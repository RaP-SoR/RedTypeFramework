import { reactive } from "vue";

export interface MessageData {
  type: string;
  payload?: any[];
  data?: any;
}

export type EventHandler = (data: MessageData) => void;

class EventManager {
  private handlers: Record<string, EventHandler[]> = {};

  public eventState = reactive<{
    lastEvent: MessageData | null;
    isProcessing: boolean;
  }>({
    lastEvent: null,
    isProcessing: false,
  });

  constructor() {
    window.addEventListener("message", this.handleEvent.bind(this));
  }

  public on(eventType: string, handler: EventHandler): void {
    if (!this.handlers[eventType]) {
      this.handlers[eventType] = [];
    }
    this.handlers[eventType].push(handler);
  }

  public off(eventType: string, handler?: EventHandler): void {
    if (!this.handlers[eventType]) return;

    if (handler) {
      this.handlers[eventType] = this.handlers[eventType].filter(
        (h) => h !== handler
      );
    } else {
      delete this.handlers[eventType];
    }
  }

  private handleEvent(event: MessageEvent): void {
    const data = event.data as MessageData;
    if (!data || !data.type) return;

    this.eventState.lastEvent = data;
    this.eventState.isProcessing = true;

    const handlers = this.handlers[data.type];
    if (handlers?.length) {
      handlers.forEach((handler) => handler(data));
    }

    this.eventState.isProcessing = false;
  }

  public destroy(): void {
    window.removeEventListener("message", this.handleEvent.bind(this));
    this.handlers = {};
  }
}

export const eventManager = new EventManager();
