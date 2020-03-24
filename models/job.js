module.exports = class Job {
    /**
     * @param {string} id 
     * @param {string} creationTime - an ISO 8601 date
     * @param {string} applicationId
     * @param {string[]} documentIds 
     * @param {string} startingTime  - an ISO 8601 date
     * @param {string} finishedTime - an ISO 8601 date
     * @param {integer} httpCode 
     * @param {string} jobType 
     * @param {string} modelId 
     * @param {object} result 
     * @param {string} resultType
     * @param {integer} status
     * @param {string} parentJobId
     * @param {string} executeAfterId
     * @param {string} submitterId 
     * @param {string} wsId
     * @param {string} reason
     * @param {string} pageRange
     * @param {string} workerArn
     * @param {string} wsArn
     */
   constructor(id, creationTime, applicationId, documentIds, startingTime, finishedTime, httpCode, jobType, modelId, result, resultType, status, parentJobId, executeAfterId, submitterId, wsId, reason, pageRange, workerArn, wsArn) {
       this.id = id
       this.creationTime = creationTime
       this.applicationId = applicationId
       this.documentIds = documentIds
       this.startingTime = startingTime
       this.finishedTime = finishedTime
       this.httpCode = httpCode
       this.jobType = jobType
       this.modelId = modelId
       this.result = result
       this.resultType = resultType
       this.status = status
       this.parentJobId = parentJobId
       this.executeAfterId = executeAfterId
       this.submitterId = submitterId
       this.wsId = wsId
       this.reason = reason
       this.pageRange = pageRange
       this.workerArn = workerArn
       this.wsArn = wsArn
   }
}