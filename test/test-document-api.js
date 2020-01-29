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

const document = {
    "id": 'id1',
    "creation_time": 'datetime',
    "tags": ['tag1', 'tag2'],
    "application_id": 'appid1',
    "filename": 'file1',
    "original_id": 'origId1',
    "extension": '.jpg',
    "mime_type": 'jpg',
    "rotation_angle": 0,
    "size": 1000,
    "expiration_time": '2018-11-07T16:02:29.761Z'
}

const transformDocumentsProcessingJob = {
    "application_id": "appId1",
    "creation_time": "2018-11-07T16:02:29.761Z",
    "document_ids": [
        "documentId1"
    ],
    "execute_after_id": "507f191e810c19729de860ed",
    "id": "id1",
    "submitter_id": "submitterId1",
    "job_type": "pdf-images",
    "starting_time": "2018-11-07T16:02:29.761Z",
    "status": "PROCESSING"
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
        .get('/admin/document?sort=filename,-extension')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/document?application_id=appId1')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/document?tag_result=tag3')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/document?document_id=id1')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/document?tags=tag1&tags=tag2')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/document?filename=test')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/document?extension=jpg')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/document?mime_type=image/jpeg')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/document?original_id=id1')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/document?created_after=2018-10-10T10:10:10')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/document?created_before=2018-10-10T10:10:10')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/document?offset=20&limit=20&sort=filename,-extension&application_id=appId1&tag_result=tag3&document_id=id1&tags=tag1&tags=tag2&filename=test&extension=jpg&mime_type=image/jpeg&original_id=id1&created_after=2018-10-10T10:10:10&created_before=2018-10-10T10:10:10')
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
        .get('/admin/' + application.id + '/document/id1')
        .reply(200, document);

    nock(serverURL)
        .get('/admin/' + application.id + '/document/id2')
        .reply(401, null);

    nock(serverURL)
        .get('/admin/' + application.id + '/document/id3')
        .reply(403, null);

    nock(serverURL)
        .get('/admin/' + application.id + '/document/id4')
        .reply(404, null);

    nock(serverURL)
        .get('/admin/' + application.id + '/document/id1/file_contents')
        .reply(200, Buffer.from([0xff, 0x11]));

    nock(serverURL)
        .get('/admin/' + application.id + '/document/id2/file_contents')
        .reply(401, null);

    nock(serverURL)
        .get('/admin/' + application.id + '/document/id3/file_contents')
        .reply(403, null);

    nock(serverURL)
        .get('/admin/' + application.id + '/document/id4/file_contents')
        .reply(404, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/document/id1/transform/image')
        .reply(200, transformDocumentsProcessingJob);

    nock(serverURL)
        .post('/admin/' + application.id + '/document/id1/transform/image?input_tag=tag1')
        .reply(200, transformDocumentsProcessingJob);

    nock(serverURL)
        .post('/admin/' + application.id + '/document/id1/transform/image?output_tag=tag1')
        .reply(200, transformDocumentsProcessingJob);

    nock(serverURL)
        .post('/admin/' + application.id + '/document/id1/transform/image?execute_after_id=jobId1')
        .reply(200, transformDocumentsProcessingJob);

    nock(serverURL)
        .post('/admin/' + application.id + '/document/id1/transform/image?callback_url=https://test.com')
        .reply(200, transformDocumentsProcessingJob);

    nock(serverURL)
        .post('/admin/' + application.id + '/document/id1/transform/image?input_tag=tag1&output_tag=tag1&execute_after_id=jobId1&callback_url=https://test.com')
        .reply(200, transformDocumentsProcessingJob);

    nock(serverURL)
        .post('/admin/' + application.id + '/document/id1/transform/image?output_tag=tag1')
        .reply(200, transformDocumentsProcessingJob);

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
        .get('/document?sort=filename,-extension')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/document?tag_result=tag3')
        .reply(200, [document], { 'content-range': '0-1/1' });

        nock(serverURL)
        .get('/document?document_id=id1')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/document?tags=tag1&tags=tag2')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/document?filename=test')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/document?extension=jpg')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/document?mime_type=image/jpeg')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/document?original_id=id1')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/document?created_after=2018-10-10T10:10:10')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/document?created_before=2018-10-10T10:10:10')
        .reply(200, [document], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/document?offset=20&limit=20&sort=filename,-extension&tag_result=tag3&document_id=id1&tags=tag1&tags=tag2&filename=test&extension=jpg&mime_type=image/jpeg&original_id=id1&created_after=2018-10-10T10:10:10&created_before=2018-10-10T10:10:10')
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
        .get('/document/id1/file_contents')
        .reply(200, document);

    nock(serverURL)
        .get('/document/id2/file_contents')
        .reply(401, null);

    nock(serverURL)
        .get('/document/id3/file_contents')
        .reply(403, null);

    nock(serverURL)
        .get('/document/id4/file_contents')
        .reply(404, null);

    nock(serverURL)
        .post('/document/id1/transform/image')
        .reply(200, transformDocumentsProcessingJob);

    nock(serverURL)
        .post('/document/id1/transform/image?input_tag=tag1')
        .reply(200, transformDocumentsProcessingJob);

    nock(serverURL)
        .post('/document/id1/transform/image?output_tag=tag1')
        .reply(200, transformDocumentsProcessingJob);

    nock(serverURL)
        .post('/document/id1/transform/image?execute_after_id=jobId1')
        .reply(200, transformDocumentsProcessingJob);

    nock(serverURL)
        .post('/document/id1/transform/image?callback_url=https://test.com')
        .reply(200, transformDocumentsProcessingJob);

    nock(serverURL)
        .post('/document/id1/transform/image?input_tag=tag1&output_tag=tag1&execute_after_id=jobId1&callback_url=https://test.com')
        .reply(200, transformDocumentsProcessingJob);

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
        .post('/admin/' + application.id + '/document?filename=test.jpg&tags=tag1&ttl=70')
        .reply(200, document);
    nock(serverURL)
        .post('/document?filename=test.jpg&tags=tag1&ttl=70')
        .reply(200, document);

    nock(serverURL)
        .post('/admin/' + application.id + '/document?filename=test.jpg&tags=tag0&ttl=70')
        .reply(400, null);

    nock(serverURL)
        .post('/document?filename=test.jpg&tags=tag0&ttl=70')
        .reply(400, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/document?filename=test.jpg&tags=tag2&ttl=70')
        .reply(401, null);

    nock(serverURL)
        .post('/document?filename=test.jpg&tags=tag2&ttl=70')
        .reply(401, null);

    nock(serverURL)
        .post('/admin/' + application.id + '/document?filename=test.jpg&tags=tag3&ttl=70')
        .reply(403, null);

    nock(serverURL)
        .post('/document?filename=test.jpg&tags=tag3&ttl=70')
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
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetDocuments(20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetDocuments(null, 20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when sort is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetDocuments(null, null, ['filename', '-extension']).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when applicationId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetDocuments(null, null, null, 'appId1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when tagResult is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetDocuments(null, null, null, null, 'tag3').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when documentId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetDocuments(null, null, null, null, null, 'id1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when tags is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetDocuments(null, null, null, null, null, null, ['tag1', 'tag2']).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when filename is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetDocuments(null, null, null, null, null, null, null, 'test').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when extension is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetDocuments(null, null, null, null, null, null, null, null, 'jpg').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when mimeType is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetDocuments(null, null, null, null, null, null, null, null, null, 'image/jpeg').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when originalId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetDocuments(null, null, null, null, null, null, null, null, null, null, 'id1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when createdAfter is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetDocuments(null, null, null, null, null, null, null, null, null, null, null, '2018-10-10T10:10:10').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when createdBefore is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetDocuments(null, null, null, null, null, null, null, null, null, null, null, null, '2018-10-10T10:10:10').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when all parameters are provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetDocuments(20, 20, ['filename', '-extension'], 'appId1', 'tag3', 'id1', ['tag1', 'tag2'],
                    'test', 'jpg', 'image/jpeg', 'id1', '2018-10-10T10:10:10', '2018-10-10T10:10:10').then((result) => {
                        result.contentRange.offset.should.be.eql(0)
                        result.contentRange.limit.should.be.eql(1)
                        result.contentRange.total.should.be.eql(1)
                        result.documents.should.be.a('array');
                        result.documents.length.should.be.eql(1)
                        result.documents[0].id.should.be.eql(document.id)
                        result.documents[0].creationTime.should.be.eql(document.creation_time)
                        result.documents[0].filename.should.be.eql(document.filename)
                        result.documents[0].extension.should.be.eql(document.extension)
                        result.documents[0].originalId.should.be.eql(document.original_id)
                        result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                        result.documents[0].applicationId.should.be.eql(document.application_id)
                        result.documents[0].mimeType.should.be.eql(document.mime_type)
                        result.documents[0].tags.should.be.eql(document.tags)
                        result.documents[0].size.should.be.eql(document.size)
                        result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                        done()
                    })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetDocuments(null, 3).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return an empty list when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetDocuments(null, 5).then((result) => {
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
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(null, 20).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when sort is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(null, null, ['filename', '-extension']).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when tagResult is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(null, null, null, 'tag3').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when documentId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(null, null, null, null, 'id1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when tags is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(null, null, null, null, null, ['tag1', 'tag2']).then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when filename is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(null, null, null, null, null, null, 'test').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when extension is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(null, null, null, null, null, null, null, 'jpg').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when mimeType is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(null, null, null, null, null, null, null, null, 'image/jpeg').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when originalId is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(null, null, null, null, null, null, null, null, null, 'id1').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when createdAfter is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(null, null, null, null, null, null, null, null, null, null, '2018-10-10T10:10:10').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when createdBefore is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(null, null, null, null, null, null, null, null, null, null, null, '2018-10-10T10:10:10').then((result) => {
                    result.contentRange.offset.should.be.eql(0)
                    result.contentRange.limit.should.be.eql(1)
                    result.contentRange.total.should.be.eql(1)
                    result.documents.should.be.a('array');
                    result.documents.length.should.be.eql(1)
                    result.documents[0].id.should.be.eql(document.id)
                    result.documents[0].creationTime.should.be.eql(document.creation_time)
                    result.documents[0].filename.should.be.eql(document.filename)
                    result.documents[0].extension.should.be.eql(document.extension)
                    result.documents[0].originalId.should.be.eql(document.original_id)
                    result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                    result.documents[0].applicationId.should.be.eql(document.application_id)
                    result.documents[0].mimeType.should.be.eql(document.mime_type)
                    result.documents[0].tags.should.be.eql(document.tags)
                    result.documents[0].size.should.be.eql(document.size)
                    result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a list of documents when all parameters are provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.getDocuments(20, 20, ['filename', '-extension'], 'tag3', 'id1', ['tag1', 'tag2'],
                    'test', 'jpg', 'image/jpeg', 'id1', '2018-10-10T10:10:10', '2018-10-10T10:10:10').then((result) => {
                        result.contentRange.offset.should.be.eql(0)
                        result.contentRange.limit.should.be.eql(1)
                        result.contentRange.total.should.be.eql(1)
                        result.documents.should.be.a('array');
                        result.documents.length.should.be.eql(1)
                        result.documents[0].id.should.be.eql(document.id)
                        result.documents[0].creationTime.should.be.eql(document.creation_time)
                        result.documents[0].filename.should.be.eql(document.filename)
                        result.documents[0].extension.should.be.eql(document.extension)
                        result.documents[0].originalId.should.be.eql(document.original_id)
                        result.documents[0].rotationAngle.should.be.eql(document.rotation_angle)
                        result.documents[0].applicationId.should.be.eql(document.application_id)
                        result.documents[0].mimeType.should.be.eql(document.mime_type)
                        result.documents[0].tags.should.be.eql(document.tags)
                        result.documents[0].size.should.be.eql(document.size)
                        result.documents[0].expirationTime.should.be.eql(document.expiration_time)
                        done()
                    })
            })
        });
        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getDocuments(null, 3).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return an empty list when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getDocuments(null, 5).then((result) => {
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
                leiaAPI.adminGetDocument(application.id, 'id1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.originalId.should.be.eql(document.original_id)
                    result.rotationAngle.should.be.eql(document.rotation_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    result.size.should.be.eql(document.size)
                    result.expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetDocument(application.id, 'id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetDocument(application.id, 'id3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetDocument(application.id, 'id4').then((_) => {
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
                    result.originalId.should.be.eql(document.original_id)
                    result.rotationAngle.should.be.eql(document.rotation_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    result.size.should.be.eql(document.size)
                    result.expirationTime.should.be.eql(document.expiration_time)
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

    describe('adminGetDocumentContent()', () => {
        it('should return a Document content', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetDocumentContent(application.id, 'id1').then((result) => {
                    (typeof result === 'object').should.be.true
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetDocumentContent(application.id, 'id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetDocumentContent(application.id, 'id3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetDocumentContent(application.id, 'id4').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        });
    })

    describe('getDocumentContent()', () => {
        it('should return a Document content', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getDocumentContent('id1').then((result) => {
                    Buffer.isBuffer(result).should.be.true
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getDocumentContent('id2').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getDocumentContent('id3').then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getDocumentContent('id4').then((_) => {
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
                leiaAPI.adminAddDocument(application.id, 'test.jpg', Buffer.from([0xff, 0x11]), ['tag1'], 70).then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.originalId.should.be.eql(document.original_id)
                    result.rotationAngle.should.be.eql(document.rotation_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    result.size.should.be.eql(document.size)
                    result.expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddDocument(application.id, 'test.jpg', Buffer.from([0xff, 0x11]), ['tag0'], 70).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        })

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddDocument(application.id, 'test.jpg', Buffer.from([0xff, 0x11]), ['tag2'], 70).then((_) => {
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
                leiaAPI.addDocument('test.jpg', Buffer.from([0xff, 0x11]), ['tag1'], 70).then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.originalId.should.be.eql(document.original_id)
                    result.rotationAngle.should.be.eql(document.rotation_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    result.size.should.be.eql(document.size)
                    result.expirationTime.should.be.eql(document.expiration_time)
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addDocument('test.jpg', Buffer.from([0xff, 0x11]), ['tag0'], 70).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        })

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.addDocument('test.jpg', Buffer.from([0xff, 0x11]), ['tag2'], 70).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })
    })

    describe('adminTransformDocuments()', () => {
        it('should return a job', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminTransformDocuments(application.id, ['id1'], 'image').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformDocumentsProcessingJob.id)
                    result.creationTime.should.be.eql(transformDocumentsProcessingJob.creation_time)
                    result.applicationId.should.be.eql(transformDocumentsProcessingJob.application_id)
                    result.documentIds.should.be.eql(transformDocumentsProcessingJob.document_ids)
                    result.jobType.should.be.eql(transformDocumentsProcessingJob.job_type)
                    result.submitterId.should.be.eql(transformDocumentsProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(transformDocumentsProcessingJob.starting_time)
                    result.status.should.be.eql(transformDocumentsProcessingJob.status)
                    result.executeAfterId.should.be.eql(transformDocumentsProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a job when providing an inputTag', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminTransformDocuments(application.id, ['id1'], 'image', null, 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformDocumentsProcessingJob.id)
                    result.creationTime.should.be.eql(transformDocumentsProcessingJob.creation_time)
                    result.applicationId.should.be.eql(transformDocumentsProcessingJob.application_id)
                    result.documentIds.should.be.eql(transformDocumentsProcessingJob.document_ids)
                    result.jobType.should.be.eql(transformDocumentsProcessingJob.job_type)
                    result.submitterId.should.be.eql(transformDocumentsProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(transformDocumentsProcessingJob.starting_time)
                    result.status.should.be.eql(transformDocumentsProcessingJob.status)
                    result.executeAfterId.should.be.eql(transformDocumentsProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a job when providing an outputTag', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminTransformDocuments(application.id, ['id1'], 'image', null, null, 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformDocumentsProcessingJob.id)
                    result.creationTime.should.be.eql(transformDocumentsProcessingJob.creation_time)
                    result.applicationId.should.be.eql(transformDocumentsProcessingJob.application_id)
                    result.documentIds.should.be.eql(transformDocumentsProcessingJob.document_ids)
                    result.jobType.should.be.eql(transformDocumentsProcessingJob.job_type)
                    result.submitterId.should.be.eql(transformDocumentsProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(transformDocumentsProcessingJob.starting_time)
                    result.status.should.be.eql(transformDocumentsProcessingJob.status)
                    result.executeAfterId.should.be.eql(transformDocumentsProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a job when providing an executeAfterId', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminTransformDocuments(application.id, ['id1'], 'image', null, null, null, 'jobId1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformDocumentsProcessingJob.id)
                    result.creationTime.should.be.eql(transformDocumentsProcessingJob.creation_time)
                    result.applicationId.should.be.eql(transformDocumentsProcessingJob.application_id)
                    result.documentIds.should.be.eql(transformDocumentsProcessingJob.document_ids)
                    result.jobType.should.be.eql(transformDocumentsProcessingJob.job_type)
                    result.submitterId.should.be.eql(transformDocumentsProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(transformDocumentsProcessingJob.starting_time)
                    result.status.should.be.eql(transformDocumentsProcessingJob.status)
                    result.executeAfterId.should.be.eql(transformDocumentsProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a job when providing a callback url', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminTransformDocuments(application.id, ['id1'], 'image', null, null, null, null, 'https://test.com').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformDocumentsProcessingJob.id)
                    result.creationTime.should.be.eql(transformDocumentsProcessingJob.creation_time)
                    result.applicationId.should.be.eql(transformDocumentsProcessingJob.application_id)
                    result.documentIds.should.be.eql(transformDocumentsProcessingJob.document_ids)
                    result.jobType.should.be.eql(transformDocumentsProcessingJob.job_type)
                    result.submitterId.should.be.eql(transformDocumentsProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(transformDocumentsProcessingJob.starting_time)
                    result.status.should.be.eql(transformDocumentsProcessingJob.status)
                    result.executeAfterId.should.be.eql(transformDocumentsProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a job when providing all parameters', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminTransformDocuments(application.id, ['id1'], 'image', null, 'tag1', 'tag1', 'jobId1', 'https://test.com').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformDocumentsProcessingJob.id)
                    result.creationTime.should.be.eql(transformDocumentsProcessingJob.creation_time)
                    result.applicationId.should.be.eql(transformDocumentsProcessingJob.application_id)
                    result.documentIds.should.be.eql(transformDocumentsProcessingJob.document_ids)
                    result.jobType.should.be.eql(transformDocumentsProcessingJob.job_type)
                    result.submitterId.should.be.eql(transformDocumentsProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(transformDocumentsProcessingJob.starting_time)
                    result.status.should.be.eql(transformDocumentsProcessingJob.status)
                    result.executeAfterId.should.be.eql(transformDocumentsProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminTransformDocuments(application.id, ['id2'], 'image', null, null, 'tag2').then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminTransformDocuments(application.id, ['id3'], 'image', null, null, 'tag3').then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        })

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminTransformDocuments(application.id, ['id4'], 'image', null, null, 'tag4').then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        })

    })

    describe('transformDocuments()', () => {
        it('should return a list of documents', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.transformDocuments(['id1'], 'image').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformDocumentsProcessingJob.id)
                    result.creationTime.should.be.eql(transformDocumentsProcessingJob.creation_time)
                    result.applicationId.should.be.eql(transformDocumentsProcessingJob.application_id)
                    result.documentIds.should.be.eql(transformDocumentsProcessingJob.document_ids)
                    result.jobType.should.be.eql(transformDocumentsProcessingJob.job_type)
                    result.submitterId.should.be.eql(transformDocumentsProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(transformDocumentsProcessingJob.starting_time)
                    result.status.should.be.eql(transformDocumentsProcessingJob.status)
                    result.executeAfterId.should.be.eql(transformDocumentsProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a list of documents when providing an inputTag', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.transformDocuments(['id1'], 'image', null, 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformDocumentsProcessingJob.id)
                    result.creationTime.should.be.eql(transformDocumentsProcessingJob.creation_time)
                    result.applicationId.should.be.eql(transformDocumentsProcessingJob.application_id)
                    result.documentIds.should.be.eql(transformDocumentsProcessingJob.document_ids)
                    result.jobType.should.be.eql(transformDocumentsProcessingJob.job_type)
                    result.submitterId.should.be.eql(transformDocumentsProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(transformDocumentsProcessingJob.starting_time)
                    result.status.should.be.eql(transformDocumentsProcessingJob.status)
                    result.executeAfterId.should.be.eql(transformDocumentsProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a list of documents when providing an outputTag', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.transformDocuments(['id1'], 'image', null, null, 'tag1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformDocumentsProcessingJob.id)
                    result.creationTime.should.be.eql(transformDocumentsProcessingJob.creation_time)
                    result.applicationId.should.be.eql(transformDocumentsProcessingJob.application_id)
                    result.documentIds.should.be.eql(transformDocumentsProcessingJob.document_ids)
                    result.jobType.should.be.eql(transformDocumentsProcessingJob.job_type)
                    result.submitterId.should.be.eql(transformDocumentsProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(transformDocumentsProcessingJob.starting_time)
                    result.status.should.be.eql(transformDocumentsProcessingJob.status)
                    result.executeAfterId.should.be.eql(transformDocumentsProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a list of documents when providing an executeAfterId', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.transformDocuments(['id1'], 'image', null, null, null, 'jobId1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformDocumentsProcessingJob.id)
                    result.creationTime.should.be.eql(transformDocumentsProcessingJob.creation_time)
                    result.applicationId.should.be.eql(transformDocumentsProcessingJob.application_id)
                    result.documentIds.should.be.eql(transformDocumentsProcessingJob.document_ids)
                    result.jobType.should.be.eql(transformDocumentsProcessingJob.job_type)
                    result.submitterId.should.be.eql(transformDocumentsProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(transformDocumentsProcessingJob.starting_time)
                    result.status.should.be.eql(transformDocumentsProcessingJob.status)
                    result.executeAfterId.should.be.eql(transformDocumentsProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a job when providing all parameters', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.transformDocuments(['id1'], 'image', null, 'tag1', 'tag1', 'jobId1', 'https://test.com').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(transformDocumentsProcessingJob.id)
                    result.creationTime.should.be.eql(transformDocumentsProcessingJob.creation_time)
                    result.applicationId.should.be.eql(transformDocumentsProcessingJob.application_id)
                    result.documentIds.should.be.eql(transformDocumentsProcessingJob.document_ids)
                    result.jobType.should.be.eql(transformDocumentsProcessingJob.job_type)
                    result.submitterId.should.be.eql(transformDocumentsProcessingJob.submitter_id)
                    result.startingTime.should.be.eql(transformDocumentsProcessingJob.starting_time)
                    result.status.should.be.eql(transformDocumentsProcessingJob.status)
                    result.executeAfterId.should.be.eql(transformDocumentsProcessingJob.execute_after_id)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.transformDocuments(['id2'], 'image', null, null, 'tag2').then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.transformDocuments(['id3'], 'image', null, null, 'tag3').then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        })

        it('should return a 404 status when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.transformDocuments(['id4'], 'image', null, null, 'tag4').then((result) => {
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
                    result.originalId.should.be.eql(document.original_id)
                    result.rotationAngle.should.be.eql(document.rotation_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    result.size.should.be.eql(document.size)
                    result.expirationTime.should.be.eql(document.expiration_time)
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
                    result.originalId.should.be.eql(document.original_id)
                    result.rotationAngle.should.be.eql(document.rotation_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    result.size.should.be.eql(document.size)
                    result.expirationTime.should.be.eql(document.expiration_time)
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
                    result.originalId.should.be.eql(document.original_id)
                    result.rotationAngle.should.be.eql(document.rotation_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    result.size.should.be.eql(document.size)
                    result.expirationTime.should.be.eql(document.expiration_time)
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
                    result.originalId.should.be.eql(document.original_id)
                    result.rotationAngle.should.be.eql(document.rotation_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    result.size.should.be.eql(document.size)
                    result.expirationTime.should.be.eql(document.expiration_time)
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
                    result.originalId.should.be.eql(document.original_id)
                    result.rotationAngle.should.be.eql(document.rotation_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    result.size.should.be.eql(document.size)
                    result.expirationTime.should.be.eql(document.expiration_time)
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
                    result.originalId.should.be.eql(document.original_id)
                    result.rotationAngle.should.be.eql(document.rotation_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    result.size.should.be.eql(document.size)
                    result.expirationTime.should.be.eql(document.expiration_time)
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
                    result.originalId.should.be.eql(document.original_id)
                    result.rotationAngle.should.be.eql(document.rotation_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    result.size.should.be.eql(document.size)
                    result.expirationTime.should.be.eql(document.expiration_time)
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
                    result.originalId.should.be.eql(document.original_id)
                    result.rotationAngle.should.be.eql(document.rotation_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    result.size.should.be.eql(document.size)
                    result.expirationTime.should.be.eql(document.expiration_time)
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
                    result.originalId.should.be.eql(document.original_id)
                    result.rotationAngle.should.be.eql(document.rotation_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    result.size.should.be.eql(document.size)
                    result.expirationTime.should.be.eql(document.expiration_time)
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
                    result.originalId.should.be.eql(document.original_id)
                    result.rotationAngle.should.be.eql(document.rotation_angle)
                    result.applicationId.should.be.eql(document.application_id)
                    result.mimeType.should.be.eql(document.mime_type)
                    result.tags.should.be.eql(document.tags)
                    result.size.should.be.eql(document.size)
                    result.expirationTime.should.be.eql(document.expiration_time)
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

