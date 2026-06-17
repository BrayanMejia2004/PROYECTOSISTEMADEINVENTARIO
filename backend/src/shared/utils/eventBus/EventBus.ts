type Listener<T = unknown> = (event: T) => void | Promise<void>;

export class EventBus {
  private listeners = new Map<string, Set<Function>>();

  on<T>(eventName: string, listener: Listener<T>): () => void {
    if (!this.listeners.has(eventName)) {
      this.listeners.set(eventName, new Set());
    }
    this.listeners.get(eventName)!.add(listener);
    return () => this.off(eventName, listener);
  }

  off<T>(eventName: string, listener: Listener<T>): void {
    this.listeners.get(eventName)?.delete(listener);
  }

  async emit<T>(eventName: string, event: T): Promise<void> {
    const eventListeners = this.listeners.get(eventName);
    if (!eventListeners) return;
    const results = Array.from(eventListeners).map(l => l(event));
    await Promise.allSettled(results);
  }

  removeAll(eventName?: string): void {
    if (eventName) {
      this.listeners.delete(eventName);
    } else {
      this.listeners.clear();
    }
  }
}

export const eventBus = new EventBus();
