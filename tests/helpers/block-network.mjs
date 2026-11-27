// Preload used by `npm run test:offline`: makes every network connection fail immediately, so
// we can prove the default test run does not depend on the internet or on any secret.
import net from "node:net";

const blocked = () => Object.assign(new Error("network disabled for offline test"), { code: "ENETUNREACH" });

net.Socket.prototype.connect = function () {
  process.nextTick(() => this.destroy(blocked()));
  return this;
};
globalThis.fetch = async () => {
  throw Object.assign(new TypeError("fetch failed"), { cause: blocked() });
};
globalThis.WebSocket = class {
  constructor() {
    throw blocked();
  }
};
