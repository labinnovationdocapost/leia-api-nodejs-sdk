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
     * @param {string} applicationId 
     */
    constructor(id, creationTime, description, ttl, inputTypes, name, tags, modelType, applicationId) {
        this.id = id
        this.creationTime = creationTime
        this.description = description
        this.ttl = ttl
        this.inputTypes = inputTypes
        this.name = name
        this.tags = tags
        this.modelType = modelType
        this.applicationId = applicationId
    }
}