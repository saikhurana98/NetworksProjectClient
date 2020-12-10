var net = require('net');

let defaultIp = '127.0.0.1';
let defaultPort = 42069;
let client = new net.Socket();

$(document).on('click', '.connect-btn', function() {
    console.log("Triggered.");
    let ip = $('[name=ip]').val();
    let port = $('[name=port]').val();

    if(!net.isIP(ip)) ip = defaultIp;

    if(port == '') { port = defaultPort; }
    else port = parseInt(port);

    client.connect(port, ip, () => {
        $('.socket-info').hide();
        $('.dept-selection').removeClass("d-none");
    });
});

$(document).on('change', '#deptsSelect', function() {
    let selectedDeptName = $("#deptsSelect").val();
    console.log(selectedDeptName);
    client.write(selectedDeptName);
});

client.on('data', function (data) {
    let obj = JSON.parse(data);
    console.log(obj);
    if(obj.type == 'init') {
        for(let deptInd = 0; deptInd < obj.payload.length; deptInd++) {
            let deptName = obj.payload[deptInd];
            let deptOptionElem = $("<option></option>").text(deptName).val(deptName);
            $("#deptsSelect").append(deptOptionElem);
        }
    }
    else if(obj.type == 'deptOfferings') {
        if(obj.success) {
            $(".offerings").empty();
            for(let offeringInd = 0; offeringInd < obj.offerings.length; offeringInd++) {
                let offeringName = obj.offerings[offeringInd];
                let offeringElem = $("<li></li>").text(offeringName).addClass('list-group-item');
                $(".offerings").append(offeringElem);
            }   
        }
        else console.log("Oops! Something went wrong. Here's what the server says: "+obj.msg);
    }
});