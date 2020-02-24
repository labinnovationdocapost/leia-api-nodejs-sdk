module.exports = class Model {
    /**
     * 
     * @param {string} id 
     * @param {string} creationTime - an ISO 8601 date
     * @param {string} description 
     * @param {integer} ttl 
     * @param {string[]} inputTypes 
     * @param {string} name 
     * @param {string[]} tags 
     * @param {string} modelType 
     * @param {boolean} allowAllApplications
     * @param {string[]} allowedApplicationIds
     * @param {string} applicationId 
     * @param {string} shortName
     * @param {string} documentation
     * @param {object} outputFormat
     */
    constructor(id, creationTime, description, ttl, inputTypes, name, tags, modelType, allowAllApplications, allowedApplicationIds, applicationId, shortName, documentation, outputFormat) {
        this.id = id
        this.creationTime = creationTime
        this.description = description
        this.ttl = ttl
        this.inputTypes = inputTypes
        this.name = name
        this.tags = tags
        this.modelType = modelType
        this.allowAllApplications = allowAllApplications
        this.allowedApplicationIds = allowedApplicationIds
        this.applicationId = applicationId
        this.shortName = shortName
        this.documentation = documentation
        this.outputFormat = outputFormat
    }
}