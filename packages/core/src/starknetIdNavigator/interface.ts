// import BN from "bn.js";
import { ProviderInterface, constants } from "starknet";
import { StarknetIdContracts } from "~/types";

export abstract class StarknetIdNavigatorInterface {
  public abstract provider: ProviderInterface;
  public abstract StarknetIdContract: StarknetIdContracts;
  public abstract chainId: constants.StarknetChainId;
  /**
   * Get address from Starkname
   *
   * @param domain name
   * @returns address as hexadecimal
   */
  public abstract getAddressFromStarkName(domain: string): Promise<string>;

  /**
   * Get Starkname from address
   *
   * @param address
   * @returns starkname
   */
  public abstract getStarkName(address: string): Promise<string>;

  /**
   * Get Starknet id from domain
   *
   * @param domain name
   * @returns data as bigint
   */
  public abstract getStarknetId(domain: string): Promise<number>;

  /**
   * Get User data from starknet id, domain or hexadecimal address
   *
   * @param starknet id (number) | domain or hexadecimal address (string)
   * @param field
   * @param domain
   * @returns data as bigint
   */
  public abstract getUserData(
    idDomainOrAddr: number | string,
    field: string,
    domain: number,
  ): Promise<BigInt>;

  /**
   * Get user extended data from starknet id, domain or hexadecimal address
   * Use this function to retrieve an array knowing its size.
   * It will return zeros if not written.
   *
   * @param starknet id (number) | domain or hexadecimal address (string)
   * @param field
   * @param length
   * @param domain
   * @returns data as array of bigint
   */
  public abstract getExtentedUserData(
    idDomainOrAddr: number | string,
    field: string,
    length: number,
    domain: number,
  ): Promise<BigInt[]>;

  /**
   * Get User unbounded data from starknet id, domain or hexadecimal address
   * Use this function to retrieve an array up to zero (not included).
   *
   * @param starknet id (number) | domain or hexadecimal address (string)
   * @param field
   * @param domain
   * @returns data as array of bigint
   */
  public abstract getUnboundedUserData(
    idDomainOrAddr: number | string,
    field: string,
    domain: number,
  ): Promise<BigInt[]>;

  /**
   * Get verifier data from starknet id, domain or hexadecimal address
   * If no verifier is provided, it will return the starknet.id verifier contract address
   *
   * @param starknet id (number) | domain or hexadecimal address (string)
   * @param field
   * @param domain
   * @param verifier contract address (optional)
   * @returns data as array of bigint
   */
  public abstract getVerifierData(
    idDomainOrAddr: number | string,
    field: string,
    domain: number,
    verifier?: string,
  ): Promise<BigInt>;

  /**
   * Get extended verifier data from starknet id, domain or hexadecimal address
   * Use this function to retrieve an array knowing its size.
   * It will return zeros if not written.
   * If no verifier is provided, it will return the starknet.id verifier contract address
   *
   *
   * @param starknet id (number) | domain or hexadecimal address (string)
   * @param field
   * @param length
   * @param domain
   * @param verifier contract address (optional)
   * @returns data as array of bigint
   */
  public abstract getExtendedVerifierData(
    idDomainOrAddr: number | string,
    field: string,
    length: number,
    domain: number,
    verifier?: string,
  ): Promise<BigInt[]>;

  /**
   * Get unbounded verifier data from starknet id, domain or hexadecimal address
   * Use this function to retrieve an array up to zero (not included).
   * If no verifier is provided, it will use the starknet.id verifier contract address
   *
   * @param starknet id (number) | domain or hexadecimal address (string)
   * @param field
   * @param domain
   * @param verifier contract address (optional)
   * @returns data as array of bigint
   */
  public abstract getUnboundedVerifierData(
    idDomainOrAddr: number | string,
    field: string,
    domain: number,
    verifier?: string,
  ): Promise<BigInt[]>;
}
