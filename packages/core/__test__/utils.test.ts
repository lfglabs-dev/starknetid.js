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

describe("Should test encoding/decoding hooks 2500 times", () => {
  it("Should test encode and decode functions with a random string", () => {
    for (let index = 0; index < 2500; index++) {
      const randomString = generateString(10, totalAlphabet);
      expect(utils.decode(utils.encode(randomString))).toBe(randomString);
    }
  });

  it("Should test decode and encode functions with a number", () => {
    for (let index = 0; index < 2500; index++) {
      const decoded = utils.decode(BigInt(index));
      expect(utils.encode(decoded).toString()).toBe(index.toString());
    }
  });
});
