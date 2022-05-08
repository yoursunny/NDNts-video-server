import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { PrepareCommand } from "./prepare.js";
import { ServeCommand } from "./serve.js";
import { DeleteCommand, ExportCommand, ImportCommand, ListCommand } from "./store.js";

yargs(hideBin(process.argv))
  .scriptName("NDNts-video")
  .command(new PrepareCommand())
  .command(new ServeCommand())
  .command(new ListCommand())
  .command(new DeleteCommand())
  .command(new ExportCommand())
  .command(new ImportCommand())
  .demandCommand()
  .parseAsync();
