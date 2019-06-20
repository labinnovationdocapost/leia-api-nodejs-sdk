module.exports = class Application {
    constructor(id, creationTime, annotationType, applicationId, documentId, name, prediction, tags) {
        this.id = id
        this.creationTime = creationTime
        this.annotationType = annotationType
        this.applicationId = applicationId
        this.documentId = documentId
        this.name = name
        this.prediction = prediction
        this.tags = tags
    }
}