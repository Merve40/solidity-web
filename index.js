#! /usr/bin/env node
var fs = require('fs');
var exec = require('child_process').exec;

var cmdArgs = process.argv.slice(2);


/**
 * Automation tool.
 */
var solidity_web = (function(){

    var help =`

solidity-web is a tool for autogenerating server- and client-code.

COMMANDS
    init
    deploy [OPTION]...
    
OPTIONS
    port=<port-number>\t\t\tport number of ganache-cli -> default: 8545
    host=<host>\t\t\t\thost ip or host name of ganache-cli -> default: 127.0.0.1
    web-port=<port-number>\t\tport number of web-server (express) -> default: localhost
    web-host=<host>\t\t\thost ip or host name of web-server (express) -> default: 8181

USAGE
    solidity-web init
    solidity-web deploy web-port=8081 web-host=localhost
`;

    var appDir = "app";
    var resourcesDir = appDir + "/contracts/";
    var webDir = appDir + "/web/";

    //default values
    var port = 8545;
    var host = "127.0.0.1";
    var webPort = 8181;
    var webHost = "localhost";
    
    /**
     * Initialize all variables 
     */
    function initVars(args){
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
            }
        }
    }

    /**
     * Initialize all directories to be generated.
     */
    function initDirs(){
        mkdir(appDir);
        mkdir(resourcesDir);
        mkdir(webDir);
    }

    function mkdir(dir){
        if(!fs.existsSync(dir)){
            console.log("creating directory "+dir);
            fs.mkdirSync(dir);
        }
    }

    function print(msg){
        console.log("\n");
        console.log(msg);
        console.log("-------------------");
    }    

    /**
     * Generates client-side contracts. 
     */
    function generateContracts() { 

       
        var msg = "Seems like there are no contracts to generate.";

        if (!fs.existsSync('build/contracts')) {
            console.log(msg);
            return;
        } else if (fs.readdirSync('build/contracts').length == 0) {
            console.log(msg);
            return;
        }
    
        var files = fs.readdirSync('build/contracts');
        for (var f in files) {
            var file = files[f];
            if (file.endsWith(".json")) {
                var name = file.split('\.')[0];
                code.clientContractJs.mkfile(resourcesDir+name+".js", name, port, host, 'build/contracts/' + file);
            }
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
            migrations = fs.readdirSync('migrations');
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
            code.migrationJs.mkfile(migrationFile, contractName, files[file]);
            idx++;
        }
    }

    function generateExpress() {

        var msg = "Seems like there are no contracts to generate.";
        if (!fs.existsSync('build/contracts')) {
            console.log(msg);
            return;
        } else if (fs.readdirSync('build/contracts').length == 0) {
            console.log(msg);
            return;
        }
       
        var contractsFile = webDir + "contracts.js";
        var appFile = webDir + "app.js";
        var indexFile = webDir + "index.html";
      
        var contracts = fs.readdirSync(resourcesDir);
    
        for (var f in contracts) {
            var contract = contracts[f];
    
            code.contractJs.addContract(contract);
            code.indexHtml.addScript(contract);
        }
    
        code.indexHtml.mkfile(indexFile);
        code.contractJs.mkfile(contractsFile);
        code.appJs.mkfile(appFile, webPort, webHost);
    }

    /**
     * Main 
     * @param {Command line arguments} args 
     */
    var main = function (args){

        if(args.length == 0 || args.includes("help") || args.includes("--help") || args.includes("-h")){
            console.log(help);
            return;

        }else if(args.length == 1 && args[0] == "init"){
            print("migrations");
            generateMigrations();
            return;

        }else if(args.includes("deploy") && !args.includes("init")){

            initVars(args);
            exec('truffle migrate --reset', (err, stdout, stderr) => {
                if (err) {
                    console.error(stderr);
                    console.log(stdout);
                } else {
                    console.log(stdout);
            
                    print("web directories");        
                    initDirs();
                    print("scripts");
                    generateContracts();
                    print("express");        
                    generateExpress();
                    print("run web-server using: node app/web/app.js");
                }
            });
        }
    }

    return {
        run : main
    }
})()

/**
 * Code generator tool.
 */
var code = {
    appJs : (function(){
        var content = `var express = require('express');
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

`;
        return{
            mkfile : function(file, webPort, webHost){
                content+=`app.listen(`+ webPort + `);
console.log("running on https://`+webHost+`:`+webPort+`");
                `;
                
                if (!fs.existsSync(file)) {
                    console.log("generating " + file);
                    fs.writeFileSync(file, content);
                }
            }
        }
    })(),
    
    contractJs : (function(){
        var content = `
// Do not modify this file!

var path = require('path'); 

module.exports=function(app){
    
    `;
    
        return {
            addContract : function(contract){
                content += `app.get('/` + contract.split("\.")[0] + `', (req, res) => {
        res.sendFile(path.join(__dirname + '/../contracts/`+ contract + `'));
    });
    `;
            },
            mkfile : function(file){
                content += `
}`;
                console.log("generating " + file);
                fs.writeFileSync(file, content);
            }
        }
    })(),
    
    indexHtml : (function(){
        var html = `<html>
    <head>
        <title>Index</title>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge">
        <meta name="viewport" content="width = device-width, initial.scale = 1">
        <script src="https://cdn.jsdelivr.net/gh/ethereum/web3.js@1.0.0-beta.36/dist/web3.min.js" 
        integrity="sha256-nWBTbvxhJgjslRyuAKJHK+XcZPlCnmIAAMixz6EefVk=" crossorigin="anonymous"></script>`; 
        
        var endHtml =`</head>
    <body>
        <p>Hello World!</p>
    </body>
</html>`;
    
        return{
            addScript : function(contract){
                html+="\n\t\t<script src='"+contract.split('\.')[0]+"' type='application/javascript'></script>"; 
            },
            mkfile: function(file){
                if(!fs.existsSync(file)){
                    console.log("generating "+file);
                    fs.writeFileSync(file, html+endHtml);
                }
            }
        }
    })(),

    migrationJs : (function(){
        
            return{
                mkfile : function(file, name, src){
                    var content = `var ` + name + ` = artifacts.require("./` + src + `");
    
module.exports = function(deployer) {
    deployer.deploy(`+ name + `);
};`;
                    console.log("generating " + file);
                    fs.writeFileSync('migrations/' + file, content);
                }
            }
    })(),

    clientContractJs : (function(){

        return{
            mkfile: function(file, contractName, port, host, src){
                var obj = JSON.parse(fs.readFileSync(src, "utf8"));
                var content = `// All changes to this file will be overwritten
var data_` + contractName + ` =
{
    "abi": `+ JSON.stringify(obj.abi);

                if(Object.keys(obj.networks).length == 0){
                    content+=`
};

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://`+host+`:`+port+`'));
}

function get`+contractName+`Instance(contractAddress){
    return new web3.eth.Contract(data_` + contractName + `.abi, contractAddress);
}
`;
                }else{
                
                    content += `,
    "address": "`+ obj.networks[Object.keys(obj.networks)[Object.keys(obj.networks).length - 1]].address + `"
};

if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
} else {
    web3 = new Web3(new Web3.providers.WebsocketProvider('ws://`+host+`:`+port+`'));
}

var `+ contractName +` = new web3.eth.Contract(data_` + contractName + `.abi, data_` + contractName + `.address);`;
            }

                console.log("generating " + file);
                fs.writeFileSync(file, content);
            }
        }        
    })()
}

solidity_web.run(cmdArgs);
