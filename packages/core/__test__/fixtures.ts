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
export const compiledErc721Sierra = readContractSierra("erc721/erc721");
export const compiledErc721SierraCasm = readContractSierraCasm("erc721/erc721");

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
      "0x13c0fc806e4f3d361882b696aaab73880feb03fd08f61352e0d799f9e29eddf",
    secret: "0x495a0423ae0e212f2638a0c6967486ae",
  },
  {
    address: "0x7b2980bb822ade41e9b3cc4c92d09afcfd04c82c4bd237a9a750d3846d05a1",
    secret: "0x6eb5b96a617779e769f9e3517ebc70c5",
  },
  {
    address: "0xc0cf7afba447a30213016e77f41e6c248b7ce35aa8a19995eb02c264ddbb78",
    secret: "0x5a9187663b540e2d23ddffcd83411aa6",
  },
];

export const getTestAccount = (provider: ProviderInterface) => {
  return DEVNET_ACCOUNTS.map(
    ({ address, secret }) => new Account(provider, address, secret),
  );
};
