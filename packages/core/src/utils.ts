/* eslint-disable no-param-reassign */
import { StarknetChainId, ZERO } from "./constants";

const basicAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789-";
const basicSizePlusOne = BigInt(basicAlphabet.length + 1);
const bigAlphabet = "这来";
const basicAlphabetSize = BigInt(basicAlphabet.length);
const bigAlphabetSize = BigInt(bigAlphabet.length);
const bigAlphabetSizePlusOne = BigInt(bigAlphabet.length + 1);

function extractStars(str: string): [string, number] {
  let k = 0;
  while (str.endsWith(bigAlphabet[bigAlphabet.length - 1])) {
    str = str.substring(0, str.length - 1);
    k += 1;
  }
  return [str, k];
}

/**
 * Check if domain is starknet.id domain
 * @param string
 * @returns boolean
 */
export function isStarkDomain(domain: string): boolean {
  return /^(?:[a-z0-9-]{1,48}(?:[a-z0-9-]{1,48}[a-z0-9-])?\.)*[a-z0-9-]{1,48}\.stark$/.test(
    domain,
  );
}

/**
 * Encode bigint into string
 * @param bigint
 * @returns string
 */
export function decode(felt: bigint): string {
  let decoded = "";
  while (felt !== ZERO) {
    const code = felt % basicSizePlusOne;
    felt /= basicSizePlusOne;
    if (code === BigInt(basicAlphabet.length)) {
      const nextSubdomain = felt / bigAlphabetSizePlusOne;
      if (nextSubdomain === ZERO) {
        const code2 = felt % bigAlphabetSizePlusOne;
        felt = nextSubdomain;
        if (code2 === ZERO) decoded += basicAlphabet[0];
        else decoded += bigAlphabet[Number(code2) - 1];
      } else {
        const code2 = felt % bigAlphabetSize;
        decoded += bigAlphabet[Number(code2)];
        felt /= bigAlphabetSize;
      }
    } else decoded += basicAlphabet[Number(code)];
  }

  const [str, k] = extractStars(decoded);
  if (k)
    decoded =
      str +
      (k % 2 === 0
        ? bigAlphabet[bigAlphabet.length - 1].repeat(k / 2 - 1) +
          bigAlphabet[0] +
          basicAlphabet[1]
        : bigAlphabet[bigAlphabet.length - 1].repeat((k - 1) / 2 + 1));

  return decoded;
}

/**
 * Decode starknetid domain '454245...' -> 'test.stark'
 * @param bigint[]
 * @returns string
 */
export function decodeDomain(encoded: bigint[]): string {
  let decoded = "";

  encoded.forEach((subdomain) => {
    decoded += decode(subdomain);
    decoded += ".";
  });

  if (!decoded) {
    return decoded;
  }

  return decoded.concat("stark");
}

/**
 * Encode string into bigint
 * @param string
 * @returns bigint
 */
export function encode(decoded: string): bigint {
  let encoded = BigInt(0);
  let multiplier = BigInt(1);

  if (decoded.endsWith(bigAlphabet[0] + basicAlphabet[1])) {
    const [str, k] = extractStars(decoded.substring(0, decoded.length - 2));
    decoded = str + bigAlphabet[bigAlphabet.length - 1].repeat(2 * (k + 1));
  } else {
    const [str, k] = extractStars(decoded);
    if (k)
      decoded =
        str + bigAlphabet[bigAlphabet.length - 1].repeat(1 + 2 * (k - 1));
  }

  for (let i = 0; i < decoded.length; i += 1) {
    const char = decoded[i];
    const index = basicAlphabet.indexOf(char);
    const bnIndex = BigInt(basicAlphabet.indexOf(char));

    if (index !== -1) {
      // add encoded + multiplier * index
      if (i === decoded.length - 1 && decoded[i] === basicAlphabet[0]) {
        encoded += multiplier * basicAlphabetSize;
        multiplier *= basicSizePlusOne;
        // add 0
        multiplier *= basicSizePlusOne;
      } else {
        encoded += multiplier * bnIndex;
        multiplier *= basicSizePlusOne;
      }
    } else if (bigAlphabet.indexOf(char) !== -1) {
      // add encoded + multiplier * (basicAlphabetSize)
      encoded += multiplier * basicAlphabetSize;
      multiplier *= basicSizePlusOne;
      // add encoded + multiplier * index
      const newid =
        (i === decoded.length - 1 ? 1 : 0) + bigAlphabet.indexOf(char);
      encoded += multiplier * BigInt(newid);
      multiplier *= bigAlphabetSize;
    }
  }

  return encoded;
}

/**
 * Encode starknetid domain 'test.stark'.. -> '454245..'
 * @param string ending with '.stark'
 * @returns bigint
 */
export function encodeDomain(domain: string): bigint {
  if (isStarkDomain(domain)) return encode(domain.replace(".stark", ""));
  throw new Error("Domain is not a stark domain");
}

/**
 * Encode several domains
 * @param string[]
 * @returns string[]
 */
export function encodeSeveral(domains: string[]): string[] {
  const encodedArray: string[] = [];

  domains.forEach((domain) => {
    encodedArray.push(encode(domain).toString(10));
  });
  return encodedArray;
}

/**
 * Decode several domains
 * @param bigint[][]
 * @returns string[]
 */
export function decodeSeveral(domains: bigint[][]): string[] {
  const encodedArray: string[] = [];

  domains.forEach((domain) => {
    encodedArray.push(decodeDomain(domain));
  });
  return encodedArray;
}

/**
 * Get starknet.id naming contract address from chainId
 * @param StarknetChainId
 * @returns string
 */
export function getNamingContract(chainId: StarknetChainId): string {
  const starknetIdMainnetContract =
    "0x6ac597f8116f886fa1c97a23fa4e08299975ecaf6b598873ca6792b9bbfb678";
  const starknetIdTestnetContract =
    "0x3bab268e932d2cecd1946f100ae67ce3dff9fd234119ea2f6da57d16d29fce";

  switch (chainId) {
    case StarknetChainId.MAINNET:
      return starknetIdMainnetContract;

    case StarknetChainId.TESTNET:
      return starknetIdTestnetContract;

    default:
      throw new Error(
        "Starknet.id naming contract is not yet deployed on this network",
      );
  }
}

/**
 * Get starknet.id identity contract address from chainId
 * @param StarknetChainId
 * @returns string
 */
export function getIdentityContract(chainId: StarknetChainId): string {
  const starknetIdMainnetContract =
    "0x05dbdedc203e92749e2e746e2d40a768d966bd243df04a6b712e222bc040a9af";
  const starknetIdTestnetContract =
    "0x0783a9097b26eae0586373b2ce0ed3529ddc44069d1e0fbc4f66d42b69d6850d";

  switch (chainId) {
    case StarknetChainId.MAINNET:
      return starknetIdMainnetContract;

    case StarknetChainId.TESTNET:
      return starknetIdTestnetContract;

    default:
      throw new Error(
        "Starknet.id identity contract is not yet deployed on this network",
      );
  }
}

/**
 * Get starknet.id verifier contract address from chainId
 * At the moment, only discord, twitter and github are supported fields
 * @param StarknetChainId
 * @returns string
 */
export function getVerifierContract(chainId: StarknetChainId): string {
  const starknetIdMainnetContract =
    "0x0480258f58d43fb73936f803780047a0f6d0a563697d80bd3f95b603f9c8b1c8";
  const starknetIdTestnetContract =
    "0x4d546c8d60cfd591557ac0613be5ceeb0ea6f797e7d11c0b5160d145fa3089f";

  switch (chainId) {
    case StarknetChainId.MAINNET:
      return starknetIdMainnetContract;

    case StarknetChainId.TESTNET:
      return starknetIdTestnetContract;

    default:
      throw new Error(
        "Starknet.id verifier contract is not yet deployed on this network",
      );
  }
}
