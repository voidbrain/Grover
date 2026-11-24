import assert from 'node:assert/strict';
import { test } from 'node:test';
import { Mcp23017 } from '../src/drivers/hardware.ts';

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
