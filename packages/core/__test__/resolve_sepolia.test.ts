import { Provider, constants } from "starknet";
import { StarknetChainId, StarknetIdNavigator } from "../src";

describe("test starknetid.js sdk on sepolia", () => {
  jest.setTimeout(90000000);
  const provider = new Provider({
    nodeUrl: "https://sepolia.rpc.starknet.id",
  });

  describe("Test offchain resolving demo", () => {
    test.skip("iris.notion.stark resolve to the right address", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        StarknetChainId.SN_SEPOLIA,
      );
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const address = await starknetIdNavigator.getAddressFromStarkName(
        "iris.notion.stark",
      );
      expect(address).toBe(
        "0x220756d68c9b120fcfc539510fc474359bea9f8bc73e8af3a23a8276d571faf",
      );
    });
  });
});
