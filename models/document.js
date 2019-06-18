module.exports = class Document {
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