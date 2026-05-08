import { describe, expect, test } from "bun:test";
import { HelpRequested, parseAppOptions } from "./cli";

describe("parseAppOptions", () => {
  test("uses defaults", () => {
    expect(parseAppOptions([])).toEqual({ ragcliPath: "ragcli" });
  });

  test("parses ragcli path and store name", () => {
    expect(parseAppOptions(["--ragcli", "../ragcli/target/debug/ragcli", "--name", "work"])).toEqual({
      ragcliPath: "../ragcli/target/debug/ragcli",
      storeName: "work",
    });
  });

  test("throws HelpRequested for help", () => {
    expect(() => parseAppOptions(["--help"])).toThrow(HelpRequested);
  });
});
