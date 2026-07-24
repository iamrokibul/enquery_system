// --- Live current date & time display (DD/MM/YYYY, HH:MM:SS AM/PM) ---
function pad(n){ return String(n).padStart(2, "0"); }

function formattedNow(){
    var now = new Date();
    var dd = pad(now.getDate());
    var mm = pad(now.getMonth() + 1);
    var yyyy = now.getFullYear();
    var hours24 = now.getHours();
    var ampm = hours24 >= 12 ? "PM" : "AM";
    var hours12 = hours24 % 12;
    if (hours12 === 0) hours12 = 12;
    var timeStr = pad(hours12) + ":" + pad(now.getMinutes()) + ":" + pad(now.getSeconds()) + " " + ampm;
    return dd + "/" + mm + "/" + yyyy + "   " + timeStr;
}

function updateDateTime(){
    var el = document.getElementById("currentDateTime");
    if (el) el.textContent = formattedNow();
}
updateDateTime();
setInterval(updateDateTime, 1000);

// --- Auto-format DD/MM/YYYY as the user types in the date fields ---
function attachDateAutoFormat(inputId){
    var input = document.getElementById(inputId);
    input.addEventListener("input", function(){
        var digits = input.value.replace(/\D/g, "").slice(0, 8);
        var formatted = digits.slice(0, 2);
        if (digits.length >= 3) formatted += "/" + digits.slice(2, 4);
        if (digits.length >= 5) formatted += "/" + digits.slice(4, 8);
        input.value = formatted;
    });
}
attachDateAutoFormat("departure");
attachDateAutoFormat("return");

function sendWhatsApp(){
// Replace with YOUR WhatsApp business number, in full international format,
// digits only, no "+", no spaces, no leading 00.
// Example: UAE number +971 50 123 4567 -> "971501234567"
var whatsappNumber = "971563490128";

var name = document.getElementById("name").value;
var mobile = document.getElementById("mobile").value;
var origin = document.getElementById("origin").value;
var destination = document.getElementById("destination").value;
var departure = document.getElementById("departure").value;
var returndate = document.getElementById("return").value;
var adult = document.getElementById("adult").value;
var child = document.getElementById("child").value;
var infant = document.getElementById("infant").value;
var remark = document.getElementById("remark").value;
var message =
"✈️ *Travel Enquiry* %0A%0A" +
"Enquiry Date/Time: " + formattedNow() + "%0A" +
"Name: " + name + "%0A" +
"Mobile No: " + mobile + "%0A" +
"Origin: " + origin + "%0A" +
"Destination: " + destination + "%0A" +
"Departure Date: " + departure + "%0A" +
"Return Date: " + returndate + "%0A" +
"Adult: " + adult + "%0A" +
"Child: " + child + "%0A" +
"Infant: " + infant + "%0A" +
"Remark: " + remark;
var url = 
"https://wa.me/" + whatsappNumber + "?text=" + message;
window.open(url, "_blank");
}
