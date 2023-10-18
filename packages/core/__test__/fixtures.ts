import fs from "fs";
import path from "path";
import {
  Account,
  CompiledContract,
  CompiledSierra,
  CompiledSierraCasm,
  ProviderInterface,
  RpcProvider,
  SequencerProvider,
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
      .readFileSync(path.resolve(__dirname, `../__mocks__/${name}.casm`))
      .toString("ascii"),
  );

const readContractSierra = (name: string): CompiledSierra =>
  json.parse(
    fs
      .readFileSync(path.resolve(__dirname, `../__mocks__/${name}.json`))
      .toString("ascii"),
  );

export const compiledErc20 = readContract("ERC20");
export const compiledStarknetId = readContract("starknetId_compiled");
export const compiledNamingContract = readContract("naming_compiled");
export const compiledPricingContract = readContract("pricing_compiled");

export const erc20ClassHash =
  "0x0673aea444139eadc086efb400c286e1c0ddbab27ef8fcb5a0341ea7aa227df2";
export const starknetIdClassHash =
  "0x062934699d840c5ff5ed6f7c047bb567b2d883d66b9632911f6f07a0b7c95902";
export const namingClassHash =
  "0x0263b7bbcd2585ed5d8fb9c0cb2f058fddde7d47aab52adbfe765eacbb773264";
export const pricingClassHash =
  "0x013b49affb16dd1ee272aeb5478510f0cff52364a5a0c28cdb44b7e02ed41355";

export const compiledErc20Sierra = readContractSierra("erc20/erc20.sierra");
export const compiledErc20SierraCasm = readContractSierraCasm("erc20/erc20");
export const compiledIdentitySierra = readContractSierra(
  "identity/identity.sierra",
);
export const compiledIdentitySierraCasm =
  readContractSierraCasm("identity/identity");
export const compiledPricingSierra = readContractSierra(
  "pricing/pricing.sierra",
);
export const compiledPricingSierraCasm =
  readContractSierraCasm("pricing/pricing");
export const compiledNamingSierra = readContractSierra("naming/naming.sierra");
export const compiledNamingSierraCasm = readContractSierraCasm("naming/naming");

/* Default test config based on run `starknet-devnet --seed 0` */
const DEFAULT_TEST_PROVIDER_SEQUENCER_URL = "http://127.0.0.1:5050/";

/* User defined config or default one */
const BASE_URL =
  process.env.TEST_PROVIDER_BASE_URL || DEFAULT_TEST_PROVIDER_SEQUENCER_URL;
const RPC_URL = process.env.TEST_RPC_URL;

/* Detect user defined node or sequencer, if none default to sequencer if both default to node */
const PROVIDER_URL = RPC_URL || BASE_URL;

/* Detect is localhost devnet */
export const IS_LOCALHOST_DEVNET =
  PROVIDER_URL.includes("localhost") || PROVIDER_URL.includes("127.0.0.1");

export const IS_DEVNET_RPC =
  IS_LOCALHOST_DEVNET && PROVIDER_URL.includes("rpc");
export const IS_DEVNET_SEQUENCER =
  IS_LOCALHOST_DEVNET && !PROVIDER_URL.includes("rpc");

/* Definitions */
export const IS_RPC = !!RPC_URL;
export const IS_SEQUENCER = !RPC_URL;

export const getTestProvider = (): ProviderInterface => {
  const provider = RPC_URL
    ? new RpcProvider({ nodeUrl: RPC_URL })
    : new SequencerProvider({ baseUrl: BASE_URL });

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
      "0x7e00d496e324876bbc8531f2d9a82bf154d1a04a50218ee74cdd372f75a551a",
    secret: "0xe3e70682c2094cac629f6fbed82c07cd",
  },
  {
    address:
      "0x69b49c2cc8b16e80e86bfc5b0614a59aa8c9b601569c7b80dde04d3f3151b79",
    secret: "0xf728b4fa42485e3a0a5d2f346baa9455",
  },
  {
    address:
      "0x7447084f620ba316a42c72ca5b8eefb3fe9a05ca5fe6430c65a69ecc4349b3b",
    secret: "0xeb1167b367a9c3787c65c1e582e2e662",
  },
];

export const getTestAccount = (provider: ProviderInterface) => {
  return DEVNET_ACCOUNTS.map(
    ({ address, secret }) => new Account(provider, address, secret),
  );
};
