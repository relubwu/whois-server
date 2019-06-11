const stdin = process.openStdin();
const path = require('path');
const express = require('express');
const app = express();
const { searchFaces, verifyFace, createPerson, getPersonBaseInfo } = require(path.join(__dirname, 'face.js'));
const { cacheFile, uploadFile, headObject } = require(path.join(__dirname, 'cos.js'));
require('log-timestamp');

const PORT = 8085;

let Cache = {
  online: false
}

app.listen(PORT, () => console.log(`Whois started on port ${ PORT }`));
app.use(require('body-parser').json({ 'limit': '5mb' }));
app.use('/assets', express.static(path.join(__dirname, 'www', 'assets')));

app.get('/', (req, res) => {
  return res.render(path.join(__dirname, 'www', 'index.pug'), Cache);
});

app.post('/searchFaces', ({ body: { data } }, res) => {
  if (!data)
    return res.sendStatus(400);
  // console.log(data);
  searchFaces(data)
    .then(({ Results }) => {
      // return res.json(result.Results[0].Candidates);
      return getPersonBaseInfo(Results[0].Candidates[0].PersonId);
    })
    .then(({ PersonName, Gender }) => {
      console.log(`Request success, subject::${PersonName}`);
      return res.json({
        status: true,
        result: `The face recognized upon your request is ${ Gender == 1 ? 'Mr.' : 'Mrs.' }${ PersonName }`
      });
    })
    .catch(({ code }) => {
      console.log(`Request failed, code::${code}`);
      return res.json({
        status: false,
        errMsg: code
      });
    })
});

// const { base64Data } = require('./test64.json');

// verifyFace(ImageUrl, 99)
//   .then(res => {
//     console.log(res);
//   })

// console.log(base64Data.replace(/^data:image\/jpeg;base64,/, ""));

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
      default:
        console.log(`Unrecognized command: [${d.toString().trim()}]`);
        break;
    }
  });
