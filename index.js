#! /usr/bin/env node

var args = process.argv.slice(2);

var help =`
arguments:
----------------------

port=<port-number>\t\t\tport number of ganache-cli -> default: 8545

host=<host>\t\t\t\thost ip or host name of ganache-cli -> default: 127.0.0.1

web-port=<port-number>\t\t\tport number of web-server (express) -> default: localhost

web-host=<host>\t\t\t\thost ip or host name of web-server (express) -> default: 8181


usage example:\tweb-init web-port=8081 web-host=localhost
`;

// help section
if(args.includes("help") || args.includes("--help") || args.includes("-h")){
    console.log(help);
    return;
}

var fs = require('fs');
var exec = require('child_process').exec;

// pre-check
if (!fs.existsSync('build/contracts')) {
    console.log("Seems like there are no contracts to generate.");
    return;
} else if (fs.readdirSync('build/contracts').length == 0) {
    console.log("Seems like there are no contracts to generate.");
    return;
}

var appDir = "app";
var resourcesDir = appDir + "/contracts/";
var webDir = appDir + "/web/";

//default values
var port = 8545;
var host = "127.0.0.1";
var webPort = 8181;
var webHost = "localhost";

for(var arg in args){
    if(args[arg].includes("=")){
        var key = args[arg].split("=")[0];
        var value = args[arg].split("=")[1];

        if(key === "port" && value.length != 0){
            port = parseInt(value);
        }else if(key === "host" && value.length != 0){
            host = value;
        }else if(key === "web-port" && value.length != 0){
            webPort = parseInt(value);
        }else if(key === "web-host" && value.length != 0){
            webHost = value;
        }else{
            console.log(help);
            return;
        }
    }else{
        console.log(help);
        return;
    }
}

console.log("\n");
console.log("migrations");
console.log("-------------------");

generateMigrations();

exec('truffle migrate --reset', (err, stdout, stderr) => {
    if (err) {
        console.log("error!");
        console.error(err);
        console.error(stderr);
        console.log(stdout);
    } else {
        console.log(stdout);

        console.log("\n");
        console.log("web directories");
        console.log("-------------------");

        if (!fs.existsSync(appDir)) {
            console.log("creating directory " + appDir);
            fs.mkdirSync(appDir);
        }
        if (!fs.existsSync(resourcesDir)) {
            console.log("creating directory " + resourcesDir);
            fs.mkdirSync(resourcesDir);
        }
        if (!fs.existsSync(webDir)) {
            console.log("creating directory " + webDir);
            fs.mkdirSync(webDir);
        }

        console.log("\n");
        console.log("scripts");
        console.log("-------------------");

        generateFiles();

        console.log("\n");
        console.log("express");
        console.log("-------------------");

        generateExpress();

        console.log("\n");
        console.log("run web-server using: node app/web/app.js");
    }

});

function generateFiles() {

    var files = fs.readdirSync('build/contracts');
    for (var f in files) {
        var file = files[f];
        if (file.endsWith(".json")) {
            var name = file.split('\.')[0];
            createContractScript(name, 'build/contracts/' + file);
        }
    }

    /**
     * Creates javascript file with initialized contract object.
     */
    function createContractScript(contractName, file) {
        var obj = JSON.parse(fs.readFileSync(file, "utf8"));

        var content = `// All changes to this file will be overwritten
        
var data_` + contractName + ` =
{
    "abi": `+ JSON.stringify(obj.abi) + `,
    "address": "`+ obj.networks[Object.keys(obj.networks)[Object.keys(obj.networks).length - 1]].address + `"
};

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://`+host+`:`+port+`'));
}

var `+ contractName + `;
web3.eth.getAccounts().then(arr => {
    var accountAddress = arr[0];
    `+ contractName + ` = new web3.eth.Contract(data_` + contractName + `.abi, data_` + contractName + `.address, { from: accountAddress });
});`;

        var fileName = contractName + ".js";
        console.log("generating " + fileName);
        fs.writeFileSync(resourcesDir + fileName, content);
    }
}

function generateMigrations() {
    if (!fs.existsSync('migrations')) {
        throw Error('Did you run "truffle init"?');
    }

    var migrations = fs.readdirSync('migrations');
    var idx = 0;

    //initial execution
    if(migrations.includes("1_initial_migration.js")){
        fs.unlinkSync('migrations/1_initial_migration.js');
        var migrations = fs.readdirSync('migrations');
    }

    if (migrations.length != 0) {
        idx = parseInt(migrations[migrations.length - 1].split("_")[0]);
    }
    idx++;

    var files = fs.readdirSync('contracts');
   
    // checks for duplicates, only generates files for new ones

    if(migrations.length > 0){
        for(var f in files){
            for(var m in migrations){
                var match = migrations[m].split("_")[migrations[m].split("_").length-1].split("\.")[0];
                
                if(files[f].split("\.")[0] === match){
                    files.splice(f,1);
                }
            }
        }
    }

    for (var file in files) {
        var contractName = files[file].split('\.')[0];
        var migrationFile = idx + "_migration_" + contractName + ".js";
        var content = `var ` + contractName + ` = artifacts.require("./` + files[file] + `");

module.exports = function(deployer) {
deployer.deploy(`+ contractName + `);
};`;
        console.log("generating " + migrationFile);
        fs.writeFileSync('migrations/' + migrationFile, content);
        idx++;
    }
}

function generateExpress() {

    var indexFile = webDir + "index.html";
    var contractsFile = webDir + "contracts.js";
    var appFile = webDir + "app.js";

    var html = `<html>
<head>
    <title>Index</title>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width = device-width, initial.scale = 1">
    <script src="https://cdn.jsdelivr.net/gh/ethereum/web3.js@1.0.0-beta.36/dist/web3.min.js" 
    integrity="sha256-nWBTbvxhJgjslRyuAKJHK+XcZPlCnmIAAMixz6EefVk=" crossorigin="anonymous"></script>`;    
    
    var contracts = fs.readdirSync(resourcesDir);

    var contractContent = `
// Do not modify this file!

var path = require('path'); 

module.exports=function(app){
    
    `;

    var content = "";
    for (var f in contracts) {
        var contract = contracts[f];
        content += `app.get('/` + contract.split("\.")[0] + `', (req, res) => {
        res.sendFile(path.join(__dirname + '/../contracts/`+ contract + `'));
    });
    `;

        html+="\n\t<script src='"+contract.split('\.')[0]+"' type='application/javascript'></script>"; 
    }
    contractContent += content + `
}`;

    console.log("generating " + contractsFile);
    fs.writeFileSync(contractsFile, contractContent);

    html+=`</head>
<body>
<p>Hello World!</p>
</body>
</html>
`;

    
    if(!fs.existsSync(indexFile)){
        console.log("generating "+indexFile);
        fs.writeFileSync(indexFile, html);
    }

    content = "";
    if (!fs.existsSync(appFile)) {
        content = `var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

require('./contracts')(app); // do not remove this line!

/**
*   Put your code below.
*/

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.listen(`+ webPort + `);
console.log("running on https://`+webHost+`:`+webPort+`");
`;
        console.log("generating " + appFile);
        fs.writeFileSync(appFile, content);
    }
}