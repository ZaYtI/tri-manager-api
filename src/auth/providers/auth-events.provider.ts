import { EventEmitter } from "events";

export const AUTH_EVENTS = Symbol("AUTH_EVENTS");

export const sharedAuthEvents = new EventEmitter();

export const authEventsProvider = {
  provide: AUTH_EVENTS,
  useValue: sharedAuthEvents,
};
