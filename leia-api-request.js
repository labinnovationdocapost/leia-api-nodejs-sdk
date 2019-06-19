var request = require('request');
var streamifier = require('streamifier')

module.exports = class LeiaAPIRequest {

    constructor(apiKey, serverURL) {
        this.apiKey = apiKey
        this.serverURL = serverURL
        this.retries = 1
    }
    
    loggedGet (url, json, contentRange) {
        if (!this.token) {
            var that = this
            return this.login(this.apiKey).then((result) => {
                that.token = result.token
                that.application = result.application
                return that.get(url, json, contentRange)
            })
        } else {
            return this.get(url, json, contentRange)
        }
    }
    
    loggedGetFile(url) {
        if (!this.token) {
            var that = this
            return this.login(this.apiKey).then((result) => {
                that.token = result.token
                that.application = result.application
                return that.getFile(url)
            })
        } else {
            return this.getFile(url)
        }
    }
    
    loggedPatch(url, body, json) {
        if (!this.token) {
            var that = this
            return this.login(this.apiKey).then((result) => {
                that.token = result.token
                that.application = result.application
                return that.patch(url, body, json)
            })
        } else {
            return this.patch(url, body, json)
        }
    }
    
    loggedDelete(url, json) {
        if (!this.token) {
            var that = this
            return this.login(this.apiKey).then((result) => {
                that.token = result.token
                that.application = result.application
                return that.del(url, json)
            })
        } else {
            return this.del(url, json)
        }
    }
    
    loggedPost(url, body, json) {
        if (!this.token) {
            var that = this
            return this.login(this.apiKey).then((result) => {
                that.token = result.token
                that.application = result.application
                return that.post(url, body, json)
            })
        } else {
            return this.post(url, body, json)
        }
    }
    
    loggedStreamPost (url, dataStream, json) {
        if (!this.token) {
            var that = this
            return this.login(this.apiKey).then((result) => {
                that.token = result.token
                that.application = result.application
                return that.streamPost(url, dataStream, json)
            })
        } else {
            return this.streamPost(url, dataStream, json)
        }
    }
    
    post(url, body, json) {
        var args = [...arguments]
        var that = this
        return new Promise(function (resolve, reject) {
            var headers = { 'token': that.token }
    
            request.post({ url: url, body: body, json: json, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, that.post, args).then((body) => {
                        resolve(body)
                    }).catch((error) => {
                        reject(error)
                    })
                })
        })
    }
    
    patch(url, body, json) {
        var args = [...arguments]
        var that = this
        return new Promise(function (resolve, reject) {
            var headers = { 'token': that.token }
            request.patch({ url: url, json: json, body: body, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, that.patch, args).then((body) => {
                        resolve(body)
                    }).catch((error) => {
                        reject(error)
                    })
                })
        })
    }
    
    get(url, json, contentRange) {
        var args = [...arguments]
        var that = this
        return new Promise(function (resolve, reject) {
            var headers = { 'token': that.token }
            request.get({ url: url, json: json, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, that.get, args, contentRange).then((result) => {
                        resolve(result)
                    }).catch((error) => {
                        reject(error)
                    })
                })
        })
    }
    
    getFile(url) {
        var args = [...arguments]
        var that = this
        return new Promise(function (resolve, reject) {
            var headers = { 'token': that.token }
    
            request.defaults({ encoding: null }).get({ url: url, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, that.getFile, args).then((body) => {
                        resolve(body)
                    }).catch((error) => {
                        reject(error)
                    })
                })
        })
    }
    
    del(url, json) {
        var args = [...arguments]
        var that = this
        return new Promise(function (resolve, reject) {
            var headers = { 'token': that.token }
            request.delete({ url: url, json: json, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, that.del, args
                        ).then((body) => {
                        resolve(body)
                    }).catch((error) => {
                        reject(error)
                    })
                })
        })
    }
    
    streamPost(url, dataStream, json) {
        var args = [...arguments]
        var that = this
        return new Promise(function (resolve, reject) {
            var headers = { 'content-type': 'application/octet-stream', 'token': that.token }
            streamifier.createReadStream(dataStream).pipe(request.post({ url: url, json: json, headers: headers },
                (err, response, body) => {
                    return that.handleLeiaIOResponse(err, response, body, that.streamPost, args).then((body) => {
                        resolve(body)
                    }).catch((error) => {
                        reject(error)
                    })
                }));
        })
    }

    handleLeiaIOResponse(err, response, body, fnc, args, contentRange) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (err) {
                var error = new Error('Unknown error')
                error.status = 500
                reject(error)
            } else {
                if (response.statusCode != 200 && response.statusCode != 201 && response.statusCode != 204) {
                    if (response.statusCode === 401 && that.retries > 0) {
                        that.retries -= 1
                        return that.handle401(fnc, args).then((body) => {
                            if (contentRange) {
                                return resolve({body, contentRange: response['headers']['content-range']})
                            } else {
                                return resolve(body)
                            }
                        }).catch((error) => {
                            return reject(error)
                        })
                    } else {
                        that.retries = 5
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

    handle401(methodAfterRelog, args) {
        var that = this
        return new Promise(function (resolve, reject) {
            return that.login(that.apiKey).then((result) => {
                that.token = result.token
                that.application = result.application
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
            that.get(that.serverURL + '/login/' + that.apiKey, true).then((body) => {
                resolve(body)
            }).catch((error) => {
                reject(error)
            })
        })
    }
    
}




