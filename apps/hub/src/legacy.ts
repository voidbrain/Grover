import { slugify as slug } from '@grover/contracts/kinds';
import type { Store } from './store.ts';

/**
 * One-off import of the old Grover's plant records (MySQL dump at tag `legacy-v1`, tables grover_companies,
 * grover_strains, grover_plants) into breeders, strains and plants.
 *
 * - Only adds what is missing (by id): running it again changes nothing, and edits made since are kept.
 * - Old pot ids do not match the new pots, so imported plants start without a pot; the old pot is in the notes.
 * - The old placeholder strain "Landrace" (id 0) is not imported; a lineage of "0" means no recorded parents.
 * - Deleted rows are skipped. Dates were epoch milliseconds (0 = not set).
 * - Old strains had no breeder, only their plants did: a strain imported now takes the breeder all its imported
 *   plants share (unknown breeders ignored).
 */

type Value = string | number | null;

/** The rows of `INSERT INTO \`table\` (cols) VALUES (...), (...);` statements, as objects. */
export function parseInserts(sql: string, table: string): Record<string, Value>[] {
  const rows: Record<string, Value>[] = [];
  const head = new RegExp('INSERT INTO `' + table + '` \\(([^)]*)\\) VALUES\\s*', 'g');
  let m: RegExpExecArray | null;
  while ((m = head.exec(sql))) {
    const cols = m[1]!.split(',').map((c) => c.trim().replace(/`/g, ''));
    let i = head.lastIndex;
    for (;;) {
      while (/\s/.test(sql[i] ?? '')) i++;
      if (sql[i] !== '(') break;
      i++;
      const values: Value[] = [];
      for (;;) {
        while (sql[i] === ' ') i++;
        if (sql[i] === "'") {
          let out = '';
          i++;
          for (;;) {
            const c = sql[i]!;
            if (c === '\\') {
              const n = sql[i + 1]!;
              out += n === 'n' ? '\n' : n === 'r' ? '\r' : n === 't' ? '\t' : n;
              i += 2;
            } else if (c === "'" && sql[i + 1] === "'") {
              out += "'";
              i += 2;
            } else if (c === "'") {
              i++;
              break;
            } else {
              out += c;
              i++;
            }
          }
          values.push(out);
        } else {
          let raw = '';
          while (sql[i] !== ',' && sql[i] !== ')') raw += sql[i++];
          raw = raw.trim();
          values.push(raw.toUpperCase() === 'NULL' ? null : Number(raw));
        }
        while (sql[i] === ' ') i++;
        if (sql[i] === ',') {
          i++;
          continue;
        }
        if (sql[i] === ')') {
          i++;
          break;
        }
        throw new Error(`unexpected "${sql[i]}" in ${table} at ${i}`);
      }
      rows.push(Object.fromEntries(cols.map((c, k) => [c, values[k] ?? null])));
      while (/\s/.test(sql[i] ?? '')) i++;
      if (sql[i] === ',') {
        i++;
        continue;
      }
      break;
    }
    head.lastIndex = i;
  }
  return rows;
}

const day = (ms: Value): string | null =>
  typeof ms === 'number' && ms > 0 ? new Date(ms).toISOString().slice(0, 10) : null;
const live = (r: Record<string, Value>) => r['deleted'] !== 1;

export interface LegacyImport {
  breeders: number;
  strains: number;
  plants: number;
  skipped: string[];
}

export function importLegacy(store: Store, sql: string): LegacyImport {
  const result: LegacyImport = { breeders: 0, strains: 0, plants: 0, skipped: [] };
  return store.tx(() => {
    const breederIds = new Map<number, string>();
    const have = new Set(store.listBreeders().map((b) => b.id));
    for (const r of parseInserts(sql, 'grover_companies').filter(live)) {
      const id = slug(String(r['name']));
      breederIds.set(Number(r['id']), id);
      if (have.has(id)) continue;
      store.putBreeder({ id, name: String(r['name']), website: null, notes: 'Imported from the old Grover.' });
      have.add(id);
      result.breeders++;
    }

    const strainRows = parseInserts(sql, 'grover_strains')
      .filter(live)
      .filter((r) => Number(r['id']) !== 0);
    const strainIds = new Map<number, string>(strainRows.map((r) => [Number(r['id']), slug(String(r['name']))]));
    const haveStrains = new Set(store.listStrains().map((s) => s.id));
    const createdStrains = new Set<string>();
    for (const r of strainRows) {
      const id = strainIds.get(Number(r['id']))!;
      if (haveStrains.has(id)) continue;
      const parents = String(r['lineage'] ?? '')
        .split(',')
        .map((x) => strainIds.get(Number(x.trim())))
        .filter((x): x is string => !!x && x !== id);
      store.putStrain({
        id,
        name: String(r['name']),
        parentIds: [...new Set(parents)],
        sativaPercent: typeof r['percentSativa'] === 'number' ? r['percentSativa'] : null,
        notes: 'Imported from the old Grover (sativa % as recorded there).',
      });
      haveStrains.add(id);
      createdStrains.add(id);
      result.strains++;
    }

    const havePlants = new Set(store.listPlants().map((p) => p.id));
    const plantBreeders = new Map<string, Set<string>>();
    for (const r of parseInserts(sql, 'grover_plants').filter(live)) {
      const id = `legacy-${r['id']}`;
      if (havePlants.has(id)) continue;
      const strainId = strainIds.get(Number(r['idStrain'])) ?? null;
      const breederId = breederIds.get(Number(r['idCompany'])) ?? null;
      const strainName = strainRows.find((s) => Number(s['id']) === Number(r['idStrain']))?.['name'];
      const notes = [
        'Imported from the old Grover.',
        r['idPot'] !== null ? `Old pot id ${r['idPot']}.` : '',
        breederId === null && r['idCompany'] !== null ? `Unknown old breeder id ${r['idCompany']}.` : '',
        strainId === null ? `Unknown old strain id ${r['idStrain']}.` : '',
        typeof r['notes'] === 'string' ? r['notes'] : '',
      ]
        .filter(Boolean)
        .join(' ');
      if (strainId && breederId) plantBreeders.set(strainId, (plantBreeders.get(strainId) ?? new Set()).add(breederId));
      store.putPlant({
        id,
        name: `${strainName ?? 'Plant'} (old #${r['id']})`,
        strainId,
        breederId,
        generation: Number(r['generation'] ?? 0),
        medium: r['idGrowingMedium'] === 1 ? 'hydro' : r['idGrowingMedium'] === 2 ? 'soil' : null,
        startedOn: day(r['dayStartGrow']),
        trimmedOn: day(r['dayTrimming']),
        bloomOn: day(r['dayStartBloom']),
        flushOn: day(r['dayStartFlush']),
        harvestedOn: day(r['dayHarvest']),
        yieldGrams: typeof r['yeld'] === 'number' && r['yeld'] > 0 ? r['yeld'] : null,
        notes,
      });
      havePlants.add(id);
      result.plants++;
    }
    for (const strain of store.listStrains()) {
      const breeders = plantBreeders.get(strain.id);
      if (strain.breederId === null && createdStrains.has(strain.id) && breeders?.size === 1)
        store.putStrain({ ...strain, breederId: [...breeders][0] });
    }
    return result;
  });
}
