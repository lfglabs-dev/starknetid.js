import { utils, constants } from 'starknetid.js'; 

function App() {
    let starknetIdContract = utils.getStarknetIdContract(constants.StarknetChainId.SN_MAIN);
    return(
        <>StarknetId contract : {starknetIdContract}</>
    );

}

export default App;