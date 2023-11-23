// import BN from "bn.js";
import { ProviderInterface, constants } from "starknet";
import { StarkProfile, StarknetIdContracts } from "~/types";

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
   * @returns id as string
   */
  public abstract getStarknetId(domain: string): Promise<string>;

  /**
   * Get User data from starknet id, domain or hexadecimal address
   *
   * @param starknet id (string) | domain or hexadecimal address (string)
   * @param field
   * @returns data as bigint
   */
  public abstract getUserData(
    idDomainOrAddr: string,
    field: string,
  ): Promise<BigInt>;

  /**
   * Get user extended data from starknet id, domain or hexadecimal address
   * Use this function to retrieve an array knowing its size.
   * It will return zeros if not written.
   *
   * @param starknet id (string) | domain or hexadecimal address (string)
   * @param field
   * @param length
   * @returns data as array of bigint
   */
  public abstract getExtentedUserData(
    idDomainOrAddr: string,
    field: string,
    length: number,
  ): Promise<BigInt[]>;

  /**
   * Get User unbounded data from starknet id, domain or hexadecimal address
   * Use this function to retrieve an array up to zero (not included).
   *
   * @param starknet id (string) | domain or hexadecimal address (string)
   * @param field
   * @returns data as array of bigint
   */
  public abstract getUnboundedUserData(
    idDomainOrAddr: string,
    field: string,
  ): Promise<BigInt[]>;

  /**
   * Get verifier data from starknet id, domain or hexadecimal address
   * If no verifier is provided, it will return the starknet.id verifier contract address
   *
   * @param starknet id (string) | domain or hexadecimal address (string)
   * @param field
   * @param verifier contract address (optional)
   * @returns data as array of bigint
   */
  public abstract getVerifierData(
    idDomainOrAddr: string,
    field: string,
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
   * @param verifier contract address (optional)
   * @returns data as array of bigint
   */
  public abstract getExtendedVerifierData(
    idDomainOrAddr: string,
    field: string,
    length: number,
    verifier?: string,
  ): Promise<BigInt[]>;

  /**
   * Get unbounded verifier data from starknet id, domain or hexadecimal address
   * Use this function to retrieve an array up to zero (not included).
   * If no verifier is provided, it will use the starknet.id verifier contract address
   *
   * @param starknet id (number) | domain or hexadecimal address (string)
   * @param field
   * @param verifier contract address (optional)
   * @returns data as array of bigint
   */
  public abstract getUnboundedVerifierData(
    idDomainOrAddr: string,
    field: string,
    verifier?: string,
  ): Promise<BigInt[]>;

  /**
   * Get profile picture verifier data from starknet id, domain or hexadecimal address
   * Use this function to retrieve the contract address & token id of the NFT set as profile picture.
   * If no verifier is provided, it will use the starknet.id profile picture verifier contract address
   * If no NFT is set as profile picture, it will return zeros.
   *
   * @param starknet id (number) | domain or hexadecimal address (string)
   * @param verifier contract address (optional)
   * @returns [domain, contract address, token id low, tokenid high]
   */
  public abstract getPpVerifierData(
    idDomainOrAddr: string,
    verifier?: string,
  ): Promise<BigInt[]>;

  /**
   * Get profile picture verifier data from starknet id, domain or hexadecimal address
   * Use this function to retrieve the contract address & token id of the NFT set as profile picture.
   * If no verifier is provided, it will use the starknet.id profile picture verifier contract address
   * If no NFT is set as profile picture, it will return zeros.
   *
   * @param starknet id (number) | domain or hexadecimal address (string)
   * @param verifier contract address (optional)
   * @returns [domain, contract address, token id low, tokenid high]
   */
  public abstract getProfileData(
    address: string,
    verifier?: string,
    pfp_verifier?: string,
    pop_verifier?: string,
  ): Promise<StarkProfile>;
}
