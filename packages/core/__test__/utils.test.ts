import { utils } from "../src/index";
import {
  isBraavosSubdomain,
  isStarkDomain,
  isStarkRootDomain,
  isSubdomain,
} from "../src/utils";

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

describe("Should test isStarkRootDomain", () => {
  it("Should return true cause string is a stark domain", () => {
    for (let index = 0; index < 2500; index++) {
      const randomString = generateString(10, basicAlphabet);
      expect(isStarkRootDomain(randomString + ".stark")).toBeTruthy();
    }
  });

  it("Should return false cause string does not end with .stark", () => {
    expect(isStarkRootDomain("test.star")).toBeFalsy();
  });

  it("Should return false cause string contains a wrong character", () => {
    expect(isStarkRootDomain("test)ben.stark")).toBeFalsy();
    expect(isStarkRootDomain("test,ben.stark")).toBeFalsy();
    expect(isStarkRootDomain("qsd12$)ben.stark")).toBeFalsy();
    expect(isStarkRootDomain("_.stark")).toBeFalsy();
    expect(isStarkRootDomain("test.ben.stark")).toBeFalsy();
    expect(isStarkRootDomain("..stark")).toBeFalsy();
    expect(isStarkRootDomain("..starkq")).toBeFalsy();
  });
});

describe("Should test isStarkDomain", () => {
  it("Should return true cause string is a stark subdomain", () => {
    for (let index = 0; index < 2500; index++) {
      const randomString = generateString(10, basicAlphabet);
      const randomString2 = generateString(10, basicAlphabet);
      const randomString3 = generateString(10, basicAlphabet);
      const randomString4 = generateString(10, basicAlphabet);

      expect(
        isStarkDomain(
          randomString +
            "." +
            randomString2 +
            "." +
            randomString3 +
            "." +
            randomString4 +
            ".stark",
        ),
      ).toBeTruthy();
    }
  });

  it("Should return true cause string is a stark subdomain", () => {
    for (let index = 0; index < 500; index++) {
      const randomString = generateString(10, basicAlphabet);

      expect(isStarkDomain(randomString + ".stark")).toBeTruthy();
    }
  });

  it("Should return false cause these are not stark domains", () => {
    const randomString = generateString(10, basicAlphabet);
    const randomString2 = generateString(10, basicAlphabet);

    expect(
      isStarkDomain(randomString + "." + randomString2 + ".starkqsd") &&
        isStarkDomain(
          randomString.concat("_") + "." + randomString2 + ".stark",
        ) &&
        isStarkDomain(randomString + "." + randomString2 + "..stark") &&
        isStarkDomain(randomString + "." + randomString2 + "..stark") &&
        isStarkDomain("." + randomString + ".." + randomString2 + ".stark") &&
        isStarkDomain("." + randomString + "." + randomString2 + ".stark"),
    ).toBeFalsy();
  });
});

describe("Should test isSubdomain", () => {
  it("Should return false cause string is not a subdomain", () => {
    expect(isSubdomain("1232575.stark")).toBeFalsy();
    expect(isSubdomain("")).toBeFalsy();
  });

  it("Should return false cause string is a subdomain", () => {
    expect(isSubdomain("1232575.ben.stark")).toBeTruthy();
    expect(isSubdomain("qsdqsdqsd.fricoben.stark")).toBeTruthy();
  });
});

describe("isBraavosSubdomain", () => {
  it("returns true for valid Braavos subdomains", () => {
    expect(isBraavosSubdomain("ben.braavos.stark")).toBe(true);
    expect(isBraavosSubdomain("john.braavos.stark")).toBe(true);
    expect(isBraavosSubdomain("jeremy.braavos.stark")).toBe(true);
    expect(isBraavosSubdomain("johnny.braavos.stark")).toBe(true);
  });

  it("returns false for invalid Braavos subdomains", () => {
    expect(isBraavosSubdomain("arya.braavoos.stark")).toBe(false);
    expect(isBraavosSubdomain("braavos.stark")).toBe(false);
    expect(isBraavosSubdomain("winterf.ell.braavos.stark")).toBe(false);
    expect(isBraavosSubdomain("johén.braavos.stark")).toBe(false);
    expect(isBraavosSubdomain(undefined)).toBe(false);
  });
});
