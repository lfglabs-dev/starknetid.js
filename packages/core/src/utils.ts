/* eslint-disable no-param-reassign */
import { constants } from "starknet";
import { ZERO } from "./constants";

const basicAlphabet = "abcdefghijklmnopqrstuvwxyz0123456789-";
const basicSizePlusOne = BigInt(basicAlphabet.length + 1);
const bigAlphabet = "这来";
const basicAlphabetSize = BigInt(basicAlphabet.length);
const bigAlphabetSize = BigInt(bigAlphabet.length);
const bigAlphabetSizePlusOne = BigInt(bigAlphabet.length + 1);

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
 * Decode starknetid domain represented as an array of bigint [454245n] -> 'test.stark'
 * @param bigint[]
 * @returns string
 */
export function decodeDomain(encoded: bigint[]): string {
  let decoded = "";

  encoded.forEach((subdomain) => {
    decoded += decode(subdomain);
    if (decoded) decoded += ".";
  });

  if (!decoded) {
    return decoded;
  }

  return decoded.concat("stark");
}

/**
 * Encode starknetid domains and subdomains to an array bigint 'test.stark' -> [454245n]
 * @param string ending with '.stark'
 * @returns bigint[]
 */
export function encodeDomain(domain: string | undefined | null): bigint[] {
  if (!domain) return [BigInt(0)];

  const encoded = [];
  for (const subdomain of domain.replace(".stark", "").split("."))
    encoded.push(encode(subdomain));
  return encoded;
}

/**
 * Get starknet.id naming contract address from chainId
 * @param StarknetChainId
 * @returns string
 */
export function getNamingContract(chainId: constants.StarknetChainId): string {
  const namingdMainnetContract =
    "0x6ac597f8116f886fa1c97a23fa4e08299975ecaf6b598873ca6792b9bbfb678";
  const namingdGoerliContract =
    "0x3bab268e932d2cecd1946f100ae67ce3dff9fd234119ea2f6da57d16d29fce";
  const namingdSepoliaContract =
    "0x00000154bc2e1af9260b9e66af0e9c46fc757ff893b3ff6a85718a810baf1474";

  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return namingdMainnetContract;

    case constants.StarknetChainId.SN_GOERLI:
      return namingdGoerliContract;

    case constants.StarknetChainId.SN_SEPOLIA:
      return namingdSepoliaContract;

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
export function getIdentityContract(
  chainId: constants.StarknetChainId,
): string {
  const starknetIdMainnetContract =
    "0x05dbdedc203e92749e2e746e2d40a768d966bd243df04a6b712e222bc040a9af";
  const starknetIdGoerliContract =
    "0x0783a9097b26eae0586373b2ce0ed3529ddc44069d1e0fbc4f66d42b69d6850d";
  const starknetIdSepoliaContract =
    "0x3697660a0981d734780731949ecb2b4a38d6a58fc41629ed611e8defda";

  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return starknetIdMainnetContract;

    case constants.StarknetChainId.SN_GOERLI:
      return starknetIdGoerliContract;

    case constants.StarknetChainId.SN_SEPOLIA:
      return starknetIdSepoliaContract;

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
export function getVerifierContract(
  chainId: constants.StarknetChainId,
): string {
  const starknetIdMainnetContract =
    "0x0480258f58d43fb73936f803780047a0f6d0a563697d80bd3f95b603f9c8b1c8";
  const starknetIdGoerliContract =
    "0x019e5204152a72891bf8cd0bed8f03593fdb29ceacd14fca587be5d9fcf87c0e";
  const starknetIdSepoliaContract =
    "0x60B94fEDe525f815AE5E8377A463e121C787cCCf3a36358Aa9B18c12c4D566";

  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return starknetIdMainnetContract;

    case constants.StarknetChainId.SN_GOERLI:
      return starknetIdGoerliContract;

    case constants.StarknetChainId.SN_SEPOLIA:
      return starknetIdSepoliaContract;

    default:
      throw new Error(
        "Starknet.id verifier contract is not yet deployed on this network",
      );
  }
}

/**
 * Get starknet.id profile picture verifier contract address from chainId
 * @param StarknetChainId
 * @returns string
 */
export function getPfpVerifierContract(
  chainId: constants.StarknetChainId,
): string {
  const starknetIdMainnetContract =
    "0x070aaa20ec4a46da57c932d9fd89ca5e6bb9ca3188d3df361a32306aff7d59c7";
  const starknetIdGoerliContract =
    "0x03cac3228b434259734ee0e4ff445f642206ea11adace7e4f45edd2596748698";
  const starknetIdSepoliaContract =
    "0x9e7bdb8dabd02ea8cfc23b1d1c5278e46490f193f87516ed5ff2dfec02";

  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return starknetIdMainnetContract;

    case constants.StarknetChainId.SN_GOERLI:
      return starknetIdGoerliContract;

    case constants.StarknetChainId.SN_SEPOLIA:
      return starknetIdSepoliaContract;

    default:
      throw new Error(
        "Starknet.id profile picture verifier contract is not yet deployed on this network",
      );
  }
}

/**
 * Get starknet.id proof of personhood verifier contract address from chainId
 * @param StarknetChainId
 * @returns string
 */
export function getPopVerifierContract(
  chainId: constants.StarknetChainId,
): string {
  const starknetIdMainnetContract =
    "0x0293eb2ba9862f762bd3036586d5755a782bd22e6f5028320f1d0405fd47bff4";
  const starknetIdGoerliContract =
    "0x03528caf090179e337931ee669a5b0214041e1bae30d460ff07d2cea2c7a9106";
  const starknetIdSepoliaContract =
    "0x15ae88ae054caa74090b89025c1595683f12edf7a4ed2ad0274de3e1d4a";

  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return starknetIdMainnetContract;

    case constants.StarknetChainId.SN_GOERLI:
      return starknetIdGoerliContract;

    case constants.StarknetChainId.SN_SEPOLIA:
      return starknetIdSepoliaContract;

    default:
      throw new Error(
        "Starknet.id proof of personhood verifier contract is not yet deployed on this network",
      );
  }
}

/**
 * Get starknet.id multicall contract address from chainId
 * @param StarknetChainId
 * @returns string
 */
export function getMulticallContract(
  chainId: constants.StarknetChainId,
): string {
  const multicallContract =
    "0x034ffb8f4452df7a613a0210824d6414dbadcddce6c6e19bf4ddc9e22ce5f970";

  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return multicallContract;

    case constants.StarknetChainId.SN_GOERLI:
      return multicallContract;

    case constants.StarknetChainId.SN_SEPOLIA:
      return multicallContract;

    default:
      throw new Error(
        "Starknet.id multicall contract is not yet deployed on this network",
      );
  }
}

export function getBlobbertContract(
  chainId: constants.StarknetChainId,
): string {
  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return "0x00539f522b29ae9251dbf7443c7a950cf260372e69efab3710a11bf17a9599f1";
    default:
      return "0";
  }
}

/**
 * Get starknet.id multicall contract address from chainId
 * @param StarknetChainId
 * @returns string
 */
export function getUtilsMulticallContract(
  chainId: constants.StarknetChainId,
): string {
  const utilsMulticallContract =
    "0x004a50c8a8bc97eaaa947e8cbde481beaf5d6c38b4ac89da31ebdddb547d13d7";

  switch (chainId) {
    case constants.StarknetChainId.SN_MAIN:
      return utilsMulticallContract;

    case constants.StarknetChainId.SN_SEPOLIA:
      return utilsMulticallContract;

    default:
      throw new Error(
        "Starknet.id utils multicall contract is not yet deployed on this network",
      );
  }
}

function extractStars(str: string): [string, number] {
  let k = 0;
  while (str.endsWith(bigAlphabet[bigAlphabet.length - 1])) {
    str = str.substring(0, str.length - 1);
    k += 1;
  }
  return [str, k];
}

/**
 * Decode bigint into string
 * @param bigint
 * @returns string
 */
function decode(felt: bigint): string {
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
 * Encode string into bigint
 * @param string
 * @returns bigint
 */
function encode(decoded: string | undefined): bigint {
  let encoded = BigInt(0);
  let multiplier = BigInt(1);

  if (!decoded) {
    return encoded;
  }

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
 * Check if domain is a subdomain
 * @param string
 * @returns boolean
 */
export function isSubdomain(domain: string | undefined): boolean {
  if (!domain) return false;

  return Boolean((domain.match(/\./g) || []).length > 1);
}

/**
 * Check if domain is a Braavos subdomain
 * @param string
 * @returns boolean
 */
export function isBraavosSubdomain(domain: string | undefined): boolean {
  if (!domain) return false;

  return /^([a-z0-9-]){1,48}\.braavos.stark$/.test(domain);
}

/**
 * Check if domain is a root domain
 * @param string
 * @returns boolean
 */
export function isStarkRootDomain(domain: string): boolean {
  return /^([a-z0-9-]){1,48}\.stark$/.test(domain);
}

/**
 * Check if domain is a Xplorer subdomain
 * @param string
 * @returns boolean
 */
export function isXplorerSubdomain(domain: string | undefined): boolean {
  if (!domain) return false;

  return /^([a-z0-9-]){1,48}\.xplorer.stark$/.test(domain);
}
