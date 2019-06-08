const path = require('path');
const express = require('express');
const app = express();
const { searchFaces, verifyFace } = require(path.join(__dirname, 'face.js'));
const { cacheFile, uploadFile, headObject } = require(path.join(__dirname, 'cos.js'));
require('log-timestamp');

const PORT = 8085;

app.listen(PORT, () => console.log(`Whois started on port ${ PORT }`));
app.use(require('body-parser').json({ 'limit': '5mb' }));
app.use('/assets', express.static(path.join(__dirname, 'www', 'assets')));

// app.get('/', (req, res) => {
//   res.render(path.join(__dirname, ))
// });

app.post('/searchFaces', async ({ body: { data } }, res) => {
  if (!data)
    return res.sendStatus(400);
  // console.log(data);
  searchFaces(data)
    .then(result => {
      return res.json(result);
    }).catch(errMsg => {
      return res.json(errMsg);
    });
});

// const { base64Data } = require('./test64.json');

// verifyFace(ImageUrl, 99)
//   .then(res => {
//     console.log(res);
//   })

// console.log(base64Data.replace(/^data:image\/jpeg;base64,/, ""));
