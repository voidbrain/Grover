import { execFile } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';
import type { Actuator, ActuatorBinding, Probe, ProbeBinding } from '@grover/contracts';
import type { MockDrivers } from './mock.ts';
import type { ActuatorDriver, DriverFactory, ProbeDriver } from './types.ts';

const run = promisify(execFile);

/**
 * Raspberry Pi drivers. Each binding maps to one driver:
 *   ds18b20   1-Wire temperature via the kernel w1-therm driver (/sys/bus/w1/devices/<address>/temperature)
 *   ads1115   analog probes (pH, EC, level) through an ADS1115 ADC on I²C; returns volts, calibrated on the hub
 *   gpio      a GPIO pin via `pinctrl` (Raspberry Pi OS Bookworm and later, every Pi model)
 *   mcp23017  an MCP23017 I²C expander pin
 *   l298n     a pump through an L298N bridge, its IN1/IN2 (and EN) on MCP23017 pins; forward only
 *   mock      simulated, so a half-wired rig can still run
 *
 * I²C needs the optional `i2c-bus` package, built on the Pi.
 */
export class HardwareDrivers implements DriverFactory {
  private readonly mock: MockDrivers;
  private readonly expanders = new Map<string, Mcp23017>();
  private i2c: typeof import('i2c-bus') | null = null;

  constructor(mock: MockDrivers) {
    this.mock = mock;
  }

  private async bus(n: number): Promise<import('i2c-bus').PromisifiedBus> {
    this.i2c ??= await import('i2c-bus').catch(() => {
      throw new Error('i2c-bus is not installed: run `npm install i2c-bus` on the Pi');
    });
    return this.i2c.openPromisified(n);
  }

  async probe(probe: Probe): Promise<ProbeDriver> {
    const b: ProbeBinding = probe.binding;
    switch (b.driver) {
      case 'mock':
        return this.mock.probe(probe);
      case 'ds18b20':
        return {
          read: async () => {
            const raw = await readFile(`/sys/bus/w1/devices/${b.address}/temperature`, 'utf8');
            const milli = Number(raw.trim());
            if (!Number.isFinite(milli) || milli === 85000)
              throw new Error(`ds18b20 ${b.address}: bad reading ${raw.trim()}`);
            return Math.round(milli / 100) / 10;
          },
        };
      case 'ads1115': {
        const bus = await this.bus(b.i2cBus);
        return { read: () => readAds1115(bus, b.i2cAddress, b.channel), close: () => bus.close() };
      }
      case 'hcsr04':
        throw new Error('hcsr04 needs microsecond timing that Node cannot give: use an analog or I²C level sensor');
    }
  }

  async actuator(actuator: Actuator): Promise<ActuatorDriver> {
    const b: ActuatorBinding = actuator.binding;
    switch (b.driver) {
      case 'mock':
        return this.mock.actuator(actuator);
      case 'gpio': {
        const level = (on: boolean) => (on !== b.activeLow ? 'dh' : 'dl');
        await run('pinctrl', ['set', String(b.pin), 'op', level(false)]);
        return { set: async (on) => void (await run('pinctrl', ['set', String(b.pin), 'op', level(on)])) };
      }
      case 'mcp23017': {
        const c = await this.expander(b.i2cBus, b.i2cAddress);
        await c.claim(b.pin, b.activeLow);
        return { set: (on) => c.write(b.pin, on, b.activeLow) };
      }
      case 'l298n':
        return l298n(await this.expander(b.i2cBus, b.i2cAddress), b);
    }
  }

  private async expander(i2cBus: number, address: number): Promise<Mcp23017> {
    const key = `${i2cBus}:${address}`;
    let chip = this.expanders.get(key);
    if (!chip) {
      chip = new Mcp23017(await this.bus(i2cBus), address);
      await chip.init();
      this.expanders.set(key, chip);
    }
    return chip;
  }

  async close(): Promise<void> {
    for (const chip of this.expanders.values()) await chip.close();
    this.expanders.clear();
  }
}

/**
 * A pump through an L298N bridge (F-018), forward only. Every pin is claimed low (the bridge off) before anything
 * else; IN2 is never driven high, so the pump cannot run backwards. On: IN2 low, then IN1 high, then EN high. Off:
 * EN low, then IN1 low (IN2 stays low). The chip's close leaves all three low.
 */
export async function l298n(
  chip: Mcp23017,
  pins: { in1: number; in2: number; enable: number | null },
): Promise<ActuatorDriver> {
  const { in1, in2, enable } = pins;
  // EN first: the bridge is disabled before its inputs become outputs.
  for (const pin of [...(enable === null ? [] : [enable]), in2, in1]) await chip.claim(pin, false);
  /** Every pin low, each tried even if another fails; the first failure is rethrown. */
  const allOff = async () => {
    let first: unknown = null;
    for (const pin of [...(enable === null ? [] : [enable]), in1, in2])
      await chip.write(pin, false, false).catch((err: unknown) => void (first ??= err));
    if (first) throw first;
  };
  return {
    set: async (on) => {
      if (!on) return allOff();
      try {
        await chip.write(in2, false, false);
        await chip.write(in1, true, false);
        if (enable !== null) await chip.write(enable, true, false);
      } catch (err) {
        // Half switched on: take it all back before reporting the failure.
        await allOff().catch(() => {});
        throw err;
      }
    },
  };
}

/** Single-shot conversion, ±4.096 V range, 128 SPS. Returns volts. */
async function readAds1115(bus: import('i2c-bus').PromisifiedBus, address: number, channel: number): Promise<number> {
  const mux = 0x4 + channel; // AINx vs GND
  const config = 0x8000 | (mux << 12) | (0x1 << 9) | 0x0100 | (0x4 << 5) | 0x3;
  await bus.writeI2cBlock(address, 0x01, 2, Buffer.from([config >> 8, config & 0xff]));
  await new Promise((r) => setTimeout(r, 10));
  const buf = Buffer.alloc(2);
  await bus.readI2cBlock(address, 0x00, 2, buf);
  return Math.round((buf.readInt16BE(0) * 4.096 * 1000) / 32768) / 1000;
}

/**
 * MCP23017 output pins. Pins stay inputs (the power-on state, so nothing is driven) until an actuator claims one;
 * a claim writes the pin's OFF level to the output latch first and only then makes it an output, so an
 * active-low relay never sees a low (on) level. Closing writes every claimed pin's OFF level.
 */
export class Mcp23017 {
  private olat = 0;
  private iodir = 0xffff;
  /** Bit set: that pin is active-low (off = high). */
  private activeLowMask = 0;
  private readonly bus: Pick<import('i2c-bus').PromisifiedBus, 'writeByte' | 'close'>;
  private readonly address: number;
  constructor(bus: Pick<import('i2c-bus').PromisifiedBus, 'writeByte' | 'close'>, address: number) {
    this.bus = bus;
    this.address = address;
  }
  async init(): Promise<void> {
    // Inputs everywhere: nothing is driven until claimed.
    await this.bus.writeByte(this.address, 0x00, 0xff); // IODIRA
    await this.bus.writeByte(this.address, 0x01, 0xff); // IODIRB
  }
  /** Makes `pin` an output at its off level. */
  async claim(pin: number, activeLow: boolean): Promise<void> {
    if (activeLow) this.activeLowMask |= 1 << pin;
    else this.activeLowMask &= ~(1 << pin);
    await this.write(pin, false, activeLow);
    this.iodir &= ~(1 << pin);
    await this.bus.writeByte(this.address, pin < 8 ? 0x00 : 0x01, pin < 8 ? this.iodir & 0xff : this.iodir >> 8);
  }
  async write(pin: number, on: boolean, activeLow: boolean): Promise<void> {
    const high = on !== activeLow;
    const next = high ? this.olat | (1 << pin) : this.olat & ~(1 << pin);
    try {
      await this.bus.writeByte(this.address, pin < 8 ? 0x14 : 0x15, pin < 8 ? next & 0xff : next >> 8);
      this.olat = next;
    } catch (err) {
      // The chip's latch is unknown now: remember this pin at its off level, so the next write of the bank drives it
      // off rather than pushing out an "on" that never took effect (or should not have).
      const off = activeLow ? this.olat | (1 << pin) : this.olat & ~(1 << pin);
      this.olat = off;
      throw err;
    }
  }
  async close(): Promise<void> {
    // Every claimed pin to its off level: high for active-low relays, low for the others.
    this.olat = this.activeLowMask;
    await this.bus.writeByte(this.address, 0x14, this.olat & 0xff).catch(() => {});
    await this.bus.writeByte(this.address, 0x15, this.olat >> 8).catch(() => {});
    await this.bus.close();
  }
}
