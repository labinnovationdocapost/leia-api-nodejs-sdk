var Model = require('./models/model')
var Application = require('./models/application')
var Document = require('./models/document')
var LeiaIORequest = require('./leia-io-request')
var { pythonizeParams } = require('./utils/format-utils')

/** (promise) Log in 
 * @param apiKey - a LeIA API Key
 * @return an Application
 */

module.exports.login = (apiKey) => {
    return new Promise(function (resolve, reject) {
        LeiaIORequest.get(null, process.env.LEIAWS_URL + '/login/' + apiKey, true).then((body) => {
            body.application = new Application(body.application.id, body.application.creation_time,
                body.application.application_type, body.application.email, body.application_name, body.application.first_name, body.application.last_name, body.api_key)
            resolve(body)
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * (promise) Log out
 * @param token - a LeIA token
 */

module.exports.logout = (token) => {
    return new Promise(function (resolve, reject) {
        LeiaIORequest.get(token, process.env.LEIAWS_URL + '/logout', true).then(() => {
            resolve()
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
* (promise) Return a list of paginated Applications (admin)
* @param token - a LeIA API token
* @param email (optional) - an email address to filter applications
* @param applicationName (optional) - an Application name to filter applications
* @param sort (optional) - a list of parameters 
* Can be 'applicationName', 'applicationType', 'creationTime', 'firstname', 'lastname', 'email'. In ascending order by default.
* If a parameter is preceded by '-' it means descending order.
* @param offset (optional) - list offset number for pagination
* @param limit (optional) - max per page
* @return a list of objects with the following format: [{contentRange: '0-1/50', applications: [Application]}]
 */

module.exports.adminGetApplications = (token, email = null, applicationName = null, sort = null, offset = null, limit = null) => {
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

    return new Promise(function (resolve, reject) {
        LeiaIORequest.get(token, process.env.LEIAWS_URL + '/admin/application' + offsetStr + limitStr + (email ? firstChar + 'email=' + email : '') + (applicationName ? firstChar + 'application_name=' + applicationName : '') + sortStr, true, true).then((result) => {
            var body = result.body
            var contentRange = result.contentRange
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
* @param token - a LeIA API token
* @param name - a Model name
* @param applicationId - an Application id
* @param file - a model file with a valid name in a zip file
* @param description (optional) - a Model description
* @param ttl (optional) - a ttl value in seconds
* @param tags (optional) - a list of tags
* @return a Model object
*/

module.exports.adminAddModel = (token, name, applicationId, file, description = null, ttl = null, tags = null) => {
    var tagsStr = ""
    var firstChar = "&"
    for (var i = 0; tags && i < tags.length; i++) {
        tagsStr += firstChar + 'tags=' + tags[i]
    }
    return new Promise(function (resolve, reject) {
        LeiaIORequest.streamPost(token, process.env.LEIAWS_URL + '/admin/model?name=' + name + '&application_id=' + applicationId + (description ? '&description=' + description : '') + (ttl ? '&ttl=' + ttl : '') + tagsStr, file.buffer, true).then((body) => {
            resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
* (promise) Add an Application (admin)
* @param token - a LeIA API token
* @param email - an Application owner's email
* @param applicationName - an Application name
* @param applicationType - an Application type. Can be 'admin' or 'developer'
* @param firstname - an Application owner's firstname
* @param lastname - an Application owner's lastname
* @return an Application object
*/

module.exports.adminAddApplication = (token, email, applicationName, applicationType, firstname, lastname) => {
    return new Promise(function (resolve, reject) {
        var application = {
            email: email,
            application_name: applicationName,
            application_type: applicationType,
            first_name: firstname,
            last_name: lastname
        }

        LeiaIORequest.post(token, process.env.LEIAWS_URL + '/admin/application', application, true).then((body) => {
            resolve(new Application(body.id, body.creation_time, body.application_type, body.email, body.application_name, body.first_name, body.last_name, body.api_key))
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
* (promise) Reset an Application API Key and get a new one (admin)
* @param token - a LeIA API token
* @param id - an Application id
* @return an Application object with the new API Key
*/

module.exports.adminResetApplicationApiKey = (token, id) => {
    return new Promise(function (resolve, reject) {
        LeiaIORequest.post(token, process.env.LEIAWS_URL + '/admin/application/' + id + '/reset_api_key', {}, true).then((body) => {
            resolve(new Application(body.id, body.creation_time, body.application_type, body.email, body.application_name, body.first_name, body.last_name, body.api_key))
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
* (promise) Delete a Model (admin)
* @param token - a LeIA API token
* @param id - a Model id
 */

module.exports.adminDeleteModel = (token, id) => {
    return new Promise(function (resolve, reject) {
        LeiaIORequest.del(token, process.env.LEIAWS_URL + '/admin/model/' + id, true).then(() => {
            resolve()
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * (promise) Update a Model (admin)
 * @param token - a LeIA API token
 * @param id - a Model id
 * @param name - a Model name
 * @param description - a Model description
 * @param ttl - a TTL value
 * @return a Model object
 */

module.exports.adminUpdateModel = (token, id, name = null, description = null, ttl = null) => {
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

    return new Promise(function (resolve, reject) {
        LeiaIORequest.patch(token, process.env.LEIAWS_URL + '/admin/model/' + id + query, {}, true).then((model) => {
            resolve(model)
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * (promise) Delete an Application (admin)
 * @param token - a LeIA API token
 * @param id - an Application id
 */

module.exports.adminDeleteApplication = (token, id) => {
    return new Promise(function (resolve, reject) {
        LeiaIORequest.del(token, process.env.LEIAWS_URL + '/admin/application/' + id, true).then(() => {
            resolve()
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
* (promise) Return a list of paginated Models (admin)
* @param token - a LeIA API token
* @param tags (optional) - an email address to filter applications
* @param sort (optional) - a list of parameters 
* Can be 'applicationName', 'applicationType', 'creationTime', 'firstname', 'lastname', 'email'. In ascending order by default.
* If a parameter is preceded by '-' it means descending order.
* @param offset (optional) - list offset number for pagination
* @param limit (optional) - max per page
* @param applicationId (optional) - an Application id to filter models
* @return a list of objects with the following format: [{contentRange: '0-1/50', models: [Model]}]
*/

module.exports.adminGetModels = (token, tags = null, sort = null, offset = null, limit = null, applicationId = null) => {
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

    return new Promise(function (resolve, reject) {
        LeiaIORequest.get(token, process.env.LEIAWS_URL + '/admin/model' + offsetStr + limitStr + tagsStr + applicationIdStr + sortStr, true, true).then((result) => {
            var body = result.body
            var contentRange = result.contentRange
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
* @param token - a LeIA API token
* @param tags (optional) - an email address to filter applications
* @param sort (optional) - a list of parameters 
* Can be 'applicationName', 'applicationType', 'creationTime', 'firstname', 'lastname', 'email'. In ascending order by default.
* If a parameter is preceded by '-' it means descending order.
* @param offset (optional) - list offset number for pagination
* @param limit (optional) - max per page
* @return a list of objects with the following format: [{contentRange: '0-1/50', models: [Model]}]
*/

module.exports.getModels = (token, tags = null, sort = null, offset = null, limit = null) => {
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

    return new Promise(function (resolve, reject) {
        LeiaIORequest.get(token, process.env.LEIAWS_URL + '/model' + offsetStr + limitStr + tagsStr + sortStr, true, true).then((result) => {
            var body = result.body
            var contentRange = result.contentRange
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
* @param token - a LeIA API token
* @param id - a Model id
* @return a Model object
*/

module.exports.adminGetModel = (token, id) => {
    return new Promise(function (resolve, reject) {
        LeiaIORequest.get(token, process.env.LEIAWS_URL + '/admin/model/' + id, true).then((body) => {
            resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
* (promise) Return a Model
* @param token - a LeIA API token
* @param id - a Model id
* @return a Model object
*/

module.exports.getModel = (token, id) => {
    return new Promise(function (resolve, reject) {
        LeiaIORequest.get(token, process.env.LEIAWS_URL + '/model/' + id, true).then((body) => {
            resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
        }).catch((error) => {
            reject(error)
        })
    })
}


/**
* (promise) Return an Application (admin)
* @param token - a LeIA API token
* @param id - a Model id
* @return an Application object
*/

module.exports.getApplication = (token, id) => {
    return new Promise(function (resolve, reject) {
        LeiaIORequest.get(token, process.env.LEIAWS_URL + '/admin/application/' + id, true).then((body) => {
            resolve(new Application(body.id, body.creation_time, body.application_type, body.email, body.application_name, body.first_name, body.last_name, body.api_key))
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
* (promise) Add a Document (admin)
* @param token - a LeIA API token
* @param file - a document file
* @param applicationId - an Application id
* @param tags (optional) - a list of tags
* @return a Model object
*/

module.exports.adminAddDocument = (token, file, applicationId, tags = null) => {
    var tagsStr = ""
    var applicationIdStr = ""
    var firstChar = "&"

    for (var i = 0; i < tags.length; i++) {
        tagsStr += firstChar + 'tags=' + tags[i]
    }

    applicationIdStr = firstChar + "application_id=" + applicationId

    return new Promise(function (resolve, reject) {
        LeiaIORequest.streamPost(token, process.env.LEIAWS_URL + '/admin/document?filename=' + file.originalname + tagsStr + applicationIdStr, file.buffer, true).then((body) => {
            resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
* (promise) Add a Document
* @param token - a LeIA API token
* @param file - a document file
* @param tags (optional) - a list of tags
* @return a Model object
*/

module.exports.adminAddDocument = (token, file, tags = null) => {
    var tagsStr = ""
    var firstChar = "&"

    for (var i = 0; i < tags.length; i++) {
        tagsStr += firstChar + 'tags=' + tags[i]
    }

    return new Promise(function (resolve, reject) {
        LeiaIORequest.streamPost(token, process.env.LEIAWS_URL + '/document?filename=' + file.originalname + tagsStr, file.buffer, true).then((body) => {
            resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * (promise) Transform a PDF into an image or text (admin)
 * @param token - a LeIA API token
 * @param documentIds - a list of Document ids
 * @param outputType - an output type. 
 * @param inputTag (optional) - The tag of the documents to process. 
 * If inputTag is present, document_ids should contain a single value, 
 * and the documents processed will be those where originalId=documentIds[0] and that contain the specified tag
 * @param outputTag (optional) - an output tag for the new documents
 * @return a list of Documents
 */

module.exports.adminTransformPDF = (token, documentIds, outputType, inputTag, outputTag) => {
    var documentIdsString = documentIds.join(',')
    var inputTagStr = ""
    var outputTagStr = ""
    var firstChar = "?"

    if (inputTag) {
        inputTagStr = firstChar + '?input_tag=' + inputTag
        firstChar = "&"
    }

    if (outputTag) {
        outputTagStr = firstChar + '?output_tag=' + outputTag
        firstChar = "&"
    }

    return new Promise(function (resolve, reject) {
        LeiaIORequest.post(token, process.env.LEIAWS_URL + '/admin/document/' + documentIdsString + '/transform/' + outputType + inputTagStr + outputTagStr, {}, true).then((body) => {
            var documents = []
            for (var i = 0; i < body.length; i++) {
                documents.push(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
            }
            resolve(documents)
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * (promise) Transform a PDF into an image or text
 * @param token - a LeIA API token
 * @param documentIds - a list of Document ids
 * @param outputType - an output type. 
 * @param inputTag (optional) - The tag of the documents to process. 
 * If inputTag is present, document_ids should contain a single value, 
 * and the documents processed will be those where originalId=documentIds[0] and that contain the specified tag
 * @param outputTag (optional) - an output tag for the new documents
 * @return a list of new Documents
 */

module.exports.transformPDF = (token, documentIds, outputType, inputTag, outputTag) => {
    var documentIdsString = documentIds.join(',')
    var inputTagStr = ""
    var outputTagStr = ""
    var firstChar = "?"

    if (inputTag) {
        inputTagStr = firstChar + '?input_tag=' + inputTag
        firstChar = "&"
    }

    if (outputTag) {
        outputTagStr = firstChar + '?output_tag=' + outputTag
        firstChar = "&"
    }

    return new Promise(function (resolve, reject) {
        LeiaIORequest.post(token, process.env.LEIAWS_URL + '/document/' + documentIdsString + '/transform/' + outputType + inputTagStr + outputTagStr, {}, true).then((body) => {
            var documents = []
            for (var i = 0; i < body.length; i++) {
                documents.push(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
            }
            resolve(documents)
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * (promise) Apply a Model to a Document (admin)
 * @param token - a LeIA API token
 * @param modelId - a Model id
 * @param documentIds - a list of Document ids
 * @param tag (optional) - The tag of the documents to process.
 * If tag is present, documentIds should contain a single value, 
 * and the documents processed will be those where originalId=documentIds[0] and that contain the specified tag
 * @return a result object
 */

module.exports.adminApplyModelToDocument = (token, modelId, documentIds, tag = null) => {
    var documentIdsString = documentIds.join(',')

    return new Promise(function (resolve, reject) {
        LeiaIORequest.get(token, process.env.LEIAWS_URL + '/admin/model/' + modelId + '/apply/' + documentIdsString + (tag ? '?tag=' + tag : ''), true).then((body) => {
            resolve(body)
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * (promise) Apply a Model to a Document
 * @param token - a LeIA API token
 * @param modelId - a Model id
 * @param documentIds - a list of Document ids
 * @param tag (optional) - The tag of the documents to process.
 * If tag is present, documentIds should contain a single value, 
 * and the documents processed will be those where originalId=documentIds[0] and that contain the specified tag
 * @return a result object
 */

module.exports.applyModelToDocument = (token, modelId, documentIds, tag = null) => {
    var documentIdsString = documentIds.join(',')

    return new Promise(function (resolve, reject) {
        LeiaIORequest.get(token, process.env.LEIAWS_URL + '/model/' + modelId + '/apply/' + documentIdsString + (tag ? '?tag=' + tag : ''), true).then((body) => {
            resolve(body)
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * Delete a Document (admin)
 * @param token - a LeIA API token
 * @param documentId - a Document id
 * 
 */

module.exports.adminDeleteDocument = (token, documentId) => {
    return new Promise(function (resolve, reject) {
        LeiaIORequest.del(token, process.env.LEIAWS_URL + '/admin/document/' + documentId).then(() => {
            resolve()
        }).catch((error) => {
            reject(error)
        })
    })
}


/**
 * Delete a Document
 * @param token - a LeIA API token
 * @param documentId - a Document id
 */

module.exports.deleteDocument = (token, documentId) => {
    return new Promise(function (resolve, reject) {
        LeiaIORequest.del(token, process.env.LEIAWS_URL + '/document/' + documentId).then(() => {
            resolve()
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * (promise) Add a tag to a Model (admin
 * @param token - a LeIA API token
 * @param modelId - a Model id
 * @param tag - the tag to add
 * @return a Model object
 */

module.exports.adminAddTagToModel = (token, modelId, tag) => {
    return new Promise(function (resolve, reject) {
        LeiaIORequest.post(token, process.env.LEIAWS_URL + '/admin/model/' + modelId + '/tag/' + tag, {}, true).then((body) => {
            resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * (promise) Add a tag to a Model (admin)
 * @param token - a LeIA API token
 * @param modelId - a Model id
 * @param tag - the tag to add
 * @return a Model object
 */

module.exports.addTagToModel = (token, modelId, tag) => {
    return new Promise(function (resolve, reject) {
        LeiaIORequest.post(token, process.env.LEIAWS_URL + '/model/' + modelId + '/tag/' + tag, {}, true).then((body) => {
            resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * (promise) Remove a tag from a Model (admin)
 * @param token - a LeIA API token
 * @param modelId - a Model id
 * @param tag - the tag to add
 * @return a Model object
 */

module.exports.adminRemoveTagFromModel = (token, modelId, tag) => {
    return new Promise(function (resolve, reject) {
        LeiaIORequest.del(token, process.env.LEIAWS_URL + '/admin/model/' + modelId + '/tag/' + tag, true).then((body) => {
            resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * (promise) Remove a tag from a Model (admin)
 * @param token - a LeIA API token
 * @param modelId - a Model id
 * @param tag - the tag to add
 * @return a Model object
 */

module.exports.adminRemoveTagFromModel = (token, modelId, tag) => {
    return new Promise(function (resolve, reject) {
        LeiaIORequest.del(token, process.env.LEIAWS_URL + '/admin/model/' + modelId + '/tag/' + tag, true).then((body) => {
            resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * (promise) Remove a tag from a Model
 * @param token - a LeIA API token
 * @param modelId - a Model id
 * @param tag - the tag to add
 * @return a Model object
 */

module.exports.adminRemoveTagFromModel = (token, modelId, tag) => {
    return new Promise(function (resolve, reject) {
        LeiaIORequest.del(token, process.env.LEIAWS_URL + '/model/' + modelId + '/tag/' + tag, true).then((body) => {
            resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.application_id))
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
* (promise) Return a list of paginated Documents (admin)
* @param token - a LeIA API token
* @param tags (optional) - an email address to filter documents
* @param sort (optional) - a list of parameters 
* Can be 'applicationId', 'filename', 'extension', 'mimeType', 'originalId', 'page', 'creationTime'. In ascending order by default.
* If a parameter is preceded by '-' it means descending order.
* @param offset (optional) - list offset number for pagination
* @param limit (optional) - max per page
* @param applicationId (optional) - an Application id to filter documents
* @return a list of objects with the following format: [{contentRange: '0-1/50', documents: [Document]}]
*/

module.exports.adminGetDocuments = (token, tags = null, sort = null, offset = null, limit = null, applicationId = null) => {
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

    return new Promise(function (resolve, reject) {
        LeiaIORequest.get(token, process.env.LEIAWS_URL + '/admin/document' + offsetStr + limitStr + tagsStr + applicationIdStr + sortStr, true, true).then((result) => {
            var body = result.body
            var contentRange = result.contentRange
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
* @param token - a LeIA API token
* @param tags (optional) - an email address to filter documents
* @param sort (optional) - a list of parameters 
* Can be 'applicationId', 'filename', 'extension', 'mimeType', 'originalId', 'page', 'creationTime'. In ascending order by default.
* If a parameter is preceded by '-' it means descending order.
* @param offset (optional) - list offset number for pagination
* @param limit (optional) - max per page
* @param applicationId (optional) - an Application id to filter documents
* @return a list of objects with the following format: [{contentRange: '0-1/50', documents: [Document]}]
*/

module.exports.getDocuments = (token, tags = null, sort = null, offset = null, limit = null) => {
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

    return new Promise(function (resolve, reject) {
        LeiaIORequest.get(token, process.env.LEIAWS_URL + '/document' + offsetStr + limitStr + tagsStr + sortStr, true, true).then((result) => {
            var body = result.body
            var contentRange = result.contentRange
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
 * @param token - a LeIA API token
 * @param documentId - a Document id
 * @return a Document object
 */

module.exports.adminGetDocument = (token, documentId) => {
    return new Promise(function (resolve, reject) {
        LeiaIORequest.get(token, process.env.LEIAWS_URL + '/admin/document/' + documentId, true).then((body) => {
            resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * (promise) Get a Document
 * @param token - a LeIA API token
 * @param documentId - a Document id
 * @return a Document object
 */

module.exports.getDocument = (token, documentId) => {
    return new Promise(function (resolve, reject) {
        LeiaIORequest.get(token, process.env.LEIAWS_URL + '/document/' + documentId, true).then((body) => {
            resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.mime_type, body.correct_angle, body.tags))
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * (promise) Get the content of a Document (admin)
 * @param token - a LeIA API token
 * @param documentId - a Document id
 * @param maxSize - a max size if the Document is an image
 */

module.exports.adminGetDocumentContent = (token, documentId, maxSize) => {
    var maxSizeStr = ""
    if (maxSize) {
        maxSizeStr = "&max_size=" + maxSize
    }
    return new Promise(function (resolve, reject) {
        LeiaIORequest.getFile(token, process.env.LEIAWS_URL + '/admin/document/' + documentId + '?file_contents=true' + maxSizeStr).then((body) => {
            resolve(body)
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * (promise) Get the content of a Document
 * @param token - a LeIA API token
 * @param documentId - a Document id
 * @param maxSize - a max size if the Document is an image
 */

module.exports.getDocumentContent = (token, documentId, maxSize) => {
    var maxSizeStr = ""
    if (maxSize) {
        maxSizeStr = "&max_size=" + maxSize
    }
    return new Promise(function (resolve, reject) {
        LeiaIORequest.getFile(token, process.env.LEIAWS_URL + '/document/' + documentId + '?file_contents=true' + maxSizeStr).then((body) => {
            resolve(body)
        }).catch((error) => {
            reject(error)
        })
    })
}

/**
 * (promise) Return a list of Document tags (admin)
 * @param token - a LeIA API token
 * @param applicationId - an Application id to filter Document tags
 * @return a list of tags
 */

module.exports.adminGetDocumentsTags = (token, applicationId = null) => {
    var applicationIdStr = ""

    if (applicationId) {
        applicationIdStr = "?application_id=" + applicationId
    }

    return new Promise(function (resolve, reject) {
        LeiaIORequest.get(token, process.env.LEIAWS_URL + '/admin/document/tag' + applicationIdStr, true).then((body) => {
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
 * @param token - a LeIA API token
 * @param applicationId - an Application id to filter Document tags
 * @return a list of tags
 */

module.exports.getDocumentsTags = (token) => {
    return new Promise(function (resolve, reject) {
        LeiaIORequest.get(token, process.env.LEIAWS_URL + '/document/tag', true).then((body) => {
            resolve(body)
        }).catch((error) => {
            if (error.status == 404) {
                return resolve([])
            }
            reject(error)
        })
    })
}






