import fs from "fs";
import path from "path";
import {
  Account,
  CompiledContract,
  CompiledSierra,
  CompiledSierraCasm,
  ProviderInterface,
  RpcProvider,
  json,
} from "starknet";

const readContract = (name: string): CompiledContract =>
  json.parse(
    fs
      .readFileSync(path.resolve(__dirname, `../__mocks__/${name}.json`))
      .toString("ascii"),
  );

const readContractSierraCasm = (name: string): CompiledSierraCasm =>
  json.parse(
    fs
      .readFileSync(
        path.resolve(
          __dirname,
          `../__mocks__/${name}.compiled_contract_class.json`,
        ),
      )
      .toString("ascii"),
  );

const readContractSierra = (name: string): CompiledSierra =>
  json.parse(
    fs
      .readFileSync(
        path.resolve(__dirname, `../__mocks__/${name}.contract_class.json`),
      )
      .toString("ascii"),
  );

export const compiledErc20 = readContract("ERC20");

export const erc20ClassHash =
  "0x0673aea444139eadc086efb400c286e1c0ddbab27ef8fcb5a0341ea7aa227df2";
export const identityClassHash =
  "0x701e2b0ea55169dadfa428f1385da75adb9713bac68cfc2cb0e41788fbb0544";
export const namingClassHash =
  "0x3f38a1919cb133925974e7df093d9cbaf3d6e77d154e0d92114abef40c1e1a6";
export const pricingClassHash =
  "0x316c001d23331128a3c3d58051584d38ebb373047996784bd9aca12387f6564";

export const compiledErc20Sierra = readContractSierra("erc20/erc20");
export const compiledErc20SierraCasm = readContractSierraCasm("erc20/erc20");
export const compiledIdentitySierra = readContractSierra("identity/identity");
export const compiledIdentitySierraCasm =
  readContractSierraCasm("identity/identity");
export const compiledPricingSierra = readContractSierra("pricing/pricing");
export const compiledPricingSierraCasm =
  readContractSierraCasm("pricing/pricing");
export const compiledNamingSierra = readContractSierra("naming/naming");
export const compiledNamingSierraCasm = readContractSierraCasm("naming/naming");
export const compiledMulticallSierra = readContractSierra(
  "multicall/multicall",
);
export const compiledMulticallSierraCasm = readContractSierraCasm(
  "multicall/multicall",
);
export const compiledUtilsMulticallSierra = readContractSierra(
  "utils_multicall/utils_multicall",
);
export const compiledUtilsMulticallSierraCasm = readContractSierraCasm(
  "utils_multicall/utils_multicall",
);
export const compiledErc721Sierra = readContractSierra("erc721/erc721");
export const compiledErc721SierraCasm = readContractSierraCasm("erc721/erc721");
export const compiledResolverSierra = readContractSierra("resolver/resolver");
export const compiledResolverSierraCasm =
  readContractSierraCasm("resolver/resolver");

/* Default test config based on run `starknet-devnet --seed 0` */
const DEFAULT_TEST_RPC_URL = "http://127.0.0.1:5050/";
const RPC_URL = process.env.TEST_RPC_URL || DEFAULT_TEST_RPC_URL;

/* Detect is localhost devnet */
export const IS_LOCALHOST_DEVNET =
  RPC_URL.includes("localhost") || RPC_URL.includes("127.0.0.1");

export const IS_DEVNET_RPC = IS_LOCALHOST_DEVNET && RPC_URL.includes("rpc");
export const IS_DEVNET_SEQUENCER =
  IS_LOCALHOST_DEVNET && !RPC_URL.includes("rpc");

/* Definitions */
export const IS_RPC = !!RPC_URL;
export const IS_SEQUENCER = !RPC_URL;

// Control flag to run localhost devnet-dependent tests.
// Enable by setting RUN_DEVNET_TESTS=true in the environment when a devnet is available.
export const SHOULD_RUN_DEVNET_TESTS =
  process.env.RUN_DEVNET_TESTS === "true" || process.env.RUN_DEVNET_TESTS === "1";

export const getTestProvider = (): ProviderInterface => {
  const provider = new RpcProvider({ nodeUrl: RPC_URL });
  if (IS_LOCALHOST_DEVNET) {
    // accelerate the tests when running locally
    const originalWaitForTransaction =
      provider.waitForTransaction.bind(provider);
    provider.waitForTransaction = (
      txHash: string,
      { retryInterval }: any = {},
    ) => {
      return originalWaitForTransaction(txHash, {
        retryInterval: retryInterval || 1000,
      });
    };
  }

  return provider;
};

export const DEVNET_ACCOUNTS = [
  {
    address:
      "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691",
    secret: "0x71d7bb07b9a64f6f78ac4c816aff4da9",
  },
  {
    address:
      "0x78662e7352d062084b0010068b99288486c2d8b914f6e2a55ce945f8792c8b1",
    secret: "0xe1406455b7d66b1690803be066cbe5e",
  },
  {
    address:
      "0x49dfb8ce986e21d354ac93ea65e6a11f639c1934ea253e5ff14ca62eca0f38e",
    secret: "0xa20a02f0ac53692d144b20cb371a60d7",
  },
];

export const getTestAccount = (provider: ProviderInterface) => {
  return DEVNET_ACCOUNTS.map(({ address, secret }) =>
    new Account({ provider, address, signer: secret }),
  );
};
