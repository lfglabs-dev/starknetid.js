import { CairoCustomEnum, cairo, shortString } from "starknet";

// CCIP util functions

export const extractArrayFromErrorMessage = (errorMsg: string) => {
  const pattern = /Execution failed\. Failure reason: \((.*?)\)\./;
  const match = errorMsg.match(pattern);

  if (match && match[1]) {
    const values = match[1].split(",").map((value) => value.trim());
    const res = values.map((entry) => {
      const hexMatch = entry.match(/(0x[0-9a-f]+)/i);
      if (hexMatch && hexMatch[1]) {
        return shortString.decodeShortString(hexMatch[1]);
      }
    });
    return res;
  }

  return null;
};

export const queryServer = async (serverUri: string, domainOrAddr: string) => {
  try {
    const response = await fetch(`${serverUri}${domainOrAddr}`);

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

// composable multicall util functions

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

// profile util functions

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
