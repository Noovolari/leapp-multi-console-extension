import { describe, beforeEach, afterEach, test, expect } from "@jest/globals";
import { background } from "./background";

describe("Background", () => {
  beforeEach(() => {});
  afterEach(() => {});
  test("verify that tests are working", () => {
    expect(1).toBeGreaterThan(0);
  });

  test("chrome api functions", () => {
    const manifest = {
      name: "my chrome extension",
      manifest_version: 2,
      version: "1.0.0",
    };

    const chrome = {
      runtime: {
        getManifest: () => jest.fn(() => manifest),
        onMessage: {
          addListener: () => {},
        },
      },
    };

    const result = background(chrome);
    expect(result).toEqual(4);
  });
});
