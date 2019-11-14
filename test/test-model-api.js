let chai = require('chai');
let chaiHttp = require('chai-http');
let nock = require('nock')
let LeiaAPI = require('../index')
chai.use(chaiHttp);
chai.should();

const serverURL = "https://test.com"

const application = {
    "id": "id1",
    "creation_time": "dateTime",
    "application_name": "appName",
    "application_type": "admin",
    "email": "test@test.com",
    "first_name": "jean",
    "last_name": "test"
}

const model = {
    "id": 'id1',
    "allow_all_applications": false,
    "allowed_application_ids": [
        "507f191e810c19729de860ea",
        "507f191e810c19729de860eb"
    ],
    "creation_time": 'datetime',
    "description": 'description',
    "ttl": 5,
    "input_types": ['image'],
    "name": 'modelName',
    "tags": ['tag1', 'tag2'],
    "model_type": 'classification',
    "application_id": 'appid1'
}

const applyModelToDocumentProcessingJob = {
    "application_id": "appId1",
    "creation_time": "2018-11-07T16:02:29.761Z",
    "document_ids": [
        "documentId1"
    ],
    "execute_after_id": "507f191e810c19729de860ed",
    "id": "id1",
    "job_type": "predict",
    "submitter_id": "submitterId1",
    "starting_time": "2018-11-07T16:02:29.761Z",
    "status": "PROCESSING"
}

const transformPDFProcessedJob = {
    "application_id": "appId1",
    "creation_time": "2018-11-07T16:02:29.761Z",
    "document_ids": [
        "documentId1"
    ],
    "finished_time": "2018-11-07T16:02:39.761Z",
    "execute_after_id": "507f191e810c19729de860ed",
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
        "correct_angle": 0,
        "size": 1000000,
        "tags": ['tag1']
    }],
    "starting_time": "2018-11-07T16:02:29.761Z",
    "submitter_id": "submitterId1",
    "status": "PROCESSED"
}

function mockModelAPI() {
    nock(serverURL)
        .get('/login/mockApiKey')
        .reply(200, { token: 'faketoken', application: { id: 'id1', application_type: 'admin' } });

    nock(serverURL)
        .get('/login/mockApiKeyDev')
        .reply(200, { token: 'faketoken', application: { id: 'id1', application_type: 'developer' } });

    nock(serverURL)
        .get('/admin/model')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?offset=20')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?limit=20')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?sort=name,-description')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?application_id=appId1')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?model_id=id1')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?tags=tag1&tags=tag2')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?model_type=classification')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?name=modelName')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?description=description')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?input_types=image')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?created_after=2018-10-10T10:10:10')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?created_before=2018-10-10T10:10:10')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?offset=20&limit=20&sort=name,-description&application_id=appId1&model_id=id1&tags=tag1&tags=tag2&model_type=classification&name=modelName&description=description&input_types=image&created_after=2018-10-10T10:10:10&created_before=2018-10-10T10:10:10')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?limit=3')
        .reply(401, null);

    nock(serverURL)
        .get('/admin/model?limit=4')
        .reply(403, null);

    nock(serverURL)
        .get('/admin/model?limit=5')
        .reply(404, {}, { 'content-range': '0-0/0' });

    nock(serverURL)
        .get('/admin/model?limit=6')
        .reply(400, null);

    nock(serverURL)
        .get('/admin/' + application.id + '/model/id1')
        .reply(200, model);

    nock(serverURL)
        .get('/admin/' + application.id + '/model/id2')
        .reply(401, null);

    nock(serverURL)
        .get('/admin/' + application.id + '/model/id3')
        .reply(403, null);

    nock(serverURL)
        .get('/admin/' + application.id + '/model/id4')
        .reply(404, null);

    nock(serverURL)
        .get('/model')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?offset=20')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?limit=20')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?sort=name,-description')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?model_id=id1')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?tags=tag1&tags=tag2')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?model_type=classification')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?name=modelName')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?description=description')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?input_types=image')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?created_after=2018-10-10T10:10:10')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?created_before=2018-10-10T10:10:10')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?offset=20&limit=20&sort=name,-description&model_id=id1&tags=tag1&tags=tag2&model_type=classification&name=modelName&description=description&input_types=image&created_after=2018-10-10T10:10:10&created_before=2018-10-10T10:10:10')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?limit=3')
        .reply(401, null);

    nock(serverURL)
        .get('/model?limit=4')
        .reply(403, null);

    nock(serverURL)
        .get('/model?limit=5')
        .reply(404, {}, { 'content-range': '0-0/0' });

    nock(serverURL)
        .get('/model?limit=6')
        .reply(400, null);

    nock(serverURL)
        .get('/model/id1')
        .reply(200, model);

    nock(serverURL)
        .get('/model/id2')
        .reply(401, null);

    nock(serverURL)
        .get('/model/id3')
        .reply(403, null);

    nock(serverURL)
        .get('/model/id4')
        .reply(404, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/model?name=modelName&description=modelDescription&ttl=5&tags=tag1&tags=tag2&allow_all_applications=true&allowed_application_ids=id1&allowed_application_ids=id2')
        .reply(200, model);

    nock(serverURL)
        .post('/admin/' + application.id + '/model?name=modelName2&description=modelDescription&ttl=5&tags=tag1&tags=tag2&allow_all_applications=true&allowed_application_ids=id1&allowed_application_ids=id2')
        .reply(401, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/model?name=modelName3&description=modelDescription&ttl=5&tags=tag1&tags=tag2&allow_all_applications=true&allowed_application_ids=id1&allowed_application_ids=id2')
        .reply(409, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/model?name=modelName4&description=modelDescription&ttl=5&tags=tag1&tags=tag2&allow_all_applications=true&allowed_application_ids=id1&allowed_application_ids=id2')
        .reply(400, null);

    nock(serverURL)
        .patch('/admin/' + application.id + '/model/id1?name=modelName&description=modelDescription&ttl=5&allow_all_applications=true&allowed_application_ids=id1&allowed_application_ids=id2')
        .reply(200, model);

    nock(serverURL)
        .patch('/admin/' + application.id + '/model/id1?name=modelName&description=modelDescription&ttl=5&allow_all_applications=true&allowed_application_ids=')
        .reply(200, model);

    nock(serverURL)
        .patch('/admin/' + application.id + '/model/id1?name=modelName2&description=modelDescription&ttl=5&allow_all_applications=true&allowed_application_ids=id1&allowed_application_ids=id2')
        .reply(401, null);

    nock(serverURL)
        .patch('/admin/' + application.id + '/model/id1?name=modelName3&description=modelDescription&ttl=5&allow_all_applications=true&allowed_application_ids=id1&allowed_application_ids=id2')
        .reply(404, null);

    nock(serverURL)
        .patch('/admin/' + application.id + '/model/id1?name=modelName4&description=modelDescription&ttl=5&allow_all_applications=true&allowed_application_ids=id1&allowed_application_ids=id2')
        .reply(400, null);

    nock(serverURL)
        .delete('/admin/' + application.id + '/model/id1')
        .reply(204, null);

    nock(serverURL)
        .delete('/admin/' + application.id + '/model/id2')
        .reply(401, null);

    nock(serverURL)
        .delete('/admin/' + application.id + '/model/id3')
        .reply(403, null);

    nock(serverURL)
        .delete('/admin/' + application.id + '/model/id4')
        .reply(404, null);

    nock(serverURL)
        .get('/admin/' + application.id + '/model/id1?file_contents=true')
        .reply(200, Buffer.from([0xff, 0x11]))

    nock(serverURL)
        .get('/admin/' + application.id + '/model/id2?file_contents=true')
        .reply(401, null);

    nock(serverURL)
        .get('/admin/' + application.id + '/model/id3?file_contents=true')
        .reply(403, null);

    nock(serverURL)
        .get('/admin/' + application.id + '/model/id4?file_contents=true')
        .reply(404, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/model/modelId1/apply/documentId1')
        .reply(200, applyModelToDocumentProcessingJob);

    nock(serverURL)
        .post('/admin/' + application.id + '/model/modelId1/apply/documentId1?execute_after_id=jobId1')
        .reply(200, applyModelToDocumentProcessingJob);

    nock(serverURL)
        .post('/admin/' + application.id + '/model/modelId1/apply/documentId1?callback_url=https://test.com')
        .reply(200, applyModelToDocumentProcessingJob);

    nock(serverURL)
        .post('/model/modelId1/apply/documentId1')
        .reply(200, applyModelToDocumentProcessingJob);

    nock(serverURL)
        .post('/model/modelId1/apply/documentId1?execute_after_id=jobId1')
        .reply(200, applyModelToDocumentProcessingJob);

    nock(serverURL)
        .post('/model/modelId1/apply/documentId1?callback_url=https://test.com')
        .reply(200, applyModelToDocumentProcessingJob);

    nock(serverURL)
        .post('/admin/' + application.id + '/model/modelId1/apply/documentId2')
        .reply(400, null);

    nock(serverURL)
        .post('/model/modelId1/apply/documentId2')
        .reply(400, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/model/modelId1/apply/documentId3')
        .reply(401, null);

    nock(serverURL)
        .post('/model/modelId1/apply/documentId3')
        .reply(401, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/model/modelId1/apply/documentId4')
        .reply(403, null);

    nock(serverURL)
        .post('/model/modelId1/apply/documentId4')
        .reply(403, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/model/modelId1/apply/documentId5')
        .reply(404, null);

    nock(serverURL)
        .post('/model/modelId1/apply/documentId5')
        .reply(404, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/model/modelId1/apply/documentId1?tag=tag1')
        .reply(200, applyModelToDocumentProcessingJob);

    nock(serverURL)
        .post('/model/modelId1/apply/documentId1?tag=tag1')
        .reply(200, applyModelToDocumentProcessingJob);

    nock(serverURL)
        .post('/admin/' + application.id + '/model/modelId1/apply/documentId1?tag=tag1&execute_after_id=jobId1&callback_url=https://test.com')
        .reply(200, applyModelToDocumentProcessingJob);

    nock(serverURL)
        .post('/model/modelId1/apply/documentId1?tag=tag1&execute_after_id=jobId1&callback_url=https://test.com')
        .reply(200, applyModelToDocumentProcessingJob);

    nock(serverURL)
        .post('/model/modelId1/apply/documentId1?tag=tag1&execute_after_id=jobId1')
        .reply(200, applyModelToDocumentProcessingJob);

    nock(serverURL)
        .post('/admin/' + application.id + '/model/modelId1/tag/tag1')
        .reply(200, model);

    nock(serverURL)
        .post('/model/modelId1/tag/tag1')
        .reply(200, model);

    nock(serverURL)
        .post('/admin/' + application.id + '/model/modelId1/tag/tag2')
        .reply(401, null);

    nock(serverURL)
        .post('/model/modelId1/tag/tag2')
        .reply(401, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/model/modelId1/tag/tag3')
        .reply(403, null);

    nock(serverURL)
        .post('/model/modelId1/tag/tag3')
        .reply(403, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/model/modelId1/tag/tag4')
        .reply(404, null);

    nock(serverURL)
        .post('/model/modelId1/tag/tag4')
        .reply(404, null);

    nock(serverURL)
        .delete('/admin/' + application.id + '/model/modelId1/tag/tag1')
        .reply(200, model);

    nock(serverURL)
        .delete('/model/modelId1/tag/tag1')
        .reply(200, model);

    nock(serverURL)
        .delete('/admin/' + application.id + '/model/modelId1/tag/tag2')
        .reply(401, null);

    nock(serverURL)
        .delete('/model/modelId1/tag/tag2')
        .reply(401, null);

    nock(serverURL)
        .delete('/admin/' + application.id + '/model/modelId1/tag/tag3')
        .reply(403, null);

    nock(serverURL)
        .delete('/model/modelId1/tag/tag3')
        .reply(403, null);

    nock(serverURL)
        .delete('/admin/' + application.id + '/model/modelId1/tag/tag4')
        .reply(404, null);

    nock(serverURL)
        .delete('/model/modelId1/tag/tag4')
        .reply(404, null);

}

function mockJobAPI() {
    nock(serverURL)
        .get('/login/mockApiKey')
        .reply(200, { token: 'faketoken', application: { id: 'id1', application_type: 'admin' } });

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
        .get('/job?offset=20&limit=20&application_id=appId1&job_type=pdf-images&model_id=modelId1&document_id=documentId1&execute_after_id=jobId1&parent_job_id=jobId1&status=PROCESSED')
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


describe('LeIA Model API', () => {
    beforeEach((done) => {
        mockModelAPI()
        done()
    });

    describe('adminGetModels()', () => {
        it('should return a list of models', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels().then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels(20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels(null, 20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when sort is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels(null, null, ['name', '-description']).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when applicationId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels(null, null, null, 'appId1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when tags is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels(null, null, null, null, ['tag1', 'tag2']).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when modelType is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels(null, null, null, null, null, 'classification').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when name is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels(null, null, null, null, null, null, 'modelName').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when description is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels(null, null, null, null, null, null, null, 'description').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when inputTypes is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels(null, null, null, null, null, null, null, null, ['image']).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when createdAfter is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels(null, null, null, null, null, null, null, null, null, '2018-10-10T10:10:10').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when createdBefore is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels(null, null, null, null, null, null, null, null, null, null, '2018-10-10T10:10:10').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });


        it('should return a list of models when all parameters are provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels(20, 20, ['name', '-description'], 'appId1', ['tag1', 'tag2'], 'classification', 'modelName', 'description', ['image'], '2018-10-10T10:10:10', '2018-10-10T10:10:10').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetModels(null, 6).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetModels(null, 3).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return an empty list LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetModels(null, 5).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(0)
                    result.contentRange.total.should.be.eql(0)
                    result.models.length.should.be.eql(0)
                    done()
                })
            })
        });

    })

    describe('getModels()', () => {
        it('should return a list of models', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getModels().then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getModels(20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getModels(null, 20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when sort is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getModels(null, null, ['name', '-description']).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });


        it('should return a list of models when tags is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getModels(null, null, null, ['tag1', 'tag2']).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when modelType is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getModels(null, null, null, null, 'classification').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when name is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getModels(null, null, null, null, null, 'modelName').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when description is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getModels(null, null, null, null, null, null, 'description').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when inputTypes is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getModels(null, null, null, null, null, null, null, ['image']).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when createdAfter is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getModels(null, null, null, null, null, null, null, null, '2018-10-10T10:10:10').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a list of models when createdBefore is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getModels(null, null, null, null, null, null, null, null, null, '2018-10-10T10:10:10').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });


        it('should return a list of models when all parameters are provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getModels(20, 20, ['name', '-description'], ['tag1', 'tag2'], 'classification', 'modelName', 'description', ['image'], '2018-10-10T10:10:10', '2018-10-10T10:10:10').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.models.should.be.a('array');
                    result.models.length.should.be.eql(1)
                    result.models[0].id.should.be.eql(model.id)
                    result.models[0].creationTime.should.be.eql(model.creation_time)
                    result.models[0].name.should.be.eql(model.name)
                    result.models[0].description.should.be.eql(model.description)
                    result.models[0].modelType.should.be.eql(model.model_type)
                    result.models[0].applicationId.should.be.eql(model.application_id)
                    result.models[0].inputTypes.should.be.eql(model.input_types)
                    result.models[0].tags.should.be.eql(model.tags)
                    result.models[0].allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.models[0].allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getModels(null, 6).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getModels(null, 3).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return an empty list LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getModels(null, 5).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(0)
                    result.contentRange.total.should.be.eql(0)
                    result.models.length.should.be.eql(0)
                    done()
                })
            })
        });

    })

    describe('adminGetModel()', () => {
        it('should return a Model', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetModel(application.id, 'id1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(model.id)
                    result.creationTime.should.be.eql(model.creation_time)
                    result.name.should.be.eql(model.name)
                    result.description.should.be.eql(model.description)
                    result.modelType.should.be.eql(model.model_type)
                    result.applicationId.should.be.eql(model.application_id)
                    result.inputTypes.should.be.eql(model.input_types)
                    result.tags.should.be.eql(model.tags)
                    result.allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetModel(application.id, 'id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetModel(application.id, 'id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('adminGetModelContent()', () => {
        it('should return a Model content', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetModelContent(application.id, 'id1').then((result) => {
                    Buffer.isBuffer(result).should.be.true
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetModelContent(application.id, 'id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetModelContent(application.id, 'id3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetModelContent(application.id, 'id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('getModel()', () => {
        it('should return a Model', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getModel('id1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(model.id)
                    result.creationTime.should.be.eql(model.creation_time)
                    result.name.should.be.eql(model.name)
                    result.description.should.be.eql(model.description)
                    result.modelType.should.be.eql(model.model_type)
                    result.applicationId.should.be.eql(model.application_id)
                    result.inputTypes.should.be.eql(model.input_types)
                    result.tags.should.be.eql(model.tags)
                    result.allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getModel('id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getModel('id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('adminAddModel()', () => {
        it('should return a model', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddModel(application.id, 'modelName', Buffer.from([0xff, 0x11]), 'modelDescription', 5, ['tag1', 'tag2'], true, ['id1', 'id2']).then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(model.id)
                    result.creationTime.should.be.eql(model.creation_time)
                    result.name.should.be.eql(model.name)
                    result.description.should.be.eql(model.description)
                    result.modelType.should.be.eql(model.model_type)
                    result.applicationId.should.be.eql(model.application_id)
                    result.inputTypes.should.be.eql(model.input_types)
                    result.tags.should.be.eql(model.tags)
                    result.allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddModel(application.id, 'modelName4', Buffer.from([0xff, 0x11]), 'modelDescription', 5, ['tag1', 'tag2'], true, ['id1', 'id2']).then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddModel(application.id, 'modelName2', Buffer.from([0xff, 0x11]), 'modelDescription', 5, ['tag1', 'tag2'], true, ['id1', 'id2']).then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 409 status when LeiaAPI returns a 409 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddModel(application.id, 'modelName3', Buffer.from([0xff, 0x11]), 'modelDescription', 5, ['tag1', 'tag2'], true, ['id1', 'id2']).then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(409)
                    done()
                })
            })
        })

    })

    describe('adminUpdateModel()', () => {
        it('should return a model', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminUpdateModel(application.id, 'id1', 'modelName', 'modelDescription', 5, true, ['id1', 'id2']).then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(model.id)
                    result.creationTime.should.be.eql(model.creation_time)
                    result.name.should.be.eql(model.name)
                    result.description.should.be.eql(model.description)
                    result.modelType.should.be.eql(model.model_type)
                    result.applicationId.should.be.eql(model.application_id)
                    result.inputTypes.should.be.eql(model.input_types)
                    result.tags.should.be.eql(model.tags)
                    result.allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should handle empty allowApplicationIds', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminUpdateModel(application.id, 'id1', 'modelName', 'modelDescription', 5, true, []).then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(model.id)
                    result.creationTime.should.be.eql(model.creation_time)
                    result.name.should.be.eql(model.name)
                    result.description.should.be.eql(model.description)
                    result.modelType.should.be.eql(model.model_type)
                    result.applicationId.should.be.eql(model.application_id)
                    result.inputTypes.should.be.eql(model.input_types)
                    result.tags.should.be.eql(model.tags)
                    result.allowAllApplications.should.be.eql(model.allow_all_applications)
                    result.allowedApplicationIds.should.be.eql(model.allowed_application_ids)
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminUpdateModel(application.id, 'id1', 'modelName4', 'modelDescription', 5, true, ['id1', 'id2']).then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminUpdateModel(application.id, 'id1', 'modelName2', 'modelDescription', 5, true, ['id1', 'id2']).then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminUpdateModel(application.id, 'id1', 'modelName3', 'modelDescription', 5, true, ['id1', 'id2']).then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        })

    })


    describe('adminDeleteModel()', () => {
        it('should call the right url', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminDeleteModel(application.id, 'id1').then((_) => {
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminDeleteModel(application.id, 'id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminDeleteModel(application.id, 'id3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminDeleteModel(application.id, 'id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })


    describe('adminApplyModelToDocument()', () => {
        it('should return a prediction result object', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminApplyModelToDocuments(application.id, 'modelId1', ['documentId1']).then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(applyModelToDocumentProcessingJob.id)
                    result.creationTime.should.be.eql(applyModelToDocumentProcessingJob.creation_time)
                    result.applicationId.should.be.eql(applyModelToDocumentProcessingJob.application_id)
                    result.documentIds.should.be.eql(applyModelToDocumentProcessingJob.document_ids)
                    result.jobType.should.be.eql(applyModelToDocumentProcessingJob.job_type)
                    result.submitterId.should.be.eql(applyModelToDocumentProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(applyModelToDocumentProcessingJob.starting_time)
                    result.status.should.be.eql(applyModelToDocumentProcessingJob.status)
                    result.executeAfterId.should.be.eql(applyModelToDocumentProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a prediction result object when providing a tag', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminApplyModelToDocuments(application.id, 'modelId1', ['documentId1'], 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(applyModelToDocumentProcessingJob.id)
                    result.creationTime.should.be.eql(applyModelToDocumentProcessingJob.creation_time)
                    result.applicationId.should.be.eql(applyModelToDocumentProcessingJob.application_id)
                    result.documentIds.should.be.eql(applyModelToDocumentProcessingJob.document_ids)
                    result.jobType.should.be.eql(applyModelToDocumentProcessingJob.job_type)
                    result.submitterId.should.be.eql(applyModelToDocumentProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(applyModelToDocumentProcessingJob.starting_time)
                    result.status.should.be.eql(applyModelToDocumentProcessingJob.status)
                    result.executeAfterId.should.be.eql(applyModelToDocumentProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a prediction result object when providing an executeAfterId', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminApplyModelToDocuments(application.id, 'modelId1', ['documentId1'], null, 'jobId1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(applyModelToDocumentProcessingJob.id)
                    result.creationTime.should.be.eql(applyModelToDocumentProcessingJob.creation_time)
                    result.applicationId.should.be.eql(applyModelToDocumentProcessingJob.application_id)
                    result.documentIds.should.be.eql(applyModelToDocumentProcessingJob.document_ids)
                    result.jobType.should.be.eql(applyModelToDocumentProcessingJob.job_type)
                    result.submitterId.should.be.eql(applyModelToDocumentProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(applyModelToDocumentProcessingJob.starting_time)
                    result.status.should.be.eql(applyModelToDocumentProcessingJob.status)
                    result.executeAfterId.should.be.eql(applyModelToDocumentProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a prediction result object when providing a callback url', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminApplyModelToDocuments(application.id, 'modelId1', ['documentId1'], null, null, 'https://test.com').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(applyModelToDocumentProcessingJob.id)
                    result.creationTime.should.be.eql(applyModelToDocumentProcessingJob.creation_time)
                    result.applicationId.should.be.eql(applyModelToDocumentProcessingJob.application_id)
                    result.documentIds.should.be.eql(applyModelToDocumentProcessingJob.document_ids)
                    result.jobType.should.be.eql(applyModelToDocumentProcessingJob.job_type)
                    result.submitterId.should.be.eql(applyModelToDocumentProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(applyModelToDocumentProcessingJob.starting_time)
                    result.status.should.be.eql(applyModelToDocumentProcessingJob.status)
                    result.executeAfterId.should.be.eql(applyModelToDocumentProcessingJob.execute_after_id)
                    done()
                })
            })
        });


        it('should return a prediction result object when providing all parameters', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminApplyModelToDocuments(application.id, 'modelId1', ['documentId1'], 'tag1', 'jobId1', 'https://test.com').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(applyModelToDocumentProcessingJob.id)
                    result.creationTime.should.be.eql(applyModelToDocumentProcessingJob.creation_time)
                    result.applicationId.should.be.eql(applyModelToDocumentProcessingJob.application_id)
                    result.documentIds.should.be.eql(applyModelToDocumentProcessingJob.document_ids)
                    result.jobType.should.be.eql(applyModelToDocumentProcessingJob.job_type)
                    result.submitterId.should.be.eql(applyModelToDocumentProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(applyModelToDocumentProcessingJob.starting_time)
                    result.status.should.be.eql(applyModelToDocumentProcessingJob.status)
                    result.executeAfterId.should.be.eql(applyModelToDocumentProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminApplyModelToDocuments(application.id, 'modelId1', ['documentId2']).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        })

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminApplyModelToDocuments(application.id, 'modelId1', ['documentId3']).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminApplyModelToDocuments(application.id, 'modelId1', ['documentId4']).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminApplyModelToDocuments(application.id, 'modelId1', ['documentId5']).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })


    describe('applyModelToDocument()', () => {
        it('should return a prediction result object', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.applyModelToDocuments('modelId1', ['documentId1']).then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(applyModelToDocumentProcessingJob.id)
                    result.creationTime.should.be.eql(applyModelToDocumentProcessingJob.creation_time)
                    result.applicationId.should.be.eql(applyModelToDocumentProcessingJob.application_id)
                    result.documentIds.should.be.eql(applyModelToDocumentProcessingJob.document_ids)
                    result.jobType.should.be.eql(applyModelToDocumentProcessingJob.job_type)
                    result.submitterId.should.be.eql(applyModelToDocumentProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(applyModelToDocumentProcessingJob.starting_time)
                    result.status.should.be.eql(applyModelToDocumentProcessingJob.status)
                    result.executeAfterId.should.be.eql(applyModelToDocumentProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a prediction result object when providing a tag', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.applyModelToDocuments('modelId1', ['documentId1'], 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(applyModelToDocumentProcessingJob.id)
                    result.creationTime.should.be.eql(applyModelToDocumentProcessingJob.creation_time)
                    result.applicationId.should.be.eql(applyModelToDocumentProcessingJob.application_id)
                    result.documentIds.should.be.eql(applyModelToDocumentProcessingJob.document_ids)
                    result.jobType.should.be.eql(applyModelToDocumentProcessingJob.job_type)
                    result.submitterId.should.be.eql(applyModelToDocumentProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(applyModelToDocumentProcessingJob.starting_time)
                    result.status.should.be.eql(applyModelToDocumentProcessingJob.status)
                    result.executeAfterId.should.be.eql(applyModelToDocumentProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a prediction result object when providing an executeAfterId', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.applyModelToDocuments('modelId1', ['documentId1'], null, 'jobId1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(applyModelToDocumentProcessingJob.id)
                    result.creationTime.should.be.eql(applyModelToDocumentProcessingJob.creation_time)
                    result.applicationId.should.be.eql(applyModelToDocumentProcessingJob.application_id)
                    result.documentIds.should.be.eql(applyModelToDocumentProcessingJob.document_ids)
                    result.jobType.should.be.eql(applyModelToDocumentProcessingJob.job_type)
                    result.submitterId.should.be.eql(applyModelToDocumentProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(applyModelToDocumentProcessingJob.starting_time)
                    result.status.should.be.eql(applyModelToDocumentProcessingJob.status)
                    result.executeAfterId.should.be.eql(applyModelToDocumentProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a prediction result object when providing a callback url', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.applyModelToDocuments('modelId1', ['documentId1'], null, null, 'https://test.com').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(applyModelToDocumentProcessingJob.id)
                    result.creationTime.should.be.eql(applyModelToDocumentProcessingJob.creation_time)
                    result.applicationId.should.be.eql(applyModelToDocumentProcessingJob.application_id)
                    result.documentIds.should.be.eql(applyModelToDocumentProcessingJob.document_ids)
                    result.jobType.should.be.eql(applyModelToDocumentProcessingJob.job_type)
                    result.submitterId.should.be.eql(applyModelToDocumentProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(applyModelToDocumentProcessingJob.starting_time)
                    result.status.should.be.eql(applyModelToDocumentProcessingJob.status)
                    result.executeAfterId.should.be.eql(applyModelToDocumentProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a prediction result object when providing all parameters', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.applyModelToDocuments('modelId1', ['documentId1'], 'tag1', 'jobId1', 'https://test.com').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(applyModelToDocumentProcessingJob.id)
                    result.creationTime.should.be.eql(applyModelToDocumentProcessingJob.creation_time)
                    result.applicationId.should.be.eql(applyModelToDocumentProcessingJob.application_id)
                    result.documentIds.should.be.eql(applyModelToDocumentProcessingJob.document_ids)
                    result.jobType.should.be.eql(applyModelToDocumentProcessingJob.job_type)
                    result.submitterId.should.be.eql(applyModelToDocumentProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(applyModelToDocumentProcessingJob.starting_time)
                    result.status.should.be.eql(applyModelToDocumentProcessingJob.status)
                    result.executeAfterId.should.be.eql(applyModelToDocumentProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.applyModelToDocuments('modelId1', ['documentId2']).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        })

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.applyModelToDocuments('modelId1', ['documentId3']).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.applyModelToDocuments('modelId1', ['documentId4']).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.applyModelToDocuments('modelId1', ['documentId5']).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('adminAddTagToModel()', () => {
        it('should return a Model', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddTagToModel(application.id, 'modelId1', 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(model.id)
                    result.creationTime.should.be.eql(model.creation_time)
                    result.name.should.be.eql(model.name)
                    result.description.should.be.eql(model.description)
                    result.modelType.should.be.eql(model.model_type)
                    result.applicationId.should.be.eql(model.application_id)
                    result.inputTypes.should.be.eql(model.input_types)
                    result.tags.should.be.eql(model.tags)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddTagToModel(application.id, 'modelId1', 'tag2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddTagToModel(application.id, 'modelId1', 'tag3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddTagToModel(application.id, 'modelId1', 'tag4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('addTagToModel()', () => {
        it('should return a Model', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addTagToModel('modelId1', 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(model.id)
                    result.creationTime.should.be.eql(model.creation_time)
                    result.name.should.be.eql(model.name)
                    result.description.should.be.eql(model.description)
                    result.modelType.should.be.eql(model.model_type)
                    result.applicationId.should.be.eql(model.application_id)
                    result.inputTypes.should.be.eql(model.input_types)
                    result.tags.should.be.eql(model.tags)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addTagToModel('modelId1', 'tag2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addTagToModel('modelId1', 'tag3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addTagToModel('modelId1', 'tag4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('adminRemoveTagFromModel()', () => {
        it('should return a Model', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminRemoveTagFromModel(application.id, 'modelId1', 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(model.id)
                    result.creationTime.should.be.eql(model.creation_time)
                    result.name.should.be.eql(model.name)
                    result.description.should.be.eql(model.description)
                    result.modelType.should.be.eql(model.model_type)
                    result.applicationId.should.be.eql(model.application_id)
                    result.inputTypes.should.be.eql(model.input_types)
                    result.tags.should.be.eql(model.tags)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminRemoveTagFromModel(application.id, 'modelId1', 'tag2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminRemoveTagFromModel(application.id, 'modelId1', 'tag3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminRemoveTagFromModel(application.id, 'modelId1', 'tag4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('removeTagFromModel()', () => {
        it('should return a Model', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.removeTagFromModel('modelId1', 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(model.id)
                    result.creationTime.should.be.eql(model.creation_time)
                    result.name.should.be.eql(model.name)
                    result.description.should.be.eql(model.description)
                    result.modelType.should.be.eql(model.model_type)
                    result.applicationId.should.be.eql(model.application_id)
                    result.inputTypes.should.be.eql(model.input_types)
                    result.tags.should.be.eql(model.tags)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.removeTagFromModel('modelId1', 'tag2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.removeTagFromModel('modelId1', 'tag3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.removeTagFromModel('modelId1', 'tag4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })
})
