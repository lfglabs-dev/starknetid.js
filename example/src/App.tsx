import { constants, utils } from "starknetid.js";

function App() {
  let starknetIdContract = utils.getStarknetIdContract(
    constants.StarknetChainId.MAINNET,
  );
  let domainTest = utils.encodeDomain("test.stark");
  console.log("domainTest", domainTest);

  let decodeTest = utils.decodeDomain([domainTest]);
  console.log("decodeTest", decodeTest);

  return <>StarknetId contract : {starknetIdContract}</>;
}

export default App;
