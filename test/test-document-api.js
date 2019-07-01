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
    "correct_angle": 0
}

const transformPDFProcessingJob = {
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
        .get('/admin/' + application.id + '/document/id1?file_contents=true')
        .reply(200, document);

    nock(serverURL)
        .get('/admin/' + application.id + '/document/id2?file_contents=true')
        .reply(401, null);

    nock(serverURL)
        .get('/admin/' + application.id + '/document/id3?file_contents=true')
        .reply(403, null);

    nock(serverURL)
        .get('/admin/' + application.id + '/document/id4?file_contents=true')
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
        .get('/document/id1?file_contents=true')
        .reply(200, document);

    nock(serverURL)
        .get('/document/id2?file_contents=true')
        .reply(401, null);

    nock(serverURL)
        .get('/document/id3?file_contents=true')
        .reply(403, null);

    nock(serverURL)
        .get('/document/id4?file_contents=true')
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
                    result.documents[0].originalId.should.be.eql(document.original_id)
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
                    result.documents[0].originalId.should.be.eql(document.original_id)
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
                    result.documents[0].originalId.should.be.eql(document.original_id)
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
                    result.documents[0].originalId.should.be.eql(document.original_id)
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
                    result.documents[0].originalId.should.be.eql(document.original_id)
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
                    result.documents[0].originalId.should.be.eql(document.original_id)
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
                    result.documents[0].originalId.should.be.eql(document.original_id)
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
                    result.documents[0].originalId.should.be.eql(document.original_id)
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
                    result.documents[0].originalId.should.be.eql(document.original_id)
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
                    result.documents[0].originalId.should.be.eql(document.original_id)
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
                    result.documents[0].originalId.should.be.eql(document.original_id)
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
                    result.documents[0].originalId.should.be.eql(document.original_id)
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
                    result.documents[0].originalId.should.be.eql(document.original_id)
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
                leiaAPI.adminGetDocument(application.id, 'id1').then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.originalId.should.be.eql(document.original_id)
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
                    (typeof result === 'object').should.be.true
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
                leiaAPI.adminAddDocument(application.id, 'test.jpg', Buffer.from([0xff, 0x11]), ['tag1']).then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(document.id)
                    result.creationTime.should.be.eql(document.creation_time)
                    result.filename.should.be.eql(document.filename)
                    result.extension.should.be.eql(document.extension)
                    result.originalId.should.be.eql(document.original_id)
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
                    result.originalId.should.be.eql(document.original_id)
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
                    result.submitterId.should.be.eql(transformPDFProcessingJob.submitter_id)
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
                    result.submitterId.should.be.eql(transformPDFProcessingJob.submitter_id)
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
                    result.submitterId.should.be.eql(transformPDFProcessingJob.submitter_id)
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
                    result.submitterId.should.be.eql(transformPDFProcessingJob.submitter_id)
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
                    result.submitterId.should.be.eql(transformPDFProcessingJob.submitter_id)
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
                    result.submitterId.should.be.eql(transformPDFProcessingJob.submitter_id)
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
                    result.originalId.should.be.eql(document.original_id)
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
                    result.originalId.should.be.eql(document.original_id)
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
                    result.originalId.should.be.eql(document.original_id)
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
                    result.originalId.should.be.eql(document.original_id)
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
                    result.originalId.should.be.eql(document.original_id)
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
                    result.originalId.should.be.eql(document.original_id)
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
                    result.originalId.should.be.eql(document.original_id)
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
                    result.originalId.should.be.eql(document.original_id)
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
                    result.originalId.should.be.eql(document.original_id)
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
                    result.originalId.should.be.eql(document.original_id)
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

