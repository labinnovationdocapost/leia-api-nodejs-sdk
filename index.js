var Model = require('./models/model')
var Application = require('./models/application')
var Document = require('./models/document')
var Annotation = require('./models/annotation')
var Job = require('./models/job')
var Worker = require('./models/worker')
var LeiaAPIRequest = require('./leia-api-request')
var { pythonizeParams, extractContentRangeInfo } = require('./utils/format-utils')

/**
 * LeIA API communication class
 * @class
 */

module.exports = class LeiaAPI {

    /**
     * @param {string} serverURL  - a LeIA API server URL
     * @param {boolean} autoRefreshToken - if true, expired tokens are refreshed automatically
     */

    constructor(serverURL, autoRefreshToken = false) {
        this.serverURL = serverURL
        if (!this.serverURL) {
            this.serverURL = "https://api.leia.io/leia/1.0.0"
        }
        this.autoRefreshToken = autoRefreshToken
    }

    /**
     * Log in
     * @param {string} apiKey - a LeIA API key
     * @returns {Application}
     */

    login(apiKey) {
        const leiaAPIRequest = new LeiaAPIRequest(apiKey, this.serverURL)
        var that = this
        return new Promise(function (resolve, reject) {
            leiaAPIRequest.login().then((body) => {
                that.leiaAPIRequest = leiaAPIRequest
                resolve(new Application(body.application.id, body.application.creation_time, body.application.application_type, body.application.email, body.application.application_name, body.application.first_name, body.application.last_name, body.application.default_job_callback_url, body.application.job_counts, body.application.api_key))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Log out
     */

    logout() {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/logout', false).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Return a list of paginated Applications (admin)
    * @param {string} email (optional) - an email address to filter applications
    * @param {string} applicationName (optional) - an Application name to filter applications
    * @param {string[]} sort (optional) - a list of parameters 
    * Can be 'applicationName', 'applicationType', 'creationTime', 'firstname', 'lastname', 'email'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param {integer} offset (optional) - list offset number for pagination
    * @param {integer} limit (optional) - max per page
    * @returns {object[]} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, applications: [Application]}]
     */

    adminGetApplications(email = null, applicationName = null, sort = null, offset = null, limit = null) {
        var offsetStr = ""
        var limitStr = ""
        var sortStr = ""
        var firstChar = "?"

        if (offset !== null) {
            offsetStr += firstChar + 'offset=' + offset
            firstChar = "&"
        }

        if (limit !== null) {
            limitStr += firstChar + 'limit=' + limit
            firstChar = "&"
        }

        if (sort) {
            sortStr = firstChar + "sort=" + pythonizeParams(sort)
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/admin/application' + offsetStr + limitStr + (email ? firstChar + 'email=' + email : '') + (applicationName ? firstChar + 'application_name=' + applicationName : '') + sortStr, true, true, that.autoRefreshToken).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var applications = []
                for (var i = 0; i < body.length; i++) {
                    applications.push(new Application(body[i].id, body[i].creation_time, body[i].application_type, body[i].email, body[i].application_name, body[i].first_name, body[i].last_name, body[i].default_job_callback_url, body[i].job_counts, body[i].api_key))
                }
                resolve({ contentRange, applications })
            }).catch((error) => {
                if (error.status == 404) {
                    return resolve({ contentRange: { offset: 0, limit: 0, total: 0 }, applications: [] })
                }
                reject(error)
            })
        })
    }

    /**
    * (promise) Add a Model (admin)
    * @param {string} applicationId - an Application id
    * @param {string} name - a Model name
    * @param {Buffer} fileBuffer - a model file zip buffer. The model inside the zip should have a valid name.
    * @param {string} description (optional) - a Model description
    * @param {integer} ttl (optional) - a ttl value in seconds
    * @param {string[]} tags (optional) - a list of tags
    * @returns {Model}
    */

    adminAddModel(applicationId, name, fileBuffer, description = null, ttl = null, tags = null) {
        var that = this
        var tagsStr = ""
        var firstChar = "&"
        for (var i = 0; tags && i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.streamPost(that.serverURL + '/admin/' + applicationId + '/model?name=' + name + (description ? '&description=' + description : '') + (ttl !== null ? '&ttl=' + ttl : '') + tagsStr, fileBuffer, true, that.autoRefreshToken).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Add an Application (admin)
    * @param {string} email - an Application owner's email
    * @param {string} applicationName - an Application name
    * @param {string} applicationType - an Application type. Can be 'admin' or 'developer'
    * @param {string} firstname - an Application owner's firstname
    * @param {string} lastname - an Application owner's lastname
    * @param {string} defaultJobCallbackUrl - a default job callback url
    * @returns {Application}
    */

    adminAddApplication(email, applicationName, applicationType, firstname, lastname, defaultJobCallbackUrl = null) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            var application = {
                email: email,
                application_name: applicationName,
                application_type: applicationType,
                first_name: firstname,
                last_name: lastname
            }

            if (defaultJobCallbackUrl !== null) {
                application['default_job_callback_url'] = defaultJobCallbackUrl
            }

            that.leiaAPIRequest.post(that.serverURL + '/admin/application', application, true, that.autoRefreshToken).then((body) => {
                resolve(new Application(body.id, body.creation_time, body.application_type, body.email, body.application_name, body.first_name, body.last_name, body.default_job_callback_url, body.job_counts, body.api_key))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Reset an Application API Key and get a new one (admin)
    * @param {string} applicationId - an Application id
    * @returns {Application} an Application object with the new API Key
    */

    adminResetApplicationApiKey(applicationId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.post(that.serverURL + '/admin/application/' + applicationId + '/reset_api_key', {}, true, that.autoRefreshToken).then((body) => {
                resolve(new Application(body.id, body.creation_time, body.application_type, body.email, body.application_name, body.first_name, body.last_name, body.default_job_callback_url, body.job_counts, body.api_key))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Delete a Model (admin)
    * @param {string} applicationId - an Application id
    * @param {string} modelId - a Model id
     */

    adminDeleteModel(applicationId, modelId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.del(that.serverURL + '/admin/' + applicationId + '/model/' + modelId, true, that.autoRefreshToken).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Update a Model (admin)
     * @param {string} applicationId - an Application id
     * @param {string} modelId - a Model id
     * @param {string} name - a Model name
     * @param {string} description - a Model description
     * @param {integer} ttl - a TTL value in seconds
     * @returns {Model}
     */

    adminUpdateModel(applicationId, modelId, name = null, description = null, ttl = null) {
        var query = ""
        var firstChar = "?"
        if (name !== null) {
            query += firstChar + 'name=' + name
            firstChar = "&"
        }
        if (description !== null) {
            query += firstChar + 'description=' + description
            firstChar = "&"
        }
        if (ttl !== null) {
            query += firstChar + 'ttl=' + ttl
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.patch(that.serverURL + '/admin/' + applicationId + '/model/' + modelId + query, {}, true, that.autoRefreshToken).then((model) => {
                resolve(model)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Delete an Application (admin)
     * @param {string} applicationId - an Application id
     */

    adminDeleteApplication(applicationId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.del(that.serverURL + '/admin/application/' + applicationId, true, that.autoRefreshToken).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Return a list of paginated Models (admin)
    * @param {string[]} tags (optional) - a list of tags to filter models
    * @param {string[]} sort (optional) - a list of parameters 
    * Can be 'applicationId', 'creationTime', 'name', 'description', 'modelType'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param {integer} offset (optional) - list offset number for pagination
    * @param {integer} limit (optional) - max per page
    * @param {string} applicationId (optional) - an Application id to filter models
    * @returns {object[]} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, models: [Model]}]
    */

    adminGetModels(tags = null, sort = null, offset = null, limit = null, applicationId = null) {
        var offsetStr = ""
        var limitStr = ""
        var tagsStr = ""
        var sortStr = ""
        var applicationIdStr = ""
        var firstChar = "?"

        if (offset !== null) {
            offsetStr += firstChar + 'offset=' + offset
            firstChar = "&"
        }

        if (limit !== null) {
            limitStr += firstChar + 'limit=' + limit
            firstChar = "&"
        }

        for (var i = 0; tags && i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
            firstChar = "&"
        }

        if (applicationId !== null) {
            applicationIdStr = firstChar + "application_id=" + applicationId
            firstChar = "&"
        }

        if (sort) {
            sortStr = firstChar + "sort=" + pythonizeParams(sort)
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/admin/model' + offsetStr + limitStr + tagsStr + applicationIdStr + sortStr, true, true, that.autoRefreshToken).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var models = []
                for (var i = 0; i < body.length; i++) {
                    models.push(new Model(body[i].id, body[i].creation_time, body[i].description, body[i].ttl, body[i].input_types, body[i].name, body[i].tags, body[i].model_type, body[i].application_id))
                }
                resolve({ contentRange, models })
            }).catch((error) => {
                if (error.status == 404) {
                    return resolve({ contentRange: { offset: 0, limit: 0, total: 0 }, models: [] })
                }
                reject(error)
            })
        })
    }

    /**
    * (promise) Return a list of paginated Models owned by the API Key
    * @param {string[]} tags (optional) - a list of tags to filter models
    * @param {string[]} sort (optional) - a list of parameters 
    * Can be 'applicationId', 'creationTime', 'name', 'description', 'modelType'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param {integer} offset (optional) - list offset number for pagination
    * @param {integer} limit (optional) - max per page
    * @param {string} applicationId (optional) - an Application id to filter models
    * @returns {object[]} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, models: [Model]}]
    */

    getModels(tags = null, sort = null, offset = null, limit = null) {
        var offsetStr = ""
        var limitStr = ""
        var tagsStr = ""
        var sortStr = ""
        var firstChar = "?"

        if (offset !== null) {
            offsetStr += firstChar + 'offset=' + offset
            firstChar = "&"
        }

        if (limit !== null) {
            limitStr += firstChar + 'limit=' + limit
            firstChar = "&"
        }

        for (var i = 0; tags && i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
            firstChar = "&"
        }

        if (sort) {
            sortStr = firstChar + "sort=" + pythonizeParams(sort)
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/model' + offsetStr + limitStr + tagsStr + sortStr, true, true, that.autoRefreshToken).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var models = []
                for (var i = 0; i < body.length; i++) {
                    models.push(new Model(body[i].id, body[i].creation_time, body[i].description, body[i].ttl, body[i].input_types, body[i].name, body[i].tags, body[i].model_type, body[i].application_id))
                }
                resolve({ contentRange, models })
            }).catch((error) => {
                if (error.status == 404) {
                    return resolve({ contentRange: { offset: 0, limit: 0, total: 0 }, models: [] })
                }
                reject(error)
            })
        })
    }

    /**
    * (promise) Return a Model (admin)
    * @param {string} applicationId - an Application id
    * @param {string} modelId - a Model id
    * @returns {Model}
    */

    adminGetModel(applicationId, modelId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/admin/' + applicationId + '/model/' + modelId, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
  * (promise) Get the content of a Model (admin)
  * @param {string} applicationId - an Application id
  * @param {string} modelId - a Model id
  * @returns {Buffer}
  */

    adminGetModelContent(applicationId, modelId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.getFile(that.serverURL + '/admin/' + applicationId + '/model/' + modelId + '?file_contents=true', false, that.autoRefreshToken).then((body) => {
                resolve(body)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Return a Model
    * @param {string} modelId - a Model id
    * @returns {Model}
    */

    getModel(modelId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/model/' + modelId, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }


    /**
    * (promise) Return an Application (admin)
    * @param {string} applicationId - an Application id
    * @returns {Application}
    */

    adminGetApplication(applicationId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/admin/application/' + applicationId, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Application(body.id, body.creation_time, body.application_type, body.email, body.application_name, body.first_name, body.last_name, body.default_job_callback_url, body.job_counts, body.api_key))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Add a Document (admin)
    * @param {string} applicationId - an Application id
    * @param {string} fileName - a document file name
    * @param {Buffer} fileBuffer - a document file buffer
    * @param {string[]} tags (optional) - a list of tags
    * @returns {Model}
    */

    adminAddDocument(applicationId, fileName, fileBuffer, tags = null) {
        var tagsStr = ""
        var firstChar = "&"

        for (var i = 0; tags && i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.streamPost(that.serverURL + '/admin/' + applicationId + '/document?filename=' + fileName + tagsStr, fileBuffer, true, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Add a Document
    * @param {string} fileName - a document file name
    * @param {Buffer} fileBuffer - a document file buffer
    * @param {string[]} tags (optional) - a list of tags
    * @returns {Model}
    */

    addDocument(fileName, fileBuffer, tags = null) {
        var tagsStr = ""
        var firstChar = "&"

        for (var i = 0; tags && i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.streamPost(that.serverURL + '/document?filename=' + fileName + tagsStr, fileBuffer, true, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
       * (promise) Transform a list of PDF into images or text (admin)
       * @param {string} applicationId - an Application id
       * @param {string[]} documentIds - a list of Document ids
       * @param {string} outputType - an output type. 
       * @param {string} inputTag (optional) - The tag of the documents to process. 
       * If inputTag is present, document_ids should contain a single value, 
       * and the documents processed will be those where originalId=documentIds[0] and that contain the specified tag
       * @param {string} outputTag (optional) - an output tag for the new documents
       * @param {string} executeAfterId (optional) - should be executed after a certain Job
       * @param {string} callbackUrl (optional) - callback url for when a job is finished
       * @returns {Job} a job with the processing info
       */

    adminTransformPDF(applicationId, documentIds, outputType, inputTag = null, outputTag = null, executeAfterId = null, callbackUrl = null) {
        var documentIdsString = documentIds.join(',')
        var inputTagStr = ""
        var outputTagStr = ""
        var executeAfterIdStr = ""
        var callbackUrlStr = ""
        var firstChar = "?"

        if (inputTag !== null) {
            inputTagStr = firstChar + 'input_tag=' + inputTag
            firstChar = "&"
        }

        if (outputTag !== null) {
            outputTagStr = firstChar + 'output_tag=' + outputTag
            firstChar = "&"
        }

        if (executeAfterId !== null) {
            executeAfterIdStr = firstChar + 'execute_after_id=' + executeAfterId
            firstChar = "&"
        }

        if (callbackUrl !== null) {
            callbackUrlStr = firstChar + 'callback_url=' + callbackUrl
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.post(that.serverURL + '/admin/' + applicationId + '/document/' + documentIdsString + '/transform/' + outputType + inputTagStr + outputTagStr + executeAfterIdStr + callbackUrlStr, {}, true, that.autoRefreshToken).then((body) => {
                var result = body.result
                if (result !== null) {
                    if (body.result_type === 'document') {
                        result = new Document(body.result.id, body.result.creation_time, body.result.application_id, body.result.filename, body.result.extension, body.result.original_id, body.result.mime_type, body.result.rotation_angle, body.result.tags, body.result.size)
                    } else if (body.result_type === 'list[document]') {
                        result = []
                        for (var i = 0; i < body.result.length; i++) {
                            result.push(new Document(body.result[i].id, body.result[i].creation_time, body.result[i].application_id, body.result[i].filename, body.result[i].extension, body.result[i].original_id, body.result[i].mime_type, body.result[i].rotation_angle, body.result[i].tags, body.result[i].size))
                        }
                    }
                }
                resolve(new Job(body.id, body.creation_time, body.application_id, body.document_ids, body.starting_time, body.finished_time, body.http_code, body.job_type, body.model_id, result, body.result_type, body.status, body.parent_job_id, body.execute_after_id, body.submitter_id, body.ws_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Transform a list of PDF into images or text
     * @param {string[]} documentIds - a list of Document ids
     * @param {string} outputType - an output type. 
     * @param {string} inputTag (optional) - The tag of the documents to process. 
     * If inputTag is present, document_ids should contain a single value, 
     * and the documents processed will be those where originalId=documentIds[0] and that contain the specified tag
     * @param {string} outputTag (optional) - an output tag for the new documents
     * @param {string} executeAfterId (optional) - should be executed after a certain Job
     * @param {string} callbackUrl (optional) - callback url for when a job is finished
     * @returns {Job} a job with the processing info
     */

    transformPDF(documentIds, outputType, inputTag = null, outputTag = null, executeAfterId = null, callbackUrl = null) {
        var documentIdsString = documentIds.join(',')
        var inputTagStr = ""
        var outputTagStr = ""
        var executeAfterIdStr = ""
        var callbackUrlStr = ""
        var firstChar = "?"

        if (inputTag !== null) {
            inputTagStr = firstChar + 'input_tag=' + inputTag
            firstChar = "&"
        }

        if (outputTag !== null) {
            outputTagStr = firstChar + 'output_tag=' + outputTag
            firstChar = "&"
        }

        if (executeAfterId !== null) {
            executeAfterIdStr = firstChar + 'execute_after_id=' + executeAfterId
            firstChar = "&"
        }

        if (callbackUrl !== null) {
            callbackUrlStr = firstChar + 'callback_url=' + callbackUrl
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.post(that.serverURL + '/document/' + documentIdsString + '/transform/' + outputType + inputTagStr + outputTagStr + executeAfterIdStr + callbackUrlStr, {}, true, that.autoRefreshToken).then((body) => {
                var result = body.result
                if (result !== null) {
                    if (body.result_type === 'document') {
                        result = new Document(body.result.id, body.result.creation_time, body.result.application_id, body.result.filename, body.result.extension, body.result.original_id, body.result.mime_type, body.result.rotation_angle, body.result.tags, body.result.size)
                    } else if (body.result_type === 'list[document]') {
                        result = []
                        for (var i = 0; i < body.result.length; i++) {
                            result.push(new Document(body.result[i].id, body.result[i].creation_time, body.result[i].application_id, body.result[i].filename, body.result[i].extension, body.result[i].original_id, body.result[i].mime_type, body.result[i].rotation_angle, body.result[i].tags, body.result[i].size))
                        }
                    }
                }
                resolve(new Job(body.id, body.creation_time, body.application_id, body.document_ids, body.starting_time, body.finished_time, body.http_code, body.job_type, body.model_id, result, body.result_type, body.status, body.parent_job_id, body.execute_after_id, body.submitter_id, body.ws_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Apply a Model to a list of Documents (admin)
    * @param {string} applicationId - an Application id
    * @param {string} modelId - a Model id
    * @param {string[]} documentIds - a list of Document ids
    * @param {string} tag (optional) - The tag of the documents to process.
    * If tag is present, documentIds should contain a single value, 
    * and the documents processed will be those where originalId=documentIds[0] and that contain the specified tag
    * @param {string} executeAfterId (optional) - should be executed after a certain Job
    * @param {string} callbackUrl (optional) - callback url for when a job is finished
    * @returns {Job} a job with the processing info
    */

    adminApplyModelToDocuments(applicationId, modelId, documentIds, tag = null, executeAfterId = null, callbackUrl = null) {
        var documentIdsString = documentIds.join(',')
        var tagStr = ""
        var executeAfterIdStr = ""
        var callbackUrlStr = ""
        var firstChar = "?"

        if (tag !== null) {
            tagStr = firstChar + 'tag=' + tag
            firstChar = "&"
        }

        if (executeAfterId !== null) {
            executeAfterIdStr = firstChar + 'execute_after_id=' + executeAfterId
            firstChar = "&"
        }

        if (callbackUrl !== null) {
            callbackUrlStr = firstChar + 'callback_url=' + callbackUrl
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/admin/' + applicationId + '/model/' + modelId + '/apply/' + documentIdsString + tagStr + executeAfterIdStr + callbackUrlStr, true, false, that.autoRefreshToken).then((body) => {
                var result = body.result
                if (result !== null) {
                    if (body.result_type === 'document') {
                        result = new Document(body.result.id, body.result.creation_time, body.result.application_id, body.result.filename, body.result.extension, body.result.original_id, body.result.mime_type, body.result.rotation_angle, body.result.tags, body.result.size)
                    } else if (body.result_type === 'list[document]') {
                        result = []
                        for (var i = 0; i < body.result.length; i++) {
                            result.push(new Document(body.result[i].id, body.result[i].creation_time, body.result[i].application_id, body.result[i].filename, body.result[i].extension, body.result[i].original_id, body.result[i].mime_type, body.result[i].rotation_angle, body.result[i].tags, body.result[i].size))
                        }
                    }
                }
                resolve(new Job(body.id, body.creation_time, body.application_id, body.document_ids, body.starting_time, body.finished_time, body.http_code, body.job_type, body.model_id, result, body.result_type, body.status, body.parent_job_id, body.execute_after_id, body.submitter_id, body.ws_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Apply a Model to a list of Documents
     * @param {string} modelId - a Model id
     * @param {string[]} documentIds - a list of Document ids
     * @param {string} tag (optional) - The tag of the documents to process.
     * If tag is present, documentIds should contain a single value, 
     * and the documents processed will be those where originalId=documentIds[0] and that contain the specified tag
     * @param {string} executeAfterId (optional) - should be executed after a certain Job
     * @param {string} callbackUrl (optional) - callback url for when a job is finished
     * @returns {Job} a job with the processing info
     */

    applyModelToDocuments(modelId, documentIds, tag = null, executeAfterId = null, callbackUrl = null) {
        var documentIdsString = documentIds.join(',')
        var tagStr = ""
        var executeAfterIdStr = ""
        var callbackUrlStr = ""
        var firstChar = "?"

        if (tag !== null) {
            tagStr = firstChar + 'tag=' + tag
            firstChar = "&"
        }

        if (executeAfterId !== null) {
            executeAfterIdStr = firstChar + 'execute_after_id=' + executeAfterId
            firstChar = "&"
        }

        if (callbackUrl !== null) {
            callbackUrlStr = firstChar + 'callback_url=' + callbackUrl
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/model/' + modelId + '/apply/' + documentIdsString + tagStr + executeAfterIdStr + callbackUrlStr, true, false, that.autoRefreshToken).then((body) => {
                var result = body.result
                if (result !== null) {
                    if (body.result_type === 'document') {
                        result = new Document(body.result.id, body.result.creation_time, body.result.application_id, body.result.filename, body.result.extension, body.result.original_id, body.result.mime_type, body.result.rotation_angle, body.result.tags, body.result.size)
                    } else if (body.result_type === 'list[document]') {
                        result = []
                        for (var i = 0; i < body.result.length; i++) {
                            result.push(new Document(body.result[i].id, body.result[i].creation_time, body.result[i].application_id, body.result[i].filename, body.result[i].extension, body.result[i].original_id, body.result[i].mime_type, body.result[i].rotation_angle, body.result[i].tags, body.result[i].size))
                        }
                    }
                }
                resolve(new Job(body.id, body.creation_time, body.application_id, body.document_ids, body.starting_time, body.finished_time, body.http_code, body.job_type, body.model_id, result, body.result_type, body.status, body.parent_job_id, body.execute_after_id, body.submitter_id, body.ws_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * Delete a Document (admin)
     * @param {string} applicationId - an Application id
     * @param {string} documentId - a Document id
     * 
     */

    adminDeleteDocument(applicationId, documentId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.del(that.serverURL + '/admin/' + applicationId + '/document/' + documentId, false, that.autoRefreshToken).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }


    /**
     * Delete a Document
     * @param {string} documentId - a Document id
     */

    deleteDocument(documentId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.del(that.serverURL + '/document/' + documentId, false, that.autoRefreshToken).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Add a tag to a Model (admin
     * @param {string} applicationId - an Application id
     * @param {string} modelId - a Model id
     * @param {string} tag - the tag to add
     * @returns {Model}
     */

    adminAddTagToModel(applicationId, modelId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.post(that.serverURL + '/admin/' + applicationId + '/model/' + modelId + '/tag/' + tag, {}, true, that.autoRefreshToken).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Add a tag to a Model (admin)
     * @param {string} modelId - a Model id
     * @param {string} tag - the tag to add
     * @returns {Model}
     */

    addTagToModel(modelId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.post(that.serverURL + '/model/' + modelId + '/tag/' + tag, {}, true, that.autoRefreshToken).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Remove a tag from a Model (admin)
     * @param {string} applicationId - an Application id
     * @param {string} modelId - a Model id
     * @param {string} tag - the tag to add
     * @returns {Model}
     */

    adminRemoveTagFromModel(applicationId, modelId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.del(that.serverURL + '/admin/' + applicationId + '/model/' + modelId + '/tag/' + tag, true, that.autoRefreshToken).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Remove a tag from a Model
     * @param {string} modelId - a Model id
     * @param {string} tag - the tag to add
     * @returns {Model}
     */

    removeTagFromModel(modelId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.del(that.serverURL + '/model/' + modelId + '/tag/' + tag, true, that.autoRefreshToken).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Return a list of paginated Documents (admin)
    * @param {string[]} tags (optional) - an email address to filter documents
    * @param {string} tagResult (optional) - tag the fetched documents
    * @param {string[]} sort (optional) - a list of parameters 
    * Can be 'applicationId', 'filename', 'extension', 'mimeType', 'originalId', 'page', 'creationTime'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param {integer} offset (optional) - list offset number for pagination
    * @param {integer} limit (optional) - max per page
    * @param {string} applicationId (optional) - an Application id to filter documents
    * @returns {object[]} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, documents: [Document]}]
    */

    adminGetDocuments(tags = null, tagResult = null, sort = null, offset = null, limit = null, applicationId = null) {
        var offsetStr = ""
        var limitStr = ""
        var tagsStr = ""
        var tagResultStr = ""
        var applicationIdStr = ""
        var sortStr = ""
        var firstChar = "?"

        if (offset !== null) {
            offsetStr += firstChar + 'offset=' + offset
            firstChar = "&"
        }

        if (limit !== null) {
            limitStr += firstChar + 'limit=' + limit
            firstChar = "&"
        }

        for (var i = 0; tags && i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
            firstChar = "&"
        }

        if (tagResult !== null) {
            tagResultStr = firstChar + "tag_result=" + tagResult
            firstChar = "&"
        }

        if (applicationId !== null) {
            applicationIdStr = firstChar + "application_id=" + applicationId
            firstChar = "&"
        }

        if (sort) {
            sortStr = firstChar + "sort=" + pythonizeParams(sort)
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/admin/document' + offsetStr + limitStr + tagsStr + tagResultStr + applicationIdStr + sortStr, true, true, that.autoRefreshToken).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var documents = []
                for (var i = 0; i < body.length; i++) {
                    documents.push(new Document(body[i].id, body[i].creation_time, body[i].application_id, body[i].filename, body[i].extension, body[i].original_id, body[i].mime_type, body[i].rotation_angle,
                        body[i].tags, body[i].size))
                }
                resolve({ contentRange, documents })
            }).catch((error) => {
                if (error.status == 404) {
                    return resolve({ contentRange: { offset: 0, limit: 0, total: 0 }, documents: [] })
                }
                reject(error)
            })

        })
    }

    /**
    * (promise) Return a list of paginated Documents
    * @param {string[]} tags (optional) - an email address to filter documents
    * @param {string} tagResult (optional) - tag the fetched documents
    * @param {string[]} sort (optional) - a list of parameters 
    * Can be 'applicationId', 'filename', 'extension', 'mimeType', 'originalId', 'page', 'creationTime'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param {integer} offset (optional) - list offset number for pagination
    * @param {integer} limit (optional) - max per page
    * @returns {object[]} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, documents: [Document]}]
    */

    getDocuments(tags = null, tagResult = null, sort = null, offset = null, limit = null) {
        var offsetStr = ""
        var limitStr = ""
        var tagsStr = ""
        var tagResultStr = ""
        var sortStr = ""
        var firstChar = "?"

        if (offset !== null) {
            offsetStr += firstChar + 'offset=' + offset
            firstChar = "&"
        }

        if (limit !== null) {
            limitStr += firstChar + 'limit=' + limit
            firstChar = "&"
        }

        if (tagResult !== null) {
            tagResultStr = firstChar + "tag_result=" + tagResult
            firstChar = "&"
        }

        for (var i = 0; tags && i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
            firstChar = "&"
        }

        if (sort) {
            sortStr = firstChar + "sort=" + pythonizeParams(sort)
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/document' + offsetStr + limitStr + tagsStr + tagResultStr + sortStr, true, true, that.autoRefreshToken).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var documents = []
                for (var i = 0; i < body.length; i++) {
                    documents.push(new Document(body[i].id, body[i].creation_time, body[i].application_id, body[i].filename, body[i].extension, body[i].original_id, body[i].mime_type, body[i].rotation_angle,
                        body[i].tags, body[i].size))
                }
                resolve({ contentRange, documents })
            }).catch((error) => {
                if (error.status == 404) {
                    return resolve({ contentRange: { offset: 0, limit: 0, total: 0 }, documents: [] })
                }
                reject(error)
            })

        })
    }

    /**
     * (promise) Get a Document (admin)
     * @param {string} applicationId - an Application id
     * @param {string} documentId - a Document id
     * @returns {Document}
     */

    adminGetDocument(applicationId, documentId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/admin/' + applicationId + '/document/' + documentId, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Get a Document
     * @param {string} documentId - a Document id
     * @returns {Document}
     */

    getDocument(documentId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/document/' + documentId, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Get the content of a Document (admin)
     * @param {string} applicationId - an Application id
     * @param {string} documentId - a Document id
     * @param {integer} maxSize (optional) - a max size if the Document is an image
     * @returns {Buffer}
     */

    adminGetDocumentContent(applicationId, documentId, maxSize = null) {
        var maxSizeStr = ""
        if (maxSize) {
            maxSizeStr = "&max_size=" + maxSize
        }
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.getFile(that.serverURL + '/admin/' + applicationId + '/document/' + documentId + '?file_contents=true' + maxSizeStr, false, that.autoRefreshToken).then((body) => {
                resolve(body)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Get the content of a Document
     * @param {string} documentId - a Document id
     * @param {integer} maxSize (optional) - a max size if the Document is an image
     * @returns {Buffer}
     */

    getDocumentContent(documentId, maxSize = null) {
        var maxSizeStr = ""
        if (maxSize) {
            maxSizeStr = "&max_size=" + maxSize
        }
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.getFile(that.serverURL + '/document/' + documentId + '?file_contents=true' + maxSizeStr, false, that.autoRefreshToken).then((body) => {
                resolve(body)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Return a list of Document tags (admin)
     * @param {string} applicationId - an Application id to filter Document tags
     * @returns {string[]} a list of tags
     */

    adminGetDocumentsTags(applicationId = null) {
        var applicationIdStr = ""

        if (applicationId) {
            applicationIdStr = "?application_id=" + applicationId
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/admin/document/tag' + applicationIdStr, true, false, that.autoRefreshToken).then((body) => {
                resolve(body)
            }).catch((error) => {
                if (error.status == 404) {
                    return resolve([])
                }
                reject(error)
            })
        })
    }

    /**
     * (promise) Return a list of Document tags
     * @returns {string[]} a list of tags
     */

    getDocumentsTags() {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/document/tag', true, false, that.autoRefreshToken).then((body) => {
                resolve(body)
            }).catch((error) => {
                if (error.status == 404) {
                    return resolve([])
                }
                reject(error)
            })
        })
    }

    /**
     * (promise) Add a tag to a Document (admin)
     * @param {string} applicationId - an Application id
     * @param {string} documentId - a Document id
     * @param {string} tag - a tag
     * @returns {Document}
     */

    adminAddTagToDocument(applicationId, documentId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.post(that.serverURL + '/admin/' + applicationId + '/document/' + documentId + '/tag/' + tag, {}, true, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Remove a tag from a Document (admin)
    *  @param {string} applicationId - an Application id
     * @param {string} documentId - a Document id
     * @param {string} tag - a tag
     * @returns {Document}
    */

    adminRemoveTagFromDocument(applicationId, documentId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.del(that.serverURL + '/admin/' + applicationId + '/document/' + documentId + '/tag/' + tag, true, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Add a tag to a Document (admin)
     * @param {string} documentId - a Document id
     * @param {string} tag - a tag
     * @returns {Document}
     */

    addTagToDocument(documentId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.post(that.serverURL + '/document/' + documentId + '/tag/' + tag, {}, true, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size))
            }).catch((error) => {
                reject(error)

            })
        })
    }

    /**
    * (promise) Remove a tag from a Document
     * @param {string} documentId - a Document id
     * @param {string} tag - a tag
     * @returns {Document}
    */

    removeTagFromDocument(documentId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.del(that.serverURL + '/document/' + documentId + '/tag/' + tag, true, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Update a Document (admin)
     * @param {string} applicationId - an Application id
     * @param {string} documentId - a Document id
     * @param {string} fileName (optional) - a new file name
     * @param {integer} rotationAngle (optional) - a new rotation angle
     * @returns {Document}
     */

    adminUpdateDocument(applicationId, documentId, fileName = null, rotationAngle = null) {
        var filenameStr = ""
        var rotationAngleStr = ""
        var firstChar = "?"

        if (fileName !== null) {
            filenameStr = firstChar + "filename=" + fileName
            firstChar = "&"
        }

        if (rotationAngle !== null) {
            rotationAngleStr = firstChar + "rotation_angle=" + rotationAngle
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.patch(that.serverURL + '/admin/' + applicationId + '/document/' + documentId + filenameStr + rotationAngleStr, {}, true, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Update a Document
     * @param {string} documentId - a Document id
     * @param {string} fileName (optional) - a new file name
     * @param {integer} rotationAngle (optional) - a new rotation angle
     * @returns {Document}
    */

    updateDocument(documentId, fileName = null, rotationAngle = null) {
        var filenameStr = ""
        var rotationAngleStr = ""
        var firstChar = "?"

        if (fileName !== null) {
            filenameStr = firstChar + "filename=" + fileName
            firstChar = "&"
        }

        if (rotationAngle !== null) {
            rotationAngleStr = firstChar + "rotation_angle=" + rotationAngle
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.patch(that.serverURL + '/document/' + documentId + filenameStr + rotationAngleStr, {}, true, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size))
                resolve(document)
            }).catch((error) => {
                reject(error)
            })
        })
    }


    /**
    * (promise) Return a list of paginated Annotations
    * @param {string[]} tags (optional) - an email address to filter documents
    * @param {string} annotationType (optional) - a type of annotation (can be BOX, TYPING or TEXT so far)
    * @param {string} name (optional) - an Annotation name
    * @param {string} documentId (optional) - a Document id to filter annotations
    * @param {integer} offset (optional) - list offset number for pagination
    * @param {integer} limit (optional) - max per page
    * @returns {Annotation} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, annotations: [Annotation]}]
    */

    getAnnotations(tags = null, annotationType = null, name = null, documentId = null, offset = null, limit = null) {
        var offsetStr = ""
        var limitStr = ""
        var tagsStr = ""
        var documentIdStr = ""
        var annotationTypeStr = ""
        var nameStr = ""
        var firstChar = "?"

        if (offset !== null) {
            offsetStr += firstChar + 'offset=' + offset
            firstChar = "&"
        }

        if (limit !== null) {
            limitStr += firstChar + 'limit=' + limit
            firstChar = "&"
        }

        for (var i = 0; tags && i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
            firstChar = "&"
        }

        if (documentId !== null) {
            documentIdStr = firstChar + "document_id=" + documentId
            firstChar = "&"
        }

        if (annotationType !== null) {
            annotationTypeStr = firstChar + "annotation_type=" + annotationType
            firstChar = "&"
        }

        if (name !== null) {
            nameStr = firstChar + "name=" + name
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/annotation' + offsetStr + limitStr + tagsStr + documentIdStr + annotationTypeStr + nameStr, true, true, that.autoRefreshToken).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var annotations = []
                for (var i = 0; i < body.length; i++) {
                    annotations.push(new Annotation(body[i].id, body[i].creation_time, body[i].annotation_type, body[i].application_id, body[i].document_id, body[i].name, body[i].prediction,
                        body[i].tags))
                }
                resolve({ contentRange, annotations })
            }).catch((error) => {
                if (error.status == 404) {
                    return resolve({ contentRange: { offset: 0, limit: 0, total: 0 }, annotations: [] })
                }
                reject(error)
            })

        })
    }

    /**
    * (promise) Return an Annotation
    * @param {string} annotationId - an Annotation id
    * @returns {Annotation}
    */

    getAnnotation(annotationId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/annotation/' + annotationId, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Annotation(body.id, body.creation_time, body.annotation_type, body.application_id, body.document_id, body.name, body.prediction,
                    body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Delete an Annotation 
    * @param {string} annotationId - an Annotation id
    */

    deleteAnnotation(annotationId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.del(that.serverURL + '/annotation/' + annotationId, true, that.autoRefreshToken).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Add a tag to a Document
     * @param {string} annotationId - an Annotation id
     * @param {string} tag - a tag
     * @returns {Annotation}
     */

    addTagToAnnotation(annotationId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.post(that.serverURL + '/annotation/' + annotationId + '/tag/' + tag, {}, true, that.autoRefreshToken).then((body) => {
                resolve(new Annotation(body.id, body.creation_time, body.annotation_type, body.application_id, body.document_id, body.name, body.prediction,
                    body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Remove a tag from an Annotation
     * @param {string} annotationId - an Annotation id
     * @param {string} tag - a tag
     * @returns {Annotation}
    */

    removeTagFromAnnotation(annotationId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.del(that.serverURL + '/annotation/' + annotationId + '/tag/' + tag, true, that.autoRefreshToken).then((body) => {
                resolve(new Annotation(body.id, body.creation_time, body.annotation_type, body.application_id, body.document_id, body.name, body.prediction,
                    body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Update an Annotation
     * @param {string} documentId - a Document id
     * @param {string} annotationType - an Annotation type (can be BOX, TYPING or TEXT so far)
     * @param {object} prediction - a prediction object
     * @param {string} name (optional) - an Annotation name
     * @param {string[]} tags (optional) - a list of tags
     * @returns {Annotation}
     */

    addAnnotation(documentId, annotationType, prediction, name = null, tags = null) {
        var tagsStr = ""

        for (var i = 0; tags && i < tags.length; i++) {
            tagsStr += '&tags=' + tags[i]
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.post(that.serverURL + '/annotation/' + documentId + '?annotation_type=' + annotationType + (name ? ('&name=' + name) : '') + tagsStr, prediction, true, that.autoRefreshToken).then((body) => {
                resolve(new Annotation(body.id, body.creation_time, body.annotation_type, body.application_id, body.document_id, body.name, body.prediction,
                    body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Update an Annotation
     * @param {string} annotationId - an Annotation id
     * @param {string} name (optional) - an Annotation name
     * @param {object} prediction (optional - a predictionn object
     * @returns {Annotation}
     */

    updateAnnotation(annotationId, name = null, prediction = null) {
        var nameStr = ""
        var firstChar = "?"

        if (name !== null) {
            nameStr += firstChar + 'name=' + name
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.patch(that.serverURL + '/annotation/' + annotationId + nameStr, prediction, true, that.autoRefreshToken).then((body) => {
                resolve(new Annotation(body.id, body.creation_time, body.annotation_type, body.application_id, body.document_id, body.name, body.prediction,
                    body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Get a list of jobs (admin)
    * @param {string} submitterId - a submitter id to filter
    * @param {string} applicationId - an Application id to filter
    * @param {string[]} sort (optional) - a list of parameters 
    * Can be'submitterId', 'applicationId', 'creationTime', 'startingTime', 'finishedTime', 'jobType', 'modelId',
      'documentIds', 'status', 'parentJobId'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param {string} jobType - a Job type (can be 'predict', 'pdf-images', 'image-text') to filter
    * @param {string} modelId - a Model id to filter
    * @param {string} documentId - a Document id to filter
    * @param {string} executeAfterId - a pre-Job id to filter
    * @param {string} parentJobId - a parent Job id to filter
    * @param {string} status - a status (can be WAITING, READY, STARTING, PROCESSED, PROCESSING, CANCELED, FAILED)
    * @param {integer} offset - an offset for pagination
    * @param {integer} limit - a limit for pagination
    * @returns {object[]} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, jobs: [Job]}]
    */

    adminGetJobs(submitterId = null, applicationId = null, sort = null, jobType = null, modelId = null, documentId = null, executeAfterId = null, parentJobId = null, status = null, offset = null, limit = null) {
        var offsetStr = ""
        var limitStr = ""
        var submitterIdStr = ""
        var applicationIdStr = ""
        var jobTypeStr = ""
        var modelIdStr = ""
        var documentIdStr = ""
        var executeAfterIdStr = ""
        var parentJobIdStr = ""
        var statusStr = ""
        var sortStr = ""
        var firstChar = "?"

        if (offset !== null) {
            offsetStr += firstChar + 'offset=' + offset
            firstChar = "&"
        }

        if (limit !== null) {
            limitStr += firstChar + 'limit=' + limit
            firstChar = "&"
        }

        if (submitterId !== null) {
            submitterIdStr += firstChar + 'submitter_id=' + submitterId
            firstChar = "&"
        }

        if (applicationId !== null) {
            applicationIdStr += firstChar + 'application_id=' + applicationId
            firstChar = "&"
        }

        if (jobType !== null) {
            jobTypeStr += firstChar + 'job_type=' + jobType
            firstChar = "&"
        }

        if (modelId !== null) {
            modelIdStr += firstChar + 'model_id=' + modelId
            firstChar = "&"
        }

        if (documentId !== null) {
            documentIdStr += firstChar + 'document_id=' + documentId
            firstChar = "&"
        }

        if (executeAfterId !== null) {
            executeAfterIdStr += firstChar + 'execute_after_id=' + executeAfterId
            firstChar = "&"
        }

        if (parentJobId !== null) {
            parentJobIdStr += firstChar + 'parent_job_id=' + parentJobId
            firstChar = "&"
        }

        if (status !== null) {
            statusStr += firstChar + 'status=' + status
            firstChar = "&"
        }

        if (sort) {
            sortStr = firstChar + "sort=" + pythonizeParams(sort)
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/admin/job' + offsetStr + limitStr + submitterIdStr + applicationIdStr + jobTypeStr + modelIdStr + documentIdStr + executeAfterIdStr + parentJobIdStr + statusStr + sortStr, true, true, that.autoRefreshToken).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var jobs = []
                for (var i = 0; i < body.length; i++) {
                    var result = body[i].result
                    if (result !== null) {
                        if (body[i].result_type === 'document') {
                            result = new Document(body[i].result.id, body[i].result.creation_time, body[i].result.application_id, body[i].result.filename, body[i].result.extension, body[i].original_id, body[i].result.mime_type, body[i].result.rotation_angle, body[i].result.tags, body[i].result.size)
                        } else if (body[i].result_type === 'list[document]') {
                            result = []
                            for (var j = 0; j < body[i].result.length; j++) {
                                result.push(new Document(body[i].result[j].id, body[i].result[j].creation_time, body[i].result[j].application_id, body[i].result[j].filename, body[i].result[j].extension, body[i].result[j].original_id, body[i].result[j].mime_type, body[i].result[j].rotation_angle, body[i].result[j].tags, body[i].result[j].size))
                            }
                        }
                    }
                    jobs.push(new Job(body[i].id, body[i].creation_time, body[i].application_id, body[i].document_ids, body[i].starting_time, body[i].finished_time, body[i].http_code, body[i].job_type, body[i].model_id, result, body[i].result_type, body[i].status, body[i].parent_job_id, body[i].execute_after_id, body[i].submitter_id, body[i].ws_id))
                }
                resolve({ contentRange, jobs })
            }).catch((error) => {
                if (error.status == 404) {
                    return resolve({ contentRange: { offset: 0, limit: 0, total: 0 }, jobs: [] })
                }
                reject(error)
            })

        })
    }

    /**
     * (promise) Get a Job (admin)
     * @param {string} submitterId - a submitter id
     * @param {string} jobId - a Job id
     * @returns {Job}
     */

    adminGetJob(submitterId, jobId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/admin/' + submitterId + '/job/' + jobId, true, false, that.autoRefreshToken).then((body) => {
                var result = body.result
                if (result !== null) {
                    if (body.result_type === 'document') {
                        result = new Document(body.result.id, body.result.creation_time, body.result.application_id, body.result.filename, body.result.extension, body.result.original_id, body.result.mime_type, body.result.rotation_angle, body.result.tags, body.result.size)
                    } else if (body.result_type === 'list[document]') {
                        result = []
                        for (var i = 0; i < body.result.length; i++) {
                            result.push(new Document(body.result[i].id, body.result[i].creation_time, body.result[i].application_id, body.result[i].filename, body.result[i].extension, body.result[i].original_id, body.result[i].mime_type, body.result[i].rotation_angle, body.result[i].tags, body.result[i].size))
                        }
                    }
                }
                resolve(new Job(body.id, body.creation_time, body.application_id, body.document_ids, body.starting_time, body.finished_time, body.http_code, body.job_type, body.model_id, result, body.result_type, body.status, body.parent_job_id, body.execute_after_id, body.submitter_id, body.ws_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
   * (promise) Cancel a Job (admin)
   * @param {string} submitterId - a submitter id
   * @param {string} jobId - a Job id
   * @returns {Job}
   */

    adminCancelJob(submitterId, jobId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.del(that.serverURL + '/admin/' + submitterId + '/job/' + jobId, true, that.autoRefreshToken).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Get a list of jobs
     * @param {string} applicationId - an Application id to filter
     * @param {string[]} sort (optional) - a list of parameters 
     * Can be'submitterId', 'applicationId', 'creationTime', 'startingTime', 'finishedTime', 'jobType', 'modelId',
       'documentIds', 'status', 'parentJobId'. In ascending order by default.
     * If a parameter is preceded by '-' it means descending order.
     * @param {string} jobType - a Job type (can be 'predict', 'pdf-images', 'image-text') to filter
     * @param {string} modelId - a Model id to filter
     * @param {string} documentId - a Document id to filter
     * @param {string} executeAfterId - a pre-Job id to filter
     * @param {string} parentJobId - a parent Job id to filter
     * @param {string} status - a status (can be WAITING, READY, STARTING, PROCESSED, PROCESSING, CANCELED, FAILED)
     * @param {integer} offset - an offset for pagination
     * @param {integer} limit - a limit for pagination
     * @returns {object[]} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, jobs: [Job]}]
     */

    getJobs(applicationId = null, sort = null, jobType = null, modelId = null, documentId = null, executeAfterId = null, parentJobId = null, status = null, offset = null, limit = null) {
        var offsetStr = ""
        var limitStr = ""
        var applicationIdStr = ""
        var jobTypeStr = ""
        var modelIdStr = ""
        var documentIdStr = ""
        var executeAfterIdStr = ""
        var parentJobIdStr = ""
        var statusStr = ""
        var sortStr = ""
        var firstChar = "?"

        if (offset !== null) {
            offsetStr += firstChar + 'offset=' + offset
            firstChar = "&"
        }

        if (limit !== null) {
            limitStr += firstChar + 'limit=' + limit
            firstChar = "&"
        }

        if (applicationId !== null) {
            applicationIdStr += firstChar + 'application_id=' + applicationId
            firstChar = "&"
        }

        if (jobType !== null) {
            jobTypeStr += firstChar + 'job_type=' + jobType
            firstChar = "&"
        }

        if (modelId !== null) {
            modelIdStr += firstChar + 'model_id=' + modelId
            firstChar = "&"
        }

        if (documentId !== null) {
            documentIdStr += firstChar + 'document_id=' + documentId
            firstChar = "&"
        }

        if (executeAfterId !== null) {
            executeAfterIdStr += firstChar + 'execute_after_id=' + executeAfterId
            firstChar = "&"
        }

        if (parentJobId !== null) {
            parentJobIdStr += firstChar + 'parent_job_id=' + parentJobId
            firstChar = "&"
        }

        if (status !== null) {
            statusStr += firstChar + 'status=' + status
            firstChar = "&"
        }

        if (sort) {
            sortStr = firstChar + "sort=" + pythonizeParams(sort)
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/job' + offsetStr + limitStr + applicationIdStr + jobTypeStr + modelIdStr + documentIdStr + executeAfterIdStr + parentJobIdStr + statusStr + sortStr, true, true, that.autoRefreshToken).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var jobs = []
                for (var i = 0; i < body.length; i++) {
                    var result = body[i].result
                    if (result !== null) {
                        if (body[i].result_type === 'document') {
                            result = new Document(body[i].result.id, body[i].result.creation_time, body[i].result.application_id, body[i].result.filename, body[i].result.extension, body[i].original_id, body[i].result.mime_type, body[i].result.rotation_angle, body[i].result.tags, body[i].result.size)
                        } else if (body[i].result_type === 'list[document]') {
                            result = []
                            for (var j = 0; j < body[i].result.length; j++) {
                                result.push(new Document(body[i].result[j].id, body[i].result[j].creation_time, body[i].result[j].application_id, body[i].result[j].filename, body[i].result[j].extension, body[i].result[j].original_id, body[i].result[j].mime_type, body[i].result[j].rotation_angle, body[i].result[j].tags, body[i].result[j].size))
                            }
                        }
                    }
                    jobs.push(new Job(body[i].id, body[i].creation_time, body[i].application_id, body[i].document_ids, body[i].starting_time, body[i].finished_time, body[i].http_code, body[i].job_type, body[i].model_id, result, body[i].result_type, body[i].status, body[i].parent_job_id, body[i].execute_after_id, body[i].submitter_id, body[i].ws_id))
                }
                resolve({ contentRange, jobs })
            }).catch((error) => {
                if (error.status == 404) {
                    return resolve({ contentRange: { offset: 0, limit: 0, total: 0 }, jobs: [] })
                }
                reject(error)
            })

        })
    }

    /**
     * (promise) Get a Job
     * @param {string} jobId - a Job id
     * @returns {Job}
     */

    getJob(jobId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/job/' + jobId, true, false, that.autoRefreshToken).then((body) => {
                var result = body.result
                if (result !== null) {
                    if (body.result_type === 'document') {
                        result = new Document(body.result.id, body.result.creation_time, body.result.application_id, body.result.filename, body.result.extension, body.result.original_id, body.result.mime_type, body.result.rotation_angle, body.result.tags, body.result.size)
                    } else if (body.result_type === 'list[document]') {
                        result = []
                        for (var i = 0; i < body.result.length; i++) {
                            result.push(new Document(body.result[i].id, body.result[i].creation_time, body.result[i].application_id, body.result[i].filename, body.result[i].extension, body.result[i].original_id, body.result[i].mime_type, body.result[i].rotation_angle, body.result[i].tags, body.result[i].size))
                        }
                    }
                }
                resolve(new Job(body.id, body.creation_time, body.application_id, body.document_ids, body.starting_time, body.finished_time, body.http_code, body.job_type, body.model_id, result, body.result_type, body.status, body.parent_job_id, body.execute_after_id, body.submitter_id, body.ws_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
   * (promise) Cancel a Job
   * @param {string} jobId - a Job id
   * @returns {Job}
   */

    cancelJob(jobId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.del(that.serverURL + '/job/' + jobId, true, that.autoRefreshToken).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }


    /**
   * (promise) Get a list of Workers
   * @returns {Worker[]}
   */

    getWorkers() {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/worker', true, false, that.autoRefreshToken).then((body) => {
                var workers = []
                for (var i = 0; i < body.length; i++) {
                    workers.push(new Worker(body[i].job_type, body[i].number, body[i].statuses))
                }
                resolve(workers)
            }).catch((error) => {
                if (error.status == 404) {
                    return resolve([])
                }
                reject(error)
            })
        })
    }

    /**
  * (promise) Get a Worker by Job type
  * @param {string} jobType - a Job type
  * @returns {Worker}
  */

    getWorker(jobType) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/worker/' + jobType, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Worker(body.job_type, body.number, body.statuses))

            }).catch((error) => {
                reject(error)
            })
        })
    }

}






