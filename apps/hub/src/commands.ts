import { isPump, type ActuationSource, type CommandResult, type OperatingMode } from '@grover/contracts';
import type { AgentLink } from './agents.ts';
import type { Bus } from './events.ts';
import type { Store } from './store.ts';

export class Refused extends Error {}

/**
 * Every way of moving hardware goes through here: the HTTP API, MCP tools (NERV) and the control loop.
 * The hub refuses what the room's mode or the actuator's limits do not allow; the agent enforces the
 * same limits again on its side, so a bad hub cannot run a pump past its cap.
 */
export class Commands {
  private readonly store: Store;
  private readonly agents: AgentLink;
  private readonly bus: Bus;
  constructor(store: Store, agents: AgentLink, bus: Bus) {
    this.store = store;
    this.agents = agents;
    this.bus = bus;
  }

  private agentFor(roomId: string): string {
    const room = this.store.getRoom(roomId);
    if (!room.agentId) throw new Refused(`room ${room.id} has no agent`);
    return room.agentId;
  }

  async readProbe(probeId: string): Promise<CommandResult> {
    const probe = this.store.getProbe(probeId);
    if (!probe.enabled) throw new Refused(`probe ${probeId} is disabled`);
    if (this.store.getRoom(probe.roomId).mode === 'off') throw new Refused('room is off');
    const ack = await this.agents.command(this.agentFor(probe.roomId), { kind: 'read', probeId });
    return { commandId: ack.id, ok: ack.ok, error: ack.error, value: ack.value };
  }

  /** Bounded run of a pump. Give `ml` (needs a calibrated pump) or `durationMs`. */
  async run(
    actuatorId: string,
    req: { durationMs?: number; ml?: number },
    source: ActuationSource,
  ): Promise<CommandResult> {
    const a = this.store.getActuator(actuatorId);
    const room = this.store.getRoom(a.roomId);
    if (!a.enabled) throw new Refused(`actuator ${a.id} is disabled`);
    if (!isPump(a.kind)) throw new Refused(`${a.id} is a ${a.kind}: switch it on or off instead`);
    if (room.mode !== 'normal') throw new Refused(`room ${room.id} is ${room.mode}: pumps only run in normal mode`);
    let durationMs = req.durationMs;
    if (req.ml !== undefined) {
      if (!a.mlPerSecond) throw new Refused(`${a.id} is not calibrated (mlPerSecond missing)`);
      durationMs = Math.round((req.ml / a.mlPerSecond) * 1000);
    }
    if (!durationMs || durationMs <= 0) throw new Refused('nothing to run');
    if (a.maxRunMs > 0 && durationMs > a.maxRunMs)
      throw new Refused(`${durationMs} ms exceeds the ${a.maxRunMs} ms cap of ${a.id}`);
    const ack = await this.agents.command(this.agentFor(a.roomId), { kind: 'run', actuatorId, durationMs, source });
    return { commandId: ack.id, ok: ack.ok, error: ack.error, value: ack.value };
  }

  async switch(actuatorId: string, on: boolean, source: ActuationSource): Promise<CommandResult> {
    const a = this.store.getActuator(actuatorId);
    const room = this.store.getRoom(a.roomId);
    if (!a.enabled) throw new Refused(`actuator ${a.id} is disabled`);
    if (isPump(a.kind) && on) throw new Refused(`${a.id} is a pump: use a bounded run`);
    if (on && room.mode === 'off') throw new Refused('room is off');
    if (on && room.mode === 'silent' && a.kind !== 'light')
      throw new Refused('room is silent: only lights can switch on');
    const ack = await this.agents.command(this.agentFor(a.roomId), { kind: 'switch', actuatorId, on, source });
    return { commandId: ack.id, ok: ack.ok, error: ack.error, value: ack.value };
  }

  /** Emergency stop: everything in the room off now. */
  async stopAll(roomId: string, source: ActuationSource): Promise<CommandResult> {
    const ack = await this.agents.command(this.agentFor(roomId), { kind: 'stop_all', source });
    return { commandId: ack.id, ok: ack.ok, error: ack.error, value: ack.value };
  }

  /** Changes the mode and pushes it to the agent. The agent applies it even if it misses this moment (retained config). */
  setMode(roomId: string, mode: OperatingMode): void {
    const room = this.store.getRoom(roomId);
    this.store.putRoom({ ...room, mode });
    if (room.agentId) this.agents.publishConfig(room.agentId);
    this.bus.emit({ type: 'room', roomId, mode });
  }
}
