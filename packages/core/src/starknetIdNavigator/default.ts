import {
  ProviderInterface,
  shortString,
  num,
  validateChecksumAddress,
  getChecksumAddress,
  constants,
  CallData,
  Contract,
  Call,
} from "starknet";
import {
  decodeDomain,
  encodeDomain,
  getNamingContract,
  getIdentityContract,
  getVerifierContract,
  isStarkDomain,
  getPfpVerifierContract,
  getPopVerifierContract,
  getMulticallContract,
  getUtilsMulticallContract,
  getBlobbertContract,
} from "../utils";
import { StarknetIdNavigatorInterface } from "./interface";
import { StarkProfile, StarknetIdContracts } from "../types";
import {
  executeMulticallWithFallback,
  executeWithFallback,
  extractArrayFromErrorMessage,
  fetchImageUrl,
  getProfileDataCalldata,
  getStarkProfilesCalldata,
  getStarknamesCalldata,
  parseBase64Image,
  queryServer,
} from "./internal";

export class StarknetIdNavigator implements StarknetIdNavigatorInterface {
  public provider: ProviderInterface;
  public StarknetIdContract: StarknetIdContracts;
  public chainId: constants.StarknetChainId;

  constructor(
    provider: ProviderInterface,
    chainId: constants.StarknetChainId,
    starknetIdContract?: StarknetIdContracts,
  ) {
    this.provider = provider;
    this.chainId = chainId;
    this.StarknetIdContract = starknetIdContract ?? {
      identity: getIdentityContract(chainId),
      naming: getNamingContract(chainId),
    };
  }

  public async getAddressFromStarkName(domain: string): Promise<string> {
    const contract =
      this.StarknetIdContract.naming ?? getNamingContract(this.chainId);
    const encodedDomain = encodeDomain(domain).map((elem) => elem.toString(10));

    try {
      return await this.tryResolveDomain(contract, encodedDomain, []);
    } catch (error) {
      if (error instanceof Error) {
        // extract server uri from error message
        const data = extractArrayFromErrorMessage(String(error));
        if (!data || data?.errorType !== "offchain_resolving") {
          // if the error is not related to offchain resolving
          throw new Error("Could not get address from stark name");
        }

        // we try querying the server for each uri, and will stop once one is working
        for (const uri of data.uris) {
          try {
            const serverRes = await queryServer(uri, data.domain_slice);
            if (serverRes.error) {
              continue;
            }
            // try resolving with hint
            const hint: any[] = [
              serverRes.data.address,
              serverRes.data.r,
              serverRes.data.s,
              serverRes.data.max_validity,
            ];
            return await this.tryResolveDomain(contract, encodedDomain, hint);
          } catch (error: any) {
            throw new Error(
              `Could not resolve domain on URI ${uri} : ${error.message}`,
            );
          }
        }
        throw new Error("Could not get address from stark name");
      } else {
        throw new Error("Could not get address from stark name");
      }
    }
  }

  public async getStarkName(address: string): Promise<string> {
    const contract =
      this.StarknetIdContract.naming ?? getNamingContract(this.chainId);

    try {
      // todo: remove fallback when naming contract is updated on mainnet
      const calldata: Call = {
        contractAddress: contract,
        entrypoint: "address_to_domain",
        calldata: CallData.compile({
          address: address,
          hint: [],
        }),
      };
      const fallbackCalldata: Call = {
        contractAddress: contract,
        entrypoint: "address_to_domain",
        calldata: CallData.compile({
          address: address,
        }),
      };
      const hexDomain = await executeWithFallback(
        this.provider,
        calldata,
        fallbackCalldata,
      );
      const decimalDomain = hexDomain.result
        .map((element) => BigInt(element))
        .slice(1);
      const stringDomain = decodeDomain(decimalDomain);

      if (!stringDomain) {
        throw new Error("Could not get stark name");
      }

      return stringDomain;
    } catch (e) {
      throw new Error("Could not get stark name");
    }
  }

  public async getStarkNames(
    addresses: string[],
    multicallContract?: string,
  ): Promise<string[]> {
    const namingContract =
      this.StarknetIdContract.naming ?? getNamingContract(this.chainId);
    const multicallAddress =
      multicallContract ?? getMulticallContract(this.chainId);

    // We need our contract to know the abi,
    // otherwise we have to hardcode all the values for each enums
    const { abi: multicallAbi } = await this.provider.getClassAt(
      multicallAddress,
    );
    const contract = new Contract(
      multicallAbi,
      multicallAddress,
      this.provider,
    );

    try {
      let { initialCalldata, fallbackCalldata } = getStarknamesCalldata(
        addresses,
        namingContract,
      );

      const data = await executeMulticallWithFallback(
        contract,
        "aggregate",
        initialCalldata,
        fallbackCalldata,
      );

      let result: string[] = [];
      if (Array.isArray(data)) {
        data.forEach((hexDomain: any) => {
          const decimalDomain = hexDomain
            .map((element: bigint) => BigInt(element))
            .slice(1);
          const stringDomain = decodeDomain(decimalDomain);
          result.push(stringDomain);
        });
      }

      return result;
    } catch (e) {
      throw new Error("Could not get stark names");
    }
  }

  public async getStarknetId(domain: string): Promise<string> {
    const contract =
      this.StarknetIdContract.naming ?? getNamingContract(this.chainId);

    try {
      const encodedDomain = encodeDomain(domain).map((elem) =>
        elem.toString(10),
      );
      const starknetId = await this.provider.callContract({
        contractAddress: contract,
        entrypoint: "domain_to_id",
        calldata: CallData.compile({
          domain: encodedDomain,
        }),
      });
      return BigInt(starknetId.result[0]).toString();
    } catch (e) {
      if (e instanceof Error && e.message === "Could not get stark name") {
        throw e;
      }
      throw new Error("Could not get starknet id from starkname");
    }
  }

  public async getUserData(
    idDomainOrAddr: string,
    field: string,
  ): Promise<BigInt> {
    const contract =
      this.StarknetIdContract.identity ?? getIdentityContract(this.chainId);
    const id = await this.checkArguments(idDomainOrAddr);

    try {
      const data = await this.provider.callContract({
        contractAddress: contract,
        entrypoint: "get_user_data",
        calldata: CallData.compile({
          token_id: id.toString(),
          field: shortString.encodeShortString(field),
          domain: "0",
        }),
      });
      return num.toBigInt(data.result[0]);
    } catch (e) {
      if (e instanceof Error && e.message === "User not found") {
        throw e;
      }
      throw Error("Could not get user data from starknet id");
    }
  }

  public async getExtentedUserData(
    idDomainOrAddr: string,
    field: string,
    length: number,
  ): Promise<BigInt[]> {
    const contract =
      this.StarknetIdContract.identity ?? getIdentityContract(this.chainId);
    const id = await this.checkArguments(idDomainOrAddr);

    try {
      const data = await this.provider.callContract({
        contractAddress: contract,
        entrypoint: "get_extended_user_data",
        calldata: CallData.compile({
          token_id: id.toString(),
          field: shortString.encodeShortString(field),
          length: length.toString(),
          domain: "0",
        }),
      });

      data.result.shift();
      const res = data.result.map((element: string) => {
        return num.toBigInt(element);
      });

      return res;
    } catch (e) {
      if (e instanceof Error && e.message === "User not found") {
        throw e;
      }
      throw Error("Could not get user extended data from starknet id");
    }
  }

  public async getUnboundedUserData(
    idDomainOrAddr: string,
    field: string,
  ): Promise<BigInt[]> {
    const contract =
      this.StarknetIdContract.identity ?? getIdentityContract(this.chainId);
    const id = await this.checkArguments(idDomainOrAddr);

    try {
      const data = await this.provider.callContract({
        contractAddress: contract,
        entrypoint: "get_unbounded_user_data",
        calldata: CallData.compile({
          token_id: id.toString(),
          field: shortString.encodeShortString(field),
          domain: "0",
        }),
      });

      data.result.shift();
      const res = data.result.map((element: string) => {
        return num.toBigInt(element);
      });

      return res;
    } catch (e) {
      if (e instanceof Error && e.message === "User not found") {
        throw e;
      }
      throw Error("Could not get user unbounded data from starknet id");
    }
  }

  public async getVerifierData(
    idDomainOrAddr: string,
    field: string,
    verifier?: string,
  ): Promise<BigInt> {
    const contract =
      this.StarknetIdContract.identity ?? getIdentityContract(this.chainId);
    const verifierAddress = verifier ?? getVerifierContract(this.chainId);
    const id = await this.checkArguments(idDomainOrAddr);

    try {
      const data = await this.provider.callContract({
        contractAddress: contract,
        entrypoint: "get_verifier_data",
        calldata: CallData.compile({
          token_id: id.toString(),
          field: shortString.encodeShortString(field),
          verifier_address: verifierAddress,
          domain: "0",
        }),
      });

      return num.toBigInt(data.result[0]);
    } catch (e) {
      if (e instanceof Error && e.message === "User not found") {
        throw e;
      }
      throw Error("Could not get user verifier data from starknet id");
    }
  }

  public async getExtendedVerifierData(
    idDomainOrAddr: string,
    field: string,
    length: number,
    verifier?: string,
  ): Promise<BigInt[]> {
    const contract =
      this.StarknetIdContract.identity ?? getIdentityContract(this.chainId);
    const verifierAddress = verifier ?? getVerifierContract(this.chainId);
    const id = await this.checkArguments(idDomainOrAddr);

    try {
      const data = await this.provider.callContract({
        contractAddress: contract,
        entrypoint: "get_extended_verifier_data",
        calldata: CallData.compile({
          token_id: id.toString(),
          field: shortString.encodeShortString(field),
          length: length.toString(),
          verifier_address: verifierAddress,
          domain: "0",
        }),
      });

      data.result.shift();
      const res = data.result.map((element: string) => {
        return num.toBigInt(element);
      });

      return res;
    } catch (e) {
      if (e instanceof Error && e.message === "User not found") {
        throw e;
      }
      throw Error("Could not get user verifier data from starknet id");
    }
  }

  public async getUnboundedVerifierData(
    idDomainOrAddr: string,
    field: string,
    verifier?: string,
  ): Promise<BigInt[]> {
    const contract =
      this.StarknetIdContract.identity ?? getIdentityContract(this.chainId);
    const verifierAddress = verifier ?? getVerifierContract(this.chainId);
    const id = await this.checkArguments(idDomainOrAddr);

    try {
      const data = await this.provider.callContract({
        contractAddress: contract,
        entrypoint: "get_unbounded_verifier_data",
        calldata: CallData.compile({
          token_id: id.toString(),
          field: shortString.encodeShortString(field),
          verifier_address: verifierAddress,
          domain: "0",
        }),
      });

      data.result.shift();
      const res = data.result.map((element: string) => {
        return num.toBigInt(element);
      });

      return res;
    } catch (e) {
      if (e instanceof Error && e.message === "User not found") {
        throw e;
      }
      throw Error("Could not get user verifier data from starknet id");
    }
  }

  public async getPfpVerifierData(
    idDomainOrAddr: string,
    verifier?: string,
  ): Promise<BigInt[]> {
    const contract =
      this.StarknetIdContract.identity ?? getIdentityContract(this.chainId);
    const pfpVerifierAddress = verifier ?? getPfpVerifierContract(this.chainId);
    const id = await this.checkArguments(idDomainOrAddr);

    try {
      const nftContractData = await this.provider.callContract({
        contractAddress: contract,
        entrypoint: "get_verifier_data",
        calldata: CallData.compile({
          token_id: id.toString(),
          field: shortString.encodeShortString("nft_pp_contract"),
          verifier_address: pfpVerifierAddress,
          domain: "0", // for now we only support domain 0
        }),
      });
      const nftContract = nftContractData.result.map((element: string) => {
        return num.toBigInt(element);
      });

      const nftTokenData = await this.provider.callContract({
        contractAddress: contract,
        entrypoint: "get_extended_verifier_data",
        calldata: CallData.compile({
          token_id: id.toString(),
          field: shortString.encodeShortString("nft_pp_id"),
          length: 2,
          verifier_address: pfpVerifierAddress,
          domain: "0", // for now we only support domain 0
        }),
      });
      nftTokenData.result.shift();
      const nftTokenId = nftTokenData.result.map((element: string) => {
        return num.toBigInt(element);
      });

      return [BigInt(0), ...nftContract, ...nftTokenId];
    } catch (e) {
      if (e instanceof Error && e.message === "User not found") {
        throw e;
      }
      throw Error("Could not get user verifier data from starknet id");
    }
  }

  public async getProfileData(
    address: string,
    useDefaultPfp: boolean = true,
    verifier?: string,
    pfp_verifier?: string,
    pop_verifier?: string,
  ): Promise<StarkProfile> {
    const identityContract =
      this.StarknetIdContract.identity ?? getIdentityContract(this.chainId);
    const namingContract =
      this.StarknetIdContract.naming ?? getNamingContract(this.chainId);
    const verifierContract = verifier ?? getVerifierContract(this.chainId);
    const pfpVerifierContract =
      pfp_verifier ?? getPfpVerifierContract(this.chainId);
    const popVerifierContract =
      pop_verifier ?? getPopVerifierContract(this.chainId);
    const multicallAddress = getMulticallContract(this.chainId);

    // We need our contract to know the abi,
    // otherwise we have to hardcode all the values for each enums
    const { abi: multicallAbi } = await this.provider.getClassAt(
      multicallAddress,
    );
    const multicallContract = new Contract(
      multicallAbi,
      multicallAddress,
      this.provider,
    );

    try {
      const { initialCalldata, fallbackCalldata } = getProfileDataCalldata(
        address,
        namingContract,
        identityContract,
        verifierContract,
        pfpVerifierContract,
        popVerifierContract,
      );
      const data = await executeMulticallWithFallback(
        multicallContract,
        "aggregate",
        initialCalldata,
        fallbackCalldata,
      );

      if (Array.isArray(data)) {
        const name = decodeDomain(data[0].slice(1));

        const twitter =
          data[2][0] !== BigInt(0) ? data[2][0].toString() : undefined;
        const github =
          data[3][0] !== BigInt(0) ? data[3][0].toString() : undefined;
        const discord =
          data[4][0] !== BigInt(0) ? data[4][0].toString() : undefined;
        const proofOfPersonhood = data[5][0] === BigInt(1) ? true : false;

        const profilePictureMetadata =
          data.length === 9
            ? data[8]
                .slice(1)
                .map((val: BigInt) =>
                  shortString.decodeShortString(val.toString()),
                )
                .join("")
            : undefined;

        // extract nft_image from profile data
        const profilePicture = profilePictureMetadata
          ? profilePictureMetadata.includes("base64")
            ? parseBase64Image(profilePictureMetadata)
            : await fetchImageUrl(profilePictureMetadata)
          : useDefaultPfp
          ? `https://starknet.id/api/identicons/${data[1][0].toString()}`
          : undefined;

        return {
          name,
          twitter,
          github,
          discord,
          proofOfPersonhood,
          profilePicture,
        };
      } else {
        throw Error("Error while calling aggregate function");
      }
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      }
      throw Error("Could not get user profile data from address");
    }
  }

  public async getStarkProfiles(
    addresses: string[],
    useDefaultPfp: boolean = true,
    pfp_verifier?: string,
  ): Promise<StarkProfile[]> {
    const identityContract =
      this.StarknetIdContract.identity ?? getIdentityContract(this.chainId);
    const namingContract =
      this.StarknetIdContract.naming ?? getNamingContract(this.chainId);
    const pfpVerifierContract =
      pfp_verifier ?? getPfpVerifierContract(this.chainId);
    const multicallAddress = getMulticallContract(this.chainId);
    const utilsMulticallContract = getUtilsMulticallContract(this.chainId);
    const blobbertContract = getBlobbertContract(this.chainId);

    // We need our contract to know the abi,
    // otherwise we have to hardcode all the values for each enums
    const { abi: multicallAbi } = await this.provider.getClassAt(
      multicallAddress,
    );
    const multicallContract = new Contract(
      multicallAbi,
      multicallAddress,
      this.provider,
    );

    try {
      const nbInstructions = 5;
      const { initialCalldata, fallbackCalldata } = getStarkProfilesCalldata(
        addresses,
        namingContract,
        identityContract,
        pfpVerifierContract,
        utilsMulticallContract,
        blobbertContract,
      );

      const data = await executeMulticallWithFallback(
        multicallContract,
        "aggregate",
        initialCalldata,
        fallbackCalldata,
      );

      if (Array.isArray(data)) {
        let results: StarkProfile[] = [];
        const callResult = data.slice(0, addresses.length * nbInstructions);
        const uriResult = data.slice(addresses.length * nbInstructions);
        let uriIndex = 0;

        for (let i = 0; i < addresses.length; i++) {
          const name = decodeDomain(callResult[i * nbInstructions].slice(1));
          const nftContract = callResult[i * nbInstructions + 2][0];

          const hasPfp =
            nftContract !== BigInt(0) &&
            nftContract !== BigInt(blobbertContract);

          const profilePictureMetadata = hasPfp
            ? uriResult[uriIndex]
                .slice(1)
                .map((val: BigInt) =>
                  shortString.decodeShortString(val.toString()),
                )
                .join("")
            : undefined;
          if (hasPfp) uriIndex++;

          // extract nft_image from profile picture metadata
          const profilePicture = profilePictureMetadata
            ? profilePictureMetadata.includes("base64")
              ? parseBase64Image(profilePictureMetadata)
              : await fetchImageUrl(profilePictureMetadata)
            : useDefaultPfp
            ? `https://starknet.id/api/identicons/${callResult[
                i * nbInstructions + 1
              ][0].toString()}` // result of domain_to_id
            : undefined;

          results.push({
            name: name.length > 0 ? name : undefined,
            profilePicture,
          });
        }
        return results;
      } else {
        throw Error("Error while calling aggregate function");
      }
    } catch (e) {
      if (e instanceof Error) {
        throw e;
      }
      throw Error("Could not get profiles from addresses");
    }
  }

  private async tryResolveDomain(
    contract: string,
    encodedDomain: string[],
    hint: any = [],
  ): Promise<string> {
    const addressData = await this.provider.callContract({
      contractAddress: contract,
      entrypoint: "domain_to_address",
      calldata: CallData.compile({ domain: encodedDomain, hint }),
    });
    return addressData.result[0];
  }

  private async checkArguments(idDomainOrAddr: string): Promise<string> {
    if (typeof idDomainOrAddr === "string") {
      if (/^\d+$/.test(idDomainOrAddr)) {
        // is a positive number
        return idDomainOrAddr;
      } else if (isStarkDomain(idDomainOrAddr)) {
        // is a starkDomain
        return this.getStarknetId(idDomainOrAddr).then((id: string) => {
          return id;
        });
      } else if (/^[-+]?0x[0-9a-f]+$/i.test(idDomainOrAddr)) {
        // is a hex address
        const checkSumAddr = getChecksumAddress(idDomainOrAddr);
        if (validateChecksumAddress(checkSumAddr)) {
          return this.getStarkName(idDomainOrAddr).then((name: string) => {
            return this.getStarknetId(name).then((id: string) => {
              return id;
            });
          });
        } else {
          throw new Error("Invalid Starknet address");
        }
      } else {
        throw new Error("Invalid idDomainOrAddr argument");
      }
    } else {
      throw new Error("Invalid idDomainOrAddr argument");
    }
  }
}
