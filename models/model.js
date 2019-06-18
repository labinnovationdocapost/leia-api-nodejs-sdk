module.exports = class Model {
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