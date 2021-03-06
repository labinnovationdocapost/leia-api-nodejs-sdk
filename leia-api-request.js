var request = require('request');
var streamifier = require('streamifier')
var fs = require('fs')

module.exports = class LeiaAPIRequest {

    constructor(apiKey, serverURL) {
        this.apiKey = apiKey
        this.serverURL = serverURL
    }

    post(url, body, json, refreshToken) {
        var args = [...arguments]
        var that = this
        url = encodeURI(url)
        return new Promise(function (resolve, reject) {
            var headers = { 'token': that.token }

            request.post({ url: url, body: body, json: json, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, that.post, args, false, refreshToken).then((body) => {
                        resolve(body)
                    }).catch((error) => {
                        reject(error)
                    })
                })
        })
    }

    patch(url, body, json, refreshToken) {
        var args = [...arguments]
        var that = this
        url = encodeURI(url)
        return new Promise(function (resolve, reject) {
            var headers = { 'token': that.token }
            request.patch({ url: url, json: json, body: body, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, that.patch, args, false, refreshToken).then((body) => {
                        resolve(body)
                    }).catch((error) => {
                        reject(error)
                    })
                })
        })
    }

    get(url, json, contentRange, refreshToken) {
        var args = [...arguments]
        var that = this
        url = encodeURI(url)
        return new Promise(function (resolve, reject) {
            var headers = {}
            if (that.token !== null) {
                headers['token'] = that.token
            }
            request.get({ url: url, json: json, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, that.get, args, contentRange, refreshToken).then((result) => {
                        resolve(result)
                    }).catch((error) => {
                        reject(error)
                    })
                })
        })
    }

    getFile(url, refreshToken) {
        var args = [...arguments]
        var that = this
        url = encodeURI(url)
        return new Promise(function (resolve, reject) {
            var headers = { 'token': that.token }

            request.defaults({ encoding: null }).get({ url: url, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, that.getFile, args, false, refreshToken).then((body) => {
                        resolve(body)
                    }).catch((error) => {
                        reject(error)
                    })
                })
        })
    }

    del(url, json, refreshToken) {
        var args = [...arguments]
        var that = this
        url = encodeURI(url)
        return new Promise(function (resolve, reject) {
            var headers = { 'token': that.token }
            request.delete({ url: url, json: json, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, that.del, args
                        , false, refreshToken).then((body) => {
                            resolve(body)
                        }).catch((error) => {
                            reject(error)
                        })
                })
        })
    }

    streamPost(url, bufferOrPath, json, refreshToken) {
        var args = [...arguments]
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
                    return that.handleLeiaIOResponse(err, response, body, that.streamPost, args, false, refreshToken).then((body) => {
                        resolve(body)
                    }).catch((error) => {
                        reject(error)
                    })
                }));
        })
    }

    handleLeiaIOResponse(err, response, body, fnc, args, contentRange, refreshToken) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (err) {
                var error = new Error(err)
                error.status = 500
                reject(error)
            } else {
                if (response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 204) {
                    if (response.statusCode === 401 && refreshToken) {
                        return that.handle401(fnc, args, true).then((body) => {
                            return resolve(body)
                        }).catch((error) => {
                            return reject(error)
                        })
                    }
                    
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

    handle401(methodAfterRelog, args, refreshToken) {
        var that = this
        return new Promise(function (resolve, reject) {
            return that.login().then((result) => {
                that.token = result.token
                if (refreshToken) {
                    args[args.length - 1] = false
                }
                return methodAfterRelog.apply(that, args)
            }).then((body) => {
                resolve(body)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    login() {
        this.token = null
        var that = this
        return new Promise(function (resolve, reject) {
            that.get(that.serverURL + '/login/' + that.apiKey, true, false, false).then((body) => {
                that.token = body.token
                resolve(body)
            }).catch((error) => {
                reject(error)
            })
        })
    }

}




