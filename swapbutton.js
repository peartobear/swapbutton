
/*

<div class="withbutton"
    litecoin-addr = "placeholder123"
    pairID = "LTC/BTC"
    orderSide = "buy"
    invoiceAmount = "100000">
</div>

*/


var invoiceExpired = false;
var expiryInterval;

var qrCode;
var modal = document.querySelector(".modal")
var close = document.querySelector(".close")
var paywithlightning = document.getElementById('pay');
var elem = document.getElementById("bar");
var timer = elem.querySelector(".timer")
var element = document.querySelector(".qrcode");


var elemDefault = elem.innerHTML;
var elemDefaultStyles = elem.style;


// Generating a random LTC keypair for claiming the reverse swap 


const TestNet = Ltc.networks.testnet;
let keyPair = Ltc.ECPair.makeRandom({network: TestNet});
let publicKey = keyPair.publicKey;
let {address} = Ltc.payments.p2pkh({pubkey : publicKey});
let privateKey = keyPair.toWIF();
console.log("Public: " + publicKey + " \nPrivate: " + privateKey + " \Address: " + address);




if (typeof localStorage === "undefined" || localStorage === null) {
    var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
}

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
 }



const myConfig = 
{
    pairId: "LTC/BTC",
    orderSide: "buy",
    invoiceAmount: 10000,
    claimPublicKey: "a9142f7150b969c9c9fb9094a187f8fb41d617a65e20876300670171b1752102e317e5607e757e9c4448fe458876d7e361222d2cbee33ece9e3a7b2e2359be4d68ac"
  }




function createQRCode() {
    var invoiceLength = 26;

    var qr = qrcode(26, "L");

    qr.addData(localStorage.getItem('data'));
    qr.make();

    qrCode = qr.createImgTag(6, 6);
}

function showQRCode() {

    createQRCode();

    element.innerHTML = qrCode;

    var size = "136px";

    var qrElement = element.children[0];

    qrElement.style.height = size;
    qrElement.style.width = size;

}





function createreverseswap(config) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
        if (request.readyState === 4) { 
            try {
                var json = JSON.parse(request.responseText);
                if (request.status === 201) {
                    localStorage.setItem('data', json.invoice)
                    localStorage.setItem('redeemS', json.redeemScript)
                    localStorage.setItem('value0', json.value)
                    showQRCode();
                } 
                } catch (exception) {
                    console.error(exception)
                }
            }  
        };

        request.open('POST', 'https://testnet.boltz.exchange/api/createreverseswap', true);
        request.setRequestHeader('Content-Type', 'application/json');   
        request.send(JSON.stringify(config));
    }


// imvoice countdown

// 5 minutes from now


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
    
// claiming the reverseswap 

/* 

var redeemScript = localStorage.getItem('redeemS');
var value = localStorage.getItem('value);


const tx = new Transaction(); */










    

// creating a dialog

window.onload = function(){
    (function() {
   paywithlightning.addEventListener("click", function() {
        modal.style.display = "inline-block"
        createreverseswap(myConfig);


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

