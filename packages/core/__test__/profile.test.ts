import { Account, shortString, constants } from "starknet";
import { StarknetIdNavigator } from "../src";
import {
  compiledErc721Sierra,
  compiledErc721SierraCasm,
  compiledIdentitySierra,
  compiledIdentitySierraCasm,
  compiledMulticallSierra,
  compiledMulticallSierraCasm,
  compiledNamingSierra,
  compiledNamingSierraCasm,
  compiledPricingSierra,
  compiledPricingSierraCasm,
  compiledUtilsMulticallSierra,
  compiledUtilsMulticallSierraCasm,
  getTestAccount,
  getTestProvider,
  IS_LOCALHOST_DEVNET,
  SHOULD_RUN_DEVNET_TESTS,
} from "./fixtures";
import {
  getMulticallContract,
  getUtilsMulticallContract,
  decodeDomain,
  getBlobbertContract,
} from "../src/utils";

jest.mock("../src/utils");
global.fetch = jest.fn();

const maybeDescribe = IS_LOCALHOST_DEVNET && SHOULD_RUN_DEVNET_TESTS ? describe : describe.skip;

maybeDescribe("test starknetid.js sdk", () => {
  jest.setTimeout(90000000);
  const provider = getTestProvider();
  const account = getTestAccount(provider)[0];
  const account2 = getTestAccount(provider)[1];
  const otherAccount = getTestAccount(provider)[1];

  let erc20Address: string =
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
  let NamingContract: string;
  let IdentityContract: string;
  let MulticallContract: string;
  let UtilsMulticallContract: string;
  let NFTContract: string;
  let NFTContract2: string;

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

    // Deploy multicall contract
    const multicallResponse = await account.declareAndDeploy(
      {
        contract: compiledMulticallSierra,
        casm: compiledMulticallSierraCasm,
      },
      { maxFee: 1e18 },
    );
    MulticallContract = multicallResponse.deploy.contract_address;

    // Deploy utils multicall contract
    const utilsMulticallResponse = await account.declareAndDeploy(
      {
        contract: compiledUtilsMulticallSierra,
        casm: compiledUtilsMulticallSierraCasm,
      },
      { maxFee: 1e18 },
    );
    UtilsMulticallContract = utilsMulticallResponse.deploy.contract_address;

    // Deploy erc721 contract
    const erc721Response = await account.declareAndDeploy(
      {
        contract: compiledErc721Sierra,
        casm: compiledErc721SierraCasm,
        constructorCalldata: [
          shortString.encodeShortString("NFT"),
          shortString.encodeShortString("NFT"),
          [
            shortString.encodeShortString("https://sepolia.api.starknet.qu"),
            shortString.encodeShortString("est/quests/uri?level="),
          ],
        ],
      },
      { maxFee: 1e18 },
    );
    NFTContract = erc721Response.deploy.contract_address;

    // Deploy a second erc721 contract
    const erc721Response2 = await account.declareAndDeploy(
      {
        contract: compiledErc721Sierra,
        casm: compiledErc721SierraCasm,
        constructorCalldata: [
          shortString.encodeShortString("NFT2"),
          shortString.encodeShortString("NFT2"),
          [shortString.encodeShortString("A wrong url")],
        ],
      },
      { maxFee: 1e18 },
    );
    NFTContract2 = erc721Response2.deploy.contract_address;

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
            "18925", // Domain encoded "ben"
            "365", // days
            "0", // resolver
            0, // sponsor
            0,
            0,
          ],
        },
        {
          contractAddress: IdentityContract,
          entrypoint: "set_main_id",
          calldata: ["1"],
        },
      ],
      undefined,
      { maxFee: 1e18 },
    );
    await provider.waitForTransaction(transaction_hash);

    // Add verifier data
    const { transaction_hash: transaction_hash2 } = await otherAccount.execute(
      [
        {
          contractAddress: IdentityContract,
          entrypoint: "set_verifier_data",
          calldata: [
            "1", // token_id
            shortString.encodeShortString("discord"), // field
            123, // value
            0,
          ],
        },
      ],
      undefined,
      { maxFee: 1e18 },
    );
    await provider.waitForTransaction(transaction_hash2);
  });

  describe("getProfileData", () => {
    beforeEach(() => {
      (getMulticallContract as jest.Mock).mockImplementation(
        (chainId: constants.StarknetChainId) => {
          if (chainId === constants.StarknetChainId.SN_SEPOLIA) {
            return MulticallContract;
          }
        },
      );
      (decodeDomain as jest.Mock).mockImplementation((encoded: bigint[]) => {
        return "ben.stark";
      });
    });

    test("getProfileData should return an undefined profile picture url", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        constants.StarknetChainId.SN_SEPOLIA,
        {
          naming: NamingContract,
          identity: IdentityContract,
        },
      );
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const profile = await starknetIdNavigator.getProfileData(
        account.address,
        false,
        otherAccount.address,
        otherAccount.address,
        otherAccount.address,
      );
      const expectedProfile = {
        name: "ben.stark",
        twitter: undefined,
        github: undefined,
        discord: "123",
        proofOfPersonhood: false,
        profilePicture: undefined,
      };
      expect(profile).toStrictEqual(expectedProfile);
    });

    test("getProfileData should return an identicon url", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        constants.StarknetChainId.SN_SEPOLIA,
        {
          naming: NamingContract,
          identity: IdentityContract,
        },
      );
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const profile = await starknetIdNavigator.getProfileData(
        account.address,
        true,
        otherAccount.address,
        otherAccount.address,
        otherAccount.address,
      );
      const expectedProfile = {
        name: "ben.stark",
        twitter: undefined,
        github: undefined,
        discord: "123",
        proofOfPersonhood: false,
        profilePicture: "https://identicon.starknet.id/1",
      };
      expect(profile).toStrictEqual(expectedProfile);
    });
  });

  describe("getProfileData with nft profile picture", () => {
    beforeEach(() => {
      fetch.mockClear();
    });

    beforeAll(async () => {
      // Add nft pp verifier data
      const { transaction_hash } = await otherAccount.execute(
        [
          {
            contractAddress: IdentityContract,
            entrypoint: "set_verifier_data",
            calldata: [
              "1", // token_id
              shortString.encodeShortString("nft_pp_contract"), // field
              NFTContract, // value
              0,
            ],
          },
          {
            contractAddress: IdentityContract,
            entrypoint: "set_extended_verifier_data",
            calldata: [
              "1", // token_id
              shortString.encodeShortString("nft_pp_id"), // field
              "2", // length
              1, // value
              0,
              0,
            ],
          },
        ],
        undefined,
        { maxFee: 1e18 },
      );
      await provider.waitForTransaction(transaction_hash);
    });

    test("getProfileData should return the right values", async () => {
      fetch.mockResolvedValue({
        ok: true,
        json: async () => ({
          image: "https://sepolia.starknet.quest/starkfighter/level1.webp",
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
      const profile = await starknetIdNavigator.getProfileData(
        account.address,
        true,
        otherAccount.address,
        otherAccount.address,
        otherAccount.address,
      );
      const expectedProfile = {
        name: "ben.stark",
        twitter: undefined,
        github: undefined,
        discord: "123",
        proofOfPersonhood: false,
        profilePicture:
          "https://sepolia.starknet.quest/starkfighter/level1.webp",
      };
      expect(profile).toStrictEqual(expectedProfile);
    });
  });

  describe("getStarkProfiles", () => {
    beforeEach(() => {
      (getMulticallContract as jest.Mock).mockImplementation(
        (chainId: constants.StarknetChainId) => {
          if (chainId === constants.StarknetChainId.SN_SEPOLIA) {
            return MulticallContract;
          }
        },
      );
      (getUtilsMulticallContract as jest.Mock).mockImplementation(
        (chainId: constants.StarknetChainId) => {
          if (chainId === constants.StarknetChainId.SN_SEPOLIA) {
            return UtilsMulticallContract;
          }
        },
      );
      (getBlobbertContract as jest.Mock).mockImplementation(
        (chainId: constants.StarknetChainId) => {
          if (chainId === constants.StarknetChainId.SN_SEPOLIA) {
            return NFTContract2;
          }
        },
      );
      (decodeDomain as jest.Mock).mockImplementation((encoded: bigint[]) => {
        if (encoded[0] === 18925n) return "ben.stark";
        else if (encoded[0] === 1068731n) return "test.stark";
        return "";
      });
    });

    beforeAll(async () => {
      // buy a second domain
      const { transaction_hash } = await account2.execute(
        [
          {
            contractAddress: erc20Address,
            entrypoint: "approve",
            calldata: [NamingContract, 0, 1], // Price of domain
          },
          {
            contractAddress: IdentityContract,
            entrypoint: "mint",
            calldata: ["2"], // TokenId
          },
          {
            contractAddress: NamingContract,
            entrypoint: "buy",
            calldata: [
              "2", // Starknet id linked
              "1068731", // Domain encoded "test"
              "365", // days
              "0", // resolver
              0, // sponsor
              0,
              0,
            ],
          },
          {
            contractAddress: IdentityContract,
            entrypoint: "set_main_id",
            calldata: ["2"],
          },
        ],
        undefined,
        { maxFee: 1e18 },
      );
      await provider.waitForTransaction(transaction_hash);
    });

    test("getStarkProfiles with useDefaultPfp enabled", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        constants.StarknetChainId.SN_SEPOLIA,
        {
          naming: NamingContract,
          identity: IdentityContract,
        },
      );
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const profiles = await starknetIdNavigator.getStarkProfiles(
        [account.address, account2.address, "0x123"],
        true,
        otherAccount.address,
      );
      const expectedProfiles = [
        {
          name: "ben.stark",
          profilePicture:
            "https://sepolia.starknet.quest/starkfighter/level1.webp",
        },
        {
          name: "test.stark",
          profilePicture: "https://identicon.starknet.id/2",
        },
        {
          name: undefined,
          profilePicture: "https://identicon.starknet.id/0",
        },
      ];
      expect(profiles).toStrictEqual(expectedProfiles);
    });

    test("getStarkProfiles with useDefaultPfp disabled", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        constants.StarknetChainId.SN_SEPOLIA,
        {
          naming: NamingContract,
          identity: IdentityContract,
        },
      );
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const profiles = await starknetIdNavigator.getStarkProfiles(
        [
          account.address,
          account2.address,
          "0x123",
          account2.address,
          account.address,
          "0x456",
          "0x789",
          account.address,
        ],
        false,
        otherAccount.address,
      );
      const expectedProfiles = [
        {
          name: "ben.stark",
          profilePicture:
            "https://sepolia.starknet.quest/starkfighter/level1.webp",
        },
        {
          name: "test.stark",
          profilePicture: undefined,
        },
        { name: undefined, profilePicture: undefined },
        {
          name: "test.stark",
          profilePicture: undefined,
        },
        {
          name: "ben.stark",
          profilePicture:
            "https://sepolia.starknet.quest/starkfighter/level1.webp",
        },
        { name: undefined, profilePicture: undefined },
        { name: undefined, profilePicture: undefined },
        {
          name: "ben.stark",
          profilePicture:
            "https://sepolia.starknet.quest/starkfighter/level1.webp",
        },
      ];
      expect(profiles).toStrictEqual(expectedProfiles);
    });

    describe("getStarkProfiles with an undefined NFT metadata", () => {
      beforeAll(async () => {
        // set NFT2 as pfp for account2
        const { transaction_hash } = await otherAccount.execute(
          [
            {
              contractAddress: IdentityContract,
              entrypoint: "set_verifier_data",
              calldata: [
                "1", // token_id
                shortString.encodeShortString("nft_pp_contract"), // field
                NFTContract, // value
                0,
              ],
            },
            {
              contractAddress: IdentityContract,
              entrypoint: "set_extended_verifier_data",
              calldata: [
                "1", // token_id
                shortString.encodeShortString("nft_pp_id"), // field
                "2", // length
                1, // value
                0,
                0,
              ],
            },
            {
              contractAddress: IdentityContract,
              entrypoint: "set_verifier_data",
              calldata: [
                "2", // token_id
                shortString.encodeShortString("nft_pp_contract"), // field
                NFTContract2, // value
                0,
              ],
            },
            {
              contractAddress: IdentityContract,
              entrypoint: "set_extended_verifier_data",
              calldata: [
                "1", // token_id
                shortString.encodeShortString("nft_pp_id"), // field
                "2", // length
                1, // value
                0,
                0,
              ],
            },
          ],
          undefined,
          { maxFee: 1e18 },
        );
        await provider.waitForTransaction(transaction_hash);
      });

      test("getStarkProfiles with with an undefined NFT metadata", async () => {
        const starknetIdNavigator = new StarknetIdNavigator(
          provider,
          constants.StarknetChainId.SN_SEPOLIA,
          {
            naming: NamingContract,
            identity: IdentityContract,
          },
        );
        expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
        const profiles = await starknetIdNavigator.getStarkProfiles(
          [
            account.address,
            account2.address,
            "0x123",
            account2.address,
            account.address,
            "0x456",
            "0x789",
            account.address,
          ],
          false,
          otherAccount.address,
        );
        const expectedProfiles = [
          {
            name: "ben.stark",
            profilePicture:
              "https://sepolia.starknet.quest/starkfighter/level1.webp",
          },
          {
            name: "test.stark",
            profilePicture: undefined,
          },
          { name: undefined, profilePicture: undefined },
          {
            name: "test.stark",
            profilePicture: undefined,
          },
          {
            name: "ben.stark",
            profilePicture:
              "https://sepolia.starknet.quest/starkfighter/level1.webp",
          },
          { name: undefined, profilePicture: undefined },
          { name: undefined, profilePicture: undefined },
          {
            name: "ben.stark",
            profilePicture:
              "https://sepolia.starknet.quest/starkfighter/level1.webp",
          },
        ];
        expect(profiles).toStrictEqual(expectedProfiles);
      });
    });
  });
});
