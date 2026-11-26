import { slugify as slug } from '@grover/contracts/kinds';
import type { Store } from './store.ts';

/**
 * One-off import of the old Grover's plant records (MySQL dump at tag `legacy-v1`, tables grover_companies,
 * grover_strains, grover_plants) into breeders, strains and plants.
 *
 * - Only adds what is missing (by id): running it again changes nothing, and edits made since are kept.
 * - Old pot ids do not match the new pots, so imported plants start without a pot; the old pot is in the notes.
 * - The old placeholder strain "Landrace" (id 0) is not imported; a lineage of "0" means no recorded parents.
 * - A strain whose name has no letters or digits (the old dump's '–', id 20) was the old app's "not known": it is
 *   imported as "Unknown (old record)" for the plants that use it, and as a parent it means no recorded parents.
 * - Deleted rows are skipped. Dates were epoch milliseconds (0 = not set).
 * - Old strains had no breeder, only their plants did: a strain imported now takes the breeder all its imported
 *   plants share (unknown breeders ignored).
 */

type Value = string | number | null;

/** The rows of `INSERT INTO \`table\` (cols) VALUES (...), (...);` statements, as objects. */
export function parseInserts(sql: string, table: string): Record<string, Value>[] {
  const rows: Record<string, Value>[] = [];
  const truncated = (at: number) => new Error(`truncated dump in ${table} near character ${at}`);
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
            if (i >= sql.length) throw truncated(i);
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
          while (i < sql.length && sql[i] !== ',' && sql[i] !== ')') raw += sql[i++];
          if (i >= sql.length) throw truncated(i);
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
        if (i >= sql.length) throw truncated(i);
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
const placeholder = (name: string) => !/[\p{L}\p{N}]/u.test(name);
const PLACEHOLDER_STRAIN = 'Unknown (old record)';

/**
 * The id for an imported name: an existing record with the same name is the same thing (id reused, nothing added);
 * otherwise `base`, with -2, -3… when another name already has it.
 */
function idFor(
  name: string,
  base: string,
  existing: Map<string, string>,
): { id: string; exists: boolean; renamed: boolean } {
  for (const [id, n] of existing) if (n === name) return { id, exists: true, renamed: false };
  if (!existing.has(base)) return { id: base, exists: false, renamed: false };
  for (let k = 2; ; k++) if (!existing.has(`${base}-${k}`)) return { id: `${base}-${k}`, exists: false, renamed: true };
}

/** The id base for an old name: its slug, or (a placeholder with no letters or digits would slug to "item") one built from the old id. */
const baseFor = (name: string, fallback: string) => (placeholder(name) ? fallback : slug(name));

const TABLES = ['grover_companies', 'grover_strains', 'grover_plants'] as const;

export interface LegacyImport {
  breeders: number;
  strains: number;
  plants: number;
  skipped: string[];
}

export function importLegacy(store: Store, sql: string): LegacyImport {
  const result: LegacyImport = { breeders: 0, strains: 0, plants: 0, skipped: [] };
  for (const t of TABLES)
    if (sql.includes('INSERT INTO `' + t + '`') && parseInserts(sql, t).length === 0)
      throw new Error(
        `${t} is in the dump without column lists, which this import cannot read: export it again with mysqldump --complete-insert`,
      );
  return store.tx(() => {
    const breederIds = new Map<number, string>();
    const breeders = new Map(store.listBreeders().map((b) => [b.id, b.name]));
    for (const r of parseInserts(sql, 'grover_companies').filter(live)) {
      const name = String(r['name']);
      const { id, exists, renamed } = idFor(name, baseFor(name, `legacy-breeder-${r['id']}`), breeders);
      breederIds.set(Number(r['id']), id);
      if (exists) continue;
      if (renamed) result.skipped.push(`breeder "${name}" imported as ${id}: its plain id was taken`);
      store.putBreeder({ id, name, website: null, notes: 'Imported from the old Grover.' });
      breeders.set(id, name);
      result.breeders++;
    }

    const strainRows = parseInserts(sql, 'grover_strains')
      .filter(live)
      .filter((r) => Number(r['id']) !== 0);
    const strains = new Map(store.listStrains().map((x) => [x.id, x.name]));
    const strainIds = new Map<number, string>();
    const placeholderIds = new Set<string>();
    const toCreate: { id: string; r: Record<string, Value> }[] = [];
    for (const r of strainRows) {
      const old = String(r['name']);
      const name = placeholder(old) ? PLACEHOLDER_STRAIN : old;
      const { id, exists, renamed } = idFor(name, baseFor(old, `legacy-strain-${r['id']}`), strains);
      strainIds.set(Number(r['id']), id);
      if (name === PLACEHOLDER_STRAIN) placeholderIds.add(id);
      if (exists) continue;
      if (renamed) result.skipped.push(`strain "${name}" imported as ${id}: its plain id was taken`);
      strains.set(id, name);
      toCreate.push({ id, r: { ...r, name } });
    }
    const createdStrains = new Set<string>();
    // Parents first, so every parent id exists when its child is saved.
    const ordered = [...toCreate].sort((a, b) => depth(a.r) - depth(b.r));
    function depth(r: Record<string, Value>, seen = new Set<number>()): number {
      const parents = String(r['lineage'] ?? '')
        .split(',')
        .map((x) => Number(x.trim()))
        .filter((x) => x && !seen.has(x));
      const rows = parents.map((p) => strainRows.find((s) => Number(s['id']) === p)).filter((x) => !!x);
      return rows.length ? 1 + Math.max(...rows.map((p) => depth(p!, new Set([...seen, Number(r['id'])])))) : 0;
    }
    for (const { id, r } of ordered) {
      const parents = String(r['lineage'] ?? '')
        .split(',')
        .map((x) => strainIds.get(Number(x.trim())))
        .filter(
          (x): x is string =>
            !!x &&
            x !== id &&
            !placeholderIds.has(x) &&
            (createdStrains.has(x) || store.listStrains().some((s) => s.id === x)),
        );
      store.putStrain({
        id,
        name: String(r['name']),
        parentIds: [...new Set(parents)],
        sativaPercent: typeof r['percentSativa'] === 'number' ? r['percentSativa'] : null,
        notes: 'Imported from the old Grover (sativa % as recorded there).',
      });
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
