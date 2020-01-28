let chai = require('chai');
let chaiHttp = require('chai-http');
let nock = require('nock')
let LeiaAPI = require('../index')
chai.use(chaiHttp);
chai.should();

const serverURL = "https://test.com"

const transformPDFProcessedJob = {
    "application_id": "appId1",
    "creation_time": "2018-11-07T16:02:29.761Z",
    "document_ids": [
        "documentId1"
    ],
    "finished_time": "2018-11-07T16:02:39.761Z",
    "execute_after_id": "507f191e810c19729de860ed",
    "submitter_id": "submitterId1",
    "id": "id1",
    "job_type": "pdf-images",
    "result_type": "list[document]",
    "result": [{
        "application_id": "507f191e810c19729de860ea",
        "creation_time": "2018-11-07T16:02:29.761Z",
        "extension": "jpg",
        "filename": "mydoc",
        "id": "507f191e810c19729de860ea",
        "mime_type": "image/jpeg",
        "original_id": "607f191e810c19729de860ea",
        "page": 0,
        "rotation_angle": 0,
        "size": 1000000,
        "tags": ['tag1']
    }],
    "page_range": ":5",
    "starting_time": "2018-11-07T16:02:29.761Z",
    "status": "PROCESSED"
}


function mockJobAPI() {
    nock(serverURL)
        .get('/login/mockApiKey')
        .reply(200, { token: 'faketoken', application: { id: 'id1', application_type: 'admin' } });

    nock(serverURL)
        .get('/admin/job')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/job?offset=20')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/job?limit=20')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/job?sort=submitter_id')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/job?sort=submitterId')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/job?job_id=id1')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/job?submitter_id=submitterId1')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/job?application_id=appId1')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/job?job_type=pdf-images')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/job?model_id=modelId1')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/job?document_id=documentId1')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/job?execute_after_id=jobId1')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/job?parent_job_id=jobId1')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/job?status=PROCESSED')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/job?created_after=2018-10-10T10:10:10')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/job?created_before=2018-10-10T10:10:10')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/job?offset=20&limit=20&sort=submitter_id&job_id=id1&submitter_id=submitterId1&application_id=appId1&job_type=pdf-images&model_id=modelId1&document_id=documentId1&execute_after_id=jobId1&parent_job_id=jobId1&status=PROCESSED&created_after=2018-10-10T10:10:10&created_before=2018-10-10T10:10:10')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/job?limit=3')
        .reply(401, null);

    nock(serverURL)
        .get('/admin/job?limit=4')
        .reply(403, null);

    nock(serverURL)
        .get('/admin/job?limit=5')
        .reply(404, {}, { 'content-range': '0-0/0' });

    nock(serverURL)
        .get('/admin/job?limit=6')
        .reply(400, null);

    nock(serverURL)
        .get('/admin/submitterId1/job/id1')
        .reply(200, transformPDFProcessedJob);

    nock(serverURL)
        .get('/admin/submitterId1/job/id2')
        .reply(401, null);

    nock(serverURL)
        .get('/admin/submitterId1/job/id3')
        .reply(403, null);

    nock(serverURL)
        .get('/admin/submitterId1/job/id4')
        .reply(404, null);

    nock(serverURL)
        .delete('/admin/submitterId1/job/id1')
        .reply(204, null);

    nock(serverURL)
        .delete('/admin/submitterId1/job/id2')
        .reply(401, null);

    nock(serverURL)
        .delete('/admin/submitterId1/job/id3')
        .reply(403, null);

    nock(serverURL)
        .delete('/admin/submitterId1/job/id4')
        .reply(404, null);

    nock(serverURL)
        .get('/job')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/job?offset=20')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/job?limit=20')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/job?sort=submitter_id')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/job?job_id=id1')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });


    nock(serverURL)
        .get('/job?submitter_id=submitterId1')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/job?application_id=appId1')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/job?job_type=pdf-images')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/job?model_id=modelId1')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/job?document_id=documentId1')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/job?execute_after_id=jobId1')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/job?parent_job_id=jobId1')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/job?status=PROCESSED')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/job?created_after=2018-10-10T10:10:10')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/job?created_before=2018-10-10T10:10:10')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/job?offset=20&limit=20&sort=submitter_id&job_id=id1&application_id=appId1&job_type=pdf-images&model_id=modelId1&document_id=documentId1&execute_after_id=jobId1&parent_job_id=jobId1&status=PROCESSED&created_after=2018-10-10T10:10:10&created_before=2018-10-10T10:10:10')
        .reply(200, [transformPDFProcessedJob], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/job?limit=3')
        .reply(401, null);

    nock(serverURL)
        .get('/job?limit=4')
        .reply(403, null);

    nock(serverURL)
        .get('/job?limit=5')
        .reply(404, {}, { 'content-range': '0-0/0' });

    nock(serverURL)
        .get('/job?limit=6')
        .reply(400, null);

    nock(serverURL)
        .get('/job/id1')
        .reply(200, transformPDFProcessedJob);

    nock(serverURL)
        .get('/job/id2')
        .reply(401, null);

    nock(serverURL)
        .get('/job/id3')
        .reply(403, null);

    nock(serverURL)
        .get('/job/id4')
        .reply(404, null);

    nock(serverURL)
        .delete('/job/id1')
        .reply(204, null);

    nock(serverURL)
        .delete('/job/id2')
        .reply(401, null);

    nock(serverURL)
        .delete('/job/id3')
        .reply(403, null);

    nock(serverURL)
        .delete('/job/id4')
        .reply(404, null);

}

describe('LeIA Job API', () => {
    beforeEach((done) => {
        mockJobAPI()
        done()
    });

    describe('adminGetJobs()', () => {
        it('should return a list of jobs', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetJobs().then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetJobs(20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetJobs(null, 20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when sort is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetJobs(null, null, ['submitter_id']).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when jobId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetJobs(null, null, null, 'id1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when submitterId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetJobs(null, null, null, null, 'submitterId1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when applicationId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetJobs(null, null, null, null, null, 'appId1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when jobType is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetJobs(null, null, null, null, null, null, 'pdf-images').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when modelId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)

            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetJobs(null, null, null, null, null, null, null, 'modelId1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when documentId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetJobs(null, null, null, null, null, null, null, null, 'documentId1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when executeAfterId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetJobs(null, null, null, null, null, null, null, null, null, 'jobId1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when parentJobId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetJobs(null, null, null, null, null, null, null, null, null, null, 'jobId1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when status is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetJobs(null, null, null, null, null, null, null, null, null, null, null, 'PROCESSED').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when createdAfter is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetJobs(null, null, null, null, null, null, null, null, null, null, null, null, '2018-10-10T10:10:10').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when createdBefore is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetJobs(null, null, null, null, null, null, null, null, null, null, null, null, null, '2018-10-10T10:10:10').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when all parameters are provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetJobs(20, 20, ['submitter_id'], 'id1', 'submitterId1', 'appId1', 'pdf-images', 'modelId1', 'documentId1', 'jobId1', 'jobId1', 'PROCESSED', '2018-10-10T10:10:10', '2018-10-10T10:10:10').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetJobs(null, 3).then(() => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return 403 when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetJobs(null, 4).then(() => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        })

        it('should return an empty list when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetJobs(null, 5).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(0)
                    result.contentRange.total.should.be.eql(0)
                    result.jobs.length.should.be.eql(0)
                    done()
                })
            })
        })
    })

    describe('adminGetJob()', () => {
        it('should return a Job', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetJob('submitterId1', 'id1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformPDFProcessedJob.id)
                    result.creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.result.should.be.a('array');
                    result.result.length.should.be.eql(1)
                    result.result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.status.should.be.eql(transformPDFProcessedJob.status)
                    result.executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetJob('submitterId1', 'id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetJob('submitterId1', 'id3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetJob('submitterId1', 'id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('adminCancelJob()', () => {
        it('should call the right url', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminCancelJob('submitterId1', 'id1').then((_) => {
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminCancelJob('submitterId1', 'id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminCancelJob('submitterId1', 'id3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminCancelJob('submitterId1', 'id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('getJobs()', () => {
        it('should return a list of jobs', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getJobs().then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getJobs(20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs(null, 20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when sort is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs(null, null, ['submitter_id']).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when jobId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs(null, null, null, 'id1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when applicationId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs(null, null, null, null, 'appId1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when jobType is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs(null, null, null, null, null, 'pdf-images').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when modelId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)

            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getJobs(null, null, null, null, null, null, 'modelId1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when documentId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs(null, null, null, null, null, null, null, 'documentId1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when executeAfterId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs(null, null, null, null, null, null, null, null, 'jobId1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when parentJobId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs(null, null, null, null, null, null, null, null, null, 'jobId1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when status is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs(null, null, null, null, null, null, null, null, null, null, 'PROCESSED').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when createdAfter is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs(null, null, null, null, null, null, null, null, null, null, null, '2018-10-10T10:10:10').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when createdBefore is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs(null, null, null, null, null, null, null, null, null, null, null, null, '2018-10-10T10:10:10').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a list of jobs when all parameters are provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs(20, 20, ['submitter_id'], 'id1', 'appId1', 'pdf-images', 'modelId1', 'documentId1', 'jobId1', 'jobId1', 'PROCESSED', '2018-10-10T10:10:10', '2018-10-10T10:10:10').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.should.be.a('object');
                    result.jobs.should.be.a('array');
                    result.jobs[0].id.should.be.eql(transformPDFProcessedJob.id)
                    result.jobs[0].creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.jobs[0].applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.jobs[0].documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobs[0].jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.jobs[0].submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.jobs[0].resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.jobs[0].result.should.be.a('array');
                    result.jobs[0].result.length.should.be.eql(1)
                    result.jobs[0].result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.jobs[0].result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.jobs[0].result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.jobs[0].result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.jobs[0].result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.jobs[0].result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.jobs[0].result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.jobs[0].result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.jobs[0].pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getJobs(null, 3).then(() => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return 403 when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getJobs(null, 4).then(() => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        })

        it('should return an empty list when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getJobs(null, 5).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(0)
                    result.contentRange.total.should.be.eql(0)
                    result.jobs.length.should.be.eql(0)
                    done()
                })
            })
        })
    })

    describe('getJob()', () => {
        it('should return a Job', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getJob('id1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformPDFProcessedJob.id)
                    result.creationTime.should.be.eql(transformPDFProcessedJob.creation_time)
                    result.applicationId.should.be.eql(transformPDFProcessedJob.application_id)
                    result.documentIds.should.be.eql(transformPDFProcessedJob.document_ids)
                    result.jobType.should.be.eql(transformPDFProcessedJob.job_type)
                    result.submitterId.should.be.eql(transformPDFProcessedJob.submitter_id)
                    result.resultType.should.be.eql(transformPDFProcessedJob.result_type)
                    result.result.should.be.a('array');
                    result.result.length.should.be.eql(1)
                    result.result[0].id.should.be.eql(transformPDFProcessedJob.result[0].id)
                    result.result[0].creationTime.should.be.eql(transformPDFProcessedJob.result[0].creation_time)
                    result.result[0].filename.should.be.eql(transformPDFProcessedJob.result[0].filename)
                    result.result[0].extension.should.be.eql(transformPDFProcessedJob.result[0].extension)
                    result.result[0].rotationAngle.should.be.eql(transformPDFProcessedJob.result[0].rotation_angle)
                    result.result[0].applicationId.should.be.eql(transformPDFProcessedJob.result[0].application_id)
                    result.result[0].mimeType.should.be.eql(transformPDFProcessedJob.result[0].mime_type)
                    result.result[0].tags.should.be.eql(transformPDFProcessedJob.result[0].tags)
                    result.startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.status.should.be.eql(transformPDFProcessedJob.status)
                    result.executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    result.pageRange.should.be.eql(transformPDFProcessedJob.page_range)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getJob('id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getJob('id3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getJob('id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('cancelJob()', () => {
        it('should call the right url', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.cancelJob('id1').then((_) => {
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.cancelJob('id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.cancelJob('id3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.cancelJob('id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })
})
