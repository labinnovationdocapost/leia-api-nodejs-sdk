module.exports = class Document {

    /**
     * @param {string} id 
     * @param {string} creationTime - an ISO 8601 date
     * @param {string} applicationId 
     * @param {string} filename 
     * @param {string} extension 
     * @param {string} mimeType 
     * @param {integer} correctAngle 
     * @param {string[]} tags 
     */

    constructor(id, creationTime, applicationId, filename, extension, mimeType, correctAngle, tags) {
        this.id = id
        this.creationTime = creationTime
        this.applicationId = applicationId
        this.filename = filename
        this.extension = extension
        this.mimeType = mimeType
        this.correctAngle = correctAngle
        this.tags = tags
    }
}