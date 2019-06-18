module.exports = class Application {
    constructor(id, creationTime, applicationType, email, applicationName, firstname, lastname, apiKey) {
        this.id = id
        this.creationTime = creationTime
        this.applicationType = applicationType
        this.email = email
        this.applicationName = applicationName
        this.firstname = firstname
        this.lastname = lastname
        this.apiKey = apiKey
    }
}