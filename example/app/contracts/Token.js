// All changes to this file will be overwritten
var data_Token =
{
    "abi": [{"constant":true,"inputs":[],"name":"oneWeiToToken","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xc341d756"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor","signature":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"from","type":"address"},{"indexed":false,"name":"to","type":"address"},{"indexed":false,"name":"amount","type":"uint256"}],"name":"Transfer","type":"event","signature":"0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef"},{"constant":false,"inputs":[{"name":"to","type":"address"},{"name":"amount","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xa9059cbb"},{"constant":false,"inputs":[{"name":"tokens","type":"uint256"}],"name":"buyTokens","outputs":[],"payable":true,"stateMutability":"payable","type":"function","signature":"0x3610724e"},{"constant":true,"inputs":[],"name":"balance","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0xb69ef8a8"}],
    "address": "0xd5E5BAe9C1B84736041B94a73bFa053EC8997c5a"
};

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:8545'));
}

var Token = new web3.eth.Contract(data_Token.abi, data_Token.address);