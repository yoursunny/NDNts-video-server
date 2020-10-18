import strattadbEnvironment from "@strattadb/environment";
import dotenv from "dotenv";
const { makeEnv, parsers } = strattadbEnvironment;

dotenv.config();

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
