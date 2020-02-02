var gasPrice = 300000;
var tokensPerWei;

var user1 = getUser(1);
var user2 = getUser(2);

// retrieves all accounts from blockchain
web3.eth.getAccounts().then(accounts=>{
    user1.setWallet(accounts[1]);
    user2.setWallet(accounts[2]);

    initUser(user1);
    initUser(user2);
});

Token.events.Transfer(onTransferred);

Token.methods.oneWeiToToken().call({}, (err, result)=>{
    if(!err){
        tokensPerWei = result;
    }
});

function initUser(user){
    user.getTransferButton().onclick = transfer;
    user.getTokenButton().onclick = buyTokens;
    user.getReceipt().getButton().onclick = close;
    user.getInfo().getButton().onclick = close;
    user.getError().getButton().onclick = close;

    updateBalance(user);
    updateToken(user);
}

function buyTokens(){
    var id = this.parentNode.parentNode.id;
    var user = getUserById(id).user;

    /**
     * The amount of tokens in Wei.
     * Buys tokens based on the given number.
     */
    var amount = Math.round( user.getTokenInput().value / tokensPerWei );
    Token.methods.buyTokens(user.getTokenInput().value).send({from: user.getWallet(), gas:gasPrice, value:amount}, (err, receipt)=>{
        if(!err){
            showReceipt(user, receipt);
            user.getTokenInput().value = "";
            updateToken(user);
            updateBalance(user);
        }else{
            console.error(err);
        }
    });  
}

function transfer(){
    var id = this.parentNode.parentNode.id;
    var user = getUserById(id).user;
    var otherUser = getUserById(id).otherUser;

    /**
     * Transfers tokens from this user to the other.
     */
    Token.methods.transfer( otherUser.getWallet(), parseInt(user.getTransferInput().value))
        .send({from: user.getWallet(), gas:gasPrice}, (err, receipt)=>{
            if(!err){
                updateBalance(user);
                updateBalance(otherUser);
                updateToken(user);
                updateToken(otherUser);
                showReceipt(user, receipt);

            }else{
                user.getError().getContent().innerHTML = `<pre><code>${err}</code></pre>`;
                user.getError().show();
            }
        });
}

/**
 * This event is fired whenever the 'transfer' method was successfully called.
 * @param {error message} error 
 * @param {event object containing parameters} event 
 */
function onTransferred(error, event){
    if(!error){
        var info = `Received ${event.returnValues.amount} Token(s) from ${event.returnValues.from} `;
        var user = user1.getWallet() == event.returnValues.to ? user1 : user2;
        user.getInfo().getContent().innerHTML = `<pre><code>${info}</code></pre>`;
        user.getInfo().show();
    }
}

function updateBalance(user){
    web3.eth.getBalance(user.getWallet()).then(balance=>{
        user.getBalance().innerHTML = balance;
    });
}

function updateToken(user){
    // retrieves the current number of tokens of the user
    Token.methods.balance().call({from:user.getWallet(), gas:gasPrice}, (err, result)=>{
        if(!err){
            user.getTokens().innerHTML = result;
        }else{
            console.error(err);
        }
    });
}

/**
 * Retrieves the transaction from the blockchain and shows it.
 * @param {user object} user 
 * @param {transaction hash} receipt 
 */
function showReceipt(user, receipt){
    web3.eth.getTransactionReceipt(receipt, (err,result)=>{
        if(!err){
            var rec = prettyPrint(result);
            var tx = user.getReceipt().getContent();
            tx.innerHTML = "<pre><code>"+rec+"</code></pre>";
            user.getReceipt().show();
        }
    }); 
}

function close(){
    var div = this.parentNode;
    div.classList.add('hide');
}

function getUserById(id){
    if(id == user1.usr){
        return {user: user1, otherUser: user2};
    }else{
        return {user: user2, otherUser:user1};
    }
}

function getUser(num){
    var usr;
    var wallet;
    if(num == 1){
        usr = "usr1";
    }else if(num == 2){
        usr = "usr2";
    }else{
        return;
    }

    function setWallet(wlt){
        xpath = `//div[@id = '${usr}']//td[@class = 'wallet']`;
        getElementsByXpath(xpath)[0].innerHTML = wlt;
        wallet = wlt;
    }

    function getWallet(){
        return wallet;
    }

    function getTokens(){
        xpath = `//div[@id = '${usr}']//td[@class = 'tokens']`;
        return getElementsByXpath(xpath)[0];
    }

    function getBalance(){
        xpath = `//div[@id = '${usr}']//td[@class = 'balance']`;
        return getElementsByXpath(xpath)[0];
    }

    function getTransferInput(){
        xpath = `//div[@id = '${usr}']/div[@class = 'main']//input`;
        return getElementsByXpath(xpath)[0];
    }

    function getTransferButton(){
        xpath = `//div[@id = '${usr}']/div[@class = 'main']//button`;
        return getElementsByXpath(xpath)[0];
    }

    function getTokenInput(){
        xpath = `//div[@id = '${usr}']/div[@class = 'mid']//input`;
        return getElementsByXpath(xpath)[0];
    }

    function getTokenButton(){
        xpath = `//div[@id = '${usr}']/div[@class = 'mid']//button`;
        return getElementsByXpath(xpath)[0];
    }


    function getReceipt(){
        
        function getButton(){
            xpath = `//div[@id = '${usr}']//div[contains(@class,'receipt')]/a`;
            return getElementsByXpath(xpath)[0];
        }

        function getContent(){
            xpath = `//div[@id = '${usr}']//div[contains(@class,'receipt')]/div`;
            return getElementsByXpath(xpath)[0];
        }

        function show(){
            xpath = `//div[@id = '${usr}']//div[contains(@class,'receipt')]`;
            getElementsByXpath(xpath)[0].classList.remove('hide');
        }

        return{
            getButton,
            getContent,
            show
        }

    }

    function getInfo(){
        
        function getButton(){
            xpath = `//div[@id = '${usr}']//div[contains(@class,'info')]/a`;
            return getElementsByXpath(xpath)[0];
        }

        function getContent(){
            xpath = `//div[@id = '${usr}']//div[contains(@class,'info')]/div`;
            return getElementsByXpath(xpath)[0];
        }

        function show(){
            xpath = `//div[@id = '${usr}']//div[contains(@class,'info')]`;
            getElementsByXpath(xpath)[0].classList.remove('hide');
        }

        return{
            getButton,
            getContent,
            show
        }
    }

    function getError(){
        
        function getButton(){
            xpath = `//div[@id = '${usr}']//div[contains(@class,'error')]/a`;
            return getElementsByXpath(xpath)[0];
        }

        function getContent(){
            xpath = `//div[@id = '${usr}']//div[contains(@class,'error')]/div`;
            return getElementsByXpath(xpath)[0];
        }

        function show(){
            xpath = `//div[@id = '${usr}']//div[contains(@class,'error')]`;
            getElementsByXpath(xpath)[0].classList.remove('hide');
        }

        return{
            getButton,
            getContent,
            show
        }
    }

    return{
        usr,
        getWallet,
        setWallet,
        getBalance,
        getTokens,
        getTransferInput,
        getTransferButton,
        getTokenInput,
        getTokenButton,
        getReceipt,
        getInfo,
        getError
    }
}

function getElementsByXpath(xpath){
    var elements = [];
    var sel = document.evaluate(xpath, document, null, XPathResult.ANY_TYPE,null);
    var el = sel.iterateNext();
    elements.push(el);

    while( (el = sel.iterateNext()) != null){
        elements.push(el);
    }
    return elements;
}

function prettyPrint(json) {
    if (typeof json != 'string') {
         json = JSON.stringify(json, undefined, 2);
    }
    json = json.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
        var cls = 'number';
        if (/^"/.test(match)) {
            if (/:$/.test(match)) {
                cls = 'key';
            } else {
                cls = 'string';
            }
        } else if (/true|false/.test(match)) {
            cls = 'boolean';
        } else if (/null/.test(match)) {
            cls = 'null';
        }
        return '<span class="' + cls + '">' + match + '</span>';
    });
}