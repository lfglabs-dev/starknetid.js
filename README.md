# Starknetid.js

## Get started

### Installation

```
# using npm
npm install starknetid.js starknet@next

# using yarn
yarn install starknetid.js starknet@next
```

### Usage for dApp developers

#### Basic usage

Import `StarknetIdNavigator` from `starknetid.js` package to access functions.
`StarknetIdNavigator` needs to be initialize with a provider.

```
import { StarknetIdNavigator } from 'starknetid.js'
import { Provider } from 'starknet'

const provider = new Provider();
const starknetIdNavigator = new StarknetIdNavigator(provider);
const addr = await starknetIdNavigator.getAddressFromStarkName('test.stark');
```

#### Using custom contracts

It's possible to use starknetid.js with custom naming and identity contracts.

```
import { StarknetIdNavigator } from 'starknetid.js'

const starknetIdNavigator = new StarknetIdNavigator(provider, {
    naming: customNamingContract,
    identity: customIdentityContract
})
```

#### Using utils functions

You can access utils function outside of the `StarknetIdNavigator` object
through the `utils` namespace

```
import { utils } from 'starknetid.js'

const encodedDomain = utils.encodeDomain('test.stark');
```

## SDK

### Resolving domains

**getAddressFromStarkName()**

_StarknetIdNavigator.**getAddressFromStarkName**(domain: string) => string_

Get address from Starkname.

**getStarkName()**

_StarknetIdNavigator.**getStarkName**(address: string) => string_

Get Starkname from address.

**getStarknetId()**

_StarknetIdNavigator.**getStarknetId**(domain: string) => number_

Get Starknet id from domain.

### Resolving user data

**getUserData()**

_StarknetIdNavigator.**getUserData**(dOrDomain: number | string, field: string)
=> BN_

Get user data from starknet id or domain.

**getExtentedUserData()**

_StarknetIdNavigator.**getExtentedUserData**(dOrDomain: number | string, field:
string, length: number) => BN[]_

Get user data from starknet id or domain. Use this function to retrieve an array
knowing its size. It will return zeros if not written.

**getUnboundedUserData()**

_StarknetIdNavigator.**getUnboundedUserData**(dOrDomain: number | string, field:
string) => BN[]_

Get User unbounded data from starknet id or domain. Use this function to
retrieve an array up to zero (not included).

### Resolving verifier data

**getVerifierData()**

_StarknetIdNavigator.**getVerifierData**(dOrDomain: number | string, field:
string, verifier?: string) => BN_

Get verifier data from starknet id or domain. If no verifier contract is
provided, it will return the starknet.id verifier contract address deployed on
the StarknetIdNavigator provider chain id.

**getExtendedVerifierData()**

_StarknetIdNavigator.**getExtendedVerifierData**(dOrDomain: number | string,
field: string, length: number, verifier?: string) => BN[]_

Get extended verifier data from starknet id or domain. Use this function to
retrieve an array knowing its size. It will return zeros if not written. If no
verifier contract is provided, it will return the starknet.id verifier contract
address deployed on the StarknetIdNavigator provider chain id.

**getUnboundedVerifierData()**

_StarknetIdNavigator.**getUnboundedVerifierData**(dOrDomain: number | string,
field: string, verifier?: string) => BN[]_

Get User unbounded data from starknet id or domain. Use this function to
retrieve an array up to zero (not included). If no verifier contract is
provided, it will return the starknet.id verifier contract address deployed on
the StarknetIdNavigator provider chain id.

### Utils

**isStarkDomain()**

_utils.**isStarkDomain**(domain: string) => boolean_

Check if domain is starknet.id domain

**decodeDomain()**

_utils.**decodeDomain**(encoded: bigint[]) => string_

Decode starknetid domain represented as an array of bigint `[454245]` ->
`test.stark`

**encodeDomain()**

_utils.**encodeDomain**(domain: string | undefined | null) => bigint[]_

Encode starknetid domains and subdomains to an array bigint `test.stark` ->
`[454245]`

**getNamingContract()**

_utils.**getNamingContract**(chainId: StarknetChainId) => string_

Get starknet.id naming contract address from chainId. If contract is not
deployed will throw an error.

**getIdentityContract()**

_utils.**getIdentityContract**(chainId: StarknetChainId) => string_

Get starknet.id identity contract address from chainId. If contract is not
deployed will throw an error.

**getVerifierContract()**

_utils.**getVerifierContract**(chainId: StarknetChainId) => string_

Get starknet.id verifier contract address from chainId. If contract is not
deployed will throw an error. At the moment, starknet.id verifier contract only
support `Discord`, `Twitter` and `Github` fields.

**isSubdomain()**

_utils.**isSubdomain**(domain: string | undefined) => boolean_

Check if domain is a starknet.id subdomain

**isBraavosSubdomain()**

_utils.**isBraavosSubdomain**(domain: string | undefined) => boolean_

Check if domain is a Braavos subdomain

**isStarkRootDomain()**

_utils.**isStarkRootDomain**(domain: string | undefined) => boolean_

Check if domain is a starknet.id root domain

## Development

You need Node and pnpm installed. Make sure to clone this repo and run:

```
pnpm install
pnpm build
```

To start watching for changes, run:

```
pnpm dev
```

and open `http://localhost:5173/`

### Running tests

For running tests:

```
pnpm test
```
