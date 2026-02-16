type SignalListener<T = any> = (data: T) => void;

class Signal<T = any> {
  private listeners: Set<SignalListener<T>> = new Set();

  subscribe(listener: SignalListener<T>): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  emit(data: T): void {
    this.listeners.forEach(listener => listener(data));
  }
}

export const terminalSignals = {
  output: new Signal<string>(),
  clear: new Signal<void>(),
  start: new Signal<string>(), // Command started
  end: new Signal<number>(),   // Command ended with exit code
};
