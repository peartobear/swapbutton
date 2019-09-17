/*

<div class="withbutton"
    litecoin-addr = "placeholder123"
    pairID = "LTC/BTC"
    orderSide = "buy"
    invoiceAmount = "100000">
</div>

*/

var qrCode;


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
    var invoiceLength = json.invoice.length;

    var qr = qrcode(json.invoice.length, "L");

    qr.addData(json.invoice);
    qr.make();

    qrCode = qr.createImgTag(6, 6);
}

function showQRCode() {
    var element = document.getElementById("qrcode");

    createQRCode();

    element.innerHTML = qrCode;

    var size = document.getElementById("lightningTipInvoice").clientWidth + "px";

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
                    console.log ("got invoice" + json.invoice)
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



// creating a dialog

window.onload = function(){
    (function() {
    createreverseswap(myConfig); 

    var paywithlightning = document.getElementById('pay');
    var invoice = document.getElementById('invoice');

    // "payWithLightning" button opens the <dialog> modally

    paywithlightning.addEventListener('click', function onOpen() {
        if (typeof invoice.showModal === "function") {
            invoice.showModal();
        } else {
            alert("Update your browser")
        }
    });

})();

}

