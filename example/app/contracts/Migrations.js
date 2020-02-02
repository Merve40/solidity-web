// All changes to this file will be overwritten
var data_Migrations =
{
    "abi": [{"constant":true,"inputs":[],"name":"last_completed_migration","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x445df0ac"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function","signature":"0x8da5cb5b"},{"inputs":[],"payable":false,"stateMutability":"nonpayable","type":"constructor","signature":"constructor"},{"constant":false,"inputs":[{"name":"completed","type":"uint256"}],"name":"setCompleted","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function","signature":"0xfdacd576"}],
    "address": "0x8284f39d6840aa8790f2FD331Acc102d914aDfA1"
};

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:8545'));
}

var Migrations = new web3.eth.Contract(data_Migrations.abi, data_Migrations.address);