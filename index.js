var Model = require('./models/model')
var Application = require('./models/application')
var Document = require('./models/document')
var Annotation = require('./models/annotation')
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
                resolve(new Application(body.application.id, body.application.creation_time, body.application.application_type, body.application.email, body.application.application_name, body.application.first_name, body.application.last_name, body.application.api_key))
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
                    applications.push(new Application(body[i].id, body[i].creation_time, body[i].application_type, body[i].email, body[i].application_name, body[i].first_name, body[i].last_name, body[i].api_key))
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
    * @param {string} name - a Model name
    * @param {string} applicationId - an Application id
    * @param {Buffer} fileBuffer - a model file zip buffer. The model inside the zip should have a valid name.
    * @param {string} description (optional) - a Model description
    * @param {integer} ttl (optional) - a ttl value in seconds
    * @param {string[]} tags (optional) - a list of tags
    * @returns {Model}
    */

    adminAddModel(name, applicationId, fileBuffer, description = null, ttl = null, tags = null) {
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
            that.leiaAPIRequest.streamPost(that.serverURL + '/admin/model?name=' + name + '&application_id=' + applicationId + (description ? '&description=' + description : '') + (ttl ? '&ttl=' + ttl : '') + tagsStr, fileBuffer, true, false, that.autoRefreshToken).then((body) => {
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
    * @returns {Application}
    */

    adminAddApplication(email, applicationName, applicationType, firstname, lastname) {
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

            that.leiaAPIRequest.post(that.serverURL + '/admin/application', application, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Application(body.id, body.creation_time, body.application_type, body.email, body.application_name, body.first_name, body.last_name, body.api_key))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Reset an Application API Key and get a new one (admin)
    * @param {string} id - an Application id
    * @returns {Application} an Application object with the new API Key
    */

    adminResetApplicationApiKey(id) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.post(that.serverURL + '/admin/application/' + id + '/reset_api_key', {}, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Application(body.id, body.creation_time, body.application_type, body.email, body.application_name, body.first_name, body.last_name, body.api_key))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Delete a Model (admin)
    * @param {string} id - a Model id
     */

    adminDeleteModel(id) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.del(that.serverURL + '/admin/model/' + id, true, false, that.autoRefreshToken).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Update a Model (admin)
     * @param {string} id - a Model id
     * @param {string} name - a Model name
     * @param {string} description - a Model description
     * @param {integer} ttl - a TTL value in seconds
     * @returns {Model}
     */

    adminUpdateModel(id, name = null, description = null, ttl = null) {
        var query = ""
        var firstChar = "?"
        if (name) {
            query += firstChar + 'name=' + name
            firstChar = "&"
        }
        if (description) {
            query += firstChar + 'description=' + description
            firstChar = "&"
        }
        if (ttl) {
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
            that.leiaAPIRequest.patch(that.serverURL + '/admin/model/' + id + query, {}, true, false, that.autoRefreshToken).then((model) => {
                resolve(model)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Delete an Application (admin)
     * @param {string} id - an Application id
     */

    adminDeleteApplication(id) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.del(that.serverURL + '/admin/application/' + id, true, false, that.autoRefreshToken).then(() => {
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

        if (applicationId) {
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
    * @param {string} id - a Model id
    * @returns {Model}
    */

    adminGetModel(id) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/admin/model/' + id, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Return a Model
    * @param {string} id - a Model id
    * @returns {Model}
    */

    getModel(id) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/model/' + id, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }


    /**
    * (promise) Return an Application (admin)
    * @param {string} id - an Application id
    * @returns {Application}
    */

    adminGetApplication(id) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/admin/application/' + id, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Application(body.id, body.creation_time, body.application_type, body.email, body.application_name, body.first_name, body.last_name, body.api_key))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Add a Document (admin)
    * @param {string} fileName - a document file name
    * @param {Buffer} fileBuffer - a document file buffer
    * @param {string} applicationId - an Application id
    * @param {string[]} tags (optional) - a list of tags
    * @returns {Model}
    */

    adminAddDocument(fileName, fileBuffer, applicationId, tags = null) {
        var tagsStr = ""
        var applicationIdStr = ""
        var firstChar = "&"

        for (var i = 0; i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
        }

        applicationIdStr = firstChar + "application_id=" + applicationId

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.streamPost(that.serverURL + '/admin/document?filename=' + fileName + tagsStr + applicationIdStr, fileBuffer, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
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

        for (var i = 0; i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.streamPost(that.serverURL + '/document?filename=' + fileName + tagsStr, fileBuffer, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Transform a PDF into an image or text (admin)
     * @param {string[]} documentIds - a list of Document ids
     * @param {string} outputType - an output type. 
     * @param {string} inputTag (optional) - The tag of the documents to process. 
     * If inputTag is present, document_ids should contain a single value, 
     * and the documents processed will be those where originalId=documentIds[0] and that contain the specified tag
     * @param {string} outputTag (optional) - an output tag for the new documents
     * @returns {Document[]}
     */

    adminTransformPDF(documentIds, outputType, inputTag = null, outputTag = null) {
        var documentIdsString = documentIds.join(',')
        var inputTagStr = ""
        var outputTagStr = ""
        var firstChar = "?"

        if (inputTag) {
            inputTagStr = firstChar + 'input_tag=' + inputTag
            firstChar = "&"
        }

        if (outputTag) {
            outputTagStr = firstChar + 'output_tag=' + outputTag
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.post(that.serverURL + '/admin/document/' + documentIdsString + '/transform/' + outputType + inputTagStr + outputTagStr, {}, true, false, that.autoRefreshToken).then((body) => {
                var documents = []
                for (var i = 0; i < body.length; i++) {
                    documents.push(new Document(body[i].id, body[i].creation_time, body[i].application_id, body[i].filename, body[i].extension, body[i].mime_type, body[i].correct_angle, body[i].tags))
                }
                resolve(documents)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Transform a PDF into an image or text
     * @param {string[]} documentIds - a list of Document ids
     * @param {string} outputType - an output type. 
     * @param {string} inputTag (optional) - The tag of the documents to process. 
     * If inputTag is present, document_ids should contain a single value, 
     * and the documents processed will be those where originalId=documentIds[0] and that contain the specified tag
     * @param {string} outputTag (optional) - an output tag for the new documents
     * @returns {Document[]}
     */

    transformPDF(documentIds, outputType, inputTag = null, outputTag = null) {
        var documentIdsString = documentIds.join(',')
        var inputTagStr = ""
        var outputTagStr = ""
        var firstChar = "?"

        if (inputTag) {
            inputTagStr = firstChar + 'input_tag=' + inputTag
            firstChar = "&"
        }

        if (outputTag) {
            outputTagStr = firstChar + 'output_tag=' + outputTag
            firstChar = "&"
        }


        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.post(that.serverURL + '/document/' + documentIdsString + '/transform/' + outputType + inputTagStr + outputTagStr, {}, true, false, that.autoRefreshToken).then((body) => {
                var documents = []
                for (var i = 0; i < body.length; i++) {
                    documents.push(new Document(body[i].id, body[i].creation_time, body[i].application_id, body[i].filename, body[i].extension, body[i].mime_type, body[i].correct_angle, body[i].tags))
                }
                resolve(documents)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Apply a Model to a Document (admin)
     * @param {string} modelId - a Model id
     * @param {string[]} documentIds - a list of Document ids
     * @param {string} tag (optional) - The tag of the documents to process.
     * If tag is present, documentIds should contain a single value, 
     * and the documents processed will be those where originalId=documentIds[0] and that contain the specified tag
     * @returns {object} a result object
     */

    adminApplyModelToDocument(modelId, documentIds, tag = null) {
        var documentIdsString = documentIds.join(',')
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/admin/model/' + modelId + '/apply/' + documentIdsString + (tag ? '?tag=' + tag : ''), true, false, that.autoRefreshToken).then((body) => {
                resolve(body)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Apply a Model to a Document
     * @param {string} modelId - a Model id
     * @param {string[]} documentIds - a list of Document ids
     * @param {string} tag (optional) - The tag of the documents to process.
     * If tag is present, documentIds should contain a single value, 
     * and the documents processed will be those where originalId=documentIds[0] and that contain the specified tag
     * @returns {object} a result object
     */

    applyModelToDocument(modelId, documentIds, tag = null) {
        var documentIdsString = documentIds.join(',')
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/model/' + modelId + '/apply/' + documentIdsString + (tag ? '?tag=' + tag : ''), true, false, that.autoRefreshToken).then((body) => {
                resolve(body)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * Delete a Document (admin)
     * @param {string} documentId - a Document id
     * 
     */

    adminDeleteDocument(documentId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.del(that.serverURL + '/admin/document/' + documentId, false, false, that.autoRefreshToken).then(() => {
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
            that.leiaAPIRequest.del(that.serverURL + '/document/' + documentId, false, false, that.autoRefreshToken).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Add a tag to a Model (admin
     * @param {string} modelId - a Model id
     * @param {string} tag - the tag to add
     * @returns {Model}
     */

    adminAddTagToModel(modelId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.post(that.serverURL + '/admin/model/' + modelId + '/tag/' + tag, {}, true, false, that.autoRefreshToken).then((body) => {
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
            that.leiaAPIRequest.post(that.serverURL + '/model/' + modelId + '/tag/' + tag, {}, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Remove a tag from a Model (admin)
     * @param {string} modelId - a Model id
     * @param {string} tag - the tag to add
     * @returns {Model}
     */

    adminRemoveTagFromModel(modelId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.del(that.serverURL + '/admin/model/' + modelId + '/tag/' + tag, true, false, that.autoRefreshToken).then((body) => {
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
            that.leiaAPIRequest.del(that.serverURL + '/model/' + modelId + '/tag/' + tag, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Return a list of paginated Documents (admin)
    * @param {string[]} tags (optional) - an email address to filter documents
    * @param {string[]} sort (optional) - a list of parameters 
    * Can be 'applicationId', 'filename', 'extension', 'mimeType', 'originalId', 'page', 'creationTime'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param {integer} offset (optional) - list offset number for pagination
    * @param {integer} limit (optional) - max per page
    * @param {string} applicationId (optional) - an Application id to filter documents
    * @returns {object[]} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, documents: [Document]}]
    */

    adminGetDocuments(tags = null, sort = null, offset = null, limit = null, applicationId = null) {
        var offsetStr = ""
        var limitStr = ""
        var tagsStr = ""
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

        if (applicationId) {
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
            that.leiaAPIRequest.get(that.serverURL + '/admin/document' + offsetStr + limitStr + tagsStr + applicationIdStr + sortStr, true, true, that.autoRefreshToken).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var documents = []
                for (var i = 0; i < body.length; i++) {
                    documents.push(new Document(body[i].id, body[i].creation_time, body[i].application_id, body[i].filename, body[i].extension, body[i].mime_type, body[i].correct_angle,
                        body[i].tags))
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
    * @param {string[]} sort (optional) - a list of parameters 
    * Can be 'applicationId', 'filename', 'extension', 'mimeType', 'originalId', 'page', 'creationTime'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param {integer} offset (optional) - list offset number for pagination
    * @param {integer} limit (optional) - max per page
    * @returns {object[]} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, documents: [Document]}]
    */

    getDocuments(tags = null, sort = null, offset = null, limit = null) {
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
            that.leiaAPIRequest.get(that.serverURL + '/document' + offsetStr + limitStr + tagsStr + sortStr, true, true, that.autoRefreshToken).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var documents = []
                for (var i = 0; i < body.length; i++) {
                    documents.push(new Document(body[i].id, body[i].creation_time, body[i].application_id, body[i].filename, body[i].extension, body[i].mime_type, body[i].correct_angle,
                        body[i].tags))
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
     * @param {string} documentId - a Document id
     * @returns {Document}
     */

    adminGetDocument(documentId) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/admin/document/' + documentId, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
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
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Get the content of a Document (admin)
     * @param {string} documentId - a Document id
     * @param {integer} maxSize (optional) - a max size if the Document is an image
     * @returns {Buffer}
     */

    adminGetDocumentContent(documentId, maxSize = null) {
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
            that.leiaAPIRequest.getFile(that.serverURL + '/admin/document/' + documentId + '?file_contents=true' + maxSizeStr, false, that.autoRefreshToken).then((body) => {
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
     * @param {string} documentId - a Document id
     * @param {string} tag - a tag
     * @returns {Document}
     */

    adminAddTagToDocument(documentId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.post(that.serverURL + '/admin/document/' + documentId + '/tag/' + tag, {}, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Remove a tag from a Document (admin)
     * @param {string} documentId - a Document id
     * @param {string} tag - a tag
     * @returns {Document}
    */

    adminRemoveTagFromDocument(documentId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.del(that.serverURL + '/admin/document/' + documentId + '/tag/' + tag, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
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
            that.leiaAPIRequest.post(that.serverURL + '/document/' + documentId + '/tag/' + tag, {}, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
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
            that.leiaAPIRequest.del(that.serverURL + '/document/' + documentId + '/tag/' + tag, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Update a Document (admin)
     * @param {string} id - a Document id
     * @param {string} fileName (optional) - a new file name
     * @param {integer} rotationAngle (optional) - a new rotation angle
     * @returns {Document}
     */

    adminUpdateDocument(id, fileName = null, rotationAngle = null) {
        var filenameStr = ""
        var rotationAngleStr = ""
        var firstChar = "?"

        if (fileName) {
            filenameStr = firstChar + "filename=" + fileName
            firstChar = "&"
        }

        if (rotationAngle) {
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
            that.leiaAPIRequest.patch(that.serverURL + '/admin/document/' + id + filenameStr + rotationAngleStr, {}, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Update a Document
     * @param {string} id - a Document id
     * @param {string} fileName (optional) - a new file name
     * @param {integer} rotationAngle (optional) - a new rotation angle
     * @returns {Document}
    */

    updateDocument(id, fileName = null, rotationAngle = null) {
        var filenameStr = ""
        var rotationAngleStr = ""
        var firstChar = "?"

        if (fileName) {
            filenameStr = firstChar + "filename=" + fileName
            firstChar = "&"
        }

        if (rotationAngle) {
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
            that.leiaAPIRequest.patch(that.serverURL + '/document/' + id + filenameStr + rotationAngleStr, {}, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
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

        if (documentId) {
            documentIdStr = firstChar + "document_id=" + documentId
            firstChar = "&"
        }

        if (annotationType) {
            annotationTypeStr = firstChar + "annotation_type=" + annotationType
            firstChar = "&"
        }

        if (name) {
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
    * @param {string} id - an Annotation id
    * @returns {Annotation}
    */

    getAnnotation(id) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/annotation/' + id, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Annotation(body.id, body.creation_time, body.annotation_type, body.application_id, body.document_id, body.name, body.prediction,
                    body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Delete an Annotation 
    * @param {string} id - an Annotation id
    */

    deleteAnnotation(id) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/annotation/' + id, true, false, that.autoRefreshToken).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Add a tag to a Document
     * @param {string} id - an Annotation id
     * @param {string} tag - a tag
     * @returns {Annotation}
     */

    addTagToAnnotation(id, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.post(that.serverURL + '/annotation/' + id + '/tag/' + tag, {}, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Annotation(body.id, body.creation_time, body.annotation_type, body.application_id, body.document_id, body.name, body.prediction,
                    body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Remove a tag from an Annotation
     * @param {string} id - an Annotation id
     * @param {string} tag - a tag
     * @returns {Annotation}
    */

    removeTagFromAnnotation(id, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.del(that.serverURL + '/annotation/' + id + '/tag/' + tag, true, false, that.autoRefreshToken).then((body) => {
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
            that.leiaAPIRequest.post(that.serverURL + '/annotation?document_id=' + documentId + '&annotation_type=' + annotationType + (name ? ('&name=' + name) : '') + tagsStr, prediction, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Annotation(body.id, body.creation_time, body.annotation_type, body.application_id, body.document_id, body.name, body.prediction,
                    body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Update an Annotation
     * @param {string} id - an Annotation id
     * @param {string} name (optional) - an Annotation name
     * @param {object} prediction (optional - a predictionn object
     * @returns {Annotation}
     */

    updateAnnotation(id, name = null, prediction = null) {
        var nameStr = ""
        var firstChar = "?"

        if (name) {
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
            that.leiaAPIRequest.patch(that.serverURL + '/annotation/' + id + nameStr, prediction, true, false, that.autoRefreshToken).then((body) => {
                resolve(new Annotation(body.id, body.creation_time, body.annotation_type, body.application_id, body.document_id, body.name, body.prediction,
                    body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

}






