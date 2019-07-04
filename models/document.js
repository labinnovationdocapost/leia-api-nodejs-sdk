module.exports = class Document {

    /**
     * @param {string} id 
     * @param {string} creationTime - an ISO 8601 date
     * @param {string} applicationId 
     * @param {string} filename 
     * @param {string} extension 
     * @param {string} originalId
     * @param {string} mimeType 
     * @param {integer} rotationAngle 
     * @param {string[]} tags 
     * @param {integer} size
     */

    constructor(id, creationTime, applicationId, filename, extension, originalId, mimeType, rotationAngle, tags, size) {
        this.id = id
        this.creationTime = creationTime
        this.applicationId = applicationId
        this.filename = filename
        this.extension = extension
        this.originalId = originalId
        this.mimeType = mimeType
        this.rotationAngle = rotationAngle
        this.tags = tags
        this.size = size
    }
}