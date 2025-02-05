const { StarknetIdNavigator } = require("starknetid.js");
const { Provider } = require("starknet");

async function compareStarknetAddresses(domainName) {
  // Initialize provider
  const provider = new Provider({ nodeUrl: "https://rpc.starknet.id/" });

  try {
    // Get address from starknet.js
    const providerAddress = await provider.getAddressFromStarkName(domainName);

    // Get address using starknetid.js
    const navigator = new StarknetIdNavigator(provider, "0x534e5f4d41494e"); // Mainnet
    const starknetJsAddress = await navigator.getAddressFromStarkName(
      domainName,
    );

    // Get address from API
    const apiResponse = await fetch(
      `https://api.starknet.id/domain_to_addr?domain=${domainName}`,
    );
    const apiData = await apiResponse.json();
    const apiAddress = apiData.addr;

    console.log(`Provider Address: ${providerAddress}`);
    console.log(`API Address: ${apiAddress}`);
    console.log(`SDK Address: ${starknetJsAddress}`);
    console.log(
      `Addresses match: ${
        BigInt(providerAddress) === BigInt(apiAddress) ? "✅" : "❌"
      }`,
    );

    return {
      providerAddress,
      apiAddress,
      match: providerAddress === apiAddress,
    };
  } catch (error) {
    console.error("Error comparing addresses:", error);
    throw error;
  }
}

async function compareStarknetDomains(address) {
  // Initialize provider
  const provider = new Provider({ nodeUrl: "https://rpc.starknet.id/" });

  try {
    // Get domain from starknet.js
    const providerDomain = await provider.getStarkName(address);

    // Get domain using starknetid.js
    const navigator = new StarknetIdNavigator(provider, "0x534e5f4d41494e"); // Mainnet
    const starknetJsDomain = await navigator.getStarkName(address);

    // Get domain from API
    const apiResponse = await fetch(
      `https://api.starknet.id/addr_to_domain?addr=${address}`,
    );
    const apiData = await apiResponse.json();
    const apiDomain = apiData.domain;

    console.log(`Provider Domain: ${providerDomain}`);
    console.log(`API Domain: ${apiDomain}`);
    console.log(`SDK Domain: ${starknetJsDomain}`);
    console.log(`Domains match: ${providerDomain === apiDomain ? "✅" : "❌"}`);

    return {
      providerDomain,
      apiDomain,
      match: providerDomain === apiDomain,
    };
  } catch (error) {
    console.error("Error comparing domains:", error);
    throw error;
  }
}

// Example usage
async function main() {
  console.log("Testing domain to address resolution:");
  await compareStarknetAddresses("th0rgal.stark");
  console.log("--------------------------------");

  console.log("Testing address to domain resolution:");
  // Using th0rgal.stark's address as an example
  await compareStarknetDomains(
    "0x00a00373a00352aa367058555149b573322910d54fcdf3a926e3e56d0dcb4b0c",
  );
  console.log("--------------------------------");
}

main();
