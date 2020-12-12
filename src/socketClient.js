var net = require("net");
var dns = require("dns");
let defaultIp = "127.0.0.1";
let defaultPort = 42069;
let client = new net.Socket();

$(document).on("click", ".connect-btn", async function () {
  let ip = $("[name=ip]").val();
  let port = $("[name=port]").val();
  if (port == "") port = defaultPort;
  else port = parseInt(port);

  if (ip == "") ip = defaultIp;
  else if (net.isIPv4(ip)) {
    client.connect(port, ip, () => {
      $(".socket-info").hide();
      $(".dept-selection").removeClass("d-none");
    });
  } else {
    dns.lookup(ip, (err, address, family) => {
      client.connect(port, address, () => {
        $(".socket-info").hide();
        $(".dept-selection").removeClass("d-none");
      });
    });
  }
});

$(document).on("change", "#deptsSelect", function () {
  let selectedDeptName = $("#deptsSelect").val();
  let payload = JSON.stringify({
    type: "offerings",
    payload: selectedDeptName,
  });
  client.write(payload);
});

$(document).on("click", ".clicky-item", function () {
  let courseCode = $(this).attr("data-course");
  let payload = JSON.stringify({
    type: "courseDesc",
    payload: courseCode,
  });
  console.log(payload);
  client.write(payload);
});

client.on("data", function (data) {
  let obj = JSON.parse(data);
  console.log(obj);
  if (obj.type == "init") {
    for (let deptInd = 0; deptInd < obj.payload.length; deptInd++) {
      let deptName = obj.payload[deptInd];
      let deptOptionElem = $("<option></option>").text(deptName).val(deptName);
      $("#deptsSelect").append(deptOptionElem);
    }
    $("#deptsSelect").trigger("change");
  } else if (obj.type == "deptOfferings") {
    if (obj.success) {
      $(".offerings").empty();
      for (
        let offeringInd = 0;
        offeringInd < obj.offerings.length;
        offeringInd++
      ) {
        let offeringName = obj.offerings[offeringInd];
        let offeringCode = obj.offerings[offeringInd].split(":")[0];
        let offeringElem = $("<li></li>")
          .attr("data-course", offeringCode)
          .text(offeringName)
          .addClass("list-group-item")
          .addClass("clicky-item");

        $(".offerings").append(offeringElem);
      }
    } else
      console.log(
        "Oops! Something went wrong. Here's what the server says: " + obj.msg
      );
  } else if (obj.type == "courseDesc") {
    if (obj.success) {
      let courseDesc = obj.payload;
      let desc = `<b>Timings:</b> ${
        courseDesc.TimingsForLS
      } <br /> <b>Faculty:</b> ${
        courseDesc.FacultyLS
      } <br />  ${courseDesc.desc.replace(/\n/g, "<br />")} `;
      $(".modal-body").html(desc);
      $("#exampleModal").modal("show");
    } else console.log("Error", obj.msg);
  }
});
