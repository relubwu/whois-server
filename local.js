const { post } = require('axios');
const WebSocket = require('ws');
const ws = new WebSocket('ws://lab.cuvita.info:8086');

const apiUrl = "https://lab.cuvita.info/searchFaces";

ws.on('open', function() {
    ws.send(JSON.stringify({ "action": "register" }));
});
ws.on('message', function(data, flags) {
  console.log(data);
    if (JSON.parse(data).action == "scan") {
      console.log("Initiate Scanning");
      post(apiUrl, { data: require('./test64.json').base64Data })
        .then(({ data }) => console.log(data))
        .catch(errMsg => console.log(errMsg));
    }
});
