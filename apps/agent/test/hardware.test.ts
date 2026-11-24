import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Actuator } from '@grover/contracts';
import { Actuators } from '../src/actuators.ts';
import { Mcp23017, l298n } from '../src/drivers/hardware.ts';

/** A fake I²C bus that records register writes per chip. */
function bus() {
  const regs = new Map<number, number>([
    [0x00, 0xff], // IODIRA: inputs at power-on
    [0x01, 0xff], // IODIRB
    [0x14, 0x00],
    [0x15, 0x00],
  ]);
  const log: [number, number][] = [];
  return {
    regs,
    log,
    async writeByte(_addr: number, reg: number, value: number) {
      regs.set(reg, value);
      log.push([reg, value]);
    },
    async close() {},
  };
}

/** Is `pin` driven, and at which level? null while it is still an input. */
const driven = (b: ReturnType<typeof bus>, pin: number) => {
  const iodir = b.regs.get(pin < 8 ? 0x00 : 0x01)!;
  if (iodir & (1 << (pin % 8))) return null;
  return (b.regs.get(pin < 8 ? 0x14 : 0x15)! >> (pin % 8)) & 1;
};

test('MCP23017: an active-low relay is never driven low (on) at start-up or shutdown', async () => {
  const b = bus();
  const chip = new Mcp23017(b as never, 0x20);
  await chip.init();
  assert.equal(driven(b, 3), null, 'init drives no pin: they stay inputs until claimed');
  await chip.claim(3, true); // active-low relay on pin 3
  assert.equal(driven(b, 3), 1, 'claimed off: high');
  await chip.claim(9, false); // active-high relay on pin 9 (port B)
  assert.equal(driven(b, 9), 0);
  await chip.write(3, true, true); // on
  assert.equal(driven(b, 3), 0);
  await chip.close();
  assert.equal(driven(b, 3), 1, 'shutdown leaves the active-low relay off (high)');
  assert.equal(driven(b, 9), 0);
  // The output latch is always written before the pin becomes an output.
  const firstIodirA = b.log.findIndex(([reg, v]) => reg === 0x00 && v !== 0xff);
  const olatBefore = b.log.slice(0, firstIodirA).some(([reg, v]) => reg === 0x14 && (v & 0b1000) !== 0);
  assert.ok(olatBefore, 'latch set high before the direction changes');
});

// F-018: a pump through an L298N bridge, its inputs on MCP23017 pins. Forward only: IN2 is never driven high.
test('L298N on an MCP23017: forward on, both inputs low when off, at start-up and at shutdown; IN2 never high', async () => {
  const b = bus();
  const chip = new Mcp23017(b as never, 0x20);
  await chip.init();
  const driver = await l298n(chip, { in1: 4, in2: 5, enable: 6 });
  assert.deepEqual([driven(b, 4), driven(b, 5), driven(b, 6)], [0, 0, 0], 'claimed off: all low');
  await driver.set(true);
  assert.deepEqual([driven(b, 4), driven(b, 5), driven(b, 6)], [1, 0, 1], 'forward: IN1 high, IN2 low, enabled');
  await driver.set(false);
  assert.deepEqual([driven(b, 4), driven(b, 5), driven(b, 6)], [0, 0, 0], 'off: all low');
  await driver.set(true);
  await chip.close();
  assert.deepEqual([driven(b, 4), driven(b, 5), driven(b, 6)], [0, 0, 0], 'shutdown: all low');
  const in2High = b.log.some(([reg, v]) => reg === 0x14 && (v & (1 << 5)) !== 0);
  assert.equal(in2High, false, 'IN2 was never written high');
  // On: IN2 is set low before IN1 goes high; off: the enable drops before IN1.
  const noEnable = await l298n(chip, { in1: 0, in2: 1, enable: null });
  await noEnable.set(true);
  assert.deepEqual([driven(b, 0), driven(b, 1)], [1, 0], 'enable jumpered on the board: IN1 alone');
});

test('L298N through the safety layer: Stop all leaves both inputs low while the pump was running', async () => {
  const b = bus();
  const chip = new Mcp23017(b as never, 0x20);
  await chip.init();
  const acts = new Actuators(() => {});
  const pump: Actuator = {
    id: 'grow',
    roomId: 'r',
    potId: null,
    kind: 'pump_grow',
    name: 'Grow',
    enabled: true,
    binding: { driver: 'l298n', i2cBus: 1, i2cAddress: 0x20, in1: 4, in2: 5, enable: null },
    maxRunMs: 10_000,
    mlPerSecond: null,
  };
  await acts.load([{ actuator: pump, driver: await l298n(chip, { in1: 4, in2: 5, enable: null }) }]);
  const { done } = acts.run('grow', 5_000, 'manual');
  await new Promise((r) => setTimeout(r, 20));
  assert.deepEqual([driven(b, 4), driven(b, 5)], [1, 0], 'running forward');
  await acts.allOff('manual');
  await done.catch(() => {});
  assert.deepEqual([driven(b, 4), driven(b, 5)], [0, 0], 'stopped: both low');
});
