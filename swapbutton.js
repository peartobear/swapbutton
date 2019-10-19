(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.bitcoin = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
    /*
    
    <div class="withbutton"
    litecoin-addr = "placeholder123"
    pairID = "LTC/BTC"
    orderSide = "buy"
    invoiceAmount = "100000">
    </div>
    
    */

    var boltzApiUrl = "https://testnet.boltz.exchange/api"
    
    var invoiceExpired = false;
    var expiryInterval;
    
    var qrCode;
    var modal = document.querySelector(".modal")
    var close = document.querySelector(".close")
    var paywithlightning = document.getElementById('pay');
    var elem = document.getElementById("bar");
    
    var elemDefault = elem.innerHTML;
    var elemDefaultStyles = elem.style;
    
    if (typeof localStorage === "undefined" || localStorage === null) {
        var LocalStorage = require('node-localstorage').LocalStorage;
        localStorage = new LocalStorage('./scratch');
    }

    const claimKeys = bitcoinjs.ECPair.makeRandom();
    
    const myConfig = 
    {
        pairId: "LTC/BTC",
        orderSide: "buy",
        invoiceAmount: 10000,
        claimPublicKey: claimKeys.publicKey.toString('hex')
    }
    
    
    
    
    function createQRCode() {
        var invoiceLength = 26;
        
        var qr = qrcode(26, "L");
        
        qr.addData(localStorage.getItem('data'));
        qr.make();
        
        qrCode = qr.createImgTag(6, 6);
    }
    
    function showQRCode() {
        var element = document.getElementById("qrcode");
        
        createQRCode();
        
        element.innerHTML = qrCode;
        
        var size = "200px";
        
        var qrElement = element.children[0];
        
        qrElement.style.height = size;
        qrElement.style.width = size;
        
    }

    function reverseBuffer(input) {
        const toReverse = buffer.Buffer.allocUnsafe(input.length);
      
        for (let i = 0, j = input.length - 1; i <= j; i += 1, j -= 1) {
            toReverse[i] = input[j];
            toReverse[j] = input[i];
        }
      
        return toReverse;
    };
    
    function claimSwap(json, preimage) {

        var claimTransaction = boltzCore.constructClaimTransaction(
            [{
                vout: 0,
                txHash: reverseBuffer(buffer.Buffer.from(json.lockupTransactionId, 'hex')),
                preimage: buffer.Buffer.from(preimage, 'hex'),
                value: json.onchainAmount,
                keys: claimKeys,
                type: boltzCore.OutputType.Bech32,
                redeemScript: buffer.Buffer.from(json.redeemScript, 'hex'),
            }],
            // TODO: change hardcoded claim address
            bitcoinjs.address.toOutputScript('tltc1q3cudtecrxh23nhmqlmzu998yh7d5wzg4vtw2kt', boltzCore.Networks.litecoinTestnet),
            2,
            true
        );

        var rawTransaction = claimTransaction.toHex();

        console.log('Generated claim transaction: ' + rawTransaction);

        var request = new XMLHttpRequest();

        request.onreadystatechange = function() {
            if (request.readyState === 4) { 
                try {
                    console.log("Broadcasted claim transaction")
                } catch (exception) {
                    console.error(exception)
                }
            }  
        };

        request.open('POST', boltzApiUrl + "/broadcasttransaction", true);
        request.setRequestHeader('Content-Type', 'application/json');   
        request.send(JSON.stringify({
            transactionHex: rawTransaction,
            currency: 'LTC',
        }));
    }
    
    function listenToEventSource(json) {
        var eventSource = new EventSource(boltzApiUrl + "/streamswapstatus?id=" + json.id);
    
        eventSource.onmessage = function(event) {
            console.log("Swap swap event: " + event.data);
    
            const eventData = JSON.parse(event.data);
    
            if (eventData.status === "invoice.settled") {
                claimSwap(json, eventData.preimage);
            }
        }
    }
    
    function createreverseswap(config) {
        var request = new XMLHttpRequest();
        
        request.onreadystatechange = function() {
            if (request.readyState === 4) { 
                try {
                    var json = JSON.parse(request.responseText);
                    if (request.status === 201) {
                        localStorage.setItem('data', json.invoice)
                        showQRCode();
    
                        listenToEventSource(json);
                    } 
                } catch (exception) {
                    console.error(exception)
                }
            }  
        };
        
        request.open('POST', boltzApiUrl + '/createreverseswap', true);
        request.setRequestHeader('Content-Type', 'application/json');   
        request.send(JSON.stringify(config));
    }
    
    
    //copying the invoice on clicking the copy button
    
    var copyBtn = document.getElementById("copy-btn")
    var copyInvoice = localStorage.getItem('data');
    copyBtn.addEventListener("click", function(){
        copyInvoice.select();
        copyInvoice.setSelectionRange(0, 99999) //for mobile devices
        document.execCommand("copy")
        copyBtn.innerHTML("Copied!")    
        
    })
    
    // imvoice countdown
    
    function startExpiryCountdown() {
        width = 1;
        expiryInterval = setInterval(frame, 200);
        function frame() {
            if (width >= 100) {
                clearInterval(expiryInterval);
                expiryInterval = undefined;
                
                invoiceExpired = true;
                
                elem.style.background = '#FD7373';
                elem.innerHTML = 'invoice expired';
                elem.style.color = "#fff"; 
            } else {
                width++;
                elem.style.width = width + '%'
            }
        }   
    }
    
    
    /*  if ((paywithlightning.clicked == true) && (elem.style.background = '#FD7373')) {
        clearInterval(window.id);
        elem.style.width = '1%'
        move();
    }  else if (paywithlightning.clicked == false) { move() } 
    else { return false } */
    
    
    
    
    // creating a dialog
    
    window.onload = function(){
        (function() {
            createreverseswap(myConfig); 
            paywithlightning.addEventListener("click", function() {
                modal.style.display = "inline-block"
                
                if (invoiceExpired) {
                    elem.innerHTML = elemDefault;
                    elem.style = elemDefaultStyles;
                }
                
                if (expiryInterval === undefined) {
                    startExpiryCountdown();
                }
            })
            
            close.addEventListener("click", function() {
                modal.style.display = "none";
            })
            
            
        })();
        
    }
    
    
    },{}]},{},[1])(1)
    });
