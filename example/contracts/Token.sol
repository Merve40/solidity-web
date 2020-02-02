pragma solidity >=0.4.22 <0.7.0;

library Balances {
    function move(mapping(address => uint256) storage balances, address from, address to, uint amount) internal {
        require(balances[from] >= amount, "Not enough balance to transfer!");
        require(balances[to] + amount >= balances[to], "Balance cannot be added to receiver!");
        balances[from] -= amount;
        balances[to] += amount;
    }
}

contract Token {
    mapping(address => uint256) balances;
    using Balances for *;

    uint constant public oneWeiToToken = 10;

    event Transfer(address from, address to, uint amount);

    constructor() public {}

    function() external payable{}

    function transfer(address to, uint amount) public returns (bool success) {
        balances.move(msg.sender, to, amount);
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function buyTokens(uint256 tokens) public payable {
        balances[msg.sender] += tokens;
        require(balances[msg.sender] >= tokens);
    }

    function balance() public view returns (uint256 balance) {
        return balances[msg.sender];
    }
}