class Annotation {
    /**
     * @param {string} id 
     * @param {string} creationTime - an ISO 8601 date
     * @param {string} annotationType 
     * @param {string} applicationId 
     * @param {string} documentId 
     * @param {string} name 
     * @param {object} prediction 
     * @param {string[]} tags 
     */
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