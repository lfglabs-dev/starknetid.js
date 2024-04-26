import {
  CairoCustomEnum,
  Contract,
  RawArgsArray,
  cairo,
  hash,
  shortString,
} from "starknet";
import { DecodedData } from "~/types";
import { utils } from "..";

//
// profile util functions
//

export const parseBase64Image = (metadata: string): string => {
  return JSON.parse(atob(metadata.split(",")[1].slice(0, -1))).image;
};

export const fetchImageUrl = async (url: string): Promise<string> => {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    // Check if the "image" key exists and is not null
    if (data.image) {
      return data.image;
    } else {
      return "Image is not set";
    }
  } catch (error) {
    console.error("There was a problem fetching the image URL:", error);
    return "Error fetching data";
  }
};

//
// composable multicall util functions
//

export const hardcoded = (arg: string | number): CairoCustomEnum => {
  return new CairoCustomEnum({
    Hardcoded: arg,
  });
};

export const reference = (call: number, pos: number): CairoCustomEnum => {
  return new CairoCustomEnum({
    Reference: cairo.tuple(call, pos),
  });
};

export const arrayReference = (call: number, pos: number): CairoCustomEnum => {
  return new CairoCustomEnum({
    ArrayReference: cairo.tuple(call, pos),
  });
};

export const staticExecution = () => {
  return new CairoCustomEnum({
    Static: {},
  });
};

export const notEqual = (call: number, pos: number, value: number) => {
  return new CairoCustomEnum({
    IfNotEqual: cairo.tuple(call, pos, value),
  });
};

export const executeMulticallWithFallback = async (
  contract: Contract,
  functionName: string,
  initialCalldata: RawArgsArray,
  fallbackCalldata: RawArgsArray,
) => {
  try {
    // Attempt the initial call
    return await contract.call(functionName, [initialCalldata]);
  } catch (initialError) {
    // If the initial call fails, try with the fallback calldata
    try {
      return await contract.call(functionName, [fallbackCalldata]);
    } catch (fallbackError) {
      throw fallbackError; // Re-throw to handle outside
    }
  }
};

//
// composable multicall calldata
//

export const getStarknamesCalldata = (
  addresses: string[],
  namingContract: string,
): {
  initialCalldata: RawArgsArray;
  fallbackCalldata: RawArgsArray;
} => {
  let initialCalldata: RawArgsArray = [];
  let fallbackCalldata: RawArgsArray = [];
  addresses.forEach((address) => {
    initialCalldata.push({
      execution: staticExecution(),
      to: hardcoded(namingContract),
      selector: hardcoded(hash.getSelectorFromName("address_to_domain")),
      calldata: [hardcoded(address), hardcoded("0")],
    });

    fallbackCalldata.push({
      execution: staticExecution(),
      to: hardcoded(namingContract),
      selector: hardcoded(hash.getSelectorFromName("address_to_domain")),
      calldata: [hardcoded(address)],
    });
  });

  return { initialCalldata, fallbackCalldata };
};

export const getStarkProfilesCalldata = (
  addresses: string[],
  namingContract: string,
  identityContract: string,
  pfpVerifierContract: string,
  utilsMulticallContract: string,
  blobbertContract: string,
): {
  initialCalldata: RawArgsArray;
  fallbackCalldata: RawArgsArray;
} => {
  let calldata: RawArgsArray = [];
  let uriCalldata: RawArgsArray = [];
  let fallback: RawArgsArray = [];
  const nbInstructions = 5;

  addresses.forEach((address, index) => {
    // We will first try to pass a hint
    calldata.push({
      execution: staticExecution(),
      to: hardcoded(namingContract),
      selector: hardcoded(hash.getSelectorFromName("address_to_domain")),
      calldata: [hardcoded(address), hardcoded("0")],
    });
    // if it fails we will fallback to not passing it
    fallback.push({
      execution: staticExecution(),
      to: hardcoded(namingContract),
      selector: hardcoded(hash.getSelectorFromName("address_to_domain")),
      calldata: [hardcoded(address)],
    });

    const calls = [
      {
        execution: staticExecution(),
        to: hardcoded(namingContract),
        selector: hardcoded(hash.getSelectorFromName("domain_to_id")),
        calldata: [arrayReference(index * nbInstructions, 0)], //  result of address_to_domain
      },
      {
        execution: staticExecution(),
        to: hardcoded(identityContract),
        selector: hardcoded(hash.getSelectorFromName("get_verifier_data")),
        calldata: [
          reference(index * nbInstructions + 1, 0), // result of domain_to_id
          hardcoded(shortString.encodeShortString("nft_pp_contract")),
          hardcoded(pfpVerifierContract),
          hardcoded("0"),
        ],
      },
      {
        execution: staticExecution(),
        to: hardcoded(identityContract),
        selector: hardcoded(
          hash.getSelectorFromName("get_extended_verifier_data"),
        ),
        calldata: [
          reference(index * nbInstructions + 1, 0), // result of domain_to_id
          hardcoded(shortString.encodeShortString("nft_pp_id")),
          hardcoded("2"),
          hardcoded(pfpVerifierContract),
          hardcoded("0"),
        ],
      },
      {
        execution: staticExecution(),
        to: hardcoded(utilsMulticallContract),
        selector: hardcoded(hash.getSelectorFromName("not_zero_and_not_y")),
        calldata: [
          reference(index * nbInstructions + 2, 0), // result of nft_pp_contract
          hardcoded(blobbertContract),
        ],
      },
    ];
    calldata.push(...calls);
    fallback.push(...calls);

    // we only fetch the uri if the nft_pp_contract is not 0 and is not the blobbert contract
    // we will handle blobbert token uris offchain
    uriCalldata.push({
      execution: notEqual(index * nbInstructions + 4, 0, 0), // result of not_zero_and_not_y is not 0
      to: reference(index * nbInstructions + 2, 0),
      selector: hardcoded(hash.getSelectorFromName("tokenURI")),
      calldata: [
        reference(index * nbInstructions + 3, 1),
        reference(index * nbInstructions + 3, 2),
      ],
    });
  });

  return {
    initialCalldata: [...calldata, ...uriCalldata],
    fallbackCalldata: [...fallback, ...uriCalldata],
  };
};

export const getProfileDataCalldata = (
  address: string,
  namingContract: string,
  identityContract: string,
  verifierContract: string,
  pfpVerifierContract: string,
  popVerifierContract: string,
): {
  initialCalldata: RawArgsArray;
  fallbackCalldata: RawArgsArray;
} => {
  let initialCalldata: RawArgsArray = [];
  let fallbackCalldata: RawArgsArray = [];

  initialCalldata.push({
    execution: staticExecution(),
    to: hardcoded(namingContract),
    selector: hardcoded(hash.getSelectorFromName("address_to_domain")),
    calldata: [hardcoded(address), hardcoded("0")],
  });
  fallbackCalldata.push({
    execution: staticExecution(),
    to: hardcoded(namingContract),
    selector: hardcoded(hash.getSelectorFromName("address_to_domain")),
    calldata: [hardcoded(address)],
  });

  const calls = [
    {
      execution: staticExecution(),
      to: hardcoded(namingContract),
      selector: hardcoded(hash.getSelectorFromName("domain_to_id")),
      calldata: [arrayReference(0, 0)],
    },
    {
      execution: staticExecution(),
      to: hardcoded(identityContract),
      selector: hardcoded(hash.getSelectorFromName("get_verifier_data")),
      calldata: [
        reference(1, 0),
        hardcoded(shortString.encodeShortString("twitter")),
        hardcoded(verifierContract),
        hardcoded("0"),
      ],
    },
    {
      execution: staticExecution(),
      to: hardcoded(identityContract),
      selector: hardcoded(hash.getSelectorFromName("get_verifier_data")),
      calldata: [
        reference(1, 0),
        hardcoded(shortString.encodeShortString("github")),
        hardcoded(verifierContract),
        hardcoded("0"),
      ],
    },
    {
      execution: staticExecution(),
      to: hardcoded(identityContract),
      selector: hardcoded(hash.getSelectorFromName("get_verifier_data")),
      calldata: [
        reference(1, 0),
        hardcoded(shortString.encodeShortString("discord")),
        hardcoded(verifierContract),
        hardcoded("0"),
      ],
    },
    {
      execution: staticExecution(),
      to: hardcoded(identityContract),
      selector: hardcoded(hash.getSelectorFromName("get_verifier_data")),
      calldata: [
        reference(1, 0),
        hardcoded(shortString.encodeShortString("proof_of_personhood")),
        hardcoded(popVerifierContract),
        hardcoded("0"),
      ],
    },
    // PFP
    {
      execution: staticExecution(),
      to: hardcoded(identityContract),
      selector: hardcoded(hash.getSelectorFromName("get_verifier_data")),
      calldata: [
        reference(1, 0),
        hardcoded(shortString.encodeShortString("nft_pp_contract")),
        hardcoded(pfpVerifierContract),
        hardcoded("0"),
      ],
    },
    {
      execution: staticExecution(),
      to: hardcoded(identityContract),
      selector: hardcoded(
        hash.getSelectorFromName("get_extended_verifier_data"),
      ),
      calldata: [
        reference(1, 0),
        hardcoded(shortString.encodeShortString("nft_pp_id")),
        hardcoded("2"),
        hardcoded(pfpVerifierContract),
        hardcoded("0"),
      ],
    },
    {
      execution: notEqual(6, 0, 0),
      to: reference(6, 0),
      selector: hardcoded(hash.getSelectorFromName("tokenURI")),
      calldata: [reference(7, 1), reference(7, 2)],
    },
  ];
  initialCalldata.push(...calls);
  fallbackCalldata.push(...calls);

  return { initialCalldata, fallbackCalldata };
};

//
// CCIP util functions
//

export const extractArrayFromErrorMessage = (errorMsg: string) => {
  const pattern = /Execution failed\. Failure reason: \((.*?)\)\./;
  const match = errorMsg.match(pattern);

  if (match && match[1]) {
    const values = match[1].split(",").map((value) => value.trim());
    const res = values.map((entry) => {
      const hexMatch = entry.match(/(0x[0-9a-f]+)/i);
      if (hexMatch && hexMatch[1]) {
        return hexMatch[1];
      }
    });
    return decodeErrorMsg(res as string[]);
  }

  return null;
};

export const decodeErrorMsg = (array: string[]): DecodedData | null => {
  try {
    let index = 0;
    const result: DecodedData = {
      errorType: shortString.decodeShortString(array[index++]),
      domain_slice: "",
      uris: [],
    };

    // Decode domain
    const domainSize: number = parseInt(array[index++], 16);
    for (let i = 0; i < domainSize; i++) {
      result.domain_slice += utils
        .decodeDomain([BigInt(array[index++])])
        .replace(".stark", "");
      if (i < domainSize - 1) result.domain_slice += ".";
    }

    // Decode URIs
    while (index < array.length) {
      let uriSize = parseInt(array[index++], 16);
      let uri = "";
      for (let i = 0; i < uriSize; i++) {
        uri += shortString.decodeShortString(array[index++]);
      }
      result.uris.push(uri);
    }
    return result;
  } catch (error) {
    console.error("Error decoding array:", error);
    return null;
  }
};

export const queryServer = async (serverUri: string, domain: string) => {
  try {
    const response = await fetch(`${serverUri}${domain}`);

    if (!response.ok) {
      const errorResponse = await response.text();
      throw new Error(errorResponse || "Error while querying server");
    }
    const data = await response.json();
    return { data };
  } catch (error) {
    return { error };
  }
};
