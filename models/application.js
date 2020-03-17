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
     * @param {integer} dedicatedWorkersTtl
     * @param {object[]} alwaysOnSchedules
     * @param {string[]} alwaysOnWorkersModelIds
     * @param {string} apiKey 
     */
   constructor(id, creationTime, applicationType, email, applicationName, firstname, lastname, defaultJobCallbackUrl, jobCounts, dedicatedWorkers, dedicatedWorkersTtl, alwaysOnSchedules, alwaysOnWorkersModelIds, apiKey) {
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
       this.dedicatedWorkersTtl = dedicatedWorkersTtl
       this.alwaysOnSchedules = alwaysOnSchedules
       this.alwaysOnWorkersModelIds = alwaysOnWorkersModelIds
       this.apiKey = apiKey
   }
}