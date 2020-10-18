import { DataStore } from "@ndn/repo";
import leveldown from "leveldown";

import { env } from "./env.js";

export const store = new DataStore(leveldown(env.repoPath));
