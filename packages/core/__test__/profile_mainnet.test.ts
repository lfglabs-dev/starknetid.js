import { Provider, constants } from "starknet";
import { StarknetIdNavigator } from "../src";

describe("test starknetid.js sdk on mainnet", () => {
  jest.setTimeout(90000000);
  const provider = new Provider({
    nodeUrl: "https://rpc.starknet.lava.build",
  });

  describe("test getProfileData with different collections", () => {
    test("getProfileData should return a blobert pfp", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        constants.StarknetChainId.SN_MAIN,
      );
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const profile = await starknetIdNavigator.getProfileData(
        "0x06fb5e4e650bb6ceb80923c008e81122129092efc7e6d6f3f5c9ac4eead25355",
        false,
      );
      const expectedProfile = {
        name: "rmz.stark",
        twitter: "302521256",
        github: undefined,
        discord: undefined,
        proofOfPersonhood: false,
        profilePicture:
          "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHByZXNlcnZlQXNwZWN0UmF0aW89InhNaW5ZTWluIG1lZXQiIHN0eWxlPSJpbWFnZS1yZW5kZXJpbmc6IHBpeGVsYXRlZCIgdmlld0JveD0iMCAwIDM1MCAzNTAiPjxpbWFnZSBocmVmPSJkYXRhOmltYWdlL3BuZztiYXNlNjQsaVZCT1J3MEtHZ29BQUFBTlNVaEVVZ0FBQURBQUFBQXdCQU1BQUFDbExPUzBBQUFBTFZCTVZFWFU0cmpRbWZmcVl2K0p4L3Vqbi83eGUvVDdqZUNiL01DNDg3SDZwZEx4eE1MUnlNeU02ZUd0LzZ1cGEra0gzelJpQUFBREtFbEVRVlE0eTAzUnNZdlRZQmdHOE5kRjJtYng2N1dpZHZMejdDaG9BZzZHdzE3aVpCRmFta0tkN0VFQ3VVbFJ5SEFWTW41VWhDQTBrTGpFNWJqRzVUcmMwU05qQ3pjWTV5NW1PZThQOGZsU1JETzBoQjk5bi9kNVM2eS8yL1dPc2k4Y3p4c0tEM1pWWFZVNzkxSmFzRWVHZDZTYzhmdWNqK2o0Z0t1cWhJUytzL3IxMDdjQVZ1ZHRxanJjK0FzTDF0RGZLdWVjc1hvN0lJYy9BSmdzcFRSanJIdTBCUjdJRUlBbVFWbXduUitVV1Qxem54L1NUWVJzSWFhTU5aNlZZQ0s5aGhCQUp5YVhGTWFlblNxMmhIWkNZZis2VEtkaFFJeTlQRldhRWg0R05MZDNqUklleG5TRE5US2FXUUNFVk8xSEFQTXVYYmtTWHBaUTV5NWgxbStFM0tZbm80Ull3NlF6cTJIc2M3d2N5NFcxRjdTSFZvQlRDVTg0WHFvMk4wcmdNYUg4OHpOcllHZ2NpZHU5VEZJNVFnQTNyWUdwY2hreVIzd0pJd0I3WHBXd3o5MEVoK3licWthcnEzYWdsTkJycUU4NGFwRnpzR3VZdE5wSElBRFZHL3BqM2tiSXVjMU5DUWlVNEZnREhlbUhDU2xPLzlxa0hITUJ0d0E5ZlZYbmg0bWcwTFlBZTNJdHdMbmQwM05ac1VJWHRtVlJydkZoY29PMWxITm5yT2RyYnNVVlA1c0JKaHJxQXVqQ0dYZnpWZE9LeVZlYUFBOGc5L1V2UXFlYjV5OHNOeEZLc3c5WVhXR3RMZXprK1dNTElmNk04eEpjd0xJV2hZM2NXMXZEb09JZlMwQVJ1ZGFTb25DUWV4TVpJbW9IZ1Bjb0VraVlSNWJ1ZVdmV0lXWjlBMHkyY01ldlJwYmhlZStzMTBsRktIWEFIb0JLc0hjdXZhTW0va1ZCaXhKR1dLc2xhbk43OE5UekdBNHNmQVdnOFZGRWk1YVlwck1lUWhZc3Bvb1FKUXlqNUVack9VM0RYdGZ6UHJCNy80UFNXdnExY0l6MENXTUkyVUk3U2lsYmltbGtHNWZlcE1PQ0xhei93UXhyYmRaeVZnbFhiVGM5eVRMaHo4UEcwNCtiOXgyV2xMQUN4Q2VmTWlFQStzZGlvckd2QkpCWGRBQ1lsVVlTTnV2TzNkTUtBRmQwY0o4U3hzYlBvcGlZK0FrQVY1VHdDVEFmNzF3V3hVYnIzRTBBdUluanBJUlowM1RNOUtJbzNtdnNIc0JEUXljbThRODh0Y1BvWTRHUW9ST1J3RjVweUdUSUJvdlJaM3p0dFIwM3FBaGZwTWNNSVpCVmgwU0J4Ujg2Yml4aE91K2hJdVNYQm9DL0dMclJpUkM0dkMyYjRKa0E4UGtLSVFGQXBIYlB3Q3c4ZndBeXdwdU9rZ1k0TkFBQUFBQkpSVTVFcmtKZ2dnPT0iIHg9IjAiIHk9IjAiIHdpZHRoPSIzNTBweCIgaGVpZ2h0PSIzNTBweCIgLz48aW1hZ2UgaHJlZj0iZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFEQUFBQUF3QkFNQUFBQ2xMT1MwQUFBQUlWQk1WRVVBQUFDbndWUkNlREVPRkI3cjdld2dUeTNaWWpuR3pjN28xYksxZTFiRmxuRWUyc2t2QUFBQUFYUlNUbE1BUU9iWVpnQUFBSlZKUkVGVU9NdnRrTDBOd21BTVJDMnlBQmRMRVNXZnM0RDV5UVpNRUlrQkVDdXdBQjB0SlNPd0pSYXR6eVVWZVhMMzVEdkw4aHRjT0FjVlNvZEM3TlJMVVVaNUlRcXpiOERJRmd4QVQxYW1oa0I1VXVBcGFjWnNNVTRxYnNlWU1WV0VPTVZvcXJEaEFtQzRsaUpWR1BCK1BhRk1iQjczTE9MV0wrU3FCdnFUYmpxSDZ0a1hEY0ZhbUFrbGxKVkp3YllXQzMvQUIyaklGWkZOMGpZcEFBQUFBRWxGVGtTdVFtQ0MiIHg9IjAiIHk9IjAiIHdpZHRoPSIzNTBweCIgaGVpZ2h0PSIzNTBweCIgLz48aW1hZ2UgaHJlZj0iZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFEQUFBQUF3Q0FNQUFBQmczQW0xQUFBQU9WQk1WRVVBQUFBT0ZCNXVFaldVRHpkS0VEREpKakYrbFpkK1RUOGZMampyN2V6R3pjNjFlMVk0U1ZFVkhTdFViM25hdDVFMkhpYU9UeWxsTVN1azl5b1BBQUFBQVhSU1RsTUFRT2JZWmdBQUFReEpSRUZVU01mdGtzdXVnekFNUkJuamhCQkNMcjMvLzdHZHBFRkN6YVBkZGNOaFlXVFB3VUV3M2R6Yy9BUU1SbWoxMXE3QkVScTkxWGNNZUE1UkNSN1d0Z3lrdnEvWHN5Mlp0N2F5cGMxSGdaTTVVZVZwTkZlWHZORkwwNnIyQmJ6eVJxMC80MVptVWRJV0ZwZ0VHUExydW5xU2RncElXOWlRMExrZ3BRZ25mN1dEWmRtMmJZRTJoZXk4Q3ptL3E1Z1NWTW5GS0JiU0VKRHlMb2lZRjFwS0FKS3dWV2NpKys2Y0U2SW5vaUVDM2ZkTytTRGw2Q3JDcWpHVWFFY0lUaTRyaEJ0R2d0dnJEVzZuTURTRTRmTG1Rb0g1UHJERTUrOXNBaS9QRzB1aEQyS01Oak9IRUdaclk4UTBCRXFFcFBPWC8zUU1rSTBDTUgwR0Y2WnZ3UC9qQVpiak9MNFVFbWU1eVR3QlBxVUpDOGVyTjJnQUFBQUFTVVZPUks1Q1lJST0iIHg9IjAiIHk9IjAiIHdpZHRoPSIzNTBweCIgaGVpZ2h0PSIzNTBweCIgLz48aW1hZ2UgaHJlZj0iZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFEQUFBQUF3QkFNQUFBQ2xMT1MwQUFBQUpGQk1WRVVBQUFBT0ZCN3I3ZXpRMUl6dHdHMm53VlRrbno1Q2VERWdUeTF5blQvR2VTZU9UeW1Eci9aSEFBQUFBWFJTVGxNQVFPYllaZ0FBQUZOSlJFRlVPTXRqR0FXamdHUWdLSUF1d2lnSUpqZGlxcFVTQUVrc3hKUmdkQVFTWWdKWWpCY1NGQlJNeEdZdm81S0xtd0IyRnhrSFluZXFzSks1QUE2SkNPd1NrcUV6c0Vzd2xqZmlEbzlSUUJjQUFDR2JCMXUzSVNFR0FBQUFBRWxGVGtTdVFtQ0MiIHg9IjAiIHk9IjAiIHdpZHRoPSIzNTBweCIgaGVpZ2h0PSIzNTBweCIgLz48aW1hZ2UgaHJlZj0iZGF0YTppbWFnZS9wbmc7YmFzZTY0LGlWQk9SdzBLR2dvQUFBQU5TVWhFVWdBQUFEQUFBQUF3QkFNQUFBQ2xMT1MwQUFBQUcxQk1WRVVBQUFEU1dDa09GQjZtVUNPNG0yeFlJd0RmYURqZzJKa21PeTYrK3JhN0FBQUFBWFJTVGxNQVFPYllaZ0FBQUhaSlJFRlVPTXRqR0FXMEFFeEtTdGdsbEkwRkZiRHJDSFpVd0tGRkJKY0VGWFVJRGtZSkpWd1NETGdrbUFWeHhJY3lEZ2xXTTBFQjdOR1I2SUxWRWxVemtRNUhJYXdhZ0JJZ0xaZ1NKUjN1V0NYU0JWMEVDMG1TU0JRRUFxd1NMdVV1Z3FUb0FQckRCZVlQVEMwS1dLTURDQmdHR0FBQThmd1d4NjB2SXpRQUFBQUFTVVZPUks1Q1lJST0iIHg9IjAiIHk9IjAiIHdpZHRoPSIzNTBweCIgaGVpZ2h0PSIzNTBweCIgLz48L3N2Zz4=",
      };
      expect(profile).toStrictEqual(expectedProfile);
    });

    test("getProfileData with a starkurabu pfp", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        constants.StarknetChainId.SN_MAIN,
      );
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const profile = await starknetIdNavigator.getProfileData(
        "0x061b6c0a78f9edf13cea17b50719f3344533fadd470b8cb29c2b4318014f52d3",
        false,
      );
      expect(
        profile.profilePicture &&
          profile.profilePicture.startsWith("https://img.starkurabu.com"),
      ).toBeTruthy();
      const expectedProfile = {
        name: "fricoben.stark",
        twitter: "1255853529866145794",
        github: "78437165",
        discord: "662387807901188096",
        proofOfPersonhood: true,
      };
      expect(profile).toMatchObject(expectedProfile);
    });

    test("getProfileData with a duck pfp", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        constants.StarknetChainId.SN_MAIN,
      );
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const profile = await starknetIdNavigator.getProfileData(
        "0x029b96adaefdb4299be95cdee599bff6bcca26c4e85a4d8ace79231f4618017f",
      );
      const expectedProfile = {
        name: "iris.stark",
        twitter: undefined,
        github: undefined,
        discord: undefined,
        proofOfPersonhood: false,
        profilePicture:
          "https://api.briq.construction/v1/preview/starknet-mainnet-dojo/0x6cff01dd5d1e2ec5e792d66bd6edae386bd022b4ffd993c76c08cd000000003.png",
      };
      expect(profile).toStrictEqual(expectedProfile);
    });

    test("getProfileData with a everai pfp", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        constants.StarknetChainId.SN_MAIN,
      );
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const profile = await starknetIdNavigator.getProfileData(
        "0x007b275f7524f39b99a51c7134bc44204fedc5dd1e982e920eb2047c6c2a71f0",
      );
      const expectedProfile = {
        name: "pragmarob.stark",
        twitter: undefined,
        github: undefined,
        discord: undefined,
        proofOfPersonhood: false,
        profilePicture:
          "https://gateway.pinata.cloud/ipfs/QmZS7maV678eJW7wJaVXJc28aKXzdZrwS1hmBmSy6bUVJh/1925.jpg",
      };
      expect(profile).toStrictEqual(expectedProfile);
    });

    test("getProfileData on an address with no identity", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        constants.StarknetChainId.SN_MAIN,
      );
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const profile = await starknetIdNavigator.getProfileData(
        "0x0302de76464d4e2447F2d1831fb0A1AF101B18F80964fCfff1aD831C0A92e1fD",
      );
      const expectedProfile = {
        name: "",
        twitter: undefined,
        github: undefined,
        discord: undefined,
        proofOfPersonhood: false,
        profilePicture: "https://identicon.starknet.id/0",
      };
      expect(profile).toStrictEqual(expectedProfile);
    });

    test("getProfileData on undeployed account", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        constants.StarknetChainId.SN_MAIN,
      );
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const profile = await starknetIdNavigator.getProfileData(
        "0x0097095403155fcbFA72AA53270D6eDd0DCC830bBb9264455517DF3e508633E5",
      );
      const expectedProfile = {
        name: "",
        twitter: undefined,
        github: undefined,
        discord: undefined,
        proofOfPersonhood: false,
        profilePicture: "https://identicon.starknet.id/0",
      };
      expect(profile).toStrictEqual(expectedProfile);
    });
  });

  describe("getStarkNames on mainnet", () => {
    test("getStarkNames", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        constants.StarknetChainId.SN_MAIN,
      );
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const names = await starknetIdNavigator.getStarkNames([
        "0x029b96adaefdb4299be95cdee599bff6bcca26c4e85a4d8ace79231f4618017f",
        "0x016Ed7556bF325417340A188Bf3646cE1ABc91711671344832a2D613FfC7cF49", // undeployed account
        "0x061b6c0a78f9edf13cea17b50719f3344533fadd470b8cb29c2b4318014f52d3",
        "0x0302de76464d4e2447F2d1831fb0A1AF101B18F80964fCfff1aD831C0A92e1fD", // address without a stark name
        "0x06fb5e4e650bb6ceb80923c008e81122129092efc7e6d6f3f5c9ac4eead25355",
      ]);
      const expectedNames = [
        "iris.stark",
        "",
        "fricoben.stark",
        "",
        "rmz.stark",
      ];
      expect(names).toStrictEqual(expectedNames);
    });
  });

  describe("getStarkProfiles on mainnet", () => {
    test("getStarkProfiles with existing profiles", async () => {
      const starknetIdNavigator = new StarknetIdNavigator(
        provider,
        constants.StarknetChainId.SN_MAIN,
      );
      expect(starknetIdNavigator).toBeInstanceOf(StarknetIdNavigator);
      const profiles = await starknetIdNavigator.getStarkProfiles([
        "0x029b96adaefdb4299be95cdee599bff6bcca26c4e85a4d8ace79231f4618017f", //duck
        "0x06fb5e4e650bb6ceb80923c008e81122129092efc7e6d6f3f5c9ac4eead25355", // blobbert
        "0x061b6c0a78f9edf13cea17b50719f3344533fadd470b8cb29c2b4318014f52d3", // starkurabu
        "0x0097095403155fcbFA72AA53270D6eDd0DCC830bBb9264455517DF3e508633E5", // nothing
        "0x007b275f7524f39b99a51c7134bc44204fedc5dd1e982e920eb2047c6c2a71f0", // everai pfp
      ]);
      const expectedProfiles = [
        { name: "iris.stark" },
        { name: "rmz.stark" },
        { name: "fricoben.stark" },
        { name: undefined },
        { name: "pragmarob.stark" },
      ];

      profiles.forEach((profile, index) => {
        expect(profile.name).toEqual(expectedProfiles[index].name);
      });

      expect(
        profiles[0].profilePicture &&
          profiles[0].profilePicture.startsWith(
            "https://api.briq.construction",
          ),
      ).toBeTruthy();
      expect(
        profiles[1].profilePicture &&
          profiles[1].profilePicture.startsWith(
            "https://identicon.starknet.id",
          ),
      ).toBeTruthy();
      expect(
        profiles[2].profilePicture &&
          profiles[2].profilePicture.startsWith("https://img.starkurabu.com"),
      ).toBeTruthy();
      expect(
        profiles[3].profilePicture &&
          profiles[3].profilePicture.startsWith(
            "https://identicon.starknet.id",
          ),
      ).toBeTruthy();
      expect(
        profiles[4].profilePicture &&
          profiles[4].profilePicture.startsWith(
            "https://gateway.pinata.cloud/ipfs/",
          ),
      ).toBeTruthy();
    });
  });
});
