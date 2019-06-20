var request = require('request');
var streamifier = require('streamifier')
var Model = require('./models/model')
var Application = require('./models/application')
var Document = require('./models/document')
var LeiaAPIRequest = require('./leia-api-request')
var { pythonizeParams, extractContentRangeInfo } = require('./utils/format-utils')

module.exports = class LeiaAPI {

    constructor(apiKey, serverURL) {
        this.apiKey = apiKey
        this.serverURL = serverURL
        if (!this.serverURL) {
            this.serverURL = "https://api.leia.io/leia/1.0.0"
        }
        this.leiaAPIRequest = new LeiaAPIRequest(apiKey, this.serverURL)
    }

    /**
     * (promise) Log out
     * @param token - a LeIA token
     */

    logout() {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedGet(that.serverURL + '/logout', true).then(() => {
                resolve()
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * Return the current logged in application
     * @return an Application object
     */

    getCurrentApplication() {
        var application = that.leiaAPIRequest.application
        if (application) {
            return new Application(application.id, application.creation_time,
                application.application_type, application.email, application_name, application.first_name, application.last_name, application.api_key)
        }
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
    * @return a list of objects with the following format: [{contentRange: '0-1/50', applications: [Application]}]
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
            that.leiaAPIRequest.get(that.serverURL + '/admin/application' + offsetStr + limitStr + (email ? firstChar + 'email=' + email : '') + (applicationName ? firstChar + 'application_name=' + applicationName : '') + sortStr, true, true).then((result) => {
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
    * @return a Model object
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
    * @return an Application object
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
    * @return an Application object with the new API Key
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
     * @return a Model object
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
    * @return a list of objects with the following format: [{contentRange: '0-1/50', models: [Model]}]
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
    * @return a list of objects with the following format: [{contentRange: '0-1/50', models: [Model]}]
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
    * @return a Model object
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
    * @return a Model object
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
    * @return an Application object
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
    * @return a Model object
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
    * @return a Model object
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
     * @return a list of Documents
     */

    adminTransformPDF(documentIds, outputType, inputTag=null, outputTag=null) {
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
     * @return a list of new Documents
     */

    transformPDF(documentIds, outputType, inputTag=null, outputTag=null) {
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
     * @return a result object
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
     * @return a result object
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
     * @return a Model object
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
     * @return a Model object
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
     * @return a Model object
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
     * @return a Model object
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
    * @return a list of objects with the following format: [{contentRange: '0-1/50', documents: [Document]}]
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
    * @return a list of objects with the following format: [{contentRange: '0-1/50', documents: [Document]}]
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
     * @return a Document object
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
     * @return a Document object
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
     * @param maxSize - a max size if the Document is an image
     */

    adminGetDocumentContent(documentId, maxSize) {
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
     * @param maxSize - a max size if the Document is an image
     */

    getDocumentContent(documentId, maxSize) {
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
     * @return a list of tags
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
     * @return a list of tags
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
     * @return a Document object
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
     * @return a Document object
     */
    
    adminRemoveTagFromDocument (documentId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedDelete(that.serverURL  + '/admin/document/' + documentId + '/tag/' + tag, true).then((body) => {
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
     * @return a Document object
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
     * @return a Document object
     */
    
    removeTagFromDocument (documentId, tag) {
        var that = this
        return new Promise(function (resolve, reject) {
            that.leiaAPIRequest.loggedDelete(that.serverURL  + '/document/' + documentId + '/tag/' + tag, true).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
            }).catch((error) => {
                reject(error)
            })
        })
    }

}






