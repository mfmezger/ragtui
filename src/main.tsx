#!/usr/bin/env bun
import { createCliRenderer } from "@opentui/core";
import { createRoot } from "@opentui/react";
import { App } from "./components/App";
import { HELP_TEXT, HelpRequested, parseAppOptions } from "./cli";

async function main(): Promise<void> {
  let options;
  try {
    options = parseAppOptions(process.argv.slice(2));
  } catch (error) {
    if (error instanceof HelpRequested) {
      console.log(HELP_TEXT);
      return;
    }
    console.error(error instanceof Error ? error.message : String(error));
    console.error("Run `ragtui --help` for usage.");
    process.exitCode = 2;
    return;
  }

  const renderer = await createCliRenderer({ exitOnCtrlC: false });
  createRoot(renderer).render(<App options={options} />);
}

void main();
