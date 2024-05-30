import { Account, constants } from "starknet";
import { StarknetIdNavigator } from "../src";
import {
  compiledIdentitySierra,
  compiledIdentitySierraCasm,
  compiledNamingSierra,
  compiledNamingSierraCasm,
  compiledPricingSierra,
  compiledPricingSierraCasm,
  compiledResolverSierra,
  compiledResolverSierraCasm,
  getTestAccount,
  getTestProvider,
} from "./fixtures";

global.fetch = jest.fn();

describe("test starknetid.js sdk", () => {
  jest.setTimeout(90000000);
  const provider = getTestProvider();
  const account = getTestAccount(provider)[0];
  const account2 = getTestAccount(provider)[1];

  let erc20Address: string =
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
  let NamingContract: string;
  let IdentityContract: string;
  let ResolverContract: string;

  beforeAll(async () => {
    expect(account).toBeInstanceOf(Account);

    // Deploy Identity contract
    const idResponse = await account.declareAndDeploy(
      {
        contract: compiledIdentitySierra,
        casm: compiledIdentitySierraCasm,
        constructorCalldata: [account.address, 0],
      },
      { maxFee: 1e18 },
    );
    IdentityContract = idResponse.deploy.contract_address;

    // Deploy pricing contract
    const pricingResponse = await account.declareAndDeploy(
      {
        contract: compiledPricingSierra,
        casm: compiledPricingSierraCasm,
        constructorCalldata: [erc20Address],
      },
      { maxFee: 1e18 },
    );
    const pricingContractAddress = pricingResponse.deploy.contract_address;

    // Deploy naming contract
    const namingResponse = await account.declareAndDeploy(
      {
        contract: compiledNamingSierra,
        casm: compiledNamingSierraCasm,
        constructorCalldata: [
          IdentityContract,
          pricingContractAddress,
          0,
          account.address,
        ],
      },
      { maxFee: 1e18 },
    );
    NamingContract = namingResponse.deploy.contract_address;

    // Deploy resolver contract
    const publicKey =
      "0x566d69d8c99f62bc71118399bab25c1f03719463eab8d6a444cd11ece131616";
    console.log("addr", account.address);
    const serverUri = ["http://0.0.0.0:8090/resolve?do", "main="];
    const resolverResponse = await account.declareAndDeploy(
      {
        contract: compiledResolverSierra,
        casm: compiledResolverSierraCasm,
        constructorCalldata: [account.address, publicKey],
      },
      { maxFee: 1e18 },
    );
    ResolverContract = resolverResponse.deploy.contract_address;

    const { transaction_hash } = await account.execute(
      [
        {
          contractAddress: erc20Address,
          entrypoint: "approve",
          calldata: [NamingContract, 0, 1], // Price of domain
        },
        {
          contractAddress: IdentityContract,
          entrypoint: "mint",
          calldata: ["1"], // TokenId
        },
        {
          contractAddress: NamingContract,
          entrypoint: "buy",
          calldata: [
            "1", // Starknet id linked
            "1068731", // Domain encoded "test"
            "365", // days
            ResolverContract, // resolver
            0, // sponsor
            0,
            0,
          ],
        },
        // add uri to resolver contract
        {
          contractAddress: ResolverContract,
          entrypoint: "add_uri",
          calldata: [2, ...serverUri],
        },
        // set_domain_to_resolver
        {
          contractAddress: NamingContract,
          entrypoint: "set_domain_to_resolver",
          calldata: [1, 1068731, ResolverContract],
        },
      ],
      undefined,
      { maxFee: 1e18 },
    );
    await provider.waitForTransaction(transaction_hash);
    console.log("transaction_hash", transaction_hash);
  });

  describe("resolve domain", () => {
    beforeEach(() => {
      fetch.mockClear();
    });

    test("resolve subdomain returns the right address", async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          address:
            "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691",
          r: "0xe9873c39c55633fef539164defc23faae516b58038cc6f9e46c0c359949203",
          s: "0x7cf03f5ac5fa86b1dfed13c8b33c4cc2384d8879b21f361fe192196e787fcf0",
          max_validity: 2032517912,
        }),
      });
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        constants.StarknetChainId.SN_SEPOLIA,
        {
          naming: NamingContract,
          identity: IdentityContract,
        },
      );
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const address = await starknetIdNavigator.getAddressFromStarkName(
        "iris.test.stark",
      );
      expect(address).toBe(account.address);
    });

    test("resolve root domain returns the right address", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        constants.StarknetChainId.SN_SEPOLIA,
        {
          naming: NamingContract,
          identity: IdentityContract,
        },
      );
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const address = await starknetIdNavigator.getAddressFromStarkName(
        "test.stark",
      );
      expect(address).toBe(account.address);
    });

    test("resolve subdomain that is not registered returns an error", async () => {
      fetch.mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Domain not found" }),
      });
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        constants.StarknetChainId.SN_SEPOLIA,
        {
          naming: NamingContract,
          identity: IdentityContract,
        },
      );
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      await expect(
        starknetIdNavigator.getAddressFromStarkName("notworking.test.stark"),
      ).rejects.toThrow("Could not get address from stark name");
    });
  });

  describe("Try reverse resolving a domain without set_address_to_domain ", () => {
    beforeEach(() => {
      fetch.mockClear();
    });

    test("resolve address returns an error", async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          address:
            "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691",
          r: "0xe9873c39c55633fef539164defc23faae516b58038cc6f9e46c0c359949203",
          s: "0x7cf03f5ac5fa86b1dfed13c8b33c4cc2384d8879b21f361fe192196e787fcf0",
          max_validity: 2032517912,
        }),
      });
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        constants.StarknetChainId.SN_SEPOLIA,
        {
          naming: NamingContract,
          identity: IdentityContract,
        },
      );
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      await expect(
        starknetIdNavigator.getStarkName(account.address),
      ).rejects.toThrow("Could not get stark name");
    });
  });

  describe("Test reverse resolving", () => {
    const serverResponse = {
      address:
        "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691",
      r: "0xe9873c39c55633fef539164defc23faae516b58038cc6f9e46c0c359949203",
      s: "0x7cf03f5ac5fa86b1dfed13c8b33c4cc2384d8879b21f361fe192196e787fcf0",
      max_validity: 2032517912,
    };
    beforeEach(() => {
      fetch.mockClear();
    });

    beforeAll(async () => {
      expect(account).toBeInstanceOf(Account);
      const { transaction_hash } = await account.execute(
        [
          {
            contractAddress: NamingContract,
            entrypoint: "set_address_to_domain",
            calldata: [
              // iris.test.stark encoded
              2,
              999902,
              1068731,
              // hints
              4,
              serverResponse.address,
              serverResponse.r,
              serverResponse.s,
              serverResponse.max_validity,
            ],
          },
        ],
        undefined,
        { maxFee: 1e18 },
      );
      await provider.waitForTransaction(transaction_hash);
    });

    test("resolve address returns the subdomain", async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          address:
            "0x64b48806902a367c8598f4f95c305e8c1a1acba5f082d294a43793113115691",
          r: "0xe9873c39c55633fef539164defc23faae516b58038cc6f9e46c0c359949203",
          s: "0x7cf03f5ac5fa86b1dfed13c8b33c4cc2384d8879b21f361fe192196e787fcf0",
          max_validity: 2032517912,
        }),
      });
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        constants.StarknetChainId.SN_SEPOLIA,
        {
          naming: NamingContract,
          identity: IdentityContract,
        },
      );
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const address = await starknetIdNavigator.getStarkName(account.address);
      expect(address).toBe("iris.test.stark");
    });
  });
});
