const { post } = require('axios');

const { base64Data } = require('./test64.json');
const apiUrl = "https://lab.cuvita.info/searchFaces";

post(apiUrl, { data: base64Data })
  .then(({ data }) => console.log(data))
  .catch(errMsg => console.log(errMsg));
