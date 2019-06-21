var request = require('request');
var streamifier = require('streamifier')

module.exports = class LeiaAPIRequest {

    constructor(apiKey, serverURL, refreshToken) {
        this.apiKey = apiKey
        this.serverURL = serverURL
        this.refreshToken = refreshToken
        this.token = null
    }
    
    loggedGet (url, json, contentRange) {
        if (!this.token) {
            var that = this
            return this.login().then((result) => {
                that.token = result.token
                return that.get(url, json, contentRange, that.refreshToken)
            })
        } else {
            return this.get(url, json, contentRange, this.refreshToken)
        }
    }
    
    loggedGetFile(url) {
        if (!this.token) {
            var that = this
            return this.login().then((result) => {
                that.token = result.token
                return that.getFile(url, that.refreshToken)
            })
        } else {
            return this.getFile(url, this.refreshToken)
        }
    }
    
    loggedPatch(url, body, json) {
        if (!this.token) {
            var that = this
            return this.login().then((result) => {
                that.token = result.token
                return that.patch(url, body, json, that.refreshToken)
            })
        } else {
            return this.patch(url, body, json, this.refreshToken)
        }
    }
    
    loggedDelete(url, json) {
        if (!this.token) {
            var that = this
            return this.login().then((result) => {
                that.token = result.token
                return that.del(url, json, that.refreshToken)
            })
        } else {
            return this.del(url, json, this.refreshToken)
        }
    }
    
    loggedPost(url, body, json) {
        if (!this.token) {
            var that = this
            return this.login().then((result) => {
                that.token = result.token
                return that.post(url, body, json, that.refreshToken)
            })
        } else {
            return this.post(url, body, json, this.refreshToken)
        }
    }
    
    loggedStreamPost (url, dataStream, json) {
        if (!this.token) {
            var that = this
            return this.login().then((result) => {
                that.token = result.token
                return that.streamPost(url, dataStream, json, that.refreshToken)
            })
        } else {
            return this.streamPost(url, dataStream, json, this.refreshToken)
        }
    }
    
    post(url, body, json, refreshToken) {
        var args = [...arguments]
        var that = this
        return new Promise(function (resolve, reject) {
            var headers = { 'token': that.token }
    
            request.post({ url: url, body: body, json: json, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, that.post, args, refreshToken).then((body) => {
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
        return new Promise(function (resolve, reject) {
            var headers = { 'token': that.token }
            request.patch({ url: url, json: json, body: body, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, that.patch, args, refreshToken).then((body) => {
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
        return new Promise(function (resolve, reject) {
            var headers = { 'token': that.token }
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
        return new Promise(function (resolve, reject) {
            var headers = { 'token': that.token }
    
            request.defaults({ encoding: null }).get({ url: url, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, that.getFile, args, refreshToken).then((body) => {
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
        return new Promise(function (resolve, reject) {
            var headers = { 'token': that.token }
            request.delete({ url: url, json: json, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, that.del, args
                        , refreshToken).then((body) => {
                        resolve(body)
                    }).catch((error) => {
                        reject(error)
                    })
                })
        })
    }
    
    streamPost(url, dataStream, json, refreshToken) {
        var args = [...arguments]
        var that = this
        return new Promise(function (resolve, reject) {
            var headers = { 'content-type': 'application/octet-stream', 'token': that.token }
            streamifier.createReadStream(dataStream).pipe(request.post({ url: url, json: json, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, that.streamPost, args, refreshToken).then((body) => {
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
                var error = new Error('Unknown error')
                error.status = 500
                reject(error)
            } else {
                if (response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 204) {
                    if (response.statusCode === 401 && refreshToken) {
                        return that.handle401(fnc, args, true).then((body) => {
                            if (contentRange) {
                                return resolve({body, contentRange: response['headers']['content-range']})
                            } else {
                                return resolve(body)
                            }
                        }).catch((error) => {
                            return reject(error)
                        })
                    }
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

    handle401(methodAfterRelog, args, refreshToken) {
        var that = this
        return new Promise(function (resolve, reject) {
            return that.login().then((result) => {
                that.token = result.token
                if (refreshToken) {
                    args[args.length-1] = false
                }
                return methodAfterRelog.apply(that, args)
            }).then((body) => {
                resolve(body)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    login () {
        var that = this
        return new Promise(function (resolve, reject) {
            that.get(that.serverURL + '/login/' + that.apiKey, true, false, false).then((body) => {
                resolve(body)
            }).catch((error) => {
                reject(error)
            })
        })
    }
    
}




