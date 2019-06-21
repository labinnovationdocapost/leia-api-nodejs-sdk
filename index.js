var Model = require('./models/model')
var Application = require('./models/application')
var Document = require('./models/document')
var Annotation = require('./models/annotation')
var LeiaAPIRequest = require('./leia-api-request')
var { pythonizeParams, extractContentRangeInfo } = require('./utils/format-utils')

module.exports = class LeiaAPI {

    constructor(apiKey, serverURL, refreshToken = false) {
        this.apiKey = apiKey
        this.serverURL = serverURL
        if (!this.serverURL) {
            this.serverURL = "https://api.leia.io/leia/1.0.0"
        }
        this.leiaAPIRequest = new LeiaAPIRequest(apiKey, this.serverURL, refreshToken)
    }

    /**
     * Log in
     * @return an object with the following format: {token: 'token', application: an Application object}
     */

    login() {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.get(that.serverURL + '/login/' + that.apiKey, true, false, false).then((body) => {
                body.application = new Application(body.application.id, body.application.creation_time, body.application.application_type, body.application.email, body.application.application_name, body.application.first_name, body.application.last_name, body.application.api_key)
                resolve(body)
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
            that.leiaAPIRequest.loggedGet(that.serverURL + '/logout', false).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Return a list of paginated Applications (admin)
    * @param email (optional) - an email address to filter applications
    * @param applicationName (optional) - an Application name to filter applications
    * @param sort (optional) - a list of parameters 
    * Can be 'applicationName', 'applicationType', 'creationTime', 'firstname', 'lastname', 'email'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param offset (optional) - list offset number for pagination
    * @param limit (optional) - max per page
    * @returns {Application} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, applications: [Application]}]
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
            that.leiaAPIRequest.loggedGet(that.serverURL + '/admin/application' + offsetStr + limitStr + (email ? firstChar + 'email=' + email : '') + (applicationName ? firstChar + 'application_name=' + applicationName : '') + sortStr, true, true).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var applications = []
                for (var i = 0; i < body.length; i++) {
                    applications.push(new Application(body[i].id, body[i].creation_time, body[i].application_type, body[i].email, body[i].application_name, body[i].first_name, body[i].last_name, body[i].api_key))
                }
                resolve({ contentRange, applications })
            }).catch((error) => {
                if (error.status == 404) {
                    return resolve({ contentRange: null, applications: [] })
                }
                reject(error)
            })
        })
    }

    /**
    * (promise) Add a Model (admin)
    * @param name - a Model name
    * @param applicationId - an Application id
    * @param fileBuffer - a model file zip buffer. The model inside the zip should have a valid name.
    * @param description (optional) - a Model description
    * @param ttl (optional) - a ttl value in seconds
    * @param tags (optional) - a list of tags
    * @returns a Model object
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
            that.leiaAPIRequest.loggedStreamPost(that.serverURL + '/admin/model?name=' + name + '&application_id=' + applicationId + (description ? '&description=' + description : '') + (ttl ? '&ttl=' + ttl : '') + tagsStr, fileBuffer, true).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Add an Application (admin)
    * @param email - an Application owner's email
    * @param applicationName - an Application name
    * @param applicationType - an Application type. Can be 'admin' or 'developer'
    * @param firstname - an Application owner's firstname
    * @param lastname - an Application owner's lastname
    * @returns an Application object
    */

    adminAddApplication(email, applicationName, applicationType, firstname, lastname) {
        var that = this
        return new Promise(function (resolve, reject) {
            var application = {
                email: email,
                application_name: applicationName,
                application_type: applicationType,
                first_name: firstname,
                last_name: lastname
            }

            that.leiaAPIRequest.loggedPost(that.serverURL + '/admin/application', application, true).then((body) => {
                resolve(new Application(body.id, body.creation_time, body.application_type, body.email, body.application_name, body.first_name, body.last_name, body.api_key))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Reset an Application API Key and get a new one (admin)
    * @param id - an Application id
    * @returns an Application object with the new API Key
    */

    adminResetApplicationApiKey(id) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedPost(that.serverURL + '/admin/application/' + id + '/reset_api_key', {}, true).then((body) => {
                resolve(new Application(body.id, body.creation_time, body.application_type, body.email, body.application_name, body.first_name, body.last_name, body.api_key))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Delete a Model (admin)
    * @param id - a Model id
     */

    adminDeleteModel(id) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedDelete(that.serverURL + '/admin/model/' + id, true).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Update a Model (admin)
     * @param id - a Model id
     * @param name - a Model name
     * @param description - a Model description
     * @param ttl - a TTL value
     * @returns a Model object
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
            that.leiaAPIRequest.loggedPatch(that.serverURL + '/admin/model/' + id + query, {}, true).then((model) => {
                resolve(model)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Delete an Application (admin)
     * @param id - an Application id
     */

    adminDeleteApplication(id) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedDelete(that.serverURL + '/admin/application/' + id, true).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Return a list of paginated Models (admin)
    * @param tags (optional) - an email address to filter applications
    * @param sort (optional) - a list of parameters 
    * Can be 'applicationId', 'creationTime', 'name', 'description', 'modelType'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param offset (optional) - list offset number for pagination
    * @param limit (optional) - max per page
    * @param applicationId (optional) - an Application id to filter models
    * @returns {Model} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, models: [Model]}]
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
            that.leiaAPIRequest.loggedGet(that.serverURL + '/admin/model' + offsetStr + limitStr + tagsStr + applicationIdStr + sortStr, true, true).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var models = []
                for (var i = 0; i < body.length; i++) {
                    models.push(new Model(body[i].id, body[i].creation_time, body[i].description, body[i].ttl, body[i].input_types, body[i].name, body[i].tags, body[i].model_type, body[i].application_id))
                }
                resolve({ contentRange, models })
            }).catch((error) => {
                if (error.status == 404) {
                    return resolve({ contentRange: null, models: [] })
                }
                reject(error)
            })
        })
    }

    /**
    * (promise) Return a list of paginated Models owned by the API Key
    * @param tags (optional) - an email address to filter applications
    * @param sort (optional) - a list of parameters 
    * Can be 'applicationId', 'creationTime', 'name', 'description', 'modelType'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param offset (optional) - list offset number for pagination
    * @param limit (optional) - max per page
    * @returns {Model} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, models: [Model]}]
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
            that.leiaAPIRequest.loggedGet(that.serverURL + '/model' + offsetStr + limitStr + tagsStr + sortStr, true, true).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var models = []
                for (var i = 0; i < body.length; i++) {
                    models.push(new Model(body[i].id, body[i].creation_time, body[i].description, body[i].ttl, body[i].input_types, body[i].name, body[i].tags, body[i].model_type, body[i].application_id))
                }
                resolve({ contentRange, models })
            }).catch((error) => {
                if (error.status == 404) {
                    return resolve({ contentRange: null, models: [] })
                }
                reject(error)
            })
        })
    }

    /**
    * (promise) Return a Model (admin)
    * @param id - a Model id
    * @returns a Model object
    */

    adminGetModel(id) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedGet(that.serverURL + '/admin/model/' + id, true).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Return a Model
    * @param id - a Model id
    * @returns a Model object
    */

    getModel(id) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedGet(that.serverURL + '/model/' + id, true).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }


    /**
    * (promise) Return an Application (admin)
    * @param id - a Model id
    * @returns an Application object
    */

    adminGetApplication(id) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedGet(that.serverURL + '/admin/application/' + id, true).then((body) => {
                resolve(new Application(body.id, body.creation_time, body.application_type, body.email, body.application_name, body.first_name, body.last_name, body.api_key))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Add a Document (admin)
    * @param fileName - a document file name
    * @param fileBuffer - a document file buffer
    * @param applicationId - an Application id
    * @param tags (optional) - a list of tags
    * @returns a Model object
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
            that.leiaAPIRequest.loggedStreamPost(that.serverURL + '/admin/document?filename=' + fileName + tagsStr + applicationIdStr, fileBuffer, true).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Add a Document
    * @param fileName - a document file name
    * @param fileBuffer - a document file buffer
    * @param tags (optional) - a list of tags
    * @returns a Model object
    */

    addDocument(fileName, fileBuffer, tags = null) {
        var tagsStr = ""
        var firstChar = "&"

        for (var i = 0; i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
        }

        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedStreamPost(that.serverURL + '/document?filename=' + fileName + tagsStr, fileBuffer, true).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Transform a PDF into an image or text (admin)
     * @param documentIds - a list of Document ids
     * @param outputType - an output type. 
     * @param inputTag (optional) - The tag of the documents to process. 
     * If inputTag is present, document_ids should contain a single value, 
     * and the documents processed will be those where originalId=documentIds[0] and that contain the specified tag
     * @param outputTag (optional) - an output tag for the new documents
     * @returns a list of Documents
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
            that.leiaAPIRequest.loggedPost(that.serverURL + '/admin/document/' + documentIdsString + '/transform/' + outputType + inputTagStr + outputTagStr, {}, true).then((body) => {
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
     * @param documentIds - a list of Document ids
     * @param outputType - an output type. 
     * @param inputTag (optional) - The tag of the documents to process. 
     * If inputTag is present, document_ids should contain a single value, 
     * and the documents processed will be those where originalId=documentIds[0] and that contain the specified tag
     * @param outputTag (optional) - an output tag for the new documents
     * @returns a list of new Documents
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
            that.leiaAPIRequest.loggedPost(that.serverURL + '/document/' + documentIdsString + '/transform/' + outputType + inputTagStr + outputTagStr, {}, true).then((body) => {
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
     * @param modelId - a Model id
     * @param documentIds - a list of Document ids
     * @param tag (optional) - The tag of the documents to process.
     * If tag is present, documentIds should contain a single value, 
     * and the documents processed will be those where originalId=documentIds[0] and that contain the specified tag
     * @returns a result object
     */

    adminApplyModelToDocument(modelId, documentIds, tag = null) {
        var documentIdsString = documentIds.join(',')
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedGet(that.serverURL + '/admin/model/' + modelId + '/apply/' + documentIdsString + (tag ? '?tag=' + tag : ''), true).then((body) => {
                resolve(body)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Apply a Model to a Document
     * @param modelId - a Model id
     * @param documentIds - a list of Document ids
     * @param tag (optional) - The tag of the documents to process.
     * If tag is present, documentIds should contain a single value, 
     * and the documents processed will be those where originalId=documentIds[0] and that contain the specified tag
     * @returns a result object
     */

    applyModelToDocument(modelId, documentIds, tag = null) {
        var documentIdsString = documentIds.join(',')
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedGet(that.serverURL + '/model/' + modelId + '/apply/' + documentIdsString + (tag ? '?tag=' + tag : ''), true).then((body) => {
                resolve(body)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * Delete a Document (admin)
     * @param documentId - a Document id
     * 
     */

    adminDeleteDocument(documentId) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedDelete(that.serverURL + '/admin/document/' + documentId).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }


    /**
     * Delete a Document
     * @param documentId - a Document id
     */

    deleteDocument(documentId) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedDelete(that.serverURL + '/document/' + documentId).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Add a tag to a Model (admin
     * @param modelId - a Model id
     * @param tag - the tag to add
     * @returns a Model object
     */

    adminAddTagToModel(modelId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedPost(that.serverURL + '/admin/model/' + modelId + '/tag/' + tag, {}, true).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Add a tag to a Model (admin)
     * @param modelId - a Model id
     * @param tag - the tag to add
     * @returns a Model object
     */

    addTagToModel(modelId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedPost(that.serverURL + '/model/' + modelId + '/tag/' + tag, {}, true).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Remove a tag from a Model (admin)
     * @param modelId - a Model id
     * @param tag - the tag to add
     * @returns a Model object
     */

    adminRemoveTagFromModel(modelId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedDelete(that.serverURL + '/admin/model/' + modelId + '/tag/' + tag, true).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Remove a tag from a Model
     * @param modelId - a Model id
     * @param tag - the tag to add
     * @returns a Model object
     */

    removeTagFromModel(modelId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedDelete(that.serverURL + '/model/' + modelId + '/tag/' + tag, true).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Return a list of paginated Documents (admin)
    * @param tags (optional) - an email address to filter documents
    * @param sort (optional) - a list of parameters 
    * Can be 'applicationId', 'filename', 'extension', 'mimeType', 'originalId', 'page', 'creationTime'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param offset (optional) - list offset number for pagination
    * @param limit (optional) - max per page
    * @param applicationId (optional) - an Application id to filter documents
    * @returns {Document} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, documents: [Document]}]
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
            that.leiaAPIRequest.loggedGet(that.serverURL + '/admin/document' + offsetStr + limitStr + tagsStr + applicationIdStr + sortStr, true, true).then((result) => {
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
                    return resolve({ contentRange: null, documents: [] })
                }
                reject(error)
            })

        })
    }

    /**
    * (promise) Return a list of paginated Documents
    * @param tags (optional) - an email address to filter documents
    * @param sort (optional) - a list of parameters 
    * Can be 'applicationId', 'filename', 'extension', 'mimeType', 'originalId', 'page', 'creationTime'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param offset (optional) - list offset number for pagination
    * @param limit (optional) - max per page
    * @param applicationId (optional) - an Application id to filter documents
    * @returns {Document} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, documents: [Document]}]
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
            that.leiaAPIRequest.loggedGet(that.serverURL + '/document' + offsetStr + limitStr + tagsStr + sortStr, true, true).then((result) => {
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
                    return resolve({ contentRange: null, documents: [] })
                }
                reject(error)
            })

        })
    }

    /**
     * (promise) Get a Document (admin)
     * @param documentId - a Document id
     * @returns a Document object
     */

    adminGetDocument(documentId) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedGet(that.serverURL + '/admin/document/' + documentId, true).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Get a Document
     * @param documentId - a Document id
     * @returns a Document object
     */

    getDocument(documentId) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedGet(that.serverURL + '/document/' + documentId, true).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Get the content of a Document (admin)
     * @param documentId - a Document id
     * @param maxSize (optional) - a max size if the Document is an image
     */

    adminGetDocumentContent(documentId, maxSize = null) {
        var maxSizeStr = ""
        if (maxSize) {
            maxSizeStr = "&max_size=" + maxSize
        }
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedGetFile(that.serverURL + '/admin/document/' + documentId + '?file_contents=true' + maxSizeStr).then((body) => {
                resolve(body)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Get the content of a Document
     * @param documentId - a Document id
     * @param maxSize (optional) - a max size if the Document is an image
     */

    getDocumentContent(documentId, maxSize = null) {
        var maxSizeStr = ""
        if (maxSize) {
            maxSizeStr = "&max_size=" + maxSize
        }
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedGetFile(that.serverURL + '/document/' + documentId + '?file_contents=true' + maxSizeStr).then((body) => {
                resolve(body)
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Return a list of Document tags (admin)
     * @param applicationId - an Application id to filter Document tags
     * @returns a list of tags
     */

    adminGetDocumentsTags(applicationId = null) {
        var applicationIdStr = ""

        if (applicationId) {
            applicationIdStr = "?application_id=" + applicationId
        }

        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedGet(that.serverURL + '/admin/document/tag' + applicationIdStr, true).then((body) => {
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
     * @param applicationId - an Application id to filter Document tags
     * @returns a list of tags
     */

    getDocumentsTags() {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedGet(that.serverURL + '/document/tag', true).then((body) => {
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
     * @param documentId - a Document id
     * @param tag - a tag
     * @returns a Document object
     */

    adminAddTagToDocument(documentId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedPost(that.serverURL + '/admin/document/' + documentId + '/tag/' + tag, {}, true).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Remove a tag from a Document (admin)
    * @param documentId - a Document id
    * @param tag - a tag
    * @returns a Document object
    */

    adminRemoveTagFromDocument(documentId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedDelete(that.serverURL + '/admin/document/' + documentId + '/tag/' + tag, true).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Add a tag to a Document (admin)
     * @param documentId - a Document id
     * @param tag - a tag
     * @returns a Document object
     */

    addTagToDocument(documentId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedPost(that.serverURL + '/document/' + documentId + '/tag/' + tag, {}, true).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
            }).catch((error) => {
                reject(error)

            })
        })
    }

    /**
    * (promise) Remove a tag from a Document
    * @param documentId - a Document id
    * @param tag - a tag
    * @returns a Document object
    */

    removeTagFromDocument(documentId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedDelete(that.serverURL + '/document/' + documentId + '/tag/' + tag, true).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Update a Document (admin)
     * @param id - a Document id
     * @param fileName (optional) - a new file name
     * @param rotationAngle (optional) - a new rotation angle
     * @returns a Document object
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
            that.leiaAPIRequest.loggedPatch(that.serverURL + '/admin/document/' + id + filenameStr + rotationAngleStr, {}, true).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Update a Document
    * @param id - a Document id
    * @param fileName (optional) - a new file name
    * @param rotationAngle (optional) - a new rotation angle
    * @returns a Document object
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
            that.leiaAPIRequest.loggedPatch(that.serverURL + '/document/' + id + filenameStr + rotationAngleStr, {}, true).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
                resolve(document)
            }).catch((error) => {
                reject(error)
            })
        })
    }


    /**
    * (promise) Return a list of paginated Annotations
    * @param tags (optional) - an email address to filter documents
    * @param annotationType (optional) - a type of annotation (can be BOX, TYPING or TEXT so far)
    * @param name (optional) - an Annotation name
    * @param documentId (optional) - a Document id to filter annotations
    * @param offset (optional) - list offset number for pagination
    * @param limit (optional) - max per page
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
            that.leiaAPIRequest.loggedGet(that.serverURL + '/annotation' + offsetStr + limitStr + tagsStr + documentIdStr + annotationTypeStr + nameStr, true, true).then((result) => {
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
                    return resolve({ contentRange: null, annotations: [] })
                }
                reject(error)
            })

        })
    }

    /**
    * (promise) Return an Annotation (admin)
    * @param id - an Annotation id
    * @returns an Annotation object
    */

    getAnnotation(id) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedGet(that.serverURL + '/annotation/' + id, true).then((body) => {
                resolve(new Annotation(body.id, body.creation_time, body.annotation_type, body.application_id, body.document_id, body.name, body.prediction,
                    body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Delete an Annotation (admin)
    * @param id - an Annotation id
    */

    deleteAnnotation(id) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedGet(that.serverURL + '/annotation/' + id, true).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Add a tag to a Document (admin)
     * @param id - an Annotation id
     * @param tag - a tag
     * @returns an Annotation object
     */

    addTagToAnnotation(id, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedPost(that.serverURL + '/annotation/' + id + '/tag/' + tag, {}, true).then((body) => {
                resolve(new Annotation(body.id, body.creation_time, body.annotation_type, body.application_id, body.document_id, body.name, body.prediction,
                    body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Remove a tag from an Annotation
    * @param id - an Annotation id
    * @param tag - a tag
    * @returns an Annotation object
    */

    removeTagFromAnnotation(id, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedDelete(that.serverURL + '/annotation/' + id + '/tag/' + tag, true).then((body) => {
                resolve(new Annotation(body.id, body.creation_time, body.annotation_type, body.application_id, body.document_id, body.name, body.prediction,
                    body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Update an Annotation (admin)
     * @param documentId - a Document id
     * @param annotationType - an Annotation type (can be BOX, TYPING or TEXT so far)
     * @param prediction - a prediction object
     * @param name (optional) - an Annotation name
     * @param tags (optional) - a list of tags
     * @returns an Annotation object
     */

    addAnnotation(documentId, annotationType, prediction, name = null, tags = null) {
        var tagsStr = ""

        for (var i = 0; tags && i < tags.length; i++) {
            tagsStr += '&tags=' + tags[i]
        }

        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedPost(that.serverURL + '/annotation?document_id=' + documentId + '&annotation_type=' + annotationType + (name ? ('&name=' + name) : '') + tagsStr, prediction, true).then((body) => {
                resolve(new Annotation(body.id, body.creation_time, body.annotation_type, body.application_id, body.document_id, body.name, body.prediction,
                    body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Update an Annotation
     * @param id - an Annotation id
     * @param name (optional) - an Annotation name
     * @param prediction (optional - a predictionn object
     * @returns an Annotation object
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
            that.leiaAPIRequest.loggedPatch(that.serverURL + '/annotation/' + id + nameStr, prediction, true).then((body) => {
                resolve(new Annotation(body.id, body.creation_time, body.annotation_type, body.application_id, body.document_id, body.name, body.prediction,
                    body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

}






