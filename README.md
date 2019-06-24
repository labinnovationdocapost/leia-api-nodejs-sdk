
LEIA API SDK for NodeJS [![npm version](https://img.shields.io/npm/v/leia-api-sdk.svg?style=flat)](https://www.npmjs.com/package/leia-api-sdk)
---

LEIA API allows you to use a wide range of Deep Learning tools to inject intelligence into your projects.

### Getting started

```npm install leia-api-sdk```

- Get an API key

- Read the [documentation](./documentation/index.html)

- Create a LeiaAPI object and authenticate to use the API

```javascript
const leiaAPI = new LeiaAPI('apiKey')
leiaAPI.login().then((application) => {
    console.log("you", application)
})
...
leiaAPI.getDocuments().then((results) => {
   ...
})
```

You can also read the [LeIA API documentation](https://api.leia.io)






