import { utils } from "../src/index";

function generateString(length: number, characters: string): string {
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}
const basicAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789-";
const bigAlphabet = "这来";
const totalAlphabet = basicAlphabet + bigAlphabet;

describe("Should test encodeDomain and decodeDomain 2500 times", () => {
  it("Should test encodeDomain and decodeDomain functions with a random string", () => {
    for (let index = 0; index < 2500; index++) {
      const randomString = generateString(10, totalAlphabet);
      expect(utils.decodeDomain(utils.encodeDomain(randomString))).toBe(
        randomString + ".stark",
      );
    }
  });

  it("Should test decodeDomain functions with a number", () => {
    for (let index = 0; index < 2500; index++) {
      const decoded = utils.decodeDomain([BigInt(index)]);
      expect(utils.encodeDomain(decoded).toString()).toBe(index.toString());
    }
  });

  it("Should test encodeDomain and decodeDomain functions with a random string not ending with .stark", () => {
    for (let index = 0; index < 2500; index++) {
      const randomString = generateString(10, totalAlphabet);
      expect(utils.decodeDomain(utils.encodeDomain(randomString))).toBe(
        randomString + ".stark",
      );
    }
  });

  it("Should test encodeDomain and decodeDomain functions with a random string ending .stark", () => {
    for (let index = 0; index < 2500; index++) {
      const randomString = generateString(10, totalAlphabet);
      expect(
        utils.decodeDomain(utils.encodeDomain(randomString + ".stark")),
      ).toBe(randomString + ".stark");
    }
  });

  it("Should test encodeDomain with subdomain not ending with.stark", () => {
    for (let index = 0; index < 2500; index++) {
      const randomString = generateString(10, totalAlphabet);
      const randomString1 = generateString(10, totalAlphabet);

      const encoded = utils.encodeDomain(randomString + "." + randomString1);

      expect(utils.decodeDomain(encoded)).toBe(
        randomString + "." + randomString1 + ".stark",
      );
    }
  });

  it("Should test encodeDomain with subdomain ending with.stark", () => {
    for (let index = 0; index < 2500; index++) {
      const randomString = generateString(10, totalAlphabet);
      const randomString1 = generateString(10, totalAlphabet);

      const encoded = utils.encodeDomain(
        randomString + "." + randomString1 + ".stark",
      );

      expect(utils.decodeDomain(encoded)).toBe(
        randomString + "." + randomString1 + ".stark",
      );
    }
  });

  it("Should test decodeDomain and encodeDomain functions with a number", () => {
    for (let index = 0; index < 2500; index++) {
      const decoded = utils.decodeDomain([BigInt(index)]);
      expect(
        utils.encodeDomain(decoded.substring(0, decoded.length - 6)).toString(),
      ).toBe(index.toString());
    }
  });
});

describe("Should test encodeDomain and decodeDomain on special cases", () => {
  it("Should test decodeDomain and encodeDomain with a subdomain", () => {
    const decoded = utils.decodeDomain([BigInt(1499554868251), BigInt(18925)]);
    expect(decoded).toBe("fricoben.ben.stark");
  });

  it("Should test encodeDomain with an undefined domain", () => {
    expect(utils.decodeDomain(utils.encodeDomain(undefined))).toBe("");
  });

  it("Should test encodeDomain with a null domain", () => {
    expect(utils.decodeDomain(utils.encodeDomain(null))).toBe("");
  });

  it("Should test encodeDomain with an empty domain", () => {
    expect(utils.decodeDomain(utils.encodeDomain(""))).toBe("");
  });
});
