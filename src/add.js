import { Segment, Version } from "@ndn/naming-convention1";
import { Name } from "@ndn/packet";
import { DataProducer, FileChunkSource } from "@ndn/segmented-object";
import * as fsWalk from "@nodelib/fs.walk";
import path from "path";

import { store } from "./store.js";

/**
 * @param {string} filename
 * @param {Name} prefix
 */
async function saveFile(filename, prefix) {
  const src = new FileChunkSource(filename, { chunkSize: 7777 });
  const packets = DataProducer.listData(src, prefix.append(Version, 1),
    { segmentNumConvention: Segment });
  await store.insert(packets);
  src.close();
}

/** @typedef { { prefix: string, path: string } } AddArgs */
/** @type {import("yargs").CommandModule<{}, AddArgs>} */
export class AddCommand {
  constructor() {
    this.command = "add";
    this.describe = "add video from filesystem directory";
  }

  /**
   * @param {import("yargs").Argv<{}>} argv
   * @returns {import("yargs").Argv<AddArgs>}
   */
  builder(argv) {
    return argv
      .option("prefix", {
        desc: "name prefix",
        type: "string",
        demandOption: true,
      })
      .option("path", {
        desc: "directory containing video files",
        type: "string",
        demandOption: true,
      });
  }

  /**
   * @param {import("yargs").Arguments<AddArgs>} args
   */
  async handler(args) {
    const prefix = new Name(args.prefix);
    const root = path.resolve(args.path);
    const files = fsWalk.walkStream(root, {
      entryFilter: ({ dirent }) => dirent.isFile(),
    });
    for await (const entry of files) {
      const filename = path.resolve(entry.path);
      const suffix = path.relative(root, entry.path).split(path.sep);
      await saveFile(filename, prefix.append(...suffix));
    }
  }
}
