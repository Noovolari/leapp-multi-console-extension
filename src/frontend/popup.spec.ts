import { jest, describe, afterEach, test, expect } from "@jest/globals";

describe("popup", () => {
  beforeEach(() => {
    jest.mock("./popup.css", () => {});
  });

  afterEach(() => {
    jest.resetModules();
  });

  test("popup", async () => {
    const globalNamespace = global as any;
    globalNamespace.chrome = {
      runtime: {
        connect: jest.fn(),
        sendMessage: jest.fn(),
      },
    };
    globalNamespace.document = {};

    await import("./popup");
    expect(1).toBe(1);
  });
});
