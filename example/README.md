# Example App

This is a small example, that demonstrates how injected contracts (see app/contracts) can be easily used on the client-side. 

## Setup
  1. Run local blockchain      
  ```
  $ ganache-cli
  ```
  2. Deploy contracts, in order to update the contract address of each injected contract
  ```
  $ solidity-web deploy
  ```
  3. Run app
  ```
  $ node app/web/app.js
  ```
