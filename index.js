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
                resolve(new Application(body.application.id, body.application.creation_time, body.application.application_type, body.application.email, body.application.application_name, body.application.first_name, body.application.last_name, body.application.default_job_callback_url, body.application.job_counts, body.application.dedicated_workers, body.application.dedicated_workers_ttl, body.application.api_key))
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
    * @param {integer} offset (optional) - list offset number for pagination
    * @param {integer} limit (optional) - max per page
    * @param {string[]} sort (optional) - a list of parameters 
    * Can be 'applicationName', 'applicationType', 'creationTime', 'firstname', 'lastname', 'email'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param {string} applicationId (optional) - filter by Application id
    * @param {string} email (optional) - an email address to filter applications
    * @param {string} applicationName (optional) - an Application name to filter applications
    * @param {string} firstName (optional) - filter by firstName
    * @param {string} lastName (optional) - filter by lastName
    * @param {string} applicationType (optional) - filter by applicationType
    * @param {string} createdAfter (optional) - only return applications created after a certain date (ISO 8601 format : yyyy-MM-ddThh:mm:ss)
    * @param {string} createdBefore (optional) - only return applications created before a certain date (ISO 8601 format : yyyy-MM-ddThh:mm:ss)
    * @returns {object[]} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, applications: [Application]}]
     */

    adminGetApplications(offset = null, limit = null, sort = null, applicationId = null, email = null, applicationName = null,
        firstName = null, lastName = null, applicationType = null, createdAfter = null, createdBefore = null) {
        var offsetStr = ""
        var limitStr = ""
        var sortStr = ""
        var applicationIdStr = ""
        var emailStr = ""
        var applicationNameStr = ""
        var firstNameStr = ""
        var lastNameStr = ""
        var applicationTypeStr = ""
        var createdAfterStr = ""
        var createdBeforeStr = ""
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

        if (applicationId !== null) {
            applicationIdStr += firstChar + 'application_id=' + applicationId
            firstChar = "&"
        }

        if (email !== null) {
            emailStr += firstChar + 'email=' + email
            firstChar = "&"
        }

        if (applicationName !== null) {
            applicationNameStr += firstChar + 'application_name=' + applicationName
            firstChar = "&"
        }

        if (firstName !== null) {
            firstNameStr += firstChar + 'first_name=' + firstName
            firstChar = "&"
        }

        if (lastName !== null) {
            lastNameStr += firstChar + 'last_name=' + lastName
            firstChar = "&"
        }

        if (applicationType !== null) {
            applicationTypeStr += firstChar + 'application_type=' + applicationType
            firstChar = "&"
        }

        if (createdAfter !== null) {
            createdAfterStr += firstChar + 'created_after=' + createdAfter
            firstChar = "&"
        }

        if (createdBefore !== null) {
            createdBeforeStr += firstChar + 'created_before=' + createdBefore
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/admin/application' + offsetStr + limitStr + sortStr + applicationIdStr + emailStr + applicationNameStr + firstNameStr + lastNameStr + applicationTypeStr + createdAfterStr + createdBeforeStr, true, true, that.autoRefreshToken).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var applications = []
                for (var i = 0; i < body.length; i++) {
                    applications.push(new Application(body[i].id, body[i].creation_time, body[i].application_type, body[i].email, body[i].application_name, body[i].first_name, body[i].last_name, body[i].default_job_callback_url, body[i].job_counts, body[i].dedicated_workers, body[i].dedicated_workers_ttl, body[i].api_key))
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
    * @param {Buffer|string} file - a model file. Can be a buffer or a path. The model inside the zip should have a valid name.
    * @param {string} description (optional) - a Model description
    * @param {integer} ttl (optional) - a ttl value in seconds
    * @param {string[]} tags (optional) - a list of tags
    * @param {boolean} allowAllApplications (optional) - if true, all applications are allowed to access the model
    * @param {string[]} allowedApplicationIds (optional) - a list of application ids allowed to access the model
    * @param {string} shortName (optiona) - a short name
    * @returns {Model}
    */

    adminAddModel(applicationId, name, file, description = null, ttl = null, tags = null, allowAllApplications = null, allowedApplicationIds = null, shortName = null) {
        var that = this
        var tagsStr = ""
        var allowedApplicationIdsStr = ""
        var firstChar = "&"
        for (var i = 0; tags && i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
        }

        for (var i = 0; allowedApplicationIds && i < allowedApplicationIds.length; i++) {
            allowedApplicationIdsStr += firstChar + 'allowed_application_ids=' + allowedApplicationIds[i]
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.streamPost(that.serverURL + '/admin/' + applicationId + '/model?name=' + name + (description ? '&description=' + description : '') 
            + (ttl !== null ? '&ttl=' + ttl : '') 
            + tagsStr + (allowAllApplications !== null ? '&allow_all_applications=' + allowAllApplications : '') 
            + allowedApplicationIdsStr
            + (shortName ? "&short_name=" + shortName : ''), file, true, that.autoRefreshToken).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.allow_all_applications, body.allowed_application_ids, body.application_id, body.short_name, body.documentation, body.output_format))
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
    * @param {string} defaultJobCallbackUrl (optional) - a default job callback url
    * @param {boolean} dedicatedWorkers (optional) - determine whether or not an Application has dedicated workers
    * @param {integer} dedicatedWorkersTtl (optional) - TTL for an Application
    * @returns {Application}
    */

    adminAddApplication(email, applicationName, applicationType, firstname, lastname, defaultJobCallbackUrl = null, dedicatedWorkers = null, dedicatedWorkersTtl = null) {
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
            if (dedicatedWorkers) {
                application['dedicated_workers'] = dedicatedWorkers
            }
            if (dedicatedWorkersTtl !== null) {
                application['dedicated_workers_ttl'] = dedicatedWorkersTtl
            }

            that.leiaAPIRequest.post(that.serverURL + '/admin/application', application, true, that.autoRefreshToken).then((body) => {
                resolve(new Application(body.id, body.creation_time, body.application_type, body.email, body.application_name, body.first_name, body.last_name, body.default_job_callback_url, body.job_counts, body.dedicated_workers, body.dedicated_workers_ttl, body.api_key))
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
                resolve(new Application(body.id, body.creation_time, body.application_type, body.email, body.application_name, body.first_name, body.last_name, body.default_job_callback_url, body.job_counts, body.dedicated_workers, body.dedicated_workers_ttl, body.api_key))
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
     * @param {boolean} allowAllApplications (optional) - if true, all applications are allowed to access the model
     * @param {string[]} allowedApplicationIds (optional) - a list of application ids allowed to access the model
     * @param {string} shortName (optional) - a short name
     * @returns {Model}
     */

    adminUpdateModel(applicationId, modelId, name = null, description = null, ttl = null, allowAllApplications = null, allowedApplicationIds = null, shortName = null) {
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

        if (allowAllApplications !== null) {
            query += firstChar + 'allow_all_applications=' + allowAllApplications
        }

        if (allowedApplicationIds !== null) {
            if (allowedApplicationIds.length === 0) {
                query += firstChar + 'allowed_application_ids='
            } else {
                for (var i = 0; i < allowedApplicationIds.length; i++) {
                    query += firstChar + 'allowed_application_ids=' + allowedApplicationIds[i]
                }
            }
            firstChar = "&"
        }

        if (shortName !== null) {
            query += firstChar + "short_name=" + shortName
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.patch(that.serverURL + '/admin/' + applicationId + '/model/' + modelId + query, {}, true, that.autoRefreshToken).then((body) => {
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.allow_all_applications, body.allowed_application_ids, body.application_id, body.short_name, body.documentation, body.output_format))
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
    * @param {integer} offset (optional) - list offset number for pagination
    * @param {integer} limit (optional) - max per page
    * @param {string[]} sort (optional) - a list of parameters 
    * Can be 'applicationId', 'creationTime', 'name', 'description', 'modelType'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param {string} applicationId (optional) - an Application id to filter models
    * @param {string} modelId (optional) - filter by Model id
    * @param {string[]} tags (optional) - a list of tags to filter models
    * @param {string} modelType (optional) - filter by modelType
    * @param {string} name (optional) - filter by name
    * @param {string} description (optional) - filter by description
    * @param {string[]} inputTypes (optional) - a list of inputTypes to filter models
    * @param {string} createdAfter (optional) - only return models created after a certain date (ISO 8601 format : yyyy-MM-ddThh:mm:ss)
    * @param {string} createdBefore (optional) - only return models created before a certain date (ISO 8601 format : yyyy-MM-ddThh:mm:ss)
    * @param {string} shortName (optional) - filter by shortName
    * @param {boolean} onlyMine (optional) - If true, only show application models 
    * @returns {object[]} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, models: [Model]}]
    */

    adminGetModels(offset = null, limit = null, sort = null, applicationId = null, modelId = null, tags = null, modelType = null, name = null, 
        description = null, inputTypes = null, createdAfter = null, createdBefore = null, shortName = null, onlyMine = null) {
        var offsetStr = ""
        var limitStr = ""
        var sortStr = ""
        var applicationIdStr = ""
        var modelIdStr = ""
        var tagsStr = ""
        var modelTypeStr = ""
        var nameStr = ""
        var descriptionStr = ""
        var inputTypesStr = ""
        var createdAfterStr = ""
        var createdBeforeStr = ""
        var shortNameStr = ""
        var onlyMineStr = ""
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

        if (applicationId !== null) {
            applicationIdStr = firstChar + "application_id=" + applicationId
            firstChar = "&"
        }

        if (modelId !== null) {
            modelIdStr = firstChar + "model_id=" + modelId
            firstChar = "&"
        }

        for (var i = 0; tags && i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
            firstChar = "&"
        }

        if (modelType !== null) {
            modelTypeStr += firstChar + 'model_type=' + modelType
            firstChar = "&"
        }

        if (name !== null) {
            nameStr += firstChar + 'name=' + name
            firstChar = "&"
        }

        if (description !== null) {
            descriptionStr += firstChar + 'description=' + description
            firstChar = "&"
        }

        for (var i = 0; inputTypes && i < inputTypes.length; i++) {
            inputTypesStr += firstChar + 'input_types=' + inputTypes[i]
            firstChar = "&"
        }

        if (createdAfter !== null) {
            createdAfterStr += firstChar + 'created_after=' + createdAfter
            firstChar = "&"
        }

        if (createdBefore !== null) {
            createdBeforeStr += firstChar + 'created_before=' + createdBefore
            firstChar = "&"
        }

        if (shortName !== null) {
            shortNameStr += firstChar + 'short_name=' + shortName
            firstChar = "&"
        }

        if (onlyMine !== null) {
            onlyMineStr += firstChar + 'only_mine=' + onlyMine.toString()
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/admin/model' + offsetStr + limitStr + sortStr + applicationIdStr + modelIdStr + tagsStr + 
               modelTypeStr + nameStr + descriptionStr + inputTypesStr + createdAfterStr + createdBeforeStr + shortNameStr + onlyMineStr, true, true, that.autoRefreshToken).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var models = []
                for (var i = 0; i < body.length; i++) {
                    models.push(new Model(body[i].id, body[i].creation_time, body[i].description, body[i].ttl, body[i].input_types, body[i].name, body[i].tags, body[i].model_type, body[i].allow_all_applications, body[i].allowed_application_ids, body[i].application_id, body[i].short_name, body[i].documentation, body[i].output_format))
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
    * @param {integer} offset (optional) - list offset number for pagination
    * @param {integer} limit (optional) - max per page
    * @param {string[]} sort (optional) - a list of parameters 
    * Can be 'applicationId', 'creationTime', 'name', 'description', 'modelType'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param {string} modelId (optional) - filter by Model id
    * @param {string[]} tags (optional) - a list of tags to filter models
    * @param {string} modelType (optional) - filter by modelType
    * @param {string} name (optional) - filter by name
    * @param {string} description (optional) - filter by description
    * @param {string[]} inputTypes (optional) - a list of inputTypes to filter models
    * @param {string} createdAfter (optional) - only return models created after a certain date (ISO 8601 format : yyyy-MM-ddThh:mm:ss)
    * @param {string} createdBefore (optional) - only return models created before a certain date (ISO 8601 format : yyyy-MM-ddThh:mm:ss)
    * @param {string} shortName (optional) - filter by shortName
    * @param {boolean} onlyMine (optional) - If true, only show application models 
    * @returns {object[]} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, models: [Model]}]
    */

    getModels(offset = null, limit = null, sort = null, modelId = null, tags = null, modelType = null, name = null, 
        description = null, inputTypes = null, createdAfter = null, createdBefore = null, shortName = null, onlyMine = null) {
        var offsetStr = ""
        var limitStr = ""
        var sortStr = ""
        var modelIdStr = ""
        var tagsStr = ""
        var modelTypeStr = ""
        var nameStr = ""
        var descriptionStr = ""
        var inputTypesStr = ""
        var createdAfterStr = ""
        var createdBeforeStr = ""
        var shortNameStr = ""
        var onlyMineStr = ""
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

        if (modelId !== null) {
            modelIdStr = firstChar + "model_id=" + modelId
            firstChar = "&"
        }

        for (var i = 0; tags && i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
            firstChar = "&"
        }

        if (modelType !== null) {
            modelTypeStr += firstChar + 'model_type=' + modelType
            firstChar = "&"
        }

        if (name !== null) {
            nameStr += firstChar + 'name=' + name
            firstChar = "&"
        }

        if (description !== null) {
            descriptionStr += firstChar + 'description=' + description
            firstChar = "&"
        }

        for (var i = 0; inputTypes && i < inputTypes.length; i++) {
            inputTypesStr += firstChar + 'input_types=' + inputTypes[i]
            firstChar = "&"
        }

        if (createdAfter !== null) {
            createdAfterStr += firstChar + 'created_after=' + createdAfter
            firstChar = "&"
        }

        if (createdBefore !== null) {
            createdBeforeStr += firstChar + 'created_before=' + createdBefore
            firstChar = "&"
        }

        if (shortName !== null) {
            shortNameStr += firstChar + 'short_name=' + shortName
            firstChar = "&"
        }

        if (onlyMine !== null) {
            onlyMineStr += firstChar + 'only_mine=' + onlyMine.toString()
            firstChar = "&"
        }
        
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/model' + offsetStr + limitStr + sortStr + modelIdStr + tagsStr + modelTypeStr + nameStr + descriptionStr + inputTypesStr + createdAfterStr + createdBeforeStr + shortNameStr + onlyMineStr, true, true, that.autoRefreshToken).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var models = []
                for (var i = 0; i < body.length; i++) {
                    models.push(new Model(body[i].id, body[i].creation_time, body[i].description, body[i].ttl, body[i].input_types, body[i].name, body[i].tags, body[i].model_type, body[i].allow_all_applications, body[i].allowed_application_ids, body[i].application_id, body[i].short_name, body[i].documentation, body[i].output_format))
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
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.allow_all_applications, body.allowed_application_ids, body.application_id, body.short_name, body.documentation, body.output_format))
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
            that.leiaAPIRequest.getFile(that.serverURL + '/admin/' + applicationId + '/model/' + modelId + '/file_contents', false, that.autoRefreshToken).then((body) => {
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
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.allow_all_applications, body.allowed_application_ids, body.application_id, body.short_name, body.documentation, body.output_format))
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
                resolve(new Application(body.id, body.creation_time, body.application_type, body.email, body.application_name, body.first_name, body.last_name, body.default_job_callback_url, body.job_counts, body.dedicated_workers, body.dedicated_workers_ttl, body.api_key))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Add a Document (admin)
    * @param {string} applicationId - an Application id
    * @param {string} fileName - a document file name
    * @param {Buffer|string} file - a document file. Can be a buffer or a path
    * @param {string[]} tags (optional) - a list of tags
    * @param {integer} ttl (optional) - a TTL in seconds
    * @returns {Document}
    */

    adminAddDocument(applicationId, fileName, file, tags = null, ttl = null) {
        var tagsStr = ""
        var ttlStr = ""
        var firstChar = "&"

        for (var i = 0; tags && i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
        }

        if (ttl !== null) {
            ttlStr += firstChar + 'ttl=' + ttl
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.streamPost(that.serverURL + '/admin/' + applicationId + '/document?filename=' + fileName + tagsStr + ttlStr, file, true, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size, body.expiration_time))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Add a Document
    * @param {string} fileName - a document file name
    * @param {Buffer|string} file - a document file. Can be a buffer or a path
    * @param {string[]} tags (optional) - a list of tags
    * @param {integer} ttl (optional) - a TTL in seconds
    * @returns {Document}
    */

    addDocument(fileName, file, tags = null, ttl = null) {
        var ttlStr = ""
        var tagsStr = ""
        var firstChar = "&"

        for (var i = 0; tags && i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
        }

        if (ttl !== null) {
            ttlStr += firstChar + 'ttl=' + ttl
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.streamPost(that.serverURL + '/document?filename=' + fileName + tagsStr + ttlStr, file, true, that.autoRefreshToken).then((body) => {
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size, body.expiration_time))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
       * (promise) Transform a list of Documents into images or text (admin)
       * @param {string} applicationId - an Application id
       * @param {string[]} documentIds - a list of Document ids
       * @param {string} outputType - an output type. 
       * @param {string} pageRange (optional) - Page range to process (ex: :5 = pages 1-5)
       * @param {string} inputTag (optional) - The tag of the documents to process. 
       * If inputTag is present, document_ids should contain a single value, 
       * and the documents processed will be those where originalId=documentIds[0] and that contain the specified tag
       * @param {string} outputTag (optional) - an output tag for the new documents
       * @param {string} executeAfterId (optional) - should be executed after a certain Job
       * @param {string} callbackUrl (optional) - callback url for when a job is finished
       * @returns {Job} a job with the processing info
       */

    adminTransformDocuments(applicationId, documentIds, outputType, pageRange = null, inputTag = null, outputTag = null, executeAfterId = null, callbackUrl = null) {
        var documentIdsString = documentIds.join(',')
        var pageRangeStr = ""
        var inputTagStr = ""
        var outputTagStr = ""
        var executeAfterIdStr = ""
        var callbackUrlStr = ""
        var firstChar = "?"

        if (pageRange !== null) {
            pageRangeStr = firstChar + 'page_range=' + pageRange
            firstChar = "&"
        }

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
            that.leiaAPIRequest.post(that.serverURL + '/admin/' + applicationId + '/document/' + documentIdsString + '/transform/' + outputType + pageRangeStr + inputTagStr + outputTagStr + executeAfterIdStr + callbackUrlStr, {}, true, that.autoRefreshToken).then((body) => {
                var result = body.result
                if (result !== null) {
                    if (body.result_type === 'document') {
                        result = new Document(body.result.id, body.result.creation_time, body.result.application_id, body.result.filename, body.result.extension, body.result.original_id, body.result.mime_type, body.result.rotation_angle, body.result.tags, body.result.size, body.expiration_time)
                    } else if (body.result_type === 'list[document]') {
                        result = []
                        for (var i = 0; i < body.result.length; i++) {
                            result.push(new Document(body.result[i].id, body.result[i].creation_time, body.result[i].application_id, body.result[i].filename, body.result[i].extension, body.result[i].original_id, body.result[i].mime_type, body.result[i].rotation_angle, body.result[i].tags, body.result[i].size, body.result[i].expiration_time))
                        }
                    }
                }
                resolve(new Job(body.id, body.creation_time, body.application_id, body.document_ids, body.starting_time, body.finished_time, body.http_code, body.job_type, body.model_id, result, body.result_type, body.status, body.parent_job_id, body.execute_after_id, body.submitter_id, body.ws_id, body.reason, body.page_range))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
     * (promise) Transform a list of Documents into images or text
     * @param {string[]} documentIds - a list of Document ids
     * @param {string} outputType - an output type. 
     * @param {string} pageRange (optional) - Page range to process (ex: :5 = pages 1-5)
     * @param {string} inputTag (optional) - The tag of the documents to process. 
     * If inputTag is present, document_ids should contain a single value, 
     * and the documents processed will be those where originalId=documentIds[0] and that contain the specified tag
     * @param {string} outputTag (optional) - an output tag for the new documents
     * @param {string} executeAfterId (optional) - should be executed after a certain Job
     * @param {string} callbackUrl (optional) - callback url for when a job is finished
     * @returns {Job} a job with the processing info
     */

    transformDocuments(documentIds, outputType, pageRange = null, inputTag = null, outputTag = null, executeAfterId = null, callbackUrl = null) {
        var documentIdsString = documentIds.join(',')
        var pageRangeStr = ""
        var inputTagStr = ""
        var outputTagStr = ""
        var executeAfterIdStr = ""
        var callbackUrlStr = ""
        var firstChar = "?"

        if (pageRange !== null) {
            pageRangeStr = firstChar + 'page_range=' + pageRange
            firstChar = "&"
        }

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
            that.leiaAPIRequest.post(that.serverURL + '/document/' + documentIdsString + '/transform/' + outputType + pageRangeStr + inputTagStr + outputTagStr + executeAfterIdStr + callbackUrlStr, {}, true, that.autoRefreshToken).then((body) => {
                var result = body.result
                if (result !== null) {
                    if (body.result_type === 'document') {
                        result = new Document(body.result.id, body.result.creation_time, body.result.application_id, body.result.filename, body.result.extension, body.result.original_id, body.result.mime_type, body.result.rotation_angle, body.result.tags, body.result.size, body.result.expiration_time)
                    } else if (body.result_type === 'list[document]') {
                        result = []
                        for (var i = 0; i < body.result.length; i++) {
                            result.push(new Document(body.result[i].id, body.result[i].creation_time, body.result[i].application_id, body.result[i].filename, body.result[i].extension, body.result[i].original_id, body.result[i].mime_type, body.result[i].rotation_angle, body.result[i].tags, body.result[i].size, body.result[i].expiration_time))
                        }
                    }
                }
                resolve(new Job(body.id, body.creation_time, body.application_id, body.document_ids, body.starting_time, body.finished_time, body.http_code, body.job_type, body.model_id, result, body.result_type, body.status, body.parent_job_id, body.execute_after_id, body.submitter_id, body.ws_id, body.reason, body.page_range))
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
    * @param {string} pageRange (optional) - Page range to process (ex: :5 = pages 1-5)
    * @param {string} executeAfterId (optional) - should be executed after a certain Job
    * @param {string} callbackUrl (optional) - callback url for when a job is finished
    * @param {object} modelParams (optional) - Additional model params (json)
    * @returns {Job} a job with the processing info
    */

    adminApplyModelToDocuments(applicationId, modelId, documentIds, tag = null, pageRange = null, executeAfterId = null, callbackUrl = null, modelParams = null) {
        var documentIdsString = documentIds.join(',')
        var tagStr = ""
        var pageRangeStr = ""
        var executeAfterIdStr = ""
        var callbackUrlStr = ""
        var firstChar = "?"

        if (tag !== null) {
            tagStr = firstChar + 'tag=' + tag
            firstChar = "&"
        }

        if (pageRange !== null) {
            pageRangeStr = firstChar + 'page_range=' + pageRange
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
            that.leiaAPIRequest.post(that.serverURL + '/admin/' + applicationId + '/model/' + modelId + '/apply/' + documentIdsString + tagStr + pageRangeStr + executeAfterIdStr + callbackUrlStr, modelParams ? modelParams : {}, true, that.autoRefreshToken).then((body) => {
                var result = body.result
                if (result !== null) {
                    if (body.result_type === 'document') {
                        result = new Document(body.result.id, body.result.creation_time, body.result.application_id, body.result.filename, body.result.extension, body.result.original_id, body.result.mime_type, body.result.rotation_angle, body.result.tags, body.result.size, body.result.expiration_time)
                    } else if (body.result_type === 'list[document]') {
                        result = []
                        for (var i = 0; i < body.result.length; i++) {
                            result.push(new Document(body.result[i].id, body.result[i].creation_time, body.result[i].application_id, body.result[i].filename, body.result[i].extension, body.result[i].original_id, body.result[i].mime_type, body.result[i].rotation_angle, body.result[i].tags, body.result[i].size, body.result[i].expiration_time))
                        }
                    }
                }
                resolve(new Job(body.id, body.creation_time, body.application_id, body.document_ids, body.starting_time, body.finished_time, body.http_code, body.job_type, body.model_id, result, body.result_type, body.status, body.parent_job_id, body.execute_after_id, body.submitter_id, body.ws_id, body.reason, body.page_range))
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
     * @param {string} pageRange (optional) - Page range to process (ex: :5 = pages 1-5)
     * @param {string} executeAfterId (optional) - should be executed after a certain Job
     * @param {string} callbackUrl (optional) - callback url for when a job is finished
     * @param {object} modelParams (optional) - Additional model params (json)
     * @returns {Job} a job with the processing info
     */

    applyModelToDocuments(modelId, documentIds, tag = null, pageRange = null, executeAfterId = null, callbackUrl = null, modelParams = null) {
        var documentIdsString = documentIds.join(',')
        var tagStr = ""
        var pageRangeStr = ""
        var executeAfterIdStr = ""
        var callbackUrlStr = ""
        var firstChar = "?"

        if (tag !== null) {
            tagStr = firstChar + 'tag=' + tag
            firstChar = "&"
        }

        if (pageRange !== null) {
            pageRangeStr = firstChar + 'page_range=' + pageRange
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
            that.leiaAPIRequest.post(that.serverURL + '/model/' + modelId + '/apply/' + documentIdsString + tagStr + pageRangeStr + executeAfterIdStr + callbackUrlStr, modelParams ? modelParams : {}, true, that.autoRefreshToken).then((body) => {
                var result = body.result
                if (result !== null) {
                    if (body.result_type === 'document') {
                        result = new Document(body.result.id, body.result.creation_time, body.result.application_id, body.result.filename, body.result.extension, body.result.original_id, body.result.mime_type, body.result.rotation_angle, body.result.tags, body.result.size, body.result.expiration_time)
                    } else if (body.result_type === 'list[document]') {
                        result = []
                        for (var i = 0; i < body.result.length; i++) {
                            result.push(new Document(body.result[i].id, body.result[i].creation_time, body.result[i].application_id, body.result[i].filename, body.result[i].extension, body.result[i].original_id, body.result[i].mime_type, body.result[i].rotation_angle, body.result[i].tags, body.result[i].size, body.result[i].expiration_time))
                        }
                    }
                }
                resolve(new Job(body.id, body.creation_time, body.application_id, body.document_ids, body.starting_time, body.finished_time, body.http_code, body.job_type, body.model_id, result, body.result_type, body.status, body.parent_job_id, body.execute_after_id, body.submitter_id, body.ws_id, body.reason, body.page_range))
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
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.allow_all_applications, body.allowed_application_ids, body.application_id, body.short_name, body.documentation, body.output_format))
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
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.allow_all_applications, body.allowed_application_ids, body.application_id, body.short_name, body.documentation, body.output_format))
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
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.allow_all_applications, body.allowed_application_ids, body.application_id, body.short_name, body.documentation, body.output_format))
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
                resolve(new Model(body.id, body.creation_time, body.description, body.ttl, body.input_types, body.name, body.tags, body.model_type, body.allow_all_applications, body.allowed_application_ids, body.application_id, body.short_name, body.documentation, body.output_format))
            }).catch((error) => {
                reject(error)
            })
        })
    }

    /**
    * (promise) Return a list of paginated Documents (admin)
    * @param {integer} offset (optional) - list offset number for pagination
    * @param {integer} limit (optional) - max per page
    * @param {string[]} sort (optional) - a list of parameters 
    * Can be 'applicationId', 'filename', 'extension', 'mimeType', 'originalId', 'page', 'creationTime'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param {string} applicationId (optional) - an Application id to filter documents
    * @param {string} tagResult (optional) - tag the fetched documents
    * @param {string} documentId (optional) - filter by id
    * @param {string[]} tags (optional) - an email address to filter documents
    * @param {string} filename (optional) - filter by filename
    * @param {string} extension (optional) - filter by extension
    * @param {string} mimeType (optional) - filter by MIME type
    * @param {string} originalId (optional) - filter by originalId
    * @param {string} createdAfter (optional) - only return documents created after a certain date (ISO 8601 format : yyyy-MM-ddThh:mm:ss)
    * @param {string} createdBefore (optional) - only return documents created before a certain date (ISO 8601 format : yyyy-MM-ddThh:mm:ss)
    * @returns {object[]} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, documents: [Document]}]
    */

    adminGetDocuments(offset = null, limit = null, sort = null, applicationId = null, tagResult = null, documentId = null, tags = null, filename = null, extension = null,
        mimeType = null, originalId = null, createdAfter = null, createdBefore = null) {
        var offsetStr = ""
        var limitStr = ""
        var sortStr = ""
        var applicationIdStr = ""
        var tagResultStr = ""
        var documentIdStr = ""
        var tagsStr = ""
        var filenameStr = ""
        var extensionStr = ""
        var mimeTypeStr = ""
        var originalIdStr = ""
        var createdAfterStr = ""
        var createdBeforeStr = ""
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

        if (applicationId !== null) {
            applicationIdStr = firstChar + "application_id=" + applicationId
            firstChar = "&"
        }

        if (tagResult !== null) {
            tagResultStr = firstChar + "tag_result=" + tagResult
            firstChar = "&"
        }

        if (documentId !== null) {
            documentIdStr = firstChar + "document_id=" + documentId
            firstChar = "&"
        }

        for (var i = 0; tags && i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
            firstChar = "&"
        }

        if (filename !== null) {
            filenameStr += firstChar + 'filename=' + filename
            firstChar = "&"
        }

        if (extension !== null) {
            extensionStr += firstChar + 'extension=' + extension
            firstChar = "&"
        }

        if (mimeType !== null) {
            mimeTypeStr += firstChar + 'mime_type=' + mimeType
            firstChar = "&"
        }

        if (originalId !== null) {
            originalIdStr += firstChar + 'original_id=' + originalId
            firstChar = "&"
        }

        if (createdAfter !== null) {
            createdAfterStr += firstChar + 'created_after=' + createdAfter
            firstChar = "&"
        }

        if (createdBefore !== null) {
            createdBeforeStr += firstChar + 'created_before=' + createdBefore
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/admin/document' + offsetStr + limitStr + sortStr + applicationIdStr + tagResultStr + documentIdStr + tagsStr + filenameStr + extensionStr + mimeTypeStr + originalIdStr + createdAfterStr + createdBeforeStr, true, true, that.autoRefreshToken).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var documents = []
                for (var i = 0; i < body.length; i++) {
                    documents.push(new Document(body[i].id, body[i].creation_time, body[i].application_id, body[i].filename, body[i].extension, body[i].original_id, body[i].mime_type, body[i].rotation_angle,
                        body[i].tags, body[i].size, body[i].expiration_time))
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
    * @param {integer} offset (optional) - list offset number for pagination
    * @param {integer} limit (optional) - max per page
    * @param {string[]} sort (optional) - a list of parameters 
    * Can be 'applicationId', 'filename', 'extension', 'mimeType', 'originalId', 'page', 'creationTime'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param {string} tagResult (optional) - tag the fetched documents
    * @param {string} documentId (optional) - filter by id
    * @param {string[]} tags (optional) - an email address to filter documents
    * @param {string} filename (optional) - filter by filename
    * @param {string} extension (optional) - filter by extension
    * @param {string} mimeType (optional) - filter by MIME type
    * @param {string} originalId (optional) - filter by originalId
    * @param {string} createdAfter (optional) - only return documents created after a certain date (ISO 8601 format : yyyy-MM-ddThh:mm:ss)
    * @param {string} createdBefore (optional) - only return documents created before a certain date (ISO 8601 format : yyyy-MM-ddThh:mm:ss)
    * @returns {object[]} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, documents: [Document]}]
    */

    getDocuments(offset = null, limit = null, sort = null, tagResult = null, documentId = null, tags = null, filename = null, extension = null,
        mimeType = null, originalId = null, createdAfter = null, createdBefore = null) {

        var offsetStr = ""
        var limitStr = ""
        var sortStr = ""
        var tagResultStr = ""
        var documentIdStr = ""
        var tagsStr = ""
        var filenameStr = ""
        var extensionStr = ""
        var mimeTypeStr = ""
        var originalIdStr = ""
        var createdAfterStr = ""
        var createdBeforeStr = ""
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

        if (tagResult !== null) {
            tagResultStr = firstChar + "tag_result=" + tagResult
            firstChar = "&"
        }

        if (documentId !== null) {
            documentIdStr = firstChar + "document_id=" + documentId
            firstChar = "&"
        }

        for (var i = 0; tags && i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
            firstChar = "&"
        }

        if (filename !== null) {
            filenameStr += firstChar + 'filename=' + filename
            firstChar = "&"
        }

        if (extension !== null) {
            extensionStr += firstChar + 'extension=' + extension
            firstChar = "&"
        }

        if (mimeType !== null) {
            mimeTypeStr += firstChar + 'mime_type=' + mimeType
            firstChar = "&"
        }

        if (originalId !== null) {
            originalIdStr += firstChar + 'original_id=' + originalId
            firstChar = "&"
        }

        if (createdAfter !== null) {
            createdAfterStr += firstChar + 'created_after=' + createdAfter
            firstChar = "&"
        }

        if (createdBefore !== null) {
            createdBeforeStr += firstChar + 'created_before=' + createdBefore
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }

            that.leiaAPIRequest.get(that.serverURL + '/document' + offsetStr + limitStr + sortStr + tagResultStr + documentIdStr + tagsStr +  
             filenameStr + extensionStr + mimeTypeStr + originalIdStr + createdAfterStr + createdBeforeStr, true, true, that.autoRefreshToken).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var documents = []
                for (var i = 0; i < body.length; i++) {
                    documents.push(new Document(body[i].id, body[i].creation_time, body[i].application_id, body[i].filename, body[i].extension, body[i].original_id, body[i].mime_type, body[i].rotation_angle,
                        body[i].tags, body[i].size, body[i].expiration_time))
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
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size, body.expiration_time))
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
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size, body.expiration_time))
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
            maxSizeStr = "?max_size=" + maxSize
        }
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.getFile(that.serverURL + '/admin/' + applicationId + '/document/' + documentId + '/file_contents' + maxSizeStr, false, that.autoRefreshToken).then((body) => {
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
            maxSizeStr = "?max_size=" + maxSize
        }
        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.getFile(that.serverURL + '/document/' + documentId + '/file_contents' + maxSizeStr, false, that.autoRefreshToken).then((body) => {
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
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size, body.expiration_time))
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
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size, body.expiration_time))
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
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size, body.expiration_time))
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
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size, body.expiration_time))
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
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size, body.expiration_time))
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
                resolve(new Document(body.id, body.creation_time, body.application_id, body.filename, body.extension, body.original_id, body.mime_type, body.rotation_angle, body.tags, body.size, body.expiration_time))
                resolve(document)
            }).catch((error) => {
                reject(error)
            })
        })
    }


    /**
    * (promise) Return a list of paginated Annotations
    * @param {integer} offset (optional) - list offset number for pagination
    * @param {integer} limit (optional) - max per page
    * @param {string} annotationId (optional) - filter by Annotation id
    * @param {string[]} tags (optional) - an email address to filter documents
    * @param {string} annotationType (optional) - a type of annotation (can be BOX, TYPING or TEXT so far)
    * @param {string} name (optional) - an Annotation name
    * @param {string} documentId (optional) - a Document id to filte    
    * @param {string} createdAfter (optional) - only return annotations created after a certain date (ISO 8601 format : yyyy-MM-ddThh:mm:ss)
    * @param {string} createdBefore (optional) - only return annotations created before a certain date (ISO 8601 format : yyyy-MM-ddThh:mm:ss)r annotations
    * @returns {Annotation} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, annotations: [Annotation]}]
    */

    getAnnotations(offset = null, limit = null, annotationId = null, tags = null, annotationType = null, name = null, documentId = null, createdAfter = null, createdBefore = null) {
        var offsetStr = ""
        var limitStr = ""
        var annotationIdStr = ""
        var tagsStr = ""
        var annotationTypeStr = ""
        var nameStr = ""
        var documentIdStr = ""
        var createdAfterStr = ""
        var createdBeforeStr = ""
        var firstChar = "?"

        if (offset !== null) {
            offsetStr += firstChar + 'offset=' + offset
            firstChar = "&"
        }

        if (limit !== null) {
            limitStr += firstChar + 'limit=' + limit
            firstChar = "&"
        }

        if (annotationId !== null) {
            annotationIdStr = firstChar + "annotation_id=" + annotationId
            firstChar = "&"
        }

        for (var i = 0; tags && i < tags.length; i++) {
            tagsStr += firstChar + 'tags=' + tags[i]
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

        if (documentId !== null) {
            documentIdStr = firstChar + "document_id=" + documentId
            firstChar = "&"
        }

        if (createdAfter !== null) {
            createdAfterStr += firstChar + 'created_after=' + createdAfter
            firstChar = "&"
        }

        if (createdBefore !== null) {
            createdBeforeStr += firstChar + 'created_before=' + createdBefore
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/annotation' + offsetStr + limitStr + annotationIdStr + tagsStr + annotationTypeStr + nameStr + documentIdStr + createdAfterStr + createdBeforeStr , true, true, that.autoRefreshToken).then((result) => {
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
    * @param {integer} offset - an offset for pagination
    * @param {integer} limit - a limit for pagination
    * @param {string[]} sort (optional) - a list of parameters 
    * Can be'submitterId', 'applicationId', 'creationTime', 'startingTime', 'finishedTime', 'jobType', 'modelId',
      'documentIds', 'status', 'parentJobId'. In ascending order by default.
    * If a parameter is preceded by '-' it means descending order.
    * @param {string} jobId (optional) - filter by Job id
    * @param {string} submitterId (optional) - a submitter id to filter
    * @param {string} applicationId (optional) - an Application id to filter
    * @param {string} jobType (optional) - a Job type (can be 'predict', 'pdf-images', 'image-text') to filter
    * @param {string} modelId (optional) - a Model id to filter
    * @param {string} documentId (optional) - a Document id to filter
    * @param {string} executeAfterId (optional) - a pre-Job id to filter
    * @param {string} parentJobId (optional) - a parent Job id to filter
    * @param {string} status (optional) - a status (can be WAITING, READY, STARTING, PROCESSED, PROCESSING, CANCELED, FAILED)
    * @param {string} createdAfter (optional) - only return jobs created after a certain date (ISO 8601 format : yyyy-MM-ddThh:mm:ss)
    * @param {string} createdBefore (optional) - only return jobs created before a certain date (ISO 8601 format : yyyy-MM-ddThh:mm:ss)r annotations
    * @returns {object[]} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, jobs: [Job]}]
    */

    adminGetJobs(offset = null, limit = null, sort = null, jobId = null, submitterId = null, applicationId = null,
         jobType = null, modelId = null, documentId = null, executeAfterId = null, parentJobId = null, 
         status = null, createdAfter = null, createdBefore = null) {
        var offsetStr = ""
        var limitStr = ""
        var sortStr = ""
        var jobIdStr = ""
        var submitterIdStr = ""
        var applicationIdStr = ""
        var jobTypeStr = ""
        var modelIdStr = ""
        var documentIdStr = ""
        var executeAfterIdStr = ""
        var parentJobIdStr = ""
        var statusStr = ""
        var createdAfterStr = ""
        var createdBeforeStr = ""
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

        if (jobId !== null) {
            jobIdStr += firstChar + 'job_id=' + jobId
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

        if (createdAfter !== null) {
            createdAfterStr += firstChar + 'created_after=' + createdAfter
            firstChar = "&"
        }

        if (createdBefore !== null) {
            createdBeforeStr += firstChar + 'created_before=' + createdBefore
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/admin/job' + offsetStr + limitStr + sortStr + jobIdStr + submitterIdStr + applicationIdStr 
            + jobTypeStr + modelIdStr + documentIdStr + executeAfterIdStr + parentJobIdStr + statusStr + createdAfterStr + createdBeforeStr, true, true, that.autoRefreshToken).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var jobs = []
                for (var i = 0; i < body.length; i++) {
                    var result = body[i].result
                    if (result !== null) {
                        if (body[i].result_type === 'document') {
                            result = new Document(body[i].result.id, body[i].result.creation_time, body[i].result.application_id, body[i].result.filename, body[i].result.extension, body[i].original_id, body[i].result.mime_type, body[i].result.rotation_angle, body[i].result.tags, body[i].result.size, body[i].expiration_time)
                        } else if (body[i].result_type === 'list[document]') {
                            result = []
                            for (var j = 0; j < body[i].result.length; j++) {
                                result.push(new Document(body[i].result[j].id, body[i].result[j].creation_time, body[i].result[j].application_id, body[i].result[j].filename, body[i].result[j].extension, body[i].result[j].original_id, body[i].result[j].mime_type, body[i].result[j].rotation_angle, body[i].result[j].tags, body[i].result[j].size, body[i].result[j].expiration_time))
                            }
                        }
                    }
                    jobs.push(new Job(body[i].id, body[i].creation_time, body[i].application_id, body[i].document_ids, body[i].starting_time, body[i].finished_time, body[i].http_code, body[i].job_type, body[i].model_id, result, body[i].result_type, body[i].status, body[i].parent_job_id, body[i].execute_after_id, body[i].submitter_id, body[i].ws_id, body[i].reason, body[i].page_range))
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
                        result = new Document(body.result.id, body.result.creation_time, body.result.application_id, body.result.filename, body.result.extension, body.result.original_id, body.result.mime_type, body.result.rotation_angle, body.result.tags, body.result.size, body.result.expiration_time)
                    } else if (body.result_type === 'list[document]') {
                        result = []
                        for (var i = 0; i < body.result.length; i++) {
                            result.push(new Document(body.result[i].id, body.result[i].creation_time, body.result[i].application_id, body.result[i].filename, body.result[i].extension, body.result[i].original_id, body.result[i].mime_type, body.result[i].rotation_angle, body.result[i].tags, body.result[i].size, body.result[i].expiration_time))
                        }
                    }
                }
                resolve(new Job(body.id, body.creation_time, body.application_id, body.document_ids, body.starting_time, body.finished_time, body.http_code, body.job_type, body.model_id, result, body.result_type, body.status, body.parent_job_id, body.execute_after_id, body.submitter_id, body.ws_id, body.reason, body.page_range))
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
     * @param {integer} offset - an offset for pagination
     * @param {integer} limit - a limit for pagination
     * @param {string[]} sort (optional) - a list of parameters 
     * Can be'submitterId', 'applicationId', 'creationTime', 'startingTime', 'finishedTime', 'jobType', 'modelId',
       'documentIds', 'status', 'parentJobId'. In ascending order by default.
     * If a parameter is preceded by '-' it means descending order.
     * @param {string} jobId (optional) - filter by Job id
     * @param {string} applicationId (optional) - an Application id to filter
     * @param {string} jobType (optional) - a Job type (can be 'predict', 'pdf-images', 'image-text') to filter
     * @param {string} modelId (optional) - a Model id to filter
     * @param {string} documentId (optional) - a Document id to filter
     * @param {string} executeAfterId (optional) - a pre-Job id to filter
     * @param {string} parentJobId (optional) - a parent Job id to filter
     * @param {string} status (optional) - a status (can be WAITING, READY, STARTING, PROCESSED, PROCESSING, CANCELED, FAILED)
     * @param {string} createdAfter (optional) - only return jobs created after a certain date (ISO 8601 format : yyyy-MM-ddThh:mm:ss)
     * @param {string} createdBefore (optional) - only return jobs created before a certain date (ISO 8601 format : yyyy-MM-ddThh:mm:ss)r annotations
     * @returns {object[]} a list of objects with the following format: [{contentRange: { offset: 0, limit: 10, total: 100 }, jobs: [Job]}]
     */

    getJobs(offset = null, limit = null, sort = null, jobId = null, applicationId = null,  jobType = null,
         modelId = null, documentId = null, executeAfterId = null, parentJobId = null, 
         status = null, createdAfter = null, createdBefore = null) {
        var offsetStr = ""
        var limitStr = ""
        var sortStr = ""
        var jobIdStr = ""
        var applicationIdStr = ""
        var jobTypeStr = ""
        var modelIdStr = ""
        var documentIdStr = ""
        var executeAfterIdStr = ""
        var parentJobIdStr = ""
        var statusStr = ""
        var createdAfterStr = ""
        var createdBeforeStr = ""
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

        if (jobId !== null) {
            jobIdStr += firstChar + 'job_id=' + jobId
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

        if (createdAfter !== null) {
            createdAfterStr += firstChar + 'created_after=' + createdAfter
            firstChar = "&"
        }

        if (createdBefore !== null) {
            createdBeforeStr += firstChar + 'created_before=' + createdBefore
            firstChar = "&"
        }

        var that = this
        return new Promise(function (resolve, reject) {
            if (!that.leiaAPIRequest) {
                var error = new Error('You have to login before you can use any other method')
                error.status = 401
                return reject(error)
            }
            that.leiaAPIRequest.get(that.serverURL + '/job' + offsetStr + limitStr + sortStr + jobIdStr + applicationIdStr + jobTypeStr + modelIdStr
             + documentIdStr + executeAfterIdStr + parentJobIdStr + statusStr + createdAfterStr + createdBeforeStr, true, true, that.autoRefreshToken).then((result) => {
                var body = result.body
                var contentRange = extractContentRangeInfo(result.contentRange)
                var jobs = []
                for (var i = 0; i < body.length; i++) {
                    var result = body[i].result
                    if (result !== null) {
                        if (body[i].result_type === 'document') {
                            result = new Document(body[i].result.id, body[i].result.creation_time, body[i].result.application_id, body[i].result.filename, body[i].result.extension, body[i].original_id, body[i].result.mime_type, body[i].result.rotation_angle, body[i].result.tags, body[i].result.size, body[i].result.expiration_time)
                        } else if (body[i].result_type === 'list[document]') {
                            result = []
                            for (var j = 0; j < body[i].result.length; j++) {
                                result.push(new Document(body[i].result[j].id, body[i].result[j].creation_time, body[i].result[j].application_id, body[i].result[j].filename, body[i].result[j].extension, body[i].result[j].original_id, body[i].result[j].mime_type, body[i].result[j].rotation_angle, body[i].result[j].tags, body[i].result[j].size, body[i].result[j].expiration_time))
                            }
                        }
                    }
                    jobs.push(new Job(body[i].id, body[i].creation_time, body[i].application_id, body[i].document_ids, body[i].starting_time, body[i].finished_time, body[i].http_code, body[i].job_type, body[i].model_id, result, body[i].result_type, body[i].status, body[i].parent_job_id, body[i].execute_after_id, body[i].submitter_id, body[i].ws_id, body[i].reason, body[i].page_range))
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
                        result = new Document(body.result.id, body.result.creation_time, body.result.application_id, body.result.filename, body.result.extension, body.result.original_id, body.result.mime_type, body.result.rotation_angle, body.result.tags, body.result.size, body.result.expiration_time)
                    } else if (body.result_type === 'list[document]') {
                        result = []
                        for (var i = 0; i < body.result.length; i++) {
                            result.push(new Document(body.result[i].id, body.result[i].creation_time, body.result[i].application_id, body.result[i].filename, body.result[i].extension, body.result[i].original_id, body.result[i].mime_type, body.result[i].rotation_angle, body.result[i].tags, body.result[i].size, body.result[i].expiration_time))
                        }
                    }
                }
                resolve(new Job(body.id, body.creation_time, body.application_id, body.document_ids, body.starting_time, body.finished_time, body.http_code, body.job_type, body.model_id, result, body.result_type, body.status, body.parent_job_id, body.execute_after_id, body.submitter_id, body.ws_id, body.reason, body.page_range))
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






