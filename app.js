const PORT_HTTP = 8085;
const PORT_WS = 8086;
const stdin = process.openStdin();
const path = require('path');
const express = require('express');
const app = express();
const server = require('http').createServer(app).listen(PORT_HTTP, () => console.log(`Whois HTTP service started on port ${ PORT_HTTP }`));
const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: PORT_WS }, () => console.log(`Whois WS service started on port ${ PORT_WS }`));
const { searchFaces, verifyFace, createPerson, getPersonBaseInfo } = require(path.join(__dirname, 'face.js'));
const { cacheFile, uploadFile, headObject } = require(path.join(__dirname, 'cos.js'));
require('log-timestamp');

/**
 * Pool
 */
let Cache = {
  online: false,
  ws: null,
  status: '',
  result: {
    success: false
  }
}

const updateStatus = (status) => {
  Cache.status = status;
}

const updateResult = (result) => {
  Cache.result = result;
}

/**
 * HTTP Core
 */
app.use(require('body-parser').json({ 'limit': '5mb' }));
app.use('/assets', express.static(path.join(__dirname, 'www', 'assets')));

app.get('/', (req, res) => {
  if (!!Cache.online)
    return res.render(path.join(__dirname, 'www', 'index-online.pug'));
  else
    return res.render(path.join(__dirname, 'www', 'index-offline.pug'));
});

app.get('/initScan', (req, res) => {
  if (!Cache.ws || !Cache.online) {
    return res.json({ status: 'failed', errMsg: 'Device offline' });
  }
  updateStatus('Capturing...');
  Cache.ws.send(JSON.stringify({ action: 'scan' }))
  console.log(`Command assigned`);
  return res.json({ status: 'success' });
})

app.get('/status', (req, res) => {
  res.json({ status: Cache.status });
})

app.get('/result', (req, res) => {
  if (!Cache.result.success)
    if (Cache.result.code == "InvalidParameterValue.NoFamiliarFaces")
      return res.render(path.join(__dirname, 'www', 'result-nofami.pug'));
    else
      return res.render(path.join(__dirname, 'www', 'result-noface.pug'));
  else
    return res.render(path.join(__dirname, 'www', 'result-success.pug'), { PersonName: Cache.result.PersonName });
})

app.post('/searchFaces', ({ body: { data } }, res) => {
  if (!data)
    return res.sendStatus(400);
  // console.log(data);
  updateStatus('Extracting features...');
  searchFaces(data)
    .then(({ Results }) => {
      // return res.json(result.Results[0].Candidates);
      updateStatus('Analyzing faces...');
      return getPersonBaseInfo(Results[0].Candidates[0].PersonId);
    })
    .then(({ PersonName, Gender }) => {
      console.log(`Request success, subject::${PersonName}`);
      updateResult({ success: true, PersonName });
      updateStatus('Completed');
      return res.json({
        status: true,
        result: `The face recognized upon your request is ${ Gender == 1 ? 'Mr.' : 'Ms.' }${ PersonName }`
      });
    })
    .catch(({ code }) => {
      console.log(`Request failed, code::${code}`);
      updateResult({ success: false, code });
      updateStatus('Completed');
      return res.json({
        status: false,
        errMsg: code
      });
    })
});

/**
 * WS
 */
wss.on('connection', ws => {
  Cache.ws = ws;
  Cache.online = true;
  ws.on('message', message => {
    try {
      message = JSON.parse(message);
    } catch (e) {
      ws.send(JSON.stringify({ action: 'error', errMsg: e }));
    }
    console.log(message);
  });
  ws.send(JSON.stringify({ action: 'register' }));
  ws.on('close', (code, reason) => {
    Cache.ws = null;
    Cache.online = false;
    console.log(`Websocket connection lost, code: ${code}, reason: ${reason}`);
  })
});

/**
 * Console
 */
stdin.addListener("data", d => {
  // note:  d is an object, and when converted to a string it will
  // end with a linefeed.  so we (rather crudely) account for that
  // with toString() and then trim()
  switch (d.toString().trim()) {
    case 'set online':
      Cache.online = true;
      console.log(`Status toggled to { ONLINE }`);
      break;
    case 'set offline':
      Cache.online = false;
      console.log(`Status toggled to { OFFLINE }`);
      break;
    case 'status':
      console.log(`Status { ${Cache.online ? 'ONLINE' : 'OFFLINE'} }`);
      break;
    case 'init':
      if (!Cache.ws || !Cache.online) {
        console.log(`Device offline`);
      } else {
        Cache.ws.send(JSON.stringify({ action: 'scan' }))
        console.log(`Command assigned`);
      }
      break;
    default:
      console.log(`Unrecognized command: [${d.toString().trim()}]`);
      break;
  }
});
