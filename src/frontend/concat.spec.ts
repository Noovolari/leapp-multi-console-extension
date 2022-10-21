import { jest, describe, test, expect } from "@jest/globals";
import concatHTML from "./concat";

describe("concat", () => {
  test("concatHTML", () => {
    const globalNamespace = global as any;
    const getElementsByTagName = jest.fn(() => ["tag-1", "tag-2"]);
    const parseFromStringMock = jest.fn(() => ({ getElementsByTagName }));
    globalNamespace.DOMParser = class {
      parseFromString = parseFromStringMock;
    };
    const concatElement = {
      appendChild: jest.fn(() => {}),
    };
    concatHTML("fake-html", concatElement);
    expect(parseFromStringMock).toHaveBeenCalledWith("fake-html", `text/html`);
    expect(getElementsByTagName).toHaveBeenCalledWith("body");
    expect(concatElement.appendChild).toHaveBeenCalledTimes(2);
    expect(concatElement.appendChild).toHaveBeenNthCalledWith(1, "tag-1");
    expect(concatElement.appendChild).toHaveBeenNthCalledWith(2, "tag-2");
  });
});
