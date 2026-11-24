import { EventEmitter } from 'node:events';
import type { LiveEvent } from '@grover/contracts';

/** In-process bus. The live WebSocket, the control loop and MCP all listen here. */
export class Bus {
  private readonly emitter = new EventEmitter();
  constructor() {
    this.emitter.setMaxListeners(100);
  }
  emit(event: LiveEvent): void {
    this.emitter.emit('event', event);
  }
  on(listener: (event: LiveEvent) => void): () => void {
    this.emitter.on('event', listener);
    return () => this.emitter.off('event', listener);
  }
}
