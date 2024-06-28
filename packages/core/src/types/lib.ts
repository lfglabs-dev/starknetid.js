export type NetworkName = "mainnet-alpha" | "goerli-alpha" | "goerli-alpha-2";

export type StarknetIdContracts = {
  identity?: string;
  naming?: string;
};

export type StarkProfile = {
  name?: string;
  profilePicture?: string;
  discord?: string;
  twitter?: string;
  github?: string;
  proofOfPersonhood?: boolean;
};

export type CcipResponse = {
  address: string;
  r: string;
  s: string;
  max_validity: number;
};

export type DecodedData = {
  errorType: string;
  domain_slice: string;
  uris: string[];
};

export const StarknetChainId = {
  SN_MAIN: "0x534e5f4d41494e", // encodeShortString('SN_MAIN'),
  SN_SEPOLIA: "0x534e5f5345504f4c4941", // encodeShortString('SN_SEPOLIA')
} as const;
