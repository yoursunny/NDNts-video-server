import { closeUplinks, openUplinks } from "@ndn/cli-common";
import { Segment, Version } from "@ndn/naming-convention1";
import { Name } from "@ndn/packet";
import { fetch, RttEstimator, TcpCubic } from "@ndn/segmented-object";
import { fromUtf8 } from "@ndn/tlv";
import m3u8 from "m3u8-parser";
import pRetry from "p-retry";
import { posix as path } from "path"; // eslint-disable-line unicorn/import-style

import { store } from "./store.js";

const fetchOptions = {
  rtte: new RttEstimator({ maxRto: 10000 }),
  ca: new TcpCubic(),
  retxLimit: 15,
  lifetimeAfterRto: 2000,
  versionConvention: Version,
  segmentNumConvention: Segment,
  estimatedFinalSegNum: 10,
};

/**
 * @param {string} filename
 */
async function* listFiles(filename) {
  yield filename;
  if (path.extname(filename) !== ".m3u8") {
    return;
  }
  const dirname = path.dirname(filename);

  const name = new Name(filename).append(Version, 1);
  const body = fromUtf8(await fetch(name, fetchOptions));

  const parser = new m3u8.Parser();
  parser.push(body);
  parser.end();
  const manifest = parser.manifest;

  for (const [, { uri }] of Object.entries(manifest.mediaGroups?.AUDIO?.audio ?? {})) {
    const audioUri = path.resolve(dirname, uri);
    yield* listFiles(audioUri);
  }
  for (const { uri } of (manifest.playlists ?? [])) {
    const playlistUri = path.resolve(dirname, uri);
    yield* listFiles(playlistUri);
  }
  const mapUris = new Set();
  for (const { uri, map: { uri: mapUri } } of (manifest.segments ?? [])) {
    if (!mapUris.has(mapUri)) {
      yield path.resolve(dirname, mapUri);
      mapUris.add(mapUri);
    }
    yield path.resolve(dirname, uri);
  }
}

/**
 * @param {string} filename
 */
async function downloadFile(filename) {
  const name = new Name(filename).append(Version, 1);
  const count = await pRetry(async () => {
    const fetchResult = fetch(name, fetchOptions);
    const tx = store.tx();
    for await (const data of fetchResult.unordered()) {
      tx.insert(data);
    }
    await tx.commit();
    return fetchResult.count;
  }, {
    retries: 1000,
    onFailedAttempt: (err) => {
      console.warn(err);
      fetchOptions.rtte = new RttEstimator({ maxRto: 10000 });
      fetchOptions.ca = new TcpCubic();
    },
  });

  const {
    rtte: { sRtt, rto },
    ca: { cwnd },
  } = fetchOptions;
  console.log("STAT", `count ${count}, srtt ${Math.round(sRtt)} ms, rto ${Math.round(rto)} ms, cwnd ${Math.round(cwnd)}`);
  fetchOptions.estimatedFinalSegNum = count;
}

/** @typedef { { playlist: string } } FetchArgs */
/** @type {import("yargs").CommandModule<{}, FetchArgs>} */
export class FetchCommand {
  constructor() {
    this.command = "fetch";
    this.describe = "fetch video from playlist";
  }

  /**
   * @param {import("yargs").Argv<{}>} argv
   * @returns {import("yargs").Argv<FetchArgs>}
   */
  builder(argv) {
    return argv
      .option("playlist", {
        desc: "playlist name prefix",
        type: "string",
        demandOption: true,
      });
  }

  /**
   * @param {import("yargs").Arguments<FetchArgs>} args
   */
  async handler(args) {
    const { playlist } = args;
    await openUplinks();
    try {
      for await (const filename of listFiles(playlist)) {
        console.log("FILE", filename);
        await downloadFile(filename);
      }
    } finally {
      closeUplinks();
    }
  }
}
