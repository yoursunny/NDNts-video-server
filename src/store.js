import { Name } from "@ndn/packet";
import { DataStore } from "@ndn/repo";
import { copy, DataTape } from "@ndn/repo-api";
import leveldown from "leveldown";
import stdout from "stdout-stream";
import { batch, consume, pipeline, tap } from "streaming-iterables";

import { env } from "./env.js";

export const store = new DataStore(leveldown(env.repoPath));

/** @typedef { { prefix: string } } PrefixArg */

/**
 * @template {boolean} demand
 * @param {demand} demandOption
 * @returns {import("yargs").CommandBuilder<{}, demand extends true ? PrefixArg : Partial<PrefixArg>>}
 */
function makePrefixBuilder(demandOption) {
  return /** @returns {any} */ (argv) =>
    argv
      .option("prefix", {
        desc: "packet name prefix",
        type: "string",
        demandOption,
      });
}

/** @type {import("yargs").CommandModule<{}, Partial<PrefixArg>>} */
export class ListCommand {
  constructor() {
    this.command = "list";
    this.describe = "list stored packets";
    this.builder = makePrefixBuilder(true);
  }

  /** @param {import("yargs").Arguments<PrefixArg>} args */
  async handler(args) {
    const { prefix } = args;
    const namePrefix = prefix ? new Name(prefix) : undefined;
    for await (const name of store.listNames(namePrefix)) {
      stdout.write(`${name}\n`);
    }
  }
}

/** @type {import("yargs").CommandModule<{}, PrefixArg>} */
export class DeleteCommand {
  constructor() {
    this.command = "delete";
    this.describe = "delete packets of given prefix";
    this.builder = makePrefixBuilder(true);
  }

  /** @param {import("yargs").Arguments<PrefixArg>} args */
  handler(args) {
    const { prefix } = args;
    return pipeline(
      () => store.listNames(new Name(prefix)),
      batch(64),
      tap((/** @type {Name[]} */b) => store.delete(...b)),
      consume,
    );
  }
}

/** @type {import("yargs").CommandModule<{}, PrefixArg>} */
export class ExportCommand {
  constructor() {
    this.command = "export";
    this.describe = "export packets to DataTape (stdout)";
    this.builder = makePrefixBuilder(true);
  }

  /** @param {import("yargs").Arguments<PrefixArg>} args */
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
