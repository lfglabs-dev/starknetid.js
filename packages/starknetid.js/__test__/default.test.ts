import { Account, Contract, stark, number, shortString } from "starknet";
import { StarknetIdNavigator } from "../src/starknetIDNavigator";
import {
  compiledErc20,
  compiledNamingContract,
  compiledPricingContract,
  compiledStarknetId,
  erc20ClassHash,
  getTestAccount,
  getTestProvider,
  namingClassHash,
  pricingClassHash,
  starknetIdClassHash,
} from "./fixtures";

describe("test starknetid.js sdk", () => {
  jest.setTimeout(600000);
  const provider = getTestProvider();
  const account = getTestAccount(provider)[0];

  let erc20: Contract;
  let erc20Address: string;
  let NamingContract: string;
  let IdentityContract: string;

  beforeAll(async () => {
    expect(account).toBeInstanceOf(Account);

    const initialTk = { low: 1000, high: 0 };
    const ERC20ConstructorCallData = stark.compileCalldata({
      name: shortString.encodeShortString("Token"),
      symbol: shortString.encodeShortString("ERC20"),
      decimals: "18",
      initial_supply: {
        type: "struct",
        low: initialTk.low,
        high: initialTk.high,
      },
      recipient: account.address,
      owner: account.address,
    });

    const declareDeploy = await account.declareDeploy({
      contract: compiledErc20,
      classHash: erc20ClassHash,
      constructorCalldata: ERC20ConstructorCallData,
    });

    erc20Address = declareDeploy.deploy.contract_address;
    erc20 = new Contract(compiledErc20.abi, erc20Address, provider);

    const { balance } = await erc20.balanceOf(account.address);
    expect(BigInt(balance.low).toString()).toStrictEqual(
      BigInt(1000).toString(),
    );

    // Deploy naming contract
    const namingResponse = await account.declareDeploy({
      contract: compiledNamingContract,
      classHash: namingClassHash,
    });
    NamingContract = namingResponse.deploy.contract_address;

    // Deploy Identity contract
    const idResponse = await account.declareDeploy({
      contract: compiledStarknetId,
      classHash: starknetIdClassHash,
    });
    IdentityContract = idResponse.deploy.contract_address;

    // Deploy pricing contract
    const pricingResponse = await account.declareDeploy({
      contract: compiledPricingContract,
      classHash: pricingClassHash,
      constructorCalldata: [erc20Address],
    });
    const pricingContractAddress = pricingResponse.deploy.contract_address;

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
  });

  describe("Retrieve domains", () => {
    test("getAddressFromStarkName should return account.address", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        naming: NamingContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const address = await starknetIdNavigator.getAddressFromStarkName(
        "ben.stark",
      );
      expect(address).toBe(account.address);
    });

    test("getStarkName should return ben.stark", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        naming: NamingContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const name = await starknetIdNavigator.getStarkName(account.address);
      expect(name).toBe("ben.stark");
    });

    test("getStarknetId should return id 1 for ben.stark", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        naming: NamingContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const id = await starknetIdNavigator.getStarknetId("ben.stark");
      expect(id).toEqual(1);
    });

    test("Should fail because contractAddress not deployed", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider);
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      expect(starknetIdNavigator.StarknetIdContract.naming).toEqual("");

      await expect(
        starknetIdNavigator.getStarkName(account.address),
      ).rejects.toThrow("Could not get stark name");
    });

    test("getAddressFromStarkName should fail because domain does not exist", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        naming: NamingContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const address = await starknetIdNavigator.getAddressFromStarkName(
        "test.stark",
      );
      expect(address).toBe("0x0");
    });

    test("getStarkName should fail because address has no starkname", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        naming: NamingContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);

      const otherAccount = getTestAccount(provider)[1];
      expect(otherAccount).toBeInstanceOf(Account);

      await expect(
        starknetIdNavigator.getStarkName(otherAccount.address),
      ).rejects.toThrow("Starkname not found");
    });
  });

  describe("Retrieve user data", () => {
    beforeAll(async () => {
      const { transaction_hash: txHash } = await account.execute([
        {
          contractAddress: IdentityContract.toLowerCase(),
          entrypoint: "set_user_data",
          calldata: [
            "1",
            shortString.encodeShortString("discord"),
            shortString.encodeShortString("test"),
          ],
        },
        {
          contractAddress: IdentityContract,
          entrypoint: "set_extended_user_data",
          calldata: [
            "1", // token_id
            shortString.encodeShortString("avatar"), // field
            "3", // length
            shortString.encodeShortString("my"), // value
            shortString.encodeShortString("avatar"),
            shortString.encodeShortString("url"),
          ],
        },
      ]);
      await provider.waitForTransaction(txHash);
    });

    test("getUserData from id should succeed", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        identity: IdentityContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);

      const userData = await starknetIdNavigator.getUserData(1, "discord");
      expect(userData).toStrictEqual(
        number.toBN(shortString.encodeShortString("test")),
      );
    });

    test("getUserData from domain should succeed", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        naming: NamingContract,
        identity: IdentityContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);

      const userData = await starknetIdNavigator.getUserData(
        "ben.stark",
        "discord",
      );
      expect(userData).toStrictEqual(
        number.toBN(shortString.encodeShortString("test")),
      );
    });

    test("getUserExtentedData should return user extended data", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        identity: IdentityContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);

      const userExtendedData = await starknetIdNavigator.getExtentedUserData(
        1,
        "avatar",
        3,
      );

      expect(userExtendedData[0]).toStrictEqual(
        number.toBN(shortString.encodeShortString("my")),
      );
      expect(userExtendedData[1]).toStrictEqual(
        number.toBN(shortString.encodeShortString("avatar")),
      );
      expect(userExtendedData[2]).toStrictEqual(
        number.toBN(shortString.encodeShortString("url")),
      );
    });

    test("getUserUnboundedData should return user unbounded data", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        identity: IdentityContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);

      const userExtendedData = await starknetIdNavigator.getUnboundedUserData(
        1,
        "avatar",
      );

      expect(userExtendedData.length).toBe(3);
      expect(userExtendedData[0]).toStrictEqual(
        number.toBN(shortString.encodeShortString("my")),
      );
      expect(userExtendedData[1]).toStrictEqual(
        number.toBN(shortString.encodeShortString("avatar")),
      );
      expect(userExtendedData[2]).toStrictEqual(
        number.toBN(shortString.encodeShortString("url")),
      );
    });

    test("Should fail because identity contract not deployed", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider);
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);

      await expect(
        starknetIdNavigator.getUserData(1, "discord"),
      ).rejects.toThrow("Could not get user data from starknet id");
    });

    test("getUserData should return 0x0 when id does not exist", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        identity: IdentityContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);

      const userData = await starknetIdNavigator.getUserData(2, "discord");
      expect(userData).toStrictEqual(number.toBN("0x0"));
    });

    test("getUserExtentedData should succeed even with wrong lenth", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        identity: IdentityContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);

      const userExtendedData = await starknetIdNavigator.getExtentedUserData(
        1,
        "avatar",
        5,
      );

      expect(userExtendedData.length).toBe(5);
      expect(userExtendedData[0]).toStrictEqual(
        number.toBN(shortString.encodeShortString("my")),
      );
      expect(userExtendedData[1]).toStrictEqual(
        number.toBN(shortString.encodeShortString("avatar")),
      );
      expect(userExtendedData[2]).toStrictEqual(
        number.toBN(shortString.encodeShortString("url")),
      );
      expect(userExtendedData[3]).toStrictEqual(number.toBN(0));
      expect(userExtendedData[4]).toStrictEqual(number.toBN(0));
    });

    test("getUserData should return 0x0 when field does not exist", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        identity: IdentityContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);

      const userData = await starknetIdNavigator.getUserData(2, "field");
      expect(userData).toStrictEqual(number.toBN("0x0"));
    });
  });

  describe("Retrieve verifier data", () => {
    const otherAccount = getTestAccount(provider)[1];

    beforeAll(async () => {
      const { transaction_hash } = await otherAccount.execute([
        {
          contractAddress: IdentityContract,
          entrypoint: "set_verifier_data",
          calldata: [
            "1", // token_id
            shortString.encodeShortString("discord"), // field
            shortString.encodeShortString("test"), // value
          ],
        },
        {
          contractAddress: IdentityContract,
          entrypoint: "set_extended_verifier_data",
          calldata: [
            "1", // token_id
            shortString.encodeShortString("avatar"), // field
            "3", // length
            shortString.encodeShortString("my"), // value
            shortString.encodeShortString("avatar"),
            shortString.encodeShortString("url"),
          ],
        },
      ]);
      await provider.waitForTransaction(transaction_hash);
    });

    test("getVerifierData from id should succeed", async () => {
      expect(otherAccount).toBeInstanceOf(Account);
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        identity: IdentityContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);

      const userData = await starknetIdNavigator.getVerifierData(
        1,
        "discord",
        otherAccount.address,
      );
      expect(userData).toStrictEqual(
        number.toBN(shortString.encodeShortString("test")),
      );
    });

    test("getVerifierData from domain should succeed", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        naming: NamingContract,
        identity: IdentityContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);

      const verifierData = await starknetIdNavigator.getVerifierData(
        "ben.stark",
        "discord",
        otherAccount.address,
      );
      expect(verifierData).toStrictEqual(
        number.toBN(shortString.encodeShortString("test")),
      );
    });

    test("getVerifierExtendedData should succeed", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        identity: IdentityContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);

      const extendedData = await starknetIdNavigator.getExtendedVerifierData(
        1,
        "avatar",
        3,
        otherAccount.address,
      );

      expect(extendedData.length).toBe(3);
      expect(extendedData[0]).toStrictEqual(
        number.toBN(shortString.encodeShortString("my")),
      );
      expect(extendedData[1]).toStrictEqual(
        number.toBN(shortString.encodeShortString("avatar")),
      );
      expect(extendedData[2]).toStrictEqual(
        number.toBN(shortString.encodeShortString("url")),
      );
    });

    test("getVerifierUnboundedData should succeed", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        identity: IdentityContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);

      const unboundedData = await starknetIdNavigator.getUnboundedVerifierData(
        1,
        "avatar",
        otherAccount.address,
      );

      expect(unboundedData.length).toBe(3);
      expect(unboundedData[0]).toStrictEqual(
        number.toBN(shortString.encodeShortString("my")),
      );
      expect(unboundedData[1]).toStrictEqual(
        number.toBN(shortString.encodeShortString("avatar")),
      );
      expect(unboundedData[2]).toStrictEqual(
        number.toBN(shortString.encodeShortString("url")),
      );
    });

    test("getVerifierData should fail because identity contract not deployed", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider);
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);

      await expect(
        starknetIdNavigator.getVerifierData(1, "discord", otherAccount.address),
      ).rejects.toThrow("Could not get user verifier data from starknet id");
    });

    test("getVerifierData should return 0x0 in case verifier contract is not deployed", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        identity: IdentityContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);

      const verifierData = await starknetIdNavigator.getVerifierData(
        1,
        "discord",
      );
      expect(verifierData).toStrictEqual(number.toBN("0x0"));
    });

    test("getVerifierData should return 0x0 when field in custom verifier contract does not exist", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        identity: IdentityContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);

      const verifierData = await starknetIdNavigator.getVerifierData(
        1,
        "field",
        otherAccount.address,
      );
      expect(verifierData).toStrictEqual(number.toBN("0x0"));
    });

    test("getVerifierData should return 0x0 when id does not exist", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(provider, {
        identity: IdentityContract,
      });
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);

      const verifierData = await starknetIdNavigator.getVerifierData(
        2,
        "discord",
        otherAccount.address,
      );
      expect(verifierData).toStrictEqual(number.toBN("0x0"));
    });
  });
});
