import { openUplinks } from "@ndn/cli-common";
import { Endpoint } from "@ndn/endpoint";
import { Data } from "@ndn/packet";
import { PrefixRegStatic, RepoProducer } from "@ndn/repo";

import { chunkSize, env, openStore } from "./env.js";

/** @type {import("yargs").CommandModule} */
export class ServeCommand {
  constructor() {
    this.command = "serve";
    this.describe = "run the producer";
  }

  async handler() {
    await openUplinks();

    const pingEndpoint = new Endpoint({ announcement: false });
    const pingPayload = new Uint8Array(chunkSize);
    for (const prefix of env.prefixes) {
      pingEndpoint.produce(prefix.append("ping"),
        async (interest) => new Data(interest.name, Data.FreshnessPeriod(1), pingPayload));
    }

    const store = openStore();
    RepoProducer.create(store, {
      reg: PrefixRegStatic(...env.prefixes),
    });
  }
}
