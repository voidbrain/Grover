import {
  computeCorrection,
  fitModel,
  phaseForDay,
  type Actuation,
  type ActuatorKind,
  type DoseModel,
  type DoseSuggestion,
  type Phase,
  type Reading,
  type Room,
} from '@grover/contracts';
import type { Commands } from './commands.ts';
import type { Bus } from './events.ts';
import type { Store } from './store.ts';

const NUTRIENT_KINDS: readonly ActuatorKind[] = ['pump_grow', 'pump_micro', 'pump_bloom', 'pump_ripen'];
const DAY = 86_400_000;

export interface ControlOptions {
  /** Time for a dose to mix before the next reading counts as its "after". */
  mixMs: number;
  /** A reading older than this is not trusted for a correction. */
  freshMs: number;
  autoDoseCooldownMs: number;
  now?: () => number;
}

/**
 * Closes the loop: logs every pump run as a dose sample, pairs it with the reading that follows,
 * refits the per-room model, and (only when the room has autoDose on) runs one correction step.
 */
export class Control {
  private readonly now: () => number;
  private readonly running = new Set<string>();
  /** Last auto-dose start per room; the dose log only learns of a run when it ends. */
  private readonly lastAuto = new Map<string, number>();
  private readonly store: Store;
  private readonly commands: Commands;
  private readonly opts: ControlOptions;
  private readonly off: () => void;

  constructor(store: Store, bus: Bus, commands: Commands, opts: ControlOptions) {
    this.store = store;
    this.commands = commands;
    this.opts = opts;
    this.now = opts.now ?? Date.now;
    this.off = bus.on((ev) => {
      if (ev.type === 'actuation') this.onActuation(ev.actuation);
      else if (ev.type === 'reading') void this.onReading(ev.reading);
    });
  }

  stop(): void {
    this.off();
  }

  model(roomId: string): DoseModel {
    return fitModel(this.store.doseSamples(roomId, 'nutrient'), this.store.doseSamples(roomId, 'ph_down'));
  }

  phase(room: Room): { phase: Phase; day: number } | null {
    if (!room.calendarId || !room.calendarStart) return null;
    const calendar = this.store.getCalendar(room.calendarId);
    if (!calendar) return null;
    const day = Math.floor((this.now() - Date.parse(room.calendarStart)) / DAY);
    const found = phaseForDay(calendar, day);
    return found ? { phase: found.phase, day } : null;
  }

  suggest(roomId: string): DoseSuggestion {
    const room = this.store.getRoom(roomId);
    const model = this.model(roomId);
    const ec = this.fresh(roomId, 'ec');
    const ph = this.fresh(roomId, 'ph');
    const base = {
      roomId,
      observed: { ec, ph },
      model: { ecPerMl: model.ecPerMlL, phPerMl: model.phPerMlL, samples: model.ecSamples + model.phSamples },
    };
    const current = this.phase(room);
    if (!current) return { ...base, reason: 'no active grow calendar for this room', ml: {}, target: null };
    const c = computeCorrection({ phase: current.phase, ec, ph, liters: room.reservoirLiters, model });
    const ml: DoseSuggestion['ml'] = {};
    if (c.ml.grow) ml.pump_grow = c.ml.grow;
    if (c.ml.micro) ml.pump_micro = c.ml.micro;
    if (c.ml.bloom) ml.pump_bloom = c.ml.bloom;
    if (c.ml.ripen) ml.pump_ripen = c.ml.ripen;
    if (c.ml.phDown) ml.pump_ph_down = c.ml.phDown;
    return {
      ...base,
      reason: `${current.phase.name}, day ${current.day}: ${c.reason}`,
      ml,
      target: { ec: current.phase.ec, ph: current.phase.ph },
    };
  }

  /** Runs the suggested correction now. Used by auto-dose and by an explicit "apply" from a person or NERV. */
  async apply(
    roomId: string,
    source: 'auto_dose' | 'manual' | 'mcp',
  ): Promise<{
    suggestion: DoseSuggestion;
    ran: { actuatorId: string; ml: number; ok: boolean; error: string | null }[];
  }> {
    const suggestion = this.suggest(roomId);
    const ran: { actuatorId: string; ml: number; ok: boolean; error: string | null }[] = [];
    const pumps = this.store.listActuators(roomId).filter((a) => a.enabled && a.potId === null && a.mlPerSecond);
    for (const [kind, ml] of Object.entries(suggestion.ml) as [ActuatorKind, number][]) {
      if (!ml) continue;
      const pump = pumps.find((p) => p.kind === kind);
      if (!pump) {
        ran.push({ actuatorId: kind, ml, ok: false, error: `no calibrated ${kind} in room` });
        continue;
      }
      try {
        const r = await this.commands.run(pump.id, { ml }, source);
        ran.push({ actuatorId: pump.id, ml, ok: r.ok, error: r.error });
      } catch (err) {
        ran.push({ actuatorId: pump.id, ml, ok: false, error: (err as Error).message });
      }
    }
    return { suggestion, ran };
  }

  private fresh(roomId: string, kind: 'ec' | 'ph'): number | null {
    const probe = this.store.roomProbe(roomId, kind);
    const r = probe ? this.store.latestReading(probe.id) : null;
    return r && this.now() - r.at <= this.opts.freshMs ? r.value : null;
  }

  private onActuation(a: Actuation): void {
    if (a.state !== 'off' || !a.ranMs) return;
    let actuator;
    try {
      actuator = this.store.getActuator(a.actuatorId);
    } catch {
      return;
    }
    if (!actuator.mlPerSecond || actuator.potId !== null) return;
    const kind = NUTRIENT_KINDS.includes(actuator.kind)
      ? 'nutrient'
      : actuator.kind === 'pump_ph_down'
        ? 'ph_down'
        : null;
    if (!kind) return;
    const room = this.store.getRoom(actuator.roomId);
    const probe = this.store.roomProbe(room.id, kind === 'nutrient' ? 'ec' : 'ph');
    const before = probe
      ? (this.store.readings(probe.id, a.at - a.ranMs - this.opts.freshMs, a.at - a.ranMs).at(-1)?.value ?? null)
      : null;
    this.store.addDose(
      {
        roomId: room.id,
        at: a.at,
        kind,
        ml: (a.ranMs / 1000) * actuator.mlPerSecond,
        liters: room.reservoirLiters,
        before,
        source: a.source,
      },
      this.opts.mixMs,
    );
  }

  private async onReading(r: Reading): Promise<void> {
    let probe;
    try {
      probe = this.store.getProbe(r.probeId);
    } catch {
      return;
    }
    if (probe.kind !== 'ec' && probe.kind !== 'ph') return;
    if (this.store.roomProbe(probe.roomId, probe.kind)?.id !== probe.id) return;
    this.store.closeDoses(probe.roomId, probe.kind === 'ec' ? 'nutrient' : 'ph_down', r.value, r.at, this.opts.mixMs);

    const room = this.store.getRoom(probe.roomId);
    if (!room.autoDose || room.mode !== 'normal' || this.running.has(room.id)) return;
    const last = Math.max(this.store.lastDoseAt(room.id, 'auto_dose') ?? 0, this.lastAuto.get(room.id) ?? 0);
    if (this.now() - last < this.opts.autoDoseCooldownMs) return;
    const s = this.suggest(room.id);
    if (Object.keys(s.ml).length === 0) return;
    this.running.add(room.id);
    this.lastAuto.set(room.id, this.now());
    try {
      await this.apply(room.id, 'auto_dose');
    } finally {
      this.running.delete(room.id);
    }
  }
}
