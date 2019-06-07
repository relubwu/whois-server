const { searchFaces, verifyFace } = require('./face.js');
const { cacheFile, uploadFile, headObject } = require('./cos.js');

const ImageUrl = "https://lab-1254391499.cos.na-siliconvalley.myqcloud.com/faces/d7a20e0d0fa947cb1778b37fed693726.jpg";
const { base64Data } = require('./test64.json');

// verifyFace(ImageUrl, 99)
//   .then(res => {
//     console.log(res);
//   })

searchFaces(base64Data)
  .then(res => {
    console.log(res);
  });

// console.log(base64Data.replace(/^data:image\/jpeg;base64,/, ""));
