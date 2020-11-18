import { store } from "./store.js";

(async () => {
  for await (const name of store.listNames()) {
    console.log(`${name}`);
  }
})().catch(console.error);
