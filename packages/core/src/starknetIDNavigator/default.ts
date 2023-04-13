import BN from "bn.js";
import {
  ProviderInterface,
  shortString,
  stark,
  number,
  validateChecksumAddress,
  getChecksumAddress,
} from "starknet";
import {
  decodeDomain,
  encodeDomain,
  getNamingContract,
  getIdentityContract,
  getVerifierContract,
  isStarkDomain,
} from "../utils";
import { StarknetIdNavigatorInterface } from "./interface";
import { StarknetIdContracts } from "../types";

export class StarknetIdNavigator implements StarknetIdNavigatorInterface {
  public provider: ProviderInterface;
  public StarknetIdContract: StarknetIdContracts;

  constructor(
    provider: ProviderInterface,
    starknetIdContract?: StarknetIdContracts,
  ) {
    this.provider = provider;
    this.StarknetIdContract = starknetIdContract ?? {
      identity: getIdentityContract(provider.chainId),
      naming: getNamingContract(provider.chainId),
    };
  }

  public async getAddressFromStarkName(domain: string): Promise<string> {
    const chainId = this.provider.chainId;
    const contract =
      this.StarknetIdContract.naming ?? getNamingContract(chainId);

    try {
      const encodedDomain = encodeDomain(domain).map((elem) =>
        elem.toString(10),
      );
      const addressData = await this.provider.callContract({
        contractAddress: contract,
        entrypoint: "domain_to_address",
        calldata: stark.compileCalldata({
          domain: encodedDomain,
        }),
      });
      return addressData.result[0];
    } catch {
      throw new Error("Could not get address from stark name");
    }
  }

  public async getStarkName(address: string): Promise<string> {
    const chainId = this.provider.chainId;
    const contract =
      this.StarknetIdContract.naming ?? getNamingContract(chainId);

    try {
      const hexDomain = await this.provider.callContract({
        contractAddress: contract,
        entrypoint: "address_to_domain",
        calldata: stark.compileCalldata({
          address: address,
        }),
      });
      const decimalDomain = hexDomain.result
        .map((element) => BigInt(element))
        .slice(1);
      const stringDomain = decodeDomain(decimalDomain);

      if (!stringDomain) {
        throw new Error("Starkname not found");
      }

      return stringDomain;
    } catch (e) {
      if (e instanceof Error && e.message === "Starkname not found") {
        throw e;
      }
      throw new Error("Could not get stark name");
    }
  }

  public async getStarknetId(domain: string): Promise<number> {
    const chainId = this.provider.chainId;
    const contract =
      this.StarknetIdContract.naming ?? getNamingContract(chainId);

    try {
      const encodedDomain = encodeDomain(domain).map((elem) =>
        elem.toString(10),
      );
      const starknetId = await this.provider.callContract({
        contractAddress: contract,
        entrypoint: "domain_to_token_id",
        calldata: stark.compileCalldata({
          domain: encodedDomain,
        }),
      });
      return Number(starknetId.result[0]);
    } catch (e) {
      if (e instanceof Error && e.message === "Starkname not found") {
        throw e;
      }
      throw new Error("Could not get starknet id from starkname");
    }
  }

  public async getUserData(
    idDomainOrAddr: string | number,
    field: string,
  ): Promise<BN> {
    const chainId = this.provider.chainId;
    const contract =
      this.StarknetIdContract.identity ?? getIdentityContract(chainId);
    const id = await this.checkArguments(idDomainOrAddr);

    try {
      const data = await this.provider.callContract({
        contractAddress: contract,
        entrypoint: "get_user_data",
        calldata: stark.compileCalldata({
          token_id: id.toString(),
          field: shortString.encodeShortString(field),
        }),
      });
      return number.toBN(data.result[0]);
    } catch (e) {
      if (e instanceof Error && e.message === "User not found") {
        throw e;
      }
      throw Error("Could not get user data from starknet id");
    }
  }

  public async getExtentedUserData(
    idDomainOrAddr: number | string,
    field: string,
    length: number,
  ): Promise<BN[]> {
    const chainId = this.provider.chainId;
    const contract =
      this.StarknetIdContract.identity ?? getIdentityContract(chainId);
    const id = await this.checkArguments(idDomainOrAddr);

    try {
      const data = await this.provider.callContract({
        contractAddress: contract,
        entrypoint: "get_extended_user_data",
        calldata: stark.compileCalldata({
          token_id: id.toString(),
          field: shortString.encodeShortString(field),
          length: length.toString(),
        }),
      });

      data.result.shift();
      const res = data.result.map((element: string) => {
        return number.toBN(element);
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
    idDomainOrAddr: number | string,
    field: string,
  ): Promise<BN[]> {
    const chainId = this.provider.chainId;
    const contract =
      this.StarknetIdContract.identity ?? getIdentityContract(chainId);
    const id = await this.checkArguments(idDomainOrAddr);

    try {
      const data = await this.provider.callContract({
        contractAddress: contract,
        entrypoint: "get_unbounded_user_data",
        calldata: stark.compileCalldata({
          token_id: id.toString(),
          field: shortString.encodeShortString(field),
        }),
      });

      data.result.shift();
      const res = data.result.map((element: string) => {
        return number.toBN(element);
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
    idDomainOrAddr: number | string,
    field: string,
    verifier?: string,
  ): Promise<BN> {
    const chainId = this.provider.chainId;
    const contract =
      this.StarknetIdContract.identity ?? getIdentityContract(chainId);
    const verifierAddress = verifier ?? getVerifierContract(chainId);
    const id = await this.checkArguments(idDomainOrAddr);

    try {
      const data = await this.provider.callContract({
        contractAddress: contract,
        entrypoint: "get_verifier_data",
        calldata: stark.compileCalldata({
          token_id: id.toString(),
          field: shortString.encodeShortString(field),
          verifier_address: verifierAddress,
        }),
      });

      return number.toBN(data.result[0]);
    } catch (e) {
      if (e instanceof Error && e.message === "User not found") {
        throw e;
      }
      throw Error("Could not get user verifier data from starknet id");
    }
  }

  public async getExtendedVerifierData(
    idDomainOrAddr: number | string,
    field: string,
    length: number,
    verifier?: string,
  ): Promise<BN[]> {
    const chainId = this.provider.chainId;
    const contract =
      this.StarknetIdContract.identity ?? getIdentityContract(chainId);
    const verifierAddress = verifier ?? getVerifierContract(chainId);
    const id = await this.checkArguments(idDomainOrAddr);

    try {
      const data = await this.provider.callContract({
        contractAddress: contract,
        entrypoint: "get_extended_verifier_data",
        calldata: stark.compileCalldata({
          token_id: id.toString(),
          field: shortString.encodeShortString(field),
          length: length.toString(),
          verifier_address: verifierAddress,
        }),
      });

      data.result.shift();
      const res = data.result.map((element: string) => {
        return number.toBN(element);
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
    idDomainOrAddr: number | string,
    field: string,
    verifier?: string,
  ): Promise<BN[]> {
    const chainId = this.provider.chainId;
    const contract =
      this.StarknetIdContract.identity ?? getIdentityContract(chainId);
    const verifierAddress = verifier ?? getVerifierContract(chainId);
    const id = await this.checkArguments(idDomainOrAddr);

    try {
      const data = await this.provider.callContract({
        contractAddress: contract,
        entrypoint: "get_unbounded_verifier_data",
        calldata: stark.compileCalldata({
          token_id: id.toString(),
          field: shortString.encodeShortString(field),
          verifier_address: verifierAddress,
        }),
      });

      data.result.shift();
      const res = data.result.map((element: string) => {
        return number.toBN(element);
      });

      return res;
    } catch (e) {
      if (e instanceof Error && e.message === "User not found") {
        throw e;
      }
      throw Error("Could not get user verifier data from starknet id");
    }
  }

  private async checkArguments(
    idDomainOrAddr: string | number,
  ): Promise<number> {
    if (typeof idDomainOrAddr === "string") {
      if (/^[-+]?[0-9]+$/.test(idDomainOrAddr)) {
        // is a number
        return parseInt(idDomainOrAddr);
      } else if (isStarkDomain(idDomainOrAddr)) {
        // is a starkDomain
        return this.getStarknetId(idDomainOrAddr).then((id: number) => {
          return id;
        });
      } else if (/^[-+]?0x[0-9a-f]+$/i.test(idDomainOrAddr)) {
        // is a hex address
        const checkSumAddr = getChecksumAddress(idDomainOrAddr);
        if (validateChecksumAddress(checkSumAddr)) {
          return this.getStarkName(idDomainOrAddr).then((name: string) => {
            return this.getStarknetId(name).then((id: number) => {
              return id;
            });
          });
        } else {
          throw new Error("Invalid Starknet address");
        }
      } else {
        throw new Error("Invalid idDomainOrAddr argument");
      }
    } else if (typeof idDomainOrAddr === "number") {
      return idDomainOrAddr;
    } else {
      throw new Error("Invalid idDomainOrAddr argument");
    }
  }
}
