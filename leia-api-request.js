var request = require('request');
var streamifier = require('streamifier')
var fs = require('fs')

module.exports = class LeiaAPIRequest {

    constructor(serverURL) {
        this.serverURL = serverURL
    }

    post(url, body, json) {
        var that = this
        url = encodeURI(url)
        return new Promise(function (resolve, reject) {
            var headers = { 'token': that.token }

            request.post({ url: url, body: body, json: json, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, false).then((body) => {
                        resolve(body)
                    }).catch((error) => {
                        reject(error)
                    })
                })
        })
    }

    patch(url, body, json) {
        var that = this
        url = encodeURI(url)
        return new Promise(function (resolve, reject) {
            var headers = { 'token': that.token }
            request.patch({ url: url, json: json, body: body, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, false).then((body) => {
                        resolve(body)
                    }).catch((error) => {
                        reject(error)
                    })
                })
        })
    }

    get(url, json, contentRange) {
        var that = this
        url = encodeURI(url)
        return new Promise(function (resolve, reject) {
            var headers = {}
            if (that.token !== null) {
                headers['token'] = that.token
            }
            request.get({ url: url, json: json, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, contentRange).then((result) => {
                        resolve(result)
                    }).catch((error) => {
                        reject(error)
                    })
                })
        })
    }

    getFile(url) {
        var that = this
        url = encodeURI(url)
        return new Promise(function (resolve, reject) {
            var headers = { 'token': that.token }

            request.defaults({ encoding: null }).get({ url: url, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, false).then((body) => {
                        resolve(body)
                    }).catch((error) => {
                        reject(error)
                    })
                })
        })
    }

    del(url, json) {
        var that = this
        url = encodeURI(url)
        return new Promise(function (resolve, reject) {
            var headers = { 'token': that.token }
            request.delete({ url: url, json: json, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, 
                        false).then((body) => {
                            resolve(body)
                        }).catch((error) => {
                            reject(error)
                        })
                })
        })
    }

    streamPost(url, bufferOrPath, json) {
        var that = this
        var readStream = null

        if (typeof bufferOrPath === 'string' || bufferOrPath instanceof String) {
            readStream = fs.createReadStream(bufferOrPath);
        } else {
            readStream = streamifier.createReadStream(bufferOrPath)
        }
        url = encodeURI(url)
        return new Promise(function (resolve, reject) {
            var headers = { 'content-type': 'application/octet-stream', 'token': that.token }
            readStream.pipe(request.post({ url: url, json: json, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, false).then((body) => {
                        resolve(body)
                    }).catch((error) => {
                        reject(error)
                    })
                }));
        })
    }

    handleLeiaIOResponse(err, response, body, contentRange) {
        return new Promise(function (resolve, reject) {
            if (err) {
                var error = new Error(err)
                error.status = 500
                reject(error)
            } else {
                if (response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 204) { 
                    if (body && typeof body === 'object') {
                        body = body['detail']
                    }
                    var error = new Error(body)
                    error.status = response.statusCode
                    reject(error)
                } else {
                    if (contentRange) {
                        resolve({ body, contentRange: response['headers']['content-range'] })
                    } else {
                        resolve(body)
                    }
                }
            }
        })
    }

    login(apiKey) {
        this.token = null
        var that = this
        return new Promise(function (resolve, reject) {
            that.get(that.serverURL + '/login/' + apiKey, true, false, false).then((body) => {
                that.token = body.token
                resolve(body)
            }).catch((error) => {
                reject(error)
            })
        })
    }

}




