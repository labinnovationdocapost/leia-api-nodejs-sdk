
LeIA API SDK [![npm version](https://img.shields.io/npm/v/leia-api-sdk.svg?style=flat)](https://www.npmjs.com/package/react-native-maps)
---

LeIA API allows you to use a wide range of Deep Learning tools to inject intelligence into your projects.

[LeIA API](https://api.leia.io)

### Getting started

```npm install leia-api-sdk```

- Get an API key

- Read the [documentation](./documentation/index.html)

- Create a LeiaAPI object and authenticate to use the API

```javascript
const leiaAPI = new LeiaAPI('apiKey')
leiaAPI.login().then((application) => {
    console.log("it's me", application)
})
...
leiaAPI.getDocuments().then((results) => {
   ...
})
```

You can also read the [LeIA API documentation](https://api.leia.io)






