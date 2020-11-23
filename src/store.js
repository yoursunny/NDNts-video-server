import { Name } from "@ndn/packet";
import { DataStore } from "@ndn/repo";
import { copy, DataTape } from "@ndn/repo-api";
import leveldown from "leveldown";
import stdout from "stdout-stream";
import { batch, consume, pipeline, tap } from "streaming-iterables";

import { env } from "./env.js";

export const store = new DataStore(leveldown(env.repoPath));

/** @type {import("yargs").CommandModule} */
export class ListCommand {
  constructor() {
    this.command = "list";
    this.describe = "list stored packets";
  }

  async handler() {
    for await (const name of store.listNames()) {
      stdout.write(`${name}\n`);
    }
  }
}

/** @typedef { { prefix: string } } PrefixArg */
/** @type {import("yargs").CommandModule<{}, PrefixArg>} */
export class DeleteCommand {
  constructor() {
    this.command = "delete";
    this.describe = "delete packets of given prefix";
  }

  /**
   * @param {import("yargs").Argv<{}>} argv
   * @returns {import("yargs").Argv<PrefixArg>}
   */
  builder(argv) {
    return argv
      .option("prefix", {
        desc: "packet name prefix",
        type: "string",
        demandOption: true,
      });
  }

  /**
   * @param {import("yargs").Arguments<PrefixArg>} args
   */
  handler(args) {
    const { prefix } = args;
    return pipeline(
      () => store.listNames(new Name(prefix)),
      batch(64),
      tap((b) => store.delete(...b)),
      consume,
    );
  }
}

/** @type {import("yargs").CommandModule<{}, PrefixArg>} */
export class ExportCommand {
  constructor() {
    this.command = "export";
    this.describe = "export packets to DataTape (stdout)";
  }

  /**
   * @param {import("yargs").Argv<{}>} argv
   * @returns {import("yargs").Argv<PrefixArg>}
   */
  builder(argv) {
    return argv
      .option("prefix", {
        desc: "packet name prefix",
        type: "string",
        demandOption: true,
      });
  }

  /**
   * @param {import("yargs").Arguments<PrefixArg>} args
   */
  async handler(args) {
    const { prefix } = args;
    const tape = new DataTape(stdout);
    await copy(store, new Name(prefix), tape);
    await tape.close();
  }
}

/** @type {import("yargs").CommandModule} */
export class ImportCommand {
  constructor() {
    this.command = "import";
    this.describe = "import packets from DataTape (stdin)";
  }

  async handler() {
    const tape = new DataTape(process.stdin);
    await copy(tape, store);
    await tape.close();
  }
}
