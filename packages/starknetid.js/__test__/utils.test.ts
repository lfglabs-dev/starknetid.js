import { utils } from "../src/index";

describe("encode & decode domains", () => {
  test("encodeDomain should return encoded domain name", async () => {
    const encoded = utils.encodeDomain("test.stark");
    expect(encoded).toBe(BigInt(1068731n));
  });

  test("encodeDomain should fail because domain not ending with .stark", async () => {
    expect(() => utils.encodeDomain("test")).toThrowError(
      "Domain is not a stark domain",
    );
    expect(() => utils.encodeDomain("test.st")).toThrowError(
      "Domain is not a stark domain",
    );
  });

  test("decodeDomain should return starknet id domain", async () => {
    const decoded = utils.decodeDomain([BigInt(1068731n)]);
    expect(decoded).toBe("test.stark");
  });
});
