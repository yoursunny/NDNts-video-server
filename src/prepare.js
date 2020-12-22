import { Segment, Version } from "@ndn/naming-convention2";
import { Name } from "@ndn/packet";
import { DataTape } from "@ndn/repo-api";
import { DataProducer, FileChunkSource } from "@ndn/segmented-object";
import * as fsWalk from "@nodelib/fs.walk";
import path from "path";
import stdout from "stdout-stream";

/**
 * @param {import("@ndn/repo-api").DataStore.Insert} store
 * @param {string} filename
 * @param {Name} prefix
 */
async function saveFile(store, filename, prefix) {
  const src = new FileChunkSource(filename, { chunkSize: 7777 });
  const packets = DataProducer.listData(src, prefix,
    { segmentNumConvention: Segment });
  await store.insert(packets);
  src.close();
}

/** @typedef { { prefix: string, path: string } } AddArgs */
/** @type {import("yargs").CommandModule<{}, AddArgs>} */
export class PrepareCommand {
  constructor() {
    this.command = "prepare";
    this.describe = "prepare video from filesystem directory to DataTape (stdout)";
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
    const tape = new DataTape(stdout);
    const prefix = new Name(args.prefix);
    const versionComponent = Version.create(Date.now());
    const root = path.resolve(args.path);
    const files = fsWalk.walkStream(root, {
      entryFilter: ({ dirent }) => dirent.isFile(),
    });
    for await (const entry of files) {
      const filename = path.resolve(entry.path);
      const suffix = path.relative(root, entry.path).split(path.sep);
      await saveFile(tape, filename, prefix.append(...suffix, versionComponent));
    }
    await tape.close();
  }
}
