import { openUplinks } from "@ndn/cli-common";
import { Name } from "@ndn/packet";
import { PrefixRegStatic, RepoProducer } from "@ndn/repo";

import { env, openStore } from "./env.js";

/** @type {import("yargs").CommandModule} */
export class ServeCommand {
  constructor() {
    this.command = "serve";
    this.describe = "run the producer";
  }

  async handler() {
    await openUplinks();
    const store = openStore();

    RepoProducer.create(store, {
      reg: PrefixRegStatic(...env.prefixes.map((uri) => new Name(uri))),
    });
  }
}
