let chai = require('chai');
let chaiHttp = require('chai-http');
let nock = require('nock')
let LeiaAPI = require('../index')
chai.use(chaiHttp);
chai.should();

const serverURL = "https://test.com"


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
        .post('/annotation/documentId1?annotation_type=BOX')
        .reply(200, annotation);

    nock(serverURL)
        .post('/annotation/documentId1?annotation_type=BOX&name=test')
        .reply(200, annotation);

    nock(serverURL)
        .post('/annotation/documentId1?annotation_type=BOX&tags=tag1')
        .reply(200, annotation);

    nock(serverURL)
        .post('/annotation/documentId1?annotation_type=BOX&name=test&tags=tag1')
        .reply(200, annotation);

    nock(serverURL)
        .post('/annotation/documentId1?annotation_type=BOX&name=test2')
        .reply(400, null);

    nock(serverURL)
        .post('/annotation/documentId1?annotation_type=BOX&name=test3')
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

    describe('addTagToAnnotation()', () => {
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

    describe('deleteAnnotation()', () => {
        it('should call the right url', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.deleteAnnotation('id1').then(() => {
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

})