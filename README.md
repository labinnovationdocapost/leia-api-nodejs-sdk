
LEIA API SDK for Node.js [![npm version](https://img.shields.io/npm/v/leia-api-sdk.svg?style=flat)](https://www.npmjs.com/package/leia-api-sdk)
---

LEIA API allows you to use a wide range of Deep Learning tools to inject intelligence into your projects.

### Getting started

```npm install leia-api-sdk```

- Get an API key

- Read the [documentation](https://htmlpreview.github.io/?https://github.com/labinnovationdocapost/leia-api-nodejs-sdk/blob/master/documentation/LeiaAPI.html)

- Create a LeiaAPI object and authenticate to use the API

```javascript
const leiaAPI = new LeiaAPI()
leiaAPI.login('apiKey').then((application) => {
    console.log("you", application)
})
...
leiaAPI.addDocument('test.jpg', image.buffer).then((document) => {
   documentId = document.id
   return leiaAPI.addModel('my model', model.buffer)
}).then((model) => {
   return leiaAPI.applyModelToDocument(model.id, [documentId])
}).then((job) => {
   ...
   // Poll job for result
   leiaAPI.getJob(job.id).then((job) => {
      console.log(job.result)
   })
   ...
})
```

You can also read the [LEIA API documentation](https://api.leia.io) on [leia.io](https://leia.io).

### Licence
Apache 2.0




