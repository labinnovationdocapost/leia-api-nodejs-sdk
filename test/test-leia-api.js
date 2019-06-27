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
    "creation_time": 'datetime',
    "description": 'description',
    "ttl": 5,
    "input_types": ['image'],
    "name": 'modelName',
    "tags": ['tag1', 'tag2'],
    "model_type": 'classification',
    "application_id": 'appid1'
}

const document = {
    "id": 'id1',
    "creation_time": 'datetime',
    "tags": ['tag1', 'tag2'],
    "application_id": 'appid1',
    "filename": 'file1',
    "extension": '.jpg',
    "mime_type": 'jpg',
    "correct_angle": 0
}

const annotation = {
    "id": "id1",
    "creation_time": 'datetime',
    "annotation_type": 'BOX',
    "application_id": "appId1",
    "document_id": 'documentId1',
    "name": "test",
    "prediction": { category: "TEST" },
    "tags": [
        "tag1",
        "tag2"
    ]
}

const transformPDFProcessingJob = {
    "application_id": "appId1",
    "creation_time": "2018-11-07T16:02:29.761Z",
    "document_ids": [
        "documentId1"
    ],
    "execute_after_id": "507f191e810c19729de860ed",
    "id": "id1",
    "job_type": "pdf-images",
    "starting_time": "2018-11-07T16:02:29.761Z",
    "status": "PROCESSING"
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
        "size": 1000000
    }],
    "starting_time": "2018-11-07T16:02:29.761Z",
    "status": "PROCESSED"
}

const predictionResult = {
    "classification": "test"
}

function mockApplicationAPI() {
    nock(serverURL)
        .get('/login/mockApiKey')
        .reply(200, { token: 'faketoken', application });

    nock(serverURL)
        .get('/login/mockApiKeyDev')
        .reply(200, { token: 'faketoken', application: { id: 'id1', application_type: 'developer' } });

    nock(serverURL)
        .get('/login/badApiKey')
        .reply(403, null);

    nock(serverURL)
        .get('/logout')
        .reply(200, null);

    nock(serverURL)
        .get('/admin/application')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?email=test@test.com')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?page=0&limit=2&application_name=commonAppName')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?page=0&limit=2&application_name=commonAppName')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?offset=0')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?limit=2')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?offset=20')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?limit=20')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?email=test@test.com')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?application_name=appName')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?sort=application_name,-email')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?offset=20&limit=20&email=test@test.com&application_name=appName&sort=application_name,-email')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?limit=3')
        .reply(401, null);

    nock(serverURL)
        .get('/admin/application?limit=4')
        .reply(403, null);

    nock(serverURL)
        .get('/admin/application?limit=5')
        .reply(404, {}, { 'content-range': '0-0/0' });

    nock(serverURL)
        .get('/admin/application?limit=6')
        .reply(400, null);

    nock(serverURL)
        .get('/admin/application/id1')
        .reply(200, application);

    nock(serverURL)
        .get('/admin/application/id2')
        .reply(401, null);

    nock(serverURL)
        .get('/admin/application/id3')
        .reply(403, null);

    nock(serverURL)
        .get('/admin/application/id4')
        .reply(404, null);

    nock(serverURL)
        .post('/admin/application/id1/reset_api_key')
        .reply(200, application);

    nock(serverURL)
        .post('/admin/application/id2/reset_api_key')
        .reply(401, null);

    nock(serverURL)
        .post('/admin/application/id3/reset_api_key')
        .reply(403, null);

    nock(serverURL)
        .post('/admin/application/id4/reset_api_key')
        .reply(404, null);

    nock(serverURL)
        .post('/admin/application/id5/reset_api_key')
        .reply(400, null);

    nock(serverURL)
        .post('/admin/application', { application_name: 'appName', application_type: 'admin', email: 'test@test.com', first_name: 'jean', 'last_name': 'test' })
        .reply(200, application);

    nock(serverURL)
        .post('/admin/application', { application_name: 'appName2', application_type: 'admin', email: 'test@test.com', first_name: 'jean', 'last_name': 'test' })
        .reply(401, application);

    nock(serverURL)
        .post('/admin/application', { application_name: 'appName3', application_type: 'admin', email: 'test@test.com', first_name: 'jean', 'last_name': 'test' })
        .reply(409, application);

    nock(serverURL)
        .post('/admin/application', { application_name: 'appName4', application_type: 'admin', email: 'test@test.com', first_name: 'jean', 'last_name': 'test' })
        .reply(400, application);

    nock(serverURL)
        .delete('/admin/application/id1')
        .reply(204, null);

    nock(serverURL)
        .delete('/admin/application/id2')
        .reply(401, null);

    nock(serverURL)
        .delete('/admin/application/id3')
        .reply(403, null);

    nock(serverURL)
        .delete('/admin/application/id4')
        .reply(404, null);

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
        .get('/admin/model?email=test@test.com')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?page=0&limit=2&application_name=commonAppName')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?page=0&limit=2&application_name=commonAppName')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?offset=20')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?limit=20')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?tags=tag1&tags=tag2')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?application_id=appId1')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?sort=name,-description')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/model?offset=20&limit=20&tags=tag1&tags=tag2&application_id=appId1&sort=name,-description')
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
        .get('/admin/model/id1')
        .reply(200, model);

    nock(serverURL)
        .get('/admin/model/id2')
        .reply(401, null);

    nock(serverURL)
        .get('/admin/model/id3')
        .reply(403, null);

    nock(serverURL)
        .get('/admin/model/id4')
        .reply(404, null);

    nock(serverURL)
        .get('/model')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?email=test@test.com')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?page=0&limit=2&application_name=commonAppName')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?page=0&limit=2&application_name=commonAppName')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?offset=20')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?limit=20')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?tags=tag1&tags=tag2')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?sort=name,-description')
        .reply(200, [model], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/model?offset=20&limit=20&tags=tag1&tags=tag2&sort=name,-description')
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
        .post('/admin/' + application.id + '/model?name=modelName&description=modelDescription&ttl=5&tags=tag1&tags=tag2')
        .reply(200, model);

    nock(serverURL)
        .post('/admin/' + application.id + '/model?name=modelName2&description=modelDescription&ttl=5&tags=tag1&tags=tag2')
        .reply(401, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/model?name=modelName3&description=modelDescription&ttl=5&tags=tag1&tags=tag2')
        .reply(409, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/model?name=modelName4&description=modelDescription&ttl=5&tags=tag1&tags=tag2')
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
        .get('/admin/' + application.id + '/model/modelId1/apply/documentId1')
        .reply(200, applyModelToDocumentProcessingJob);

    nock(serverURL)
        .get('/model/modelId1/apply/documentId1')
        .reply(200, applyModelToDocumentProcessingJob);

    nock(serverURL)
        .get('/admin/' + application.id + '/model/modelId1/apply/documentId2')
        .reply(400, null);

    nock(serverURL)
        .get('/model/modelId1/apply/documentId2')
        .reply(400, null);

    nock(serverURL)
        .get('/admin/' + application.id + '/model/modelId1/apply/documentId3')
        .reply(401, null);

    nock(serverURL)
        .get('/model/modelId1/apply/documentId3')
        .reply(401, null);

    nock(serverURL)
        .get('/admin/' + application.id + '/model/modelId1/apply/documentId4')
        .reply(403, null);

    nock(serverURL)
        .get('/model/modelId1/apply/documentId4')
        .reply(403, null);

    nock(serverURL)
        .get('/admin/' + application.id + '/model/modelId1/apply/documentId5')
        .reply(404, null);

    nock(serverURL)
        .get('/model/modelId1/apply/documentId5')
        .reply(404, null);

    nock(serverURL)
        .get('/admin/' + application.id + '/model/modelId1/apply/documentId1?tag=tag1')
        .reply(200, applyModelToDocumentProcessingJob);

    nock(serverURL)
        .get('/model/modelId1/apply/documentId1?tag=tag1')
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

function mockDocumentAPI() {
    nock(serverURL)
        .get('/login/mockApiKey')
        .reply(200, { token: 'faketoken', application: { id: 'id1', application_type: 'admin' } });

    nock(serverURL)
        .get('/login/mockApiKeyDev')
        .reply(200, { token: 'faketoken', application: { id: 'id1', application_type: 'developer' } });

    nock(serverURL)
        .get('/admin/document')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/document?offset=20')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/document?limit=20')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/document?tags=tag1&tags=tag2')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/document?application_id=appId1')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/document?sort=filename,-extension')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/document?offset=20&limit=20&tags=tag1&tags=tag2&application_id=appId1&sort=filename,-extension')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/document?limit=3')
        .reply(401, null);

    nock(serverURL)
        .get('/admin/document?limit=4')
        .reply(403, null);

    nock(serverURL)
        .get('/admin/document?limit=5')
        .reply(404, {}, { 'content-range': '0-0/0' });

    nock(serverURL)
        .get('/admin/document?limit=6')
        .reply(400, null);

    nock(serverURL)
        .get('/admin/document/id1')
        .reply(200, document);

    nock(serverURL)
        .get('/admin/document/id2')
        .reply(401, null);

    nock(serverURL)
        .get('/admin/document/id3')
        .reply(403, null);

    nock(serverURL)
        .get('/admin/document/id4')
        .reply(404, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/document/id1/transform/image')
        .reply(200, transformPDFProcessingJob);

    nock(serverURL)
        .post('/admin/' + application.id + '/document/id1/transform/image?input_tag=tag1')
        .reply(200, transformPDFProcessingJob);

    nock(serverURL)
        .post('/admin/' + application.id + '/document/id1/transform/image?input_tag=tag1&output_tag=tag1')
        .reply(200, transformPDFProcessingJob);

    nock(serverURL)
        .post('/admin/' + application.id + '/document/id1/transform/image?output_tag=tag1')
        .reply(200, transformPDFProcessingJob);

    nock(serverURL)
        .post('/admin/' + application.id + '/document/id2/transform/image?output_tag=tag2')
        .reply(401, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/document/id3/transform/image?output_tag=tag3')
        .reply(403, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/document/id4/transform/image?output_tag=tag4')
        .reply(404, null);

    nock(serverURL)
        .get('/document')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/document?offset=20')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/document?limit=20')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/document?tags=tag1&tags=tag2')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/document?sort=filename,-extension')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/document?offset=20&limit=20&tags=tag1&tags=tag2&sort=filename,-extension')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/document?limit=3')
        .reply(401, null);

    nock(serverURL)
        .get('/document?limit=4')
        .reply(403, null);

    nock(serverURL)
        .get('/document?limit=5')
        .reply(404, {}, { 'content-range': '0-0/0' });

    nock(serverURL)
        .get('/document?limit=6')
        .reply(400, null);

    nock(serverURL)
        .get('/document/id1')
        .reply(200, document);

    nock(serverURL)
        .get('/document/id2')
        .reply(401, null);

    nock(serverURL)
        .get('/document/id3')
        .reply(403, null);

    nock(serverURL)
        .get('/document/id4')
        .reply(404, null);

    nock(serverURL)
        .post('/document/id1/transform/image')
        .reply(200, transformPDFProcessingJob);

    nock(serverURL)
        .post('/document/id1/transform/image?input_tag=tag1')
        .reply(200, transformPDFProcessingJob);

    nock(serverURL)
        .post('/document/id1/transform/image?output_tag=tag1')
        .reply(200, transformPDFProcessingJob);

    nock(serverURL)
        .post('/document/id2/transform/image?output_tag=tag2')
        .reply(401, null);

    nock(serverURL)
        .post('/document/id3/transform/image?output_tag=tag3')
        .reply(403, null);

    nock(serverURL)
        .post('/document/id4/transform/image?output_tag=tag4')
        .reply(404, null);

    nock(serverURL)
        .delete('/admin/' + application.id + '/document/id1')
        .reply(204, null);

    nock(serverURL)
        .delete('/admin/' + application.id + '/document/id2')
        .reply(401, null);

    nock(serverURL)
        .delete('/admin/' + application.id + '/document/id3')
        .reply(403, null);

    nock(serverURL)
        .delete('/admin/' + application.id + '/document/id4')
        .reply(404, null);

    nock(serverURL)
        .delete('/document/id1')
        .reply(204, null);

    nock(serverURL)
        .delete('/document/id2')
        .reply(401, null);

    nock(serverURL)
        .delete('/document/id3')
        .reply(403, null);

    nock(serverURL)
        .delete('/document/id4')
        .reply(404, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/document?filename=test.jpg&tags=tag1')
        .reply(200, document);
    nock(serverURL)
        .post('/document?filename=test.jpg&tags=tag1')
        .reply(200, document);

    nock(serverURL)
        .post('/admin/' + application.id + '/document?filename=test.jpg&tags=tag0')
        .reply(400, null);

    nock(serverURL)
        .post('/document?filename=test.jpg&tags=tag0')
        .reply(400, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/document?filename=test.jpg&tags=tag2')
        .reply(401, null);

    nock(serverURL)
        .post('/document?filename=test.jpg&tags=tag2')
        .reply(401, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/document?filename=test.jpg&tags=tag3')
        .reply(403, null);

    nock(serverURL)
        .post('/document?filename=test.jpg&tags=tag3')
        .reply(403, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/document/documentId1/tag/tag1')
        .reply(200, document);

    nock(serverURL)
        .post('/document/documentId1/tag/tag1')
        .reply(200, document);

    nock(serverURL)
        .post('/admin/' + application.id + '/document/documentId1/tag/tag2')
        .reply(401, null);

    nock(serverURL)
        .post('/document/documentId1/tag/tag2')
        .reply(401, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/document/documentId1/tag/tag3')
        .reply(403, null);

    nock(serverURL)
        .post('/document/documentId1/tag/tag3')
        .reply(403, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/document/documentId1/tag/tag4')
        .reply(404, null);

    nock(serverURL)
        .post('/document/documentId1/tag/tag4')
        .reply(404, null);

    nock(serverURL)
        .post('/model/documentId1/tag/tag4')
        .reply(404, null);

    nock(serverURL)
        .delete('/admin/' + application.id + '/document/documentId1/tag/tag1')
        .reply(200, document);

    nock(serverURL)
        .delete('/document/documentId1/tag/tag1')
        .reply(200, document);

    nock(serverURL)
        .delete('/admin/' + application.id + '/document/documentId1/tag/tag2')
        .reply(401, null);

    nock(serverURL)
        .delete('/document/documentId1/tag/tag2')
        .reply(401, null);

    nock(serverURL)
        .delete('/admin/' + application.id + '/document/documentId1/tag/tag3')
        .reply(403, null);

    nock(serverURL)
        .delete('/document/documentId1/tag/tag3')
        .reply(403, null);

    nock(serverURL)
        .delete('/admin/' + application.id + '/document/documentId1/tag/tag4')
        .reply(404, null);

    nock(serverURL)
        .delete('/document/documentId1/tag/tag4')
        .reply(404, null);

    nock(serverURL)
        .patch('/admin/' + application.id + '/document/documentId1?filename=test.jpg')
        .reply(200, document);

    nock(serverURL)
        .patch('/admin/' + application.id + '/document/documentId1?rotation_angle=90')
        .reply(200, document);

    nock(serverURL)
        .patch('/admin/' + application.id + '/document/documentId1?filename=test.jpg&rotation_angle=90')
        .reply(200, document);

    nock(serverURL)
        .patch('/admin/' + application.id + '/document/documentId1?filename=test2.jpg')
        .reply(400, null);

    nock(serverURL)
        .patch('/admin/' + application.id + '/document/documentId1?filename=test3.jpg')
        .reply(401, null);

    nock(serverURL)
        .patch('/admin/' + application.id + '/document/documentId1?filename=test4.jpg')
        .reply(404, null);

    nock(serverURL)
        .patch('/document/documentId1?filename=test.jpg')
        .reply(200, document);

    nock(serverURL)
        .patch('/document/documentId1?rotation_angle=90')
        .reply(200, document);

    nock(serverURL)
        .patch('/document/documentId1?filename=test.jpg&rotation_angle=90')
        .reply(200, document);

    nock(serverURL)
        .patch('/document/documentId1?filename=test2.jpg')
        .reply(400, null);

    nock(serverURL)
        .patch('/document/documentId1?filename=test3.jpg')
        .reply(401, null);

    nock(serverURL)
        .patch('/document/documentId1?filename=test4.jpg')
        .reply(404, null);
}

function mockAnnotationAPI() {
    nock(serverURL)
        .get('/login/mockApiKey')
        .reply(200, { token: 'faketoken', application: { id: 'id1', application_type: 'admin' } });

    nock(serverURL)
        .get('/login/mockApiKeyDev')
        .reply(200, { token: 'faketoken', application: { id: 'id1', application_type: 'developer' } });

    nock(serverURL)
        .get('/annotation')
        .reply(200, [annotation], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/annotation?offset=20')
        .reply(200, [annotation], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/annotation?limit=20')
        .reply(200, [annotation], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/annotation?tags=tag1&tags=tag2')
        .reply(200, [annotation], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/annotation?document_id=documentId1')
        .reply(200, [annotation], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/annotation?annotation_type=BOX')
        .reply(200, [annotation], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/annotation?name=test')
        .reply(200, [annotation], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/annotation?offset=20&limit=20&tags=tag1&tags=tag2&document_id=documentId1&annotation_type=BOX&name=test')
        .reply(200, [annotation], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/annotation?limit=3')
        .reply(401, null);

    nock(serverURL)
        .get('/annotation?limit=4')
        .reply(403, null);

    nock(serverURL)
        .get('/annotation?limit=5')
        .reply(404, {}, { 'content-range': '0-0/0' });

    nock(serverURL)
        .get('/annotation?limit=6')
        .reply(400, null);

    nock(serverURL)
        .get('/annotation/id1')
        .reply(200, annotation);

    nock(serverURL)
        .get('/annotation/id2')
        .reply(401, null);

    nock(serverURL)
        .get('/annotation/id3')
        .reply(403, null);

    nock(serverURL)
        .get('/annotation/id4')
        .reply(404, null);

    nock(serverURL)
        .delete('/annotation/id1')
        .reply(204, null);

    nock(serverURL)
        .delete('/annotation/id2')
        .reply(401, null);

    nock(serverURL)
        .delete('/annotation/id3')
        .reply(403, null);

    nock(serverURL)
        .delete('/annotation/id4')
        .reply(404, null);

    nock(serverURL)
        .post('/annotation?document_id=documentId1&annotation_type=BOX')
        .reply(200, annotation);

    nock(serverURL)
        .post('/annotation?document_id=documentId1&annotation_type=BOX&name=test')
        .reply(200, annotation);

    nock(serverURL)
        .post('/annotation?document_id=documentId1&annotation_type=BOX&tags=tag1')
        .reply(200, annotation);

    nock(serverURL)
        .post('/annotation?document_id=documentId1&annotation_type=BOX&name=test&tags=tag1')
        .reply(200, annotation);

    nock(serverURL)
        .post('/annotation?document_id=documentId1&annotation_type=BOX&name=test2')
        .reply(400, null);

    nock(serverURL)
        .post('/annotation?document_id=documentId1&annotation_type=BOX&name=test3')
        .reply(401, null);

    nock(serverURL)
        .post('/annotation/annotationId1/tag/tag1')
        .reply(200, annotation);

    nock(serverURL)
        .post('/annotation/annotationId1/tag/tag2')
        .reply(401, null);

    nock(serverURL)
        .post('/annotation/annotationId1/tag/tag3')
        .reply(403, null);

    nock(serverURL)
        .post('/annotation/annotationId1/tag/tag4')
        .reply(404, null);

    nock(serverURL)
        .post('/annotation/annotationId1/tag/tag4')
        .reply(404, null);

    nock(serverURL)
        .delete('/annotation/annotationId1/tag/tag1')
        .reply(200, annotation);

    nock(serverURL)
        .delete('/annotation/annotationId1/tag/tag2')
        .reply(401, null);

    nock(serverURL)
        .delete('/annotation/annotationId1/tag/tag3')
        .reply(403, null);

    nock(serverURL)
        .delete('/annotation/annotationId1/tag/tag4')
        .reply(404, null);

    nock(serverURL)
        .patch('/annotation/annotationId1?name=test')
        .reply(200, annotation);

    nock(serverURL)
        .patch('/annotation/annotationId1')
        .reply(200, annotation);

    nock(serverURL)
        .patch('/annotation/annotationId1?name=test2')
        .reply(400, null);

    nock(serverURL)
        .patch('/annotation/annotationId1?name=test3')
        .reply(401, null);

    nock(serverURL)
        .patch('/annotation/annotationId1?name=test4')
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

describe('LeIA Application API', () => {
    beforeEach((done) => {
        mockApplicationAPI()
        done()
    });

    describe('login()', () => {
        it('should return a token and an Application', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((result) => {
                result.should.be.a('object');
                result.id.should.be.eql(application.id)
                result.creationTime.should.be.eql(application.creation_time)
                result.applicationName.should.be.eql(application.application_name)
                result.applicationType.should.be.eql(application.application_type)
                result.email.should.be.eql(application.email)
                result.firstname.should.be.eql(application.first_name)
                result.lastname.should.be.eql(application.last_name)
                done()
            })
        });

        it('should return a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('badApiKey').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(403)
                done()
            })
        });
    })

    describe('logout()', () => {
        it('should call the right url', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.logout().then((_) => {
                    done()
                })
            })
        });
    })

    describe('adminGetApplication()', () => {
        it('should return a list of applications', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplications().then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.applications.should.be.a('array');
                    result.applications.length.should.be.eql(1)
                    result.applications[0].id.should.be.eql(application.id)
                    result.applications[0].creationTime.should.be.eql(application.creation_time)
                    result.applications[0].applicationName.should.be.eql(application.application_name)
                    result.applications[0].applicationType.should.be.eql(application.application_type)
                    result.applications[0].email.should.be.eql(application.email)
                    result.applications[0].firstname.should.be.eql(application.first_name)
                    result.applications[0].lastname.should.be.eql(application.last_name)
                    done()
                })
            })
        });


        it('should return a list of applications when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplications(null, null, null, 20, null).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.applications.should.be.a('array');
                    result.applications.length.should.be.eql(1)
                    result.applications[0].id.should.be.eql(application.id)
                    result.applications[0].creationTime.should.be.eql(application.creation_time)
                    result.applications[0].applicationName.should.be.eql(application.application_name)
                    result.applications[0].applicationType.should.be.eql(application.application_type)
                    result.applications[0].email.should.be.eql(application.email)
                    result.applications[0].firstname.should.be.eql(application.first_name)
                    result.applications[0].lastname.should.be.eql(application.last_name)
                    done()
                })
            })
        });

        it('should return a list of applications when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplications(null, null, null, null, 20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.applications.should.be.a('array');
                    result.applications.length.should.be.eql(1)
                    result.applications[0].id.should.be.eql(application.id)
                    result.applications[0].creationTime.should.be.eql(application.creation_time)
                    result.applications[0].applicationName.should.be.eql(application.application_name)
                    result.applications[0].applicationType.should.be.eql(application.application_type)
                    result.applications[0].email.should.be.eql(application.email)
                    result.applications[0].firstname.should.be.eql(application.first_name)
                    result.applications[0].lastname.should.be.eql(application.last_name)
                    done()
                })
            })
        });

        it('should return a list of applications when sort is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplications(null, null, ['applicationName', '-email'], null, null).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.applications.should.be.a('array');
                    result.applications.length.should.be.eql(1)
                    result.applications[0].id.should.be.eql(application.id)
                    result.applications[0].creationTime.should.be.eql(application.creation_time)
                    result.applications[0].applicationName.should.be.eql(application.application_name)
                    result.applications[0].applicationType.should.be.eql(application.application_type)
                    result.applications[0].email.should.be.eql(application.email)
                    result.applications[0].firstname.should.be.eql(application.first_name)
                    result.applications[0].lastname.should.be.eql(application.last_name)
                    done()
                })
            })
        });

        it('should return a list of applications when email is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetApplications('test@test.com', null, null, null, null).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.applications.should.be.a('array');
                    result.applications.length.should.be.eql(1)
                    result.applications[0].id.should.be.eql(application.id)
                    result.applications[0].creationTime.should.be.eql(application.creation_time)
                    result.applications[0].applicationName.should.be.eql(application.application_name)
                    result.applications[0].applicationType.should.be.eql(application.application_type)
                    result.applications[0].email.should.be.eql(application.email)
                    result.applications[0].firstname.should.be.eql(application.first_name)
                    result.applications[0].lastname.should.be.eql(application.last_name)
                    done()
                })
            })
        });

        it('should return a list of applications when application_name is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetApplications(null, 'appName', null, null, null).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.applications.should.be.a('array');
                    result.applications.length.should.be.eql(1)
                    result.applications[0].id.should.be.eql(application.id)
                    result.applications[0].creationTime.should.be.eql(application.creation_time)
                    result.applications[0].applicationName.should.be.eql(application.application_name)
                    result.applications[0].applicationType.should.be.eql(application.application_type)
                    result.applications[0].email.should.be.eql(application.email)
                    result.applications[0].firstname.should.be.eql(application.first_name)
                    result.applications[0].lastname.should.be.eql(application.last_name)
                    done()
                })
            })
        });


        it('should return a list of applications when application_name is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetApplications('test@test.com', 'appName', ['applicationName', '-email'], 20, 20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.applications.should.be.a('array');
                    result.applications.length.should.be.eql(1)
                    result.applications[0].id.should.be.eql(application.id)
                    result.applications[0].creationTime.should.be.eql(application.creation_time)
                    result.applications[0].applicationName.should.be.eql(application.application_name)
                    result.applications[0].applicationType.should.be.eql(application.application_type)
                    result.applications[0].email.should.be.eql(application.email)
                    result.applications[0].firstname.should.be.eql(application.first_name)
                    result.applications[0].lastname.should.be.eql(application.last_name)
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplications(null, null, null, null, 6).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplications(null, null, null, null, 3).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplications(null, null, null, null, 4).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return an empty list when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplications(null, null, null, null, 5).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(0)
                    result.contentRange.total.should.be.eql(0)
                    result.applications.length.should.be.eql(0)
                    done()
                })
            })
        });
    })

    describe('adminGetApplication()', () => {
        it('should return an Application', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplication('id1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(application.id)
                    result.creationTime.should.be.eql(application.creation_time)
                    result.applicationName.should.be.eql(application.application_name)
                    result.applicationType.should.be.eql(application.application_type)
                    result.email.should.be.eql(application.email)
                    result.firstname.should.be.eql(application.first_name)
                    result.lastname.should.be.eql(application.last_name)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplication('id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplication('id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('adminResetApplicationApiKey()', () => {
        it('should return an Application', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminResetApplicationApiKey('id1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(application.id)
                    result.creationTime.should.be.eql(application.creation_time)
                    result.applicationName.should.be.eql(application.application_name)
                    result.applicationType.should.be.eql(application.application_type)
                    result.email.should.be.eql(application.email)
                    result.firstname.should.be.eql(application.first_name)
                    result.lastname.should.be.eql(application.last_name)
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminResetApplicationApiKey('id5').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminResetApplicationApiKey('id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminResetApplicationApiKey('id3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminResetApplicationApiKey('id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('adminAddApplication()', () => {
        it('should return an Application', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddApplication("test@test.com", "appName", "admin", "jean", "test").then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(application.id)
                    result.creationTime.should.be.eql(application.creation_time)
                    result.applicationName.should.be.eql(application.application_name)
                    result.applicationType.should.be.eql(application.application_type)
                    result.email.should.be.eql(application.email)
                    result.firstname.should.be.eql(application.first_name)
                    result.lastname.should.be.eql(application.last_name)
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddApplication("test@test.com", "appName4", "admin", "jean", "test").then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddApplication("test@test.com", "appName2", "admin", "jean", "test").then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 409 status when LeiaAPI returns a 409 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddApplication("test@test.com", "appName3", "admin", "jean", "test").then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(409)
                    done()
                })
            })
        })

    })

    describe('adminGetApplication()', () => {
        it('should return an Application', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplication('id1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(application.id)
                    result.creationTime.should.be.eql(application.creation_time)
                    result.applicationName.should.be.eql(application.application_name)
                    result.applicationType.should.be.eql(application.application_type)
                    result.email.should.be.eql(application.email)
                    result.firstname.should.be.eql(application.first_name)
                    result.lastname.should.be.eql(application.last_name)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplication('id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplication('id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('adminDeleteApplication()', () => {
        it('should call the right url', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminDeleteApplication('id1').then((_) => {
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminDeleteApplication('id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminDeleteApplication('id3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminDeleteApplication('id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

})

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
                    done()
                })
            })
        });

        it('should return a list of models when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels(null, null, 20).then((result) => {
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
                    done()
                })
            })
        });

        it('should return a list of models when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels(null, null, null, 20).then((result) => {
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
                    done()
                })
            })
        });

        it('should return a list of models when sort is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels(null, ['name', '-description']).then((result) => {
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
                    done()
                })
            })
        });

        it('should return a list of models when tags is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels(['tag1', 'tag2']).then((result) => {
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
                    done()
                })
            })
        });

        it('should return a list of models when applicationId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels(null, null, null, null, 'appId1').then((result) => {
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
                    done()
                })
            })
        });


        it('should return a list of models when all parameters are provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetModels(['tag1', 'tag2'], ['name', '-description'], 20, 20, 'appId1').then((result) => {
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
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetModels(null, null, null, 6).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetModels(null, null, null, 3).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return an empty list LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetModels(null, null, null, 5).then((result) => {
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
                    done()
                })
            })
        });

        it('should return a list of models when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getModels(null, null, 20).then((result) => {
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
                    done()
                })
            })
        });

        it('should return a list of models when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getModels(null, null, null, 20).then((result) => {
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
                    done()
                })
            })
        });

        it('should return a list of models when sort is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getModels(null, ['name', '-description']).then((result) => {
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
                    done()
                })
            })
        });

        it('should return a list of models when tags is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getModels(['tag1', 'tag2']).then((result) => {
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
                    done()
                })
            })
        });

        it('should return a list of models when all parameters are provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getModels(['tag1', 'tag2'], ['name', '-description'], 20, 20).then((result) => {
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
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getModels(null, null, null, 6).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getModels(null, null, null, 3).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return an empty list LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getModels(null, null, null, 5).then((result) => {
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
                leiaAPI.adminGetModel('id1').then((result) => {
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
                leiaAPI.adminGetModel('id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetModel('id4').then((_) => {
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
                leiaAPI.adminAddModel(application.id, 'modelName', Buffer.from([0xff, 0x11]), 'modelDescription', 5, ['tag1', 'tag2']).then((result) => {
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

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddModel(application.id, 'modelName4', Buffer.from([0xff, 0x11]), 'modelDescription', 5, ['tag1', 'tag2']).then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddModel(application.id, 'modelName2', Buffer.from([0xff, 0x11]), 'modelDescription', 5, ['tag1', 'tag2']).then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 409 status when LeiaAPI returns a 409 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddModel(application.id, 'modelName3', Buffer.from([0xff, 0x11]), 'modelDescription', 5, ['tag1', 'tag2']).then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(409)
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

describe('LeIA Job API', () => {
    beforeEach((done) => {
        mockJobAPI()
        done()
    });

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
                    result.jobs[0].result.should.be.eql(transformPDFProcessedJob.result)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a list of jobs when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getJobs(null, null, null, null, null, null, null, 20, null).then((result) => {
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
                    result.jobs[0].result.should.be.eql(transformPDFProcessedJob.result)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a list of jobs when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs(null, null, null, null, null, null, null, null, 20).then((result) => {
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
                    result.jobs[0].result.should.be.eql(transformPDFProcessedJob.result)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a list of jobs when applicationId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs('appId1', null, null, null, null, null, null, null, null).then((result) => {
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
                    result.jobs[0].result.should.be.eql(transformPDFProcessedJob.result)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a list of jobs when jobType is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs(null, 'pdf-images', null, null, null, null, null, null, null).then((result) => {
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
                    result.jobs[0].result.should.be.eql(transformPDFProcessedJob.result)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a list of jobs when modelId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)

            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getJobs(null, null, 'modelId1', null, null, null, null, null, null).then((result) => {
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
                    result.jobs[0].result.should.be.eql(transformPDFProcessedJob.result)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a list of jobs when documentId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs(null, null, null, 'documentId1', null, null, null, null, null).then((result) => {
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
                    result.jobs[0].result.should.be.eql(transformPDFProcessedJob.result)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a list of jobs when executeAfterId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs(null, null, null, null, 'jobId1', null, null, null, null).then((result) => {
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
                    result.jobs[0].result.should.be.eql(transformPDFProcessedJob.result)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a list of jobs when parentJobId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs(null, null, null, null, null, 'jobId1', null, null, null).then((result) => {
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
                    result.jobs[0].result.should.be.eql(transformPDFProcessedJob.result)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a list of jobs when status is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs(null, null, null, null, null, null, 'PROCESSED', null, null).then((result) => {
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
                    result.jobs[0].result.should.be.eql(transformPDFProcessedJob.result)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a list of jobs when all parameters are provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getJobs('appId1', 'pdf-images', 'modelId1', 'documentId1', 'jobId1', 'jobId1', 'PROCESSED', 20, 20).then((result) => {
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
                    result.jobs[0].result.should.be.eql(transformPDFProcessedJob.result)
                    result.jobs[0].startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.jobs[0].status.should.be.eql(transformPDFProcessedJob.status)
                    result.jobs[0].executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getJobs(null, null, null, null, null, null, null, null, 3).then(() => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return 403 when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getJobs(null, null, null, null, null, null, null, null, 4).then(() => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        })

        it('should return an empty list when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getJobs(null, null, null, null, null, null, null, null, 5).then((result) => {
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
                    result.result.should.be.eql(transformPDFProcessedJob.result)
                    result.startingTime.should.be.eql(transformPDFProcessedJob.starting_time)
                    result.status.should.be.eql(transformPDFProcessedJob.status)
                    result.executeAfterId.should.be.eql(transformPDFProcessedJob.execute_after_id)
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

    describe('deleteJob()', () => {
        it('should call the right url', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.deleteJob('id1').then((_) => {
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.deleteJob('id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.deleteJob('id3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.deleteJob('id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })
})


describe('LeIA Annotation API', () => {
    beforeEach((done) => {
        mockAnnotationAPI()
        done()
    });

    describe('getAnnotations()', () => {
        it('should return a list of annotations', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getAnnotations().then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.annotations.should.be.a('array');
                    result.annotations.length.should.be.eql(1)
                    result.annotations[0].id.should.be.eql(annotation.id)
                    result.annotations[0].creationTime.should.be.eql(annotation.creation_time)
                    result.annotations[0].annotationType.should.be.eql(annotation.annotation_type)
                    result.annotations[0].applicationId.should.be.eql(annotation.application_id)
                    result.annotations[0].documentId.should.be.eql(annotation.document_id)
                    result.annotations[0].name.should.be.eql(annotation.name)
                    result.annotations[0].prediction.should.be.eql(annotation.prediction)
                    result.annotations[0].tags.should.be.eql(annotation.tags)
                    done()
                })
            })
        });

        it('should return a list of annotations when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getAnnotations(null, null, null, null, 20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.annotations.should.be.a('array');
                    result.annotations.length.should.be.eql(1)
                    result.annotations[0].id.should.be.eql(annotation.id)
                    result.annotations[0].creationTime.should.be.eql(annotation.creation_time)
                    result.annotations[0].annotationType.should.be.eql(annotation.annotation_type)
                    result.annotations[0].applicationId.should.be.eql(annotation.application_id)
                    result.annotations[0].documentId.should.be.eql(annotation.document_id)
                    result.annotations[0].name.should.be.eql(annotation.name)
                    result.annotations[0].prediction.should.be.eql(annotation.prediction)
                    result.annotations[0].tags.should.be.eql(annotation.tags)
                    done()
                })
            })
        });

        it('should return a list of documents when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getAnnotations(null, null, null, null, null, 20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.annotations.should.be.a('array');
                    result.annotations.length.should.be.eql(1)
                    result.annotations[0].id.should.be.eql(annotation.id)
                    result.annotations[0].creationTime.should.be.eql(annotation.creation_time)
                    result.annotations[0].annotationType.should.be.eql(annotation.annotation_type)
                    result.annotations[0].applicationId.should.be.eql(annotation.application_id)
                    result.annotations[0].documentId.should.be.eql(annotation.document_id)
                    result.annotations[0].name.should.be.eql(annotation.name)
                    result.annotations[0].prediction.should.be.eql(annotation.prediction)
                    result.annotations[0].tags.should.be.eql(annotation.tags)
                    done()
                })
            })
        });

        it('should return a list of documents when tags is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getAnnotations(['tag1', 'tag2']).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.annotations.should.be.a('array');
                    result.annotations.length.should.be.eql(1)
                    result.annotations[0].id.should.be.eql(annotation.id)
                    result.annotations[0].creationTime.should.be.eql(annotation.creation_time)
                    result.annotations[0].annotationType.should.be.eql(annotation.annotation_type)
                    result.annotations[0].applicationId.should.be.eql(annotation.application_id)
                    result.annotations[0].documentId.should.be.eql(annotation.document_id)
                    result.annotations[0].name.should.be.eql(annotation.name)
                    result.annotations[0].prediction.should.be.eql(annotation.prediction)
                    result.annotations[0].tags.should.be.eql(annotation.tags)
                    done()
                })
            })
        });

        it('should return a list of documents when annotationType is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getAnnotations(null, 'BOX').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.annotations.should.be.a('array');
                    result.annotations.length.should.be.eql(1)
                    result.annotations[0].id.should.be.eql(annotation.id)
                    result.annotations[0].creationTime.should.be.eql(annotation.creation_time)
                    result.annotations[0].annotationType.should.be.eql(annotation.annotation_type)
                    result.annotations[0].applicationId.should.be.eql(annotation.application_id)
                    result.annotations[0].documentId.should.be.eql(annotation.document_id)
                    result.annotations[0].name.should.be.eql(annotation.name)
                    result.annotations[0].prediction.should.be.eql(annotation.prediction)
                    result.annotations[0].tags.should.be.eql(annotation.tags)
                    done()
                })
            })
        });

        it('should return a list of documents when name is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getAnnotations(null, null, 'test').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.annotations.should.be.a('array');
                    result.annotations.length.should.be.eql(1)
                    result.annotations[0].id.should.be.eql(annotation.id)
                    result.annotations[0].creationTime.should.be.eql(annotation.creation_time)
                    result.annotations[0].annotationType.should.be.eql(annotation.annotation_type)
                    result.annotations[0].applicationId.should.be.eql(annotation.application_id)
                    result.annotations[0].documentId.should.be.eql(annotation.document_id)
                    result.annotations[0].name.should.be.eql(annotation.name)
                    result.annotations[0].prediction.should.be.eql(annotation.prediction)
                    result.annotations[0].tags.should.be.eql(annotation.tags)
                    done()
                })
            })
        });

        it('should return a list of documents when documentId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getAnnotations(null, null, null, 'documentId1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.annotations.should.be.a('array');
                    result.annotations.length.should.be.eql(1)
                    result.annotations[0].id.should.be.eql(annotation.id)
                    result.annotations[0].creationTime.should.be.eql(annotation.creation_time)
                    result.annotations[0].annotationType.should.be.eql(annotation.annotation_type)
                    result.annotations[0].applicationId.should.be.eql(annotation.application_id)
                    result.annotations[0].documentId.should.be.eql(annotation.document_id)
                    result.annotations[0].name.should.be.eql(annotation.name)
                    result.annotations[0].prediction.should.be.eql(annotation.prediction)
                    result.annotations[0].tags.should.be.eql(annotation.tags)
                    done()
                })
            })
        });

        it('should return a list of documents when all parameters are provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getAnnotations(['tag1', 'tag2'], 'BOX', 'test', 'documentId1', 20, 20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.annotations.should.be.a('array');
                    result.annotations.length.should.be.eql(1)
                    result.annotations[0].id.should.be.eql(annotation.id)
                    result.annotations[0].creationTime.should.be.eql(annotation.creation_time)
                    result.annotations[0].annotationType.should.be.eql(annotation.annotation_type)
                    result.annotations[0].applicationId.should.be.eql(annotation.application_id)
                    result.annotations[0].documentId.should.be.eql(annotation.document_id)
                    result.annotations[0].name.should.be.eql(annotation.name)
                    result.annotations[0].prediction.should.be.eql(annotation.prediction)
                    result.annotations[0].tags.should.be.eql(annotation.tags)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getAnnotations(null, null, null, null, null, 3).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return an empty list when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getAnnotations(null, null, null, null, null, 5).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(0)
                    result.contentRange.total.should.be.eql(0)
                    result.annotations.length.should.be.eql(0)
                    done()
                })
            })
        })
    })

    describe('getAnnotation()', () => {
        it('should return an Annotation', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getAnnotation('id1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(annotation.id)
                    result.creationTime.should.be.eql(annotation.creation_time)
                    result.annotationType.should.be.eql(annotation.annotation_type)
                    result.applicationId.should.be.eql(annotation.application_id)
                    result.documentId.should.be.eql(annotation.document_id)
                    result.name.should.be.eql(annotation.name)
                    result.prediction.should.be.eql(annotation.prediction)
                    result.tags.should.be.eql(annotation.tags)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getAnnotation('id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getAnnotation('id3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getAnnotation('id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('addAnnotation()', () => {
        it('should return an Annotation', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addAnnotation('documentId1', 'BOX', { category: 'TEST' }, 'test', ['tag1']).then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(annotation.id)
                    result.creationTime.should.be.eql(annotation.creation_time)
                    result.annotationType.should.be.eql(annotation.annotation_type)
                    result.applicationId.should.be.eql(annotation.application_id)
                    result.documentId.should.be.eql(annotation.document_id)
                    result.name.should.be.eql(annotation.name)
                    result.prediction.should.be.eql(annotation.prediction)
                    result.tags.should.be.eql(annotation.tags)
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addAnnotation('documentId1', 'BOX', { category: 'TEST' }, 'test2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        })

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addAnnotation('documentId1', 'BOX', { category: 'TEST' }, 'test3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })
    })

    describe('deleteAnnotation()', () => {
        it('should call the right url', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.deleteAnnotation('id1').then((_) => {
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.deleteAnnotation('id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.deleteAnnotation('id3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.deleteAnnotation('id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('addTagToDocument()', () => {
        it('should return an Annotation', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addTagToAnnotation('annotationId1', 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(annotation.id)
                    result.creationTime.should.be.eql(annotation.creation_time)
                    result.annotationType.should.be.eql(annotation.annotation_type)
                    result.applicationId.should.be.eql(annotation.application_id)
                    result.documentId.should.be.eql(annotation.document_id)
                    result.name.should.be.eql(annotation.name)
                    result.prediction.should.be.eql(annotation.prediction)
                    result.tags.should.be.eql(annotation.tags)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addTagToAnnotation('annotationId1', 'tag2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addTagToAnnotation('annotationId1', 'tag3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addTagToAnnotation('annotationId1', 'tag4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('removeTagFromAnnotation()', () => {
        it('should return a Document', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.removeTagFromAnnotation('annotationId1', 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(annotation.id)
                    result.creationTime.should.be.eql(annotation.creation_time)
                    result.annotationType.should.be.eql(annotation.annotation_type)
                    result.applicationId.should.be.eql(annotation.application_id)
                    result.documentId.should.be.eql(annotation.document_id)
                    result.name.should.be.eql(annotation.name)
                    result.prediction.should.be.eql(annotation.prediction)
                    result.tags.should.be.eql(annotation.tags)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.removeTagFromAnnotation('annotationId1', 'tag2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.removeTagFromAnnotation('annotationId1', 'tag3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.removeTagFromAnnotation('annotationId1', 'tag4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('updateAnnotation()', () => {
        it('should return an Annotation when providing name', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.updateAnnotation('annotationId1', 'test').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(annotation.id)
                    result.creationTime.should.be.eql(annotation.creation_time)
                    result.annotationType.should.be.eql(annotation.annotation_type)
                    result.applicationId.should.be.eql(annotation.application_id)
                    result.documentId.should.be.eql(annotation.document_id)
                    result.name.should.be.eql(annotation.name)
                    result.prediction.should.be.eql(annotation.prediction)
                    result.tags.should.be.eql(annotation.tags)
                    done()
                })
            })
        });

        it('should return an Annotation when providing a prediction', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.updateAnnotation('annotationId1', null, { category: 'TEXT' }).then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(annotation.id)
                    result.creationTime.should.be.eql(annotation.creation_time)
                    result.annotationType.should.be.eql(annotation.annotation_type)
                    result.applicationId.should.be.eql(annotation.application_id)
                    result.documentId.should.be.eql(annotation.document_id)
                    result.name.should.be.eql(annotation.name)
                    result.prediction.should.be.eql(annotation.prediction)
                    result.tags.should.be.eql(annotation.tags)
                    done()
                })
            })
        });

        it('should return an Annotation when providing all parameters', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.updateAnnotation('annotationId1', 'test', { category: 'TEXT' }).then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(annotation.id)
                    result.creationTime.should.be.eql(annotation.creation_time)
                    result.annotationType.should.be.eql(annotation.annotation_type)
                    result.applicationId.should.be.eql(annotation.application_id)
                    result.documentId.should.be.eql(annotation.document_id)
                    result.name.should.be.eql(annotation.name)
                    result.prediction.should.be.eql(annotation.prediction)
                    result.tags.should.be.eql(annotation.tags)
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.updateAnnotation('annotationId1', 'test2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        })

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.updateAnnotation('annotationId1', 'test3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.updateAnnotation('annotationId1', 'test4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        })
    })

})

describe('LeIA Document API', () => {
    beforeEach((done) => {
        mockDocumentAPI()
        done()
    });

    describe('adminGetDocuments()', () => {
        it('should return a list of documents', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetDocuments().then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].correctAngle.should.be.eql(document.correct_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a list of documents when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetDocuments(null, null, 20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].correctAngle.should.be.eql(document.correct_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a list of documents when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetDocuments(null, null, null, 20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].correctAngle.should.be.eql(document.correct_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a list of documents when sort is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetDocuments(null, ['filename', '-extension']).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].correctAngle.should.be.eql(document.correct_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a list of documents when tags is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetDocuments(['tag1', 'tag2']).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].correctAngle.should.be.eql(document.correct_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a list of documents when applicationId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetDocuments(null, null, null, null, 'appId1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].correctAngle.should.be.eql(document.correct_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a list of documents when all parameters are provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetDocuments(['tag1', 'tag2'], ['filename', '-extension'], 20, 20, 'appId1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].correctAngle.should.be.eql(document.correct_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetDocuments(null, null, null, 3).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return an empty list when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetDocuments(null, null, null, 5).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(0)
                    result.contentRange.total.should.be.eql(0)
                    result.documents.length.should.be.eql(0)
                    done()
                })
            })
        })
    })

    describe('getDocuments()', () => {
        it('should return a list of documents', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments().then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].correctAngle.should.be.eql(document.correct_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a list of documents when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(null, null, 20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].correctAngle.should.be.eql(document.correct_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a list of documents when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(null, null, null, 20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].correctAngle.should.be.eql(document.correct_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a list of documents when sort is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(null, ['filename', '-extension']).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].correctAngle.should.be.eql(document.correct_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a list of documents when tags is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(['tag1', 'tag2']).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].correctAngle.should.be.eql(document.correct_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a list of documents when applicationId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(null, null, null, null, 'appId1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].correctAngle.should.be.eql(document.correct_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a list of documents when all parameters are provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(['tag1', 'tag2'], ['filename', '-extension'], 20, 20, 'appId1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].correctAngle.should.be.eql(document.correct_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getDocuments(null, null, null, 3).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return an empty list when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getDocuments(null, null, null, 5).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(0)
                    result.contentRange.total.should.be.eql(0)
                    result.documents.length.should.be.eql(0)
                    done()
                })
            })
        })
    })

    describe('adminGetDocument()', () => {
        it('should return a Document', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetDocument('id1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.correctAngle.should.be.eql(document.correct_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetDocument('id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetDocument('id3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetDocument('id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('getDocument()', () => {
        it('should return a Document', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getDocument('id1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.correctAngle.should.be.eql(document.correct_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getDocument('id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getDocument('id3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getDocument('id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('adminAddDocument()', () => {
        it('should return a Document', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddDocument(application.id, 'test.jpg', Buffer.from([0xff, 0x11]), ['tag1']).then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.correctAngle.should.be.eql(document.correct_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddDocument(application.id, 'test.jpg', Buffer.from([0xff, 0x11]), ['tag0']).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        })

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddDocument(application.id, 'test.jpg', Buffer.from([0xff, 0x11]), ['tag2']).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

    })

    describe('addDocument()', () => {
        it('should return a Document', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addDocument('test.jpg', Buffer.from([0xff, 0x11]), ['tag1']).then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.correctAngle.should.be.eql(document.correct_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addDocument('test.jpg', Buffer.from([0xff, 0x11]), ['tag0']).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        })

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addDocument('test.jpg', Buffer.from([0xff, 0x11]), ['tag2']).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })
    })

    describe('adminTransformPDF()', () => {
        it('should return a job', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminTransformPDF(application.id, ['id1'], 'image').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformPDFProcessingJob.id)
                    result.creationTime.should.be.eql(transformPDFProcessingJob.creation_time)
                    result.applicationId.should.be.eql(transformPDFProcessingJob.application_id)
                    result.documentIds.should.be.eql(transformPDFProcessingJob.document_ids)
                    result.jobType.should.be.eql(transformPDFProcessingJob.job_type)
                    result.startingTime.should.be.eql(transformPDFProcessingJob.starting_time)
                    result.status.should.be.eql(transformPDFProcessingJob.status)
                    result.executeAfterId.should.be.eql(transformPDFProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a job when providing an inputTag', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminTransformPDF(application.id, ['id1'], 'image', 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformPDFProcessingJob.id)
                    result.creationTime.should.be.eql(transformPDFProcessingJob.creation_time)
                    result.applicationId.should.be.eql(transformPDFProcessingJob.application_id)
                    result.documentIds.should.be.eql(transformPDFProcessingJob.document_ids)
                    result.jobType.should.be.eql(transformPDFProcessingJob.job_type)
                    result.startingTime.should.be.eql(transformPDFProcessingJob.starting_time)
                    result.status.should.be.eql(transformPDFProcessingJob.status)
                    result.executeAfterId.should.be.eql(transformPDFProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a job when providing an outputTag', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminTransformPDF(application.id, ['id1'], 'image', null, 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformPDFProcessingJob.id)
                    result.creationTime.should.be.eql(transformPDFProcessingJob.creation_time)
                    result.applicationId.should.be.eql(transformPDFProcessingJob.application_id)
                    result.documentIds.should.be.eql(transformPDFProcessingJob.document_ids)
                    result.jobType.should.be.eql(transformPDFProcessingJob.job_type)
                    result.startingTime.should.be.eql(transformPDFProcessingJob.starting_time)
                    result.status.should.be.eql(transformPDFProcessingJob.status)
                    result.executeAfterId.should.be.eql(transformPDFProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminTransformPDF(application.id, ['id2'], 'image', null, 'tag2').then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminTransformPDF(application.id, ['id3'], 'image', null, 'tag3').then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        })

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminTransformPDF(application.id, ['id4'], 'image', null, 'tag4').then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        })

    })

    describe('transformPDF()', () => {
        it('should return a list of documents', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.transformPDF(['id1'], 'image').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformPDFProcessingJob.id)
                    result.creationTime.should.be.eql(transformPDFProcessingJob.creation_time)
                    result.applicationId.should.be.eql(transformPDFProcessingJob.application_id)
                    result.documentIds.should.be.eql(transformPDFProcessingJob.document_ids)
                    result.jobType.should.be.eql(transformPDFProcessingJob.job_type)
                    result.startingTime.should.be.eql(transformPDFProcessingJob.starting_time)
                    result.status.should.be.eql(transformPDFProcessingJob.status)
                    result.executeAfterId.should.be.eql(transformPDFProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a list of documents when providing an inputTag', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.transformPDF(['id1'], 'image', 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformPDFProcessingJob.id)
                    result.creationTime.should.be.eql(transformPDFProcessingJob.creation_time)
                    result.applicationId.should.be.eql(transformPDFProcessingJob.application_id)
                    result.documentIds.should.be.eql(transformPDFProcessingJob.document_ids)
                    result.jobType.should.be.eql(transformPDFProcessingJob.job_type)
                    result.startingTime.should.be.eql(transformPDFProcessingJob.starting_time)
                    result.status.should.be.eql(transformPDFProcessingJob.status)
                    result.executeAfterId.should.be.eql(transformPDFProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a list of documents when providing an outputTag', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.transformPDF(['id1'], 'image', null, 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformPDFProcessingJob.id)
                    result.creationTime.should.be.eql(transformPDFProcessingJob.creation_time)
                    result.applicationId.should.be.eql(transformPDFProcessingJob.application_id)
                    result.documentIds.should.be.eql(transformPDFProcessingJob.document_ids)
                    result.jobType.should.be.eql(transformPDFProcessingJob.job_type)
                    result.startingTime.should.be.eql(transformPDFProcessingJob.starting_time)
                    result.status.should.be.eql(transformPDFProcessingJob.status)
                    result.executeAfterId.should.be.eql(transformPDFProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.transformPDF(['id2'], 'image', null, 'tag2').then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.transformPDF(['id3'], 'image', null, 'tag3').then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        })

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.transformPDF(['id4'], 'image', null, 'tag4').then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        })

    })


    describe('adminDeleteDocument()', () => {
        it('should call the right url', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminDeleteDocument(application.id, 'id1').then((result) => {
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminDeleteDocument(application.id, 'id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminDeleteDocument(application.id, 'id3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminDeleteDocument(application.id, 'id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('deleteDocument()', () => {
        it('should call the right url', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.deleteDocument('id1').then((result) => {
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.deleteDocument('id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.deleteDocument('id3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.deleteDocument('id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('adminAddTagToDocument()', () => {
        it('should return a Document', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddTagToDocument(application.id, 'documentId1', 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.correctAngle.should.be.eql(document.correct_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddTagToDocument(application.id, 'documentId1', 'tag2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddTagToDocument(application.id, 'documentId1', 'tag3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddTagToDocument(application.id, 'documentId1', 'tag4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('addTagToDocument()', () => {
        it('should return a Document', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addTagToDocument('documentId1', 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.correctAngle.should.be.eql(document.correct_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addTagToDocument('documentId1', 'tag2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addTagToDocument('documentId1', 'tag3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addTagToDocument('documentId1', 'tag4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('adminRemoveTagFromDocument()', () => {
        it('should return a Document', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminRemoveTagFromDocument(application.id, 'documentId1', 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.correctAngle.should.be.eql(document.correct_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminRemoveTagFromDocument(application.id, 'documentId1', 'tag2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminRemoveTagFromDocument(application.id, 'documentId1', 'tag3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminRemoveTagFromDocument(application.id, 'documentId1', 'tag4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('removeTagFromDocument()', () => {
        it('should return a Document', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.removeTagFromDocument('documentId1', 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.correctAngle.should.be.eql(document.correct_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.removeTagFromDocument('documentId1', 'tag2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.removeTagFromDocument('documentId1', 'tag3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.removeTagFromDocument('documentId1', 'tag4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('adminUpdateDocument()', () => {
        it('should return a Document when providing fileName', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminUpdateDocument(application.id, 'documentId1', 'test.jpg').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.correctAngle.should.be.eql(document.correct_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a Document when providing rotationAngle', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminUpdateDocument(application.id, 'documentId1', null, 90).then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.correctAngle.should.be.eql(document.correct_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a Document when providing all parameters', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminUpdateDocument(application.id, 'documentId1', 'test.jpg', 90).then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.correctAngle.should.be.eql(document.correct_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminUpdateDocument(application.id, 'documentId1', 'test2.jpg').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        })

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminUpdateDocument(application.id, 'documentId1', 'test3.jpg').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminUpdateDocument(application.id, 'documentId1', 'test4.jpg').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        })
    })

    describe('updateDocument()', () => {
        it('should return a Document when providing fileName', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.updateDocument('documentId1', 'test.jpg').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.correctAngle.should.be.eql(document.correct_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a Document when providing rotationAngle', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.updateDocument('documentId1', null, 90).then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.correctAngle.should.be.eql(document.correct_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a Document when providing all parameters', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.updateDocument('documentId1', 'test.jpg', 90).then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.correctAngle.should.be.eql(document.correct_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.updateDocument('documentId1', 'test2.jpg').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        })

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.updateDocument('documentId1', 'test3.jpg').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.updateDocument('documentId1', 'test4.jpg').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        })
    })

})

