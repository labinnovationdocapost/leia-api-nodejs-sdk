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

const predictionResult = {
    "classification": "test"
}

function mockApplicationAPI() {
    nock(serverURL)
        .get('/login/mockApiKey')
        .reply(200, { token: 'faketoken', application: { id: 'id1', application_type: 'admin' } });

    nock(serverURL)
        .get('/login/mockApiKeyDev')
        .reply(200, { token: 'faketoken', application: { id: 'id1', application_type: 'developer' } });

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
        .reply(404, [], { 'content-range': '0-0/0' });

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
        .reply(404, [], { 'content-range': '0-0/0' });

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
        .reply(404, [], { 'content-range': '0-0/0' });

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
        .post('/admin/model?name=modelName&application_id=appId1&description=modelDescription&ttl=5&tags=tag1&tags=tag2')
        .reply(200, model);

    nock(serverURL)
        .post('/admin/model?name=modelName2&application_id=appId1&description=modelDescription&ttl=5&tags=tag1&tags=tag2')
        .reply(401, null);

    nock(serverURL)
        .post('/admin/model?name=modelName3&application_id=appId1&description=modelDescription&ttl=5&tags=tag1&tags=tag2')
        .reply(409, null);

    nock(serverURL)
        .post('/admin/model?name=modelName4&application_id=appId1&description=modelDescription&ttl=5&tags=tag1&tags=tag2')
        .reply(400, null);

    nock(serverURL)
        .delete('/admin/model/id1')
        .reply(204, null);

    nock(serverURL)
        .delete('/admin/model/id2')
        .reply(401, null);

    nock(serverURL)
        .delete('/admin/model/id3')
        .reply(403, null);

    nock(serverURL)
        .delete('/admin/model/id4')
        .reply(404, null);

    nock(serverURL)
        .get('/admin/model/modelId1/apply/documentId1')
        .reply(200, predictionResult);

    nock(serverURL)
        .get('/model/modelId1/apply/documentId1')
        .reply(200, predictionResult);

    nock(serverURL)
        .get('/admin/model/modelId1/apply/documentId2')
        .reply(400, predictionResult);

    nock(serverURL)
        .get('/model/modelId1/apply/documentId2')
        .reply(400, predictionResult);

    nock(serverURL)
        .get('/admin/model/modelId1/apply/documentId3')
        .reply(401, predictionResult);

    nock(serverURL)
        .get('/model/modelId1/apply/documentId3')
        .reply(401, predictionResult);

    nock(serverURL)
        .get('/admin/model/modelId1/apply/documentId4')
        .reply(403, predictionResult);

    nock(serverURL)
        .get('/model/modelId1/apply/documentId4')
        .reply(403, predictionResult);

    nock(serverURL)
        .get('/admin/model/modelId1/apply/documentId5')
        .reply(404, predictionResult);

    nock(serverURL)
        .get('/model/modelId1/apply/documentId5')
        .reply(404, predictionResult);

    nock(serverURL)
        .get('/admin/model/modelId1/apply/documentId1?tag=tag1')
        .reply(200, predictionResult);

    nock(serverURL)
        .get('/model/modelId1/apply/documentId1?tag=tag1')
        .reply(200, predictionResult);

    nock(serverURL)
        .post('/admin/model/modelId1/tag/tag1')
        .reply(200, model);

    nock(serverURL)
        .post('/model/modelId1/tag/tag1')
        .reply(200, model);

    nock(serverURL)
        .post('/admin/model/modelId1/tag/tag2')
        .reply(401, null);

    nock(serverURL)
        .post('/model/modelId1/tag/tag2')
        .reply(401, null);

    nock(serverURL)
        .post('/admin/model/modelId1/tag/tag3')
        .reply(403, null);

    nock(serverURL)
        .post('/model/modelId1/tag/tag3')
        .reply(403, null);

    nock(serverURL)
        .post('/admin/model/modelId1/tag/tag4')
        .reply(404, null);

    nock(serverURL)
        .post('/model/modelId1/tag/tag4')
        .reply(404, null);

    nock(serverURL)
        .delete('/admin/model/modelId1/tag/tag1')
        .reply(200, model);

    nock(serverURL)
        .delete('/model/modelId1/tag/tag1')
        .reply(200, model);

    nock(serverURL)
        .delete('/admin/model/modelId1/tag/tag2')
        .reply(401, null);

    nock(serverURL)
        .delete('/model/modelId1/tag/tag2')
        .reply(401, null);

    nock(serverURL)
        .delete('/admin/model/modelId1/tag/tag3')
        .reply(403, null);

    nock(serverURL)
        .delete('/model/modelId1/tag/tag3')
        .reply(403, null);

    nock(serverURL)
        .delete('/admin/model/modelId1/tag/tag4')
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
            .reply(404, [], { 'content-range': '0-0/0' });
    
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
            .post('/admin/document/id1/transform/image')
            .reply(200, [document]);

        nock(serverURL)
            .post('/admin/document/id1/transform/image?input_tag=tag1')
            .reply(200, [document]);

        nock(serverURL)
            .post('/admin/document/id1/transform/image?input_tag=tag1&output_tag=tag1')
            .reply(200, [document]);
    
        nock(serverURL)
            .post('/admin/document/id1/transform/image?output_tag=tag1')
            .reply(200, [document]);
    
        nock(serverURL)
            .post('/admin/document/id2/transform/image?output_tag=tag2')
            .reply(401, null);
    
        nock(serverURL)
            .post('/admin/document/id3/transform/image?output_tag=tag3')
            .reply(403, null);
    
        nock(serverURL)
            .post('/admin/document/id4/transform/image?output_tag=tag4')
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
            .reply(404, [], { 'content-range': '0-0/0' });
    
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
            .reply(200, [document]);

        nock(serverURL)
            .post('/document/id1/transform/image?input_tag=tag1')
            .reply(200, [document]);
    
        nock(serverURL)
            .post('/document/id1/transform/image?output_tag=tag1')
            .reply(200, [document]);
    
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
            .delete('/admin/document/id1')
            .reply(204, null);
    
        nock(serverURL)
            .delete('/admin/document/id2')
            .reply(401, null);
    
        nock(serverURL)
            .delete('/admin/document/id3')
            .reply(403, null);
    
        nock(serverURL)
            .delete('/admin/document/id4')
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
            .post('/admin/document?filename=test.jpg&tags=tag1&application_id=appId1')
            .reply(200, document);
        nock(serverURL)
            .post('/document?filename=test.jpg&tags=tag1')
            .reply(200, document);
    
        nock(serverURL)
            .post('/admin/document?filename=test.jpg&tags=tag0&application_id=appId0')
            .reply(400, null);
    
        nock(serverURL)
            .post('/document?filename=test.jpg&tags=tag0')
            .reply(400, null);
    
        nock(serverURL)
            .post('/admin/document?filename=test.jpg&tags=tag2&application_id=appId2')
            .reply(401, null);
    
        nock(serverURL)
            .post('/document?filename=test.jpg&tags=tag2')
            .reply(401, null);
    
        nock(serverURL)
            .post('/admin/document?filename=test.jpg&tags=tag3&application_id=appId3')
            .reply(403, null);
    
        nock(serverURL)
            .post('/document?filename=test.jpg&tags=tag3')
            .reply(403, null);
}

describe('LeIA Application API', () => {
    beforeEach((done) => {
        mockApplicationAPI()
        done()
    });

    describe('adminGetApplication()', () => {
        it('should return a list of applications', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });


        it('should return a list of applications when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });

        it('should return a list of applications when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });

        it('should return a list of applications when sort is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });

        it('should return a list of applications when email is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });

        it('should return a list of applications when application_name is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });


        it('should return a list of applications when application_name is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminGetApplications(null, null, null, null, 6).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(400)
                done()
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminGetApplications(null, null, null, null, 3).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminGetApplications(null, null, null, null, 4).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(403)
                done()
            })
        });

        it('should return an empty list when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminGetApplications(null, null, null, null, 5).then((result) => {
                (result.contentRange == null).should.be.true
                result.applications.length.should.be.eql(0)
                done()
            })
        });
    })

    describe('adminGetApplication()', () => {
        it('should return an Application', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
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
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminGetApplication('id2').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminGetApplication('id4').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
            })
        });
    })

    describe('adminResetApplicationApiKey()', () => {
        it('should return an Application', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
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
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminResetApplicationApiKey('id5').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(400)
                done()
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminResetApplicationApiKey('id2').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminResetApplicationApiKey('id3').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(403)
                done()
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminResetApplicationApiKey('id4').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
            })
        });
    })

    describe('adminAddApplication()', () => {
        it('should return an Application', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
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
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminAddApplication("test@test.com", "appName4", "admin", "jean", "test").then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(400)
                done()
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminAddApplication("test@test.com", "appName2", "admin", "jean", "test").then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        })

        it('should return a 409 status when LeiaAPI returns a 409 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminAddApplication("test@test.com", "appName3", "admin", "jean", "test").then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(409)
                done()
            })
        })

    })

    describe('adminGetApplication()', () => {
        it('should return an Application', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
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
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminGetApplication('id2').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminGetApplication('id4').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
            })
        });
    })

    describe('adminDeleteApplication()', () => {
        it('should call the right url', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminDeleteApplication('id1').then((_) => {
                done()
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminDeleteApplication('id2').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminDeleteApplication('id3').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(403)
                done()
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminDeleteApplication('id4').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
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
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });

        it('should return a list of models when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });

        it('should return a list of models when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });

        it('should return a list of models when sort is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });

        it('should return a list of models when tags is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });

        it('should return a list of models when applicationId is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });


        it('should return a list of models when all parameters are provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminGetModels(null, null, null, 6).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(400)
                done()
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminGetModels(null, null, null, 3).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        });

        it('should return an empty list LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminGetModels(null, null, null, 5).then((result) => {
                (result.contentRange == null).should.be.true
                result.models.length.should.be.eql(0)
                done()
            })
        });

    })

    describe('getModels()', () => {
        it('should return a list of models', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)

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
        });

        it('should return a list of models when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)

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
        });

        it('should return a list of models when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)

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
        });

        it('should return a list of models when sort is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)

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
        });

        it('should return a list of models when tags is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)

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
        });

        it('should return a list of models when all parameters are provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)

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
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.getModels(null, null, null, 6).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(400)
                done()
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.getModels(null, null, null, 3).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        });

        it('should return an empty list LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.getModels(null, null, null, 5).then((result) => {
                (result.contentRange == null).should.be.true
                result.models.length.should.be.eql(0)
                done()
            })
        });

    })

    describe('adminGetModel()', () => {
        it('should return a Model', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
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
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminGetModel('id2').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminGetModel('id4').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
            })
        });
    })

    describe('getModel()', () => {
        it('should return a Model', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
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
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.getModel('id2').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.getModel('id4').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
            })
        });
    })

    describe('adminAddModel()', () => {
        it('should return a model', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminAddModel('modelName', 'appId1', Buffer.from([0xff, 0x11]), 'modelDescription', 5, ['tag1', 'tag2']).then((result) => {
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
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminAddModel('modelName4', 'appId1', Buffer.from([0xff, 0x11]), 'modelDescription', 5, ['tag1', 'tag2']).then((result) => {
            }).catch((error) => {
                error.status.should.be.eql(400)
                done()
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminAddModel('modelName2', 'appId1', Buffer.from([0xff, 0x11]), 'modelDescription', 5, ['tag1', 'tag2']).then((result) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        })

        it('should return a 409 status when LeiaAPI returns a 409 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminAddModel('modelName3', 'appId1', Buffer.from([0xff, 0x11]), 'modelDescription', 5, ['tag1', 'tag2']).then((result) => {
            }).catch((error) => {
                error.status.should.be.eql(409)
                done()
            })
        })

    })


    describe('adminDeleteModel()', () => {
        it('should call the right url', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminDeleteModel('id1').then((_) => {
                done()
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminDeleteModel('id2').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminDeleteModel('id3').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(403)
                done()
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminDeleteModel('id4').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
            })
        });
    })


    describe('adminApplyModelToDocument()', () => {
        it('should return a prediction result object', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminApplyModelToDocument('modelId1', ['documentId1']).then((result) => {
                result.should.be.a('object');
                result.classification.should.be.eql('test')
                done()
            })
        });

        it('should return a prediction result object when providing a tag', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminApplyModelToDocument('modelId1', ['documentId1'], 'tag1').then((result) => {
                result.should.be.a('object');
                result.classification.should.be.eql('test')
                done()
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminApplyModelToDocument('modelId1', ['documentId2']).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(400)
                done()
            })
        })

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminApplyModelToDocument('modelId1', ['documentId3']).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminApplyModelToDocument('modelId1', ['documentId4']).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(403)
                done()
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminApplyModelToDocument('modelId1', ['documentId5']).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
            })
        });
    })


    describe('applyModelToDocument()', () => {
        it('should return a prediction result object', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.applyModelToDocument('modelId1', ['documentId1']).then((result) => {
                result.should.be.a('object');
                result.classification.should.be.eql('test')
                done()
            })
        });

        it('should return a prediction result object when providing a tag', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.applyModelToDocument('modelId1', ['documentId1'], 'tag1').then((result) => {
                result.should.be.a('object');
                result.classification.should.be.eql('test')
                done()
            })
        });

        it('should return a 401 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.applyModelToDocument('modelId1', ['documentId2']).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(400)
                done()
            })
        })

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.applyModelToDocument('modelId1', ['documentId3']).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.applyModelToDocument('modelId1', ['documentId4']).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(403)
                done()
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.applyModelToDocument('modelId1', ['documentId5']).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
            })
        });
    })

    describe('adminAddTagToModel()', () => {
        it('should return a Model', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminAddTagToModel('modelId1', 'tag1').then((result) => {
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
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminAddTagToModel('modelId1', 'tag2').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminAddTagToModel('modelId1', 'tag3').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(403)
                done()
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminAddTagToModel('modelId1', 'tag4').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
            })
        });
    })

    describe('addTagToModel()', () => {
        it('should return a Model', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
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
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.addTagToModel('modelId1', 'tag2').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.addTagToModel('modelId1', 'tag3').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(403)
                done()
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.addTagToModel('modelId1', 'tag4').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
            })
        });
    })

    describe('adminRemoveTagFromModel()', () => {
        it('should return a Model', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminRemoveTagFromModel('modelId1', 'tag1').then((result) => {
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
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminRemoveTagFromModel('modelId1', 'tag2').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminRemoveTagFromModel('modelId1', 'tag3').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(403)
                done()
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminRemoveTagFromModel('modelId1', 'tag4').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
            })
        });
    })

    describe('removeTagFromModel()', () => {
        it('should return a Model', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
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
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.removeTagFromModel('modelId1', 'tag2').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.removeTagFromModel('modelId1', 'tag3').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(403)
                done()
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.removeTagFromModel('modelId1', 'tag4').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
            })
        });
    })
})

describe('LeIA Document API', () => {
    beforeEach((done) => {
        mockDocumentAPI()
        done()
    });

    describe('adminGetDocuments()', () => {
        it('should return a list of documents', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });

        it('should return a list of documents when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });

        it('should return a list of documents when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });

        it('should return a list of documents when sort is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });

        it('should return a list of documents when tags is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });

        it('should return a list of documents when applicationId is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });

        it('should return a list of documents when all parameters are provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)

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
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminGetDocuments(null, null, null, 3).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        })

        it('should return an empty list when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminGetDocuments(null, null, null, 5).then((result) => {
                (result.contentRange == null).should.be.true
                result.documents.length.should.be.eql(0)
                done()
            })
        })
    })

    describe('getDocuments()', () => {
        it('should return a list of documents', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)

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
        });

        it('should return a list of documents when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)

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
        });

        it('should return a list of documents when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)

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
        });

        it('should return a list of documents when sort is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)

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
        });

        it('should return a list of documents when tags is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)

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
        });

        it('should return a list of documents when applicationId is provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)

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
        });

        it('should return a list of documents when all parameters are provided', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)

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
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.getDocuments(null, null, null, 3).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        })

        it('should return an empty list when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.getDocuments(null, null, null, 5).then((result) => {
                (result.contentRange == null).should.be.true
                result.documents.length.should.be.eql(0)
                done()
            })
        })
    })

    describe('adminGetDocument()', () => {
        it('should return a Document', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
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
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminGetDocument('id2').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminGetDocument('id3').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(403)
                done()
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminGetDocument('id4').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
            })
        });
    })

    describe('getDocument()', () => {
        it('should return a Document', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
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
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.getDocument('id2').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.getDocument('id3').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(403)
                done()
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.getDocument('id4').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
            })
        });
    })

    describe('adminAddDocument()', () => {
        it('should return a Document', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminAddDocument('test.jpg', Buffer.from([0xff, 0x11]), 'appId1', ['tag1']).then((result) => {
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
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminAddDocument('test.jpg', Buffer.from([0xff, 0x11]), 'appId0', ['tag0']).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(400)
                done()
            })
        })

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminAddDocument('test.jpg', Buffer.from([0xff, 0x11]), 'appId2', ['tag2']).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        })

    })

    describe('addDocument()', () => {
        it('should return a Document', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
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
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.addDocument('test.jpg', Buffer.from([0xff, 0x11]), ['tag0']).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(400)
                done()
            })
        })

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.addDocument('test.jpg', Buffer.from([0xff, 0x11]), ['tag2']).then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        })
    })

    describe('adminTransformPDF()', () => {
        it('should return a list of documents', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminTransformPDF(['id1'], 'image').then((result) => {
                result.should.be.a('array');
                result.length.should.be.eql(1)
                result[0].id.should.be.eql(document.id)
                result[0].creationTime.should.be.eql(document.creation_time)
                result[0].filename.should.be.eql(document.filename)
                result[0].extension.should.be.eql(document.extension)
                result[0].correctAngle.should.be.eql(document.correct_angle)
                result[0].applicationId.should.be.eql(document.application_id)
                result[0].mimeType.should.be.eql(document.mime_type)
                result[0].tags.should.be.eql(document.tags)
                done()
            })
        });

        it('should return a list of documents when providing an inputTag', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminTransformPDF(['id1'], 'image', 'tag1').then((result) => {
                result.should.be.a('array');
                result.length.should.be.eql(1)
                result[0].id.should.be.eql(document.id)
                result[0].creationTime.should.be.eql(document.creation_time)
                result[0].filename.should.be.eql(document.filename)
                result[0].extension.should.be.eql(document.extension)
                result[0].correctAngle.should.be.eql(document.correct_angle)
                result[0].applicationId.should.be.eql(document.application_id)
                result[0].mimeType.should.be.eql(document.mime_type)
                result[0].tags.should.be.eql(document.tags)
                done()
            })
        });

        it('should return a list of documents when providing an outputTag', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminTransformPDF(['id1'], 'image', null, 'tag1').then((result) => {
                result.should.be.a('array');
                result.length.should.be.eql(1)
                result[0].id.should.be.eql(document.id)
                result[0].creationTime.should.be.eql(document.creation_time)
                result[0].filename.should.be.eql(document.filename)
                result[0].extension.should.be.eql(document.extension)
                result[0].correctAngle.should.be.eql(document.correct_angle)
                result[0].applicationId.should.be.eql(document.application_id)
                result[0].mimeType.should.be.eql(document.mime_type)
                result[0].tags.should.be.eql(document.tags)
                done()
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminTransformPDF(['id2'], 'image', null, 'tag2').then((result) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminTransformPDF(['id3'], 'image', null, 'tag3').then((result) => {
            }).catch((error) => {
                error.status.should.be.eql(403)
                done()
            })
        })

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminTransformPDF(['id4'], 'image', null, 'tag4').then((result) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
            })
        })

    })

    describe('transformPDF()', () => {
        it('should return a list of documents', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.transformPDF(['id1'], 'image').then((result) => {
                result.should.be.a('array');
                result.length.should.be.eql(1)
                result[0].id.should.be.eql(document.id)
                result[0].creationTime.should.be.eql(document.creation_time)
                result[0].filename.should.be.eql(document.filename)
                result[0].extension.should.be.eql(document.extension)
                result[0].correctAngle.should.be.eql(document.correct_angle)
                result[0].applicationId.should.be.eql(document.application_id)
                result[0].mimeType.should.be.eql(document.mime_type)
                result[0].tags.should.be.eql(document.tags)
                done()
            })
        });

        it('should return a list of documents when providing an inputTag', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.transformPDF(['id1'], 'image', 'tag1').then((result) => {
                result.should.be.a('array');
                result.length.should.be.eql(1)
                result[0].id.should.be.eql(document.id)
                result[0].creationTime.should.be.eql(document.creation_time)
                result[0].filename.should.be.eql(document.filename)
                result[0].extension.should.be.eql(document.extension)
                result[0].correctAngle.should.be.eql(document.correct_angle)
                result[0].applicationId.should.be.eql(document.application_id)
                result[0].mimeType.should.be.eql(document.mime_type)
                result[0].tags.should.be.eql(document.tags)
                done()
            })
        });

        it('should return a list of documents when providing an outputTag', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.transformPDF(['id1'], 'image', null, 'tag1').then((result) => {
                result.should.be.a('array');
                result.length.should.be.eql(1)
                result[0].id.should.be.eql(document.id)
                result[0].creationTime.should.be.eql(document.creation_time)
                result[0].filename.should.be.eql(document.filename)
                result[0].extension.should.be.eql(document.extension)
                result[0].correctAngle.should.be.eql(document.correct_angle)
                result[0].applicationId.should.be.eql(document.application_id)
                result[0].mimeType.should.be.eql(document.mime_type)
                result[0].tags.should.be.eql(document.tags)
                done()
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.transformPDF(['id2'], 'image', null, 'tag2').then((result) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.transformPDF(['id3'], 'image', null, 'tag3').then((result) => {
            }).catch((error) => {
                error.status.should.be.eql(403)
                done()
            })
        })

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKeyDev', serverURL)
            leiaAPI.transformPDF(['id4'], 'image', null, 'tag4').then((result) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
            })
        })

    })
    

    describe('adminDeleteDocument()', () => {
        it('should call the right url', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminDeleteDocument('id1').then((result) => {
                done()
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminDeleteDocument('id2').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminDeleteDocument('id3').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(403)
                done()
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.adminDeleteDocument('id4').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
            })
        });
    })

    describe('deleteDocument()', () => {
        it('should call the right url', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.deleteDocument('id1').then((result) => {
                done()
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.deleteDocument('id2').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(401)
                done()
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.deleteDocument('id3').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(403)
                done()
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI('mockApiKey', serverURL)
            leiaAPI.deleteDocument('id4').then((_) => {
            }).catch((error) => {
                error.status.should.be.eql(404)
                done()
            })
        });
    })
})
