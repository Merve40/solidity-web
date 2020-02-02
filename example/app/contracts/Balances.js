// All changes to this file will be overwritten
var data_Balances =
{
    "abi": []
};

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:8545'));
}

function getBalancesInstance(contractAddress){
    return new web3.eth.Contract(data_Balances.abi, contractAddress);
}
