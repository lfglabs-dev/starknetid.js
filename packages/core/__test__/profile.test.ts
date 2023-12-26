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
  getTestAccount,
  getTestProvider,
} from "./fixtures";
import { getMulticallContract, decodeDomain } from "../src/utils";

jest.mock("../src/utils");

describe("test starknetid.js sdk", () => {
  jest.setTimeout(90000000);
  const provider = getTestProvider();
  const account = getTestAccount(provider)[0];
  const otherAccount = getTestAccount(provider)[1];

  let erc20Address: string =
    "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
  let NamingContract: string;
  let IdentityContract: string;
  let MulticallContract: string;
  let NFTContract: string;

  beforeAll(async () => {
    expect(account).toBeInstanceOf(Account);

    // Deploy Identity contract
    const idResponse = await account.declareAndDeploy({
      contract: compiledIdentitySierra,
      casm: compiledIdentitySierraCasm,
      constructorCalldata: [account.address, 0],
    });
    IdentityContract = idResponse.deploy.contract_address;

    // Deploy pricing contract
    const pricingResponse = await account.declareAndDeploy({
      contract: compiledPricingSierra,
      casm: compiledPricingSierraCasm,
      constructorCalldata: [erc20Address],
    });
    const pricingContractAddress = pricingResponse.deploy.contract_address;

    // Deploy naming contract
    const namingResponse = await account.declareAndDeploy({
      contract: compiledNamingSierra,
      casm: compiledNamingSierraCasm,
      constructorCalldata: [
        IdentityContract,
        pricingContractAddress,
        0,
        account.address,
      ],
    });
    NamingContract = namingResponse.deploy.contract_address;

    // Deploy multicall contract
    const multicallResponse = await account.declareAndDeploy({
      contract: compiledMulticallSierra,
      casm: compiledMulticallSierraCasm,
    });
    MulticallContract = multicallResponse.deploy.contract_address;

    // Deploy erc721 contract
    const erc721Response = await account.declareAndDeploy({
      contract: compiledErc721Sierra,
      casm: compiledErc721SierraCasm,
      constructorCalldata: [
        shortString.encodeShortString("NFT"),
        shortString.encodeShortString("NFT"),
        [
          shortString.encodeShortString("https://goerli.api.starknet.qu"),
          shortString.encodeShortString("est/quests/uri?level="),
        ],
      ],
    });
    NFTContract = erc721Response.deploy.contract_address;

    const { transaction_hash } = await account.execute([
      {
        contractAddress: NamingContract,
        entrypoint: "initializer",
        calldata: [
          IdentityContract, // starknetid_contract_addr
          pricingContractAddress, // pricing_contract_addr
          account.address, // admin
          "0", // l1_contract
        ],
      },
      {
        contractAddress: erc20Address,
        entrypoint: "approve",
        calldata: [NamingContract, 10000000000000, 0], // Price of domain
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
          "365", // Expiry
          "0",
          account.address, // receiver_address
          0,
          0,
        ],
      },
      {
        contractAddress: NamingContract,
        entrypoint: "set_address_to_domain",
        calldata: [
          "1", // length
          "18925", // Domain encoded "ben"
        ],
      },
    ]);
    await provider.waitForTransaction(transaction_hash);

    // Add verifier data
    const { transaction_hash: transaction_hash2 } = await otherAccount.execute([
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
    ]);
    await provider.waitForTransaction(transaction_hash2);
  });

  describe("getProfileData", () => {
    beforeEach(() => {
      (getMulticallContract as jest.Mock).mockImplementation(
        (chainId: constants.StarknetChainId) => {
          if (chainId === constants.StarknetChainId.SN_GOERLI) {
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
        constants.StarknetChainId.SN_GOERLI,
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
        constants.StarknetChainId.SN_GOERLI,
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
        profilePicture: "https://starknet.id/api/identicons/1",
      };
      expect(profile).toStrictEqual(expectedProfile);
    });
  });

  describe("getProfileData with nft profile picture", () => {
    beforeAll(async () => {
      // Add nft pp verifier data
      const { transaction_hash } = await otherAccount.execute([
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
      ]);
      await provider.waitForTransaction(transaction_hash);
    });

    test("getProfileData should return the right values", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        constants.StarknetChainId.SN_GOERLI,
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
          "https://goerli.starknet.quest/starkfighter/level1.webp",
      };
      expect(profile).toStrictEqual(expectedProfile);
    });
  });
});
