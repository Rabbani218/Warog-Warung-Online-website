import { EventEmitter } from "events";

const globalForKotEvents = globalThis;

export const kotEvents = globalForKotEvents.kotEvents || new EventEmitter();

if (!globalForKotEvents.kotEvents) {
  globalForKotEvents.kotEvents = kotEvents;
}

export function emitKotUpdate(payload) {
  kotEvents.emit("kot-update", payload);
}

export function subscribeKotUpdate(handler) {
  kotEvents.on("kot-update", handler);
  return () => kotEvents.off("kot-update", handler);
}
