import { describe, expect, test } from "bun:test";
import { buildRagcliArgs } from "./client";

describe("buildRagcliArgs", () => {
  test("places global --name before the subcommand", () => {
    expect(buildRagcliArgs({ executable: "ragcli", storeName: "work", args: ["sources", "--json"] })).toEqual([
      "ragcli",
      "--name",
      "work",
      "sources",
      "--json",
    ]);
  });

  test("omits empty store names", () => {
    expect(buildRagcliArgs({ executable: "ragcli", storeName: "", args: ["doctor", "--json"] })).toEqual([
      "ragcli",
      "doctor",
      "--json",
    ]);
  });
});
