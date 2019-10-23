module.exports = class Application {
     /**
      * @param {string} id 
     *  @param {string} creationTime - an ISO 8601 date
      * @param {string} applicationType 
      * @param {string} email 
      * @param {string} applicationName 
      * @param {string} firstname 
      * @param {string} lastname 
      * @param {string} defaultJobCallbackUrl
      * @param {object} jobCounts
      * @param {boolean} dedicatedWorkers
      * @param {string} apiKey 
      */
    constructor(id, creationTime, applicationType, email, applicationName, firstname, lastname, defaultJobCallbackUrl, jobCounts, dedicatedWorkers, apiKey) {
        this.id = id
        this.creationTime = creationTime
        this.applicationType = applicationType
        this.email = email
        this.applicationName = applicationName
        this.firstname = firstname
        this.lastname = lastname
        this.defaultJobCallbackUrl = defaultJobCallbackUrl
        this.jobCounts = jobCounts
        this.dedicatedWorkers = dedicatedWorkers
        this.apiKey = apiKey
    }
}