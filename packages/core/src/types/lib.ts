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
