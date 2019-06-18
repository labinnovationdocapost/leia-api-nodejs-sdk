var request = require('request');

function handleLeiaIOResponse(err, response, body, contentRange) {
    return new Promise(function (resolve, reject) {
        if (err) {
            var error = new Error('Unknown error')
            error.status = 500
            reject(error)
        } else {
            if (response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 204) {
                var error = new Error(body)
                error.status = response.statusCode
                reject(error)
            } else {
                if (contentRange) {
                    resolve({body, contentRange: response['headers']['content-range']})
                } else {
                    resolve(body)
                }
            }
        }
    })
}

module.exports.post = (token, url, body, json) => {
    return new Promise(function (resolve, reject) {
        var headers = { 'token': token }

        request.post({ url: url, body: body, json: json, headers: headers },
            (err, response, body) => {
                return handleLeiaIOResponse(err, response, body).then((body) => {
                    resolve(body)
                }).catch((error) => {
                    reject(error)
                })
            })
    })
}

module.exports.patch = (token, url, body, json) => {
    return new Promise(function (resolve, reject) {
        var headers = { 'token': token }
        request.patch({ url: url, json: json, body: body, headers: headers },
            (err, response, body) => {
                return handleLeiaIOResponse(err, response, body).then((body) => {
                    resolve(body)
                }).catch((error) => {
                    reject(error)
                })
            })
    })
}

module.exports.get = (token, url, json, contentRange) => {
    return new Promise(function (resolve, reject) {
        var headers = { }
        if (token) {
            headers['token'] = token
        }

        request.get({ url: url, json: json, headers: headers },
            (err, response, body) => {
                return handleLeiaIOResponse(err, response, body, contentRange).then((result) => {
                    resolve(result)
                }).catch((error) => {
                    reject(error)
                })
            })
    })
}

module.exports.getFile = (token, url) => {
    return new Promise(function (resolve, reject) {
        var headers = { 'token': token }

        request.defaults({ encoding: null }).get({ url: url, headers: headers },
            (err, response, body) => {
                return handleLeiaIOResponse(err, response, body).then((body) => {
                    resolve(body)
                }).catch((error) => {
                    reject(error)
                })
            })
    })
}

module.exports.del = (token, url, json) => {
    return new Promise(function (resolve, reject) {
        var headers = { 'token': token }
        request.delete({ url: url, json: json, headers: headers },
            (err, response, body) => {
                return handleLeiaIOResponse(err, response, body).then((body) => {
                    resolve(body)
                }).catch((error) => {
                    reject(error)
                })
            })
    })
}

module.exports.streamPost = (token, url, dataStream, json) => {
    return new Promise(function (resolve, reject) {
        var headers = { 'content-type': 'application/octet-stream', 'token': token }
        require('streamifier').createReadStream(dataStream).pipe(request.post({ url: url, json: json, headers: headers },
            (err, response, body) => {
                return handleLeiaIOResponse(err, response, body).then((body) => {
                    resolve(body)
                }).catch((error) => {
                    reject(error)
                })
            }));
    })
}

