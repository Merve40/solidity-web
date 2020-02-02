
// Do not modify this file!

var path = require('path'); 

module.exports=function(app){
    
    app.get('/Balances', (req, res) => {
        res.sendFile(path.join(__dirname + '/../contracts/Balances.js'));
    });
    app.get('/Migrations', (req, res) => {
        res.sendFile(path.join(__dirname + '/../contracts/Migrations.js'));
    });
    app.get('/Token', (req, res) => {
        res.sendFile(path.join(__dirname + '/../contracts/Token.js'));
    });
    
}