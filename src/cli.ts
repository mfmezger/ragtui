import type { AppOptions } from "./types";

export function parseAppOptions(argv: string[]): AppOptions {
  let ragcliPath = process.env.RAGTUI_RAGCLI ?? "ragcli";
  let storeName: string | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--ragcli") {
      const value = argv[index + 1];
      if (value === undefined) {
        throw new Error("--ragcli requires a path");
      }
      ragcliPath = value;
      index += 1;
      continue;
    }
    if (arg === "--name") {
      const value = argv[index + 1];
      if (value === undefined) {
        throw new Error("--name requires a store name");
      }
      storeName = value;
      index += 1;
      continue;
    }
    if (arg === "--help" || arg === "-h") {
      throw new HelpRequested();
    }
    throw new Error(`unknown option: ${arg}`);
  }

  return storeName === undefined ? { ragcliPath } : { ragcliPath, storeName };
}

export class HelpRequested extends Error {
  constructor() {
    super("help requested");
    this.name = "HelpRequested";
  }
}

export const HELP_TEXT = `ragtui - OpenTUI interface for ragcli

Usage:
  ragtui [--ragcli <path>] [--name <store>]

Options:
  --ragcli <path>   ragcli executable to call, defaults to RAGTUI_RAGCLI or ragcli
  --name <store>    ragcli store name, same as ragcli --name
  -h, --help        show this help

Keys:
  Tab          switch focus between sources and composer
  Up/Down      move source cursor when sources are focused
  Space        toggle source selection when sources are focused
  r            refresh doctor/stat/sources when sources are focused
  c            clear chat when sources are focused
  Enter        send message when composer is focused
  Esc/Ctrl+C   exit
`;
