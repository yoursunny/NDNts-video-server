import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { FetchCommand } from "./fetch.js";
import { PrepareCommand } from "./prepare.js";
import { ServeCommand } from "./serve.js";
import { DeleteCommand, ExportCommand, ImportCommand, ListCommand } from "./store.js";

(/** @type {import("yargs").Argv} */(/** @type {unknown} */(yargs())))
  .scriptName("NDNts-video")
  .command(new FetchCommand())
  .command(new PrepareCommand())
  .command(new ServeCommand())
  .command(new ListCommand())
  .command(new DeleteCommand())
  .command(new ExportCommand())
  .command(new ImportCommand())
  .demandCommand()
  .parse(hideBin(process.argv));
