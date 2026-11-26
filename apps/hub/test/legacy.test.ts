import assert from 'node:assert/strict';
import { test } from 'node:test';
import { openDb } from '../src/db.ts';
import { importLegacy, parseInserts } from '../src/legacy.ts';
import { Store } from '../src/store.ts';

// An invented dump in the old Grover's format (names and numbers are made up).
const DUMP = `
INSERT INTO \`grover_companies\` (\`id\`, \`name\`, \`enabled\`, \`deleted\`, \`lastUpdate\`) VALUES
(1, 'Acme Seeds', 1, 0, 1),
(2, 'Gone Seeds', 1, 1, 1),
(3, 'O\\'Brien Genetics', 1, 0, 1);
INSERT INTO \`grover_strains\` (\`id\`, \`name\`, \`lineage\`, \`percentSativa\`, \`enabled\`, \`deleted\`, \`lastUpdate\`) VALUES
(0, 'Landrace', '0', 0, 1, 0, 1),
(1, 'Blue Comet x Mist', '2,3', 50, 1, 0, 1),
(2, 'Blue Comet', '4', 0, 1, 0, 1),
(3, 'Mist', '0', 100, 1, 0, 1),
(4, 'Old Hills', '0', 0, 1, 0, 1);
INSERT INTO \`grover_plants\` (\`id\`, \`idStrain\`, \`idCompany\`, \`idGrowingMedium\`, \`generation\`, \`dayStartGrow\`, \`dayStartBloom\`, \`dayHarvest\`, \`yeld\`, \`notes\`, \`deleted\`, \`idPot\`) VALUES
(7, 1, 1, 1, 0, 1636070400000, 1643500800000, 0, 0, '', 0, NULL),
(8, 1, 89, 2, 2, 1648598400000, 0, 0, 0, NULL, 0, 3),
(9, 2, 1, 1, 0, 0, 0, 0, 0, '', 1, NULL);
`;

test('parses MySQL rows: strings with escapes, NULL, numbers', () => {
  const rows = parseInserts(DUMP, 'grover_companies');
  assert.equal(rows.length, 3);
  assert.equal(rows[2]!['name'], "O'Brien Genetics");
  assert.equal(parseInserts(DUMP, 'grover_plants')[1]!['notes'], null);
});

test('imports breeders, strains with parents, plants with generation and dates; only once', () => {
  const store = new Store(openDb(':memory:'));
  const first = importLegacy(store, DUMP);
  assert.deepEqual(
    first,
    { breeders: 2, strains: 4, plants: 2, skipped: [] },
    'deleted rows and the Landrace placeholder are skipped',
  );
  const cross = store.listStrains().find((s) => s.id === 'blue-comet-x-mist')!;
  assert.deepEqual(cross.parentIds, ['blue-comet', 'mist']);
  assert.equal(cross.sativaPercent, 50);
  assert.equal(cross.breederId, 'acme-seeds', 'from its plants: the known breeder they all share');
  assert.equal(store.listStrains().find((s) => s.id === 'mist')!.breederId, null, 'no plants, no breeder');
  assert.deepEqual(store.listStrains().find((s) => s.id === 'mist')!.parentIds, [], "lineage '0' means none");
  const p7 = store.listPlants().find((p) => p.id === 'legacy-7')!;
  assert.equal(p7.breederId, 'acme-seeds');
  assert.equal(p7.startedOn, '2021-11-05');
  assert.equal(p7.harvestedOn, null, '0 = not set');
  assert.equal(p7.medium, 'hydro');
  assert.equal(p7.potId, null);
  const p8 = store.listPlants().find((p) => p.id === 'legacy-8')!;
  assert.equal(p8.generation, 2);
  assert.match(p8.notes, /Old pot id 3/);
  assert.match(p8.notes, /Unknown old breeder id 89/);
  // Run again after an edit: nothing new, the edit is kept.
  store.putPlant({ ...p8, name: 'Renamed' });
  assert.deepEqual(importLegacy(store, DUMP), { breeders: 0, strains: 0, plants: 0, skipped: [] });
  assert.equal(store.listPlants().find((p) => p.id === 'legacy-8')!.name, 'Renamed');
});

test('a truncated or unusual dump stops with a reason instead of running away', () => {
  assert.throws(
    () => parseInserts("INSERT INTO `grover_companies` (`id`, `name`) VALUES (1, 'Acme", 'grover_companies'),
    /truncated/,
  );
  assert.throws(
    () => parseInserts('INSERT INTO `grover_companies` (`id`, `name`) VALUES (1, 2', 'grover_companies'),
    /truncated/,
  );
  const store = new Store(openDb(':memory:'));
  assert.throws(
    () => importLegacy(store, "INSERT INTO `grover_strains` VALUES (1, 'Mist', '0', 100, 1, 0, 1);"),
    /complete-insert/,
    'a dump without column lists is refused, not imported as nothing',
  );
});

test('names that make the same id are kept apart, and reported', () => {
  const store = new Store(openDb(':memory:'));
  store.putStrain({ id: 'mist', name: 'MIST (my own)' });
  const r = importLegacy(
    store,
    "INSERT INTO `grover_strains` (`id`, `name`, `lineage`, `percentSativa`, `deleted`) VALUES (1, 'Mist', '0', 100, 0), (2, 'Mist!', '0', 90, 0);",
  );
  assert.equal(r.strains, 2);
  const ids = store
    .listStrains()
    .map((s) => `${s.id}=${s.name}`)
    .sort();
  assert.deepEqual(ids, ['mist-2=Mist', 'mist-3=Mist!', 'mist=MIST (my own)']);
  assert.equal(r.skipped.length, 2, JSON.stringify(r.skipped));
  // Importing again finds them by name and adds nothing.
  assert.equal(
    importLegacy(
      store,
      "INSERT INTO `grover_strains` (`id`, `name`, `lineage`, `percentSativa`, `deleted`) VALUES (1, 'Mist', '0', 100, 0), (2, 'Mist!', '0', 90, 0);",
    ).strains,
    0,
  );
});

test('a placeholder name with no letters or digits gets an id from its old id, not "item" (F-012-T03, B-013)', () => {
  // The real dump has a strain named '–' that plants use; it was imported as id "item".
  const store = new Store(openDb(':memory:'));
  importLegacy(
    store,
    "INSERT INTO `grover_companies` (`id`, `name`, `deleted`) VALUES (5, '?', 0);\n" +
      "INSERT INTO `grover_strains` (`id`, `name`, `lineage`, `percentSativa`, `deleted`) VALUES (20, '–', '0', NULL, 0);\n" +
      'INSERT INTO `grover_plants` (`id`, `idStrain`, `idCompany`, `generation`, `deleted`) VALUES (1, 20, 5, 0, 0);',
  );
  assert.deepEqual(
    store.listStrains().map((s) => [s.id, s.name]),
    [['legacy-strain-20', 'Unknown (old record)']],
  );
  assert.deepEqual(
    store.listBreeders().map((b) => [b.id, b.name]),
    [['legacy-breeder-5', '?']],
  );
  assert.equal(store.listPlants()[0]!.strainId, 'legacy-strain-20');
});

test('a lineage naming the placeholder strain means no recorded parents, and a second import adds nothing (B-013)', () => {
  // In the real dump most strains have lineage '20', the placeholder '–': the old app's "parent not known".
  const store = new Store(openDb(':memory:'));
  const dump =
    "INSERT INTO `grover_strains` (`id`, `name`, `lineage`, `percentSativa`, `deleted`) VALUES (20, '–', '0', NULL, 0), (21, 'Red Comet', '20', 50, 0), (22, 'Red Comet x Mist', '21,20', 50, 0);\n" +
    'INSERT INTO `grover_plants` (`id`, `idStrain`, `idCompany`, `generation`, `deleted`) VALUES (1, 20, NULL, 0, 0);';
  importLegacy(store, dump);
  assert.deepEqual(
    store.listStrains().map((s) => [s.id, s.parentIds]),
    [
      ['red-comet', []],
      ['red-comet-x-mist', ['red-comet']],
      ['legacy-strain-20', []],
    ],
  );
  assert.deepEqual(importLegacy(store, dump), { breeders: 0, strains: 0, plants: 0, skipped: [] });
});
