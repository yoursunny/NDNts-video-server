import "dotenv/config"; // eslint-disable-line import/no-unassigned-import

import { DataStore } from "@ndn/repo";
import strattadbEnvironment from "@strattadb/environment";
import leveldown from "leveldown";

const { makeEnv, parsers } = strattadbEnvironment;

export const env = makeEnv({
  repoPath: {
    envVarName: "REPO_PATH",
    parser: parsers.string,
    required: true,
  },
  prefixes: {
    envVarName: "REPO_PREFIXES",
    parser: parsers.array({
      parser: parsers.string,
    }),
    required: true,
  },
});

export function openStore() {
  return new DataStore(leveldown(env.repoPath));
}
