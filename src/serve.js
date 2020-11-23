import { openUplinks } from "@ndn/cli-common";
import { Name } from "@ndn/packet";
import { PrefixRegStatic, RepoProducer } from "@ndn/repo";

import { env } from "./env.js";
import { store } from "./store.js";

/** @type {import("yargs").CommandModule} */
export class ServeCommand {
  constructor() {
    this.command = "serve";
    this.describe = "run the producer";
  }

  async handler() {
    await openUplinks();

    RepoProducer.create(store, {
      reg: PrefixRegStatic(...env.prefixes.map((uri) => new Name(uri))),
    });
  }
}
