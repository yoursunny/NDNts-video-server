import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { AddCommand } from "./add.js";
import { FetchCommand } from "./fetch.js";
import { ServeCommand } from "./serve.js";
import { DeleteCommand, ExportCommand, ImportCommand, ListCommand } from "./store.js";

yargs()
  .scriptName("ivoosh-mirror")
  .command(new FetchCommand())
  .command(new AddCommand())
  .command(new ServeCommand())
  .command(new ListCommand())
  .command(new DeleteCommand())
  .command(new ExportCommand())
  .command(new ImportCommand())
  .demandCommand()
  .parse(hideBin(process.argv));
