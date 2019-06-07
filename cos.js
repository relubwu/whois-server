const fs = require('fs');
const exec = require('util').promisify(require('child_process').exec);
const cossdk = require('cos-nodejs-sdk-v5');
const { SecretId, SecretKey, Bucket, Region, Prefix, Cache, Postfix } = require("./config/config.json");

const COS = new cossdk({ SecretId, SecretKey });

/**
 * Private functions
 */
function getBucket() {
  return new Promise((resolve, reject) => {
    COS.getBucket({
      Bucket, Region, Prefix
    }, (errMsg, response) => {
      if (errMsg) {
          reject(errMsg);
      }
      resolve(response);
    })
  });
}

function touch() {
  return require('md5')(Date.now() + require('randomstring').generate(10)) + Postfix;
}

/**
 * Public method
 */
function uploadFile(filename="") {
  return new Promise((resolve, reject) => {
    COS.putObject({
      Bucket, Region, Prefix,
      Key: Prefix + filename,
      Body: fs.createReadStream(Cache + filename)
    }, (errMsg, response) => {
      if (errMsg) {
          reject(errMsg);
      }
      resolve(response)
    })
  });
}

function cacheFile(base64String) {
  return new Promise((resolve, reject) => {
    // await exec(`rm -f ./.cache/*`);
    let filename = touch();
    fs.writeFile(Cache + filename, base64String, 'base64', errMsg => {
      if (errMsg)
        reject(errMsg)
      else
        resolve(filename);
    });
  });
}

function headObject(filename="") {
  return new Promise((resolve, reject) => {
    COS.headObject({
      Bucket, Region, Prefix,
      Key: Prefix + filename
    }, (errMsg, response) => {
      if (errMsg) {
          reject(errMsg);
      }
      resolve(response);
    })
  });
}

module.exports = {
  cacheFile,
  uploadFile,
  headObject
}
