import { Name } from "@ndn/packet";
import { copy, DataTape } from "@ndn/repo-api";
import stdout from "stdout-stream";
import { batch, consume, pipeline, tap } from "streaming-iterables";

import { openStore } from "./env.js";

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
    const store = openStore();
    for await (const name of store.listNames(namePrefix)) {
      stdout.write(`${name}\n`);
    }
    await store.close();
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
  async handler(args) {
    const { prefix } = args;
    const store = openStore();
    await pipeline(
      () => store.listNames(new Name(prefix)),
      batch(64),
      tap((/** @type {Name[]} */b) => store.delete(...b)),
      consume,
    );
    await store.close();
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
    const store = openStore();
    await copy(store, new Name(prefix), tape);
    await Promise.all([tape.close(), store.close()]);
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
    const store = openStore();
    await copy(tape, store);
    await Promise.all([tape.close(), store.close()]);
  }
}
