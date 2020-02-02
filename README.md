# Solidity Web Automation Tool 

This tool is built on top of [truffle-suite](https://github.com/trufflesuite/ganache-cli) &
[express.js](https://github.com/expressjs/express) and is meant for facilitating the development of smart contracts for web applications. It intends to eliminate the need to copy paste contract ABI's and contract addresses into front-end javascripts scripts. Instead, it automatically creates a separate javascript for each contract, which is initialized with it's ABI and contract address. These scripts are then injected into the HTML (app/web/index.html), thus making it immediately accessible to other scripts. One of the biggest advantages of using this tool is, that every changes to the smart contract in solidity, are automatically updated in the front-end once `solidity-web deploy` is executed.


## NPM Package
```
npm i solidity-web
```

## How to get started:
In the root folder    

  
**1. Initialize truffle**    
It will generate `contracts` and `migrations` folders.
```
truffle init
```   
**2. Uncomment network configurations in `truffle-config.js`**
```
networks: {
     development: {
      host: "127.0.0.1",     // Localhost (default: none)
      port: 8545,            // Standard Ethereum port (default: none)
      network_id: "*",       // Any network (default: none)
     },
...
}
```
**3. Run the Ethereum Node**    
```
$ ganache-cli
```
**4. Implement your solidity smart contracts in the `contracts` folder**   
The migration files are autogenerated. They can be customized after deployment (step 5) and be redeployed again to update changes.

**5. Initialize your contracts in another terminal**
```
$ solidity-web init
```
    
**6. Deploy your contracts**    
The command below will deploy contracts and use the default configurations as defined in `truffle-config.js` (step 2).   
```
$ solidity-web deploy
```    
Custom port and host for the webserver can be set as follows:
```
$ solidity-web deploy web-host=<host> web-port=<port-number>
```

This command calls truffle's `truffle migrate` command underneath, which compiles the `.sol` files and creates a `build` folder with json files.
On top of this, the `solidity-web` tool will generate an `app` folder, which contains the server- and client-side implementation. The `app.js` file is the server-side code, which launches the container. 
It can be changed to add rest functionality or or frontend code (HTML/Javascript/CSS). The `contracts.js` file creates a reference for each smart-contract.
For demonstration purposes, an `index.html` is already present and references all smart-contract instances defined in `contract.js`.

**7. Start the express webserver**   
```
$ node app/web/app.js
```     
The default url is http://localhost:8181
