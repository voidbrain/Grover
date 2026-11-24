import assert from 'node:assert/strict';
import { test } from 'node:test';
import { DEFAULT_TANK_COLOURS, NUTRIENT_PALETTE, Room, tankColour } from '../src/index.ts';

const room = {
  id: 'r',
  name: 'R',
  agentId: null,
  mode: 'normal',
  autoFeed: false,
  calendarId: null,
  calendarStart: null,
};

test("nutrient colours (F-017): a default for each supply tank, the owner's choice over it", () => {
  const r = Room.parse(room);
  assert.deepEqual(r.tankColours, {}, 'tents saved before F-017 parse');
  assert.equal(tankColour(r, 'grow'), DEFAULT_TANK_COLOURS.grow);
  const mine = Room.parse({ ...room, tankColours: { grow: '#1a7f37' } });
  assert.equal(tankColour(mine, 'grow'), '#1a7f37');
  assert.equal(tankColour(mine, 'bloom'), DEFAULT_TANK_COLOURS.bloom);
  for (const hex of [...Object.values(DEFAULT_TANK_COLOURS), ...NUTRIENT_PALETTE.map((p) => p.hex)])
    assert.match(hex, /^#[0-9a-f]{6}$/);
});

test('a colour is #rrggbb, for a supply tank only', () => {
  assert.equal(Room.safeParse({ ...room, tankColours: { grow: 'green' } }).success, false);
  assert.equal(Room.safeParse({ ...room, tankColours: { mix: '#000000' } }).success, false);
});
