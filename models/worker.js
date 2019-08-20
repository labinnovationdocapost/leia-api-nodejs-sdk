module.exports = class Worker {
    /**
     * @param {string} jobType 
     * @param {number} number
     * @param {string[]} statuses 
     */
    constructor(jobType, number, statuses) {
        this.jobType = jobType
        this.number = number
        this.statuses = statuses
    }
}