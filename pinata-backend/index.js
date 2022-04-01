const pinataSDK = require('@pinata/sdk');
const pinata = pinataSDK('f8f1931c8fca2fd7b69c', '9da6e535a0b1a6f02177f969c0162b13d715cc7f797e045e1ca1ec5106e868cf');

pinata.testAuthentication().then((result) => {
  //handle successful authentication here
  console.log(result);
}).catch((err) => {
  //handle error here
  console.log(err);
});