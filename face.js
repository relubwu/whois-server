const path = require('path');
const tencentcloud = require("tencentcloud-sdk-nodejs");
const { SecretId, SecretKey, endpoint, region } = require(path.join(__dirname, 'config', 'config.json'));
const { Client, Models } = tencentcloud.iai.v20180301;
const { Credential, ClientProfile, HttpProfile } = tencentcloud.common;

let cred = new Credential(SecretId, SecretKey); // Instantiate credential object
let httpProfile = new HttpProfile();  // Instantiate HTTP profile
httpProfile.endpoint = endpoint; // Configure endpoint
let clientProfile = new ClientProfile();  // Instantiate client profile
clientProfile.httpProfile = httpProfile;  // Configure HTTP profile
let client = new Client(cred, region, clientProfile);

function compareFace(UrlA, UrlB) {
  return new Promise((resolve, reject) => {
    let req = new Models.CompareFaceRequest();
    req.deserialize({ UrlA, UrlB });
    client.CompareFace(req, (errMsg, response) => {
        if (errMsg) {
            return reject(errMsg);
        }
        resolve(response);
    });
  });
}

function verifyFace(Image, PersonId) {
  return new Promise((resolve, reject) => {
    Image = Image.replace(new RegExp(`^data:image\/${filetype};base64,`), "")
    let req = new Models.VerifyFaceRequest();
    req.deserialize({ PersonId, Url });
    client.VerifyFace(req, (errMsg, response) => {
        if (errMsg) {
            return reject(errMsg);
        }
        resolve({ Score: response.Score, IsMatch: response.IsMatch });
    });
  })
}

function searchFaces(Image, filetype="jpeg") {
  return new Promise((resolve, reject) => {
    Image = Image.replace(new RegExp(`^data:image\/${filetype};base64,`), "");
    let req = new Models.SearchFacesRequest();
    req.deserialize({ Image, GroupIds: ['16'] });
    client.SearchFaces(req, (errMsg, response) => {
        if (errMsg) {
            return reject(errMsg);
        }
        // One Standard-Deviation Bias
        if (response.Results[0].Candidates[0].Score >= 32.00)
          return resolve(response);
        else
          reject({ code: "InvalidParameterValue.NoFamiliarFaces"});
    });
  })
}

function createPerson(Image, PersonName, Gender="1") {
  return new Promise((resolve, reject) => {
    let PersonId = require('md5')(Date.now() + require('randomstring').generate(10)) + Postfix;
    let req = new Models.CreatePersonRequest();
    req.deserialize({ Image, PersonName, Gender, PersonId, GroupId: '16'  });
    client.CreatePerson(req, (errMsg, response) => {
        if (errMsg) {
            return reject(errMsg);
        }
        resolve(response);
    });
  });
}

function getPersonBaseInfo(PersonId) {
  return new Promise((resolve, reject) => {
    let req = new Models.GetPersonBaseInfoRequest();
    req.deserialize({ PersonId  });
    client.GetPersonBaseInfo(req, (errMsg, response) => {
        if (errMsg) {
            return reject(errMsg);
        }
        resolve(response);
    });
  });
}

module.exports = {
  compareFace,
  verifyFace,
  searchFaces,
  createPerson,
  getPersonBaseInfo
}
