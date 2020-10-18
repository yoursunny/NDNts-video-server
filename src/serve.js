import { openUplinks } from "@ndn/cli-common";
import { Endpoint } from "@ndn/endpoint";
import { Interest, Name } from "@ndn/packet";
import { PrefixRegStatic, RepoProducer } from "@ndn/repo";

import { env } from "./env.js";
import { store } from "./store.js";

(async () => {
  await openUplinks();

  try {
    const endpoint = new Endpoint();
    let name = new Name(process.env.NDNTS_KEY);
    while (!name.at(1).equals("KEY")) {
      const data = await endpoint.consume(new Interest(name, Interest.CanBePrefix));
      name = data.sigInfo.keyLocator.name;
    }
  } catch {}

  RepoProducer.create(store, {
    reg: PrefixRegStatic(...env.prefixes.map((uri) => new Name(uri))),
  });
})().catch(console.error);
