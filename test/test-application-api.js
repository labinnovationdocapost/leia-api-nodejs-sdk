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
    "last_name": "test",
    "default_job_callback_url": "http://test.com",
    "job_counts": {
        "predict-5d52858cb4608e10db98ea1f": 146,
        "predict-5d5285d5b4608e10db98ea20": 2,
        "predict-5d52864ab4608e10db98ea21": 1
    },
    "dedicated_workers": true
}

function mockApplicationAPI() {
    nock(serverURL)
        .get('/login/mockApiKey')
        .reply(200, { token: 'faketoken', application });

    nock(serverURL)
        .get('/login/mockApiKeyDev')
        .reply(200, { token: 'faketoken', application: { id: 'id1', application_type: 'developer', dedicated_workers: true } });

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
        .get('/admin/application?offset=20')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?limit=20')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?sort=application_name,-email')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?email=test@test.com')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?application_name=appName')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?first_name=Jean')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?last_name=test')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?application_type=admin')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?created_before=2018-10-10T10:10:10')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?created_after=2018-10-10T10:10:10')
        .reply(200, [application], { 'content-range': '0-1/1' });

    nock(serverURL)
        .get('/admin/application?offset=20&limit=20&sort=application_name,-email&email=test@test.com&application_name=appName&first_name=Jean&last_name=test&application_type=admin&created_after=2018-10-10T10:10:10&created_before=2018-10-10T10:10:10')
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
        .post('/admin/application', { application_name: 'appName', application_type: 'admin', email: 'test@test.com', first_name: 'jean', last_name: 'test', default_job_callback_url: 'http://test.com', dedicated_workers: 'true' })
        .reply(200, application);

    nock(serverURL)
        .post('/admin/application', { application_name: 'appName2', application_type: 'admin', email: 'test@test.com', first_name: 'jean', last_name: 'test', default_job_callback_url: 'http://test.com', dedicated_workers: 'true' })
        .reply(401, application);

    nock(serverURL)
        .post('/admin/application', { application_name: 'appName3', application_type: 'admin', email: 'test@test.com', first_name: 'jean', last_name: 'test', default_job_callback_url: 'http://test.com', dedicated_workers: 'true' })
        .reply(409, application);

    nock(serverURL)
        .post('/admin/application', { application_name: 'appName4', application_type: 'admin', email: 'test@test.com', first_name: 'jean', last_name: 'test', default_job_callback_url: 'http://test.com', dedicated_workers: 'true' })
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
                result.defaultJobCallbackUrl.should.be.eql(application.default_job_callback_url)
                result.jobCounts.should.be.eql(application.job_counts)
                result.jobCounts.should.be.a('object')
                result.dedicatedWorkers.should.be.eql(application.dedicated_workers)
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
                    result.applications[0].defaultJobCallbackUrl.should.be.eql(application.default_job_callback_url)
                    result.applications[0].jobCounts.should.be.eql(application.job_counts)
                    result.applications[0].jobCounts.should.be.a('object')
                    result.applications[0].dedicatedWorkers.should.be.eql(application.dedicated_workers)
                    done()
                })
            })
        });


        it('should return a list of applications when offset is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplications(20).then((result) => {
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
                    result.applications[0].defaultJobCallbackUrl.should.be.eql(application.default_job_callback_url)
                    result.applications[0].jobCounts.should.be.eql(application.job_counts)
                    result.applications[0].jobCounts.should.be.a('object')
                    result.applications[0].dedicatedWorkers.should.be.eql(application.dedicated_workers)
                    done()
                })
            })
        });

        it('should return a list of applications when limit is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplications(null, 20).then((result) => {
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
                    result.applications[0].defaultJobCallbackUrl.should.be.eql(application.default_job_callback_url)
                    result.applications[0].jobCounts.should.be.eql(application.job_counts)
                    result.applications[0].jobCounts.should.be.a('object')
                    result.applications[0].dedicatedWorkers.should.be.eql(application.dedicated_workers)
                    done()
                })
            })
        });

        it('should return a list of applications when sort is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplications(null, null, ['applicationName', '-email']).then((result) => {
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
                    result.applications[0].defaultJobCallbackUrl.should.be.eql(application.default_job_callback_url)
                    result.applications[0].jobCounts.should.be.eql(application.job_counts)
                    result.applications[0].jobCounts.should.be.a('object')
                    result.applications[0].dedicatedWorkers.should.be.eql(application.dedicated_workers)
                    done()
                })
            })
        });

        it('should return a list of applications when email is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetApplications(null, null, null, 'test@test.com').then((result) => {
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
                    result.applications[0].defaultJobCallbackUrl.should.be.eql(application.default_job_callback_url)
                    result.applications[0].jobCounts.should.be.eql(application.job_counts)
                    result.applications[0].jobCounts.should.be.a('object')
                    result.applications[0].dedicatedWorkers.should.be.eql(application.dedicated_workers)
                    done()
                })
            })
        });

        it('should return a list of applications when application_name is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetApplications(null, null, null, null, 'appName').then((result) => {
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
                    result.applications[0].defaultJobCallbackUrl.should.be.eql(application.default_job_callback_url)
                    result.applications[0].jobCounts.should.be.eql(application.job_counts)
                    result.applications[0].jobCounts.should.be.a('object')
                    result.applications[0].dedicatedWorkers.should.be.eql(application.dedicated_workers)
                    done()
                })
            })
        });

        it('should return a list of applications when first_name is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetApplications(null, null, null, null, null, 'Jean').then((result) => {
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
                    result.applications[0].defaultJobCallbackUrl.should.be.eql(application.default_job_callback_url)
                    result.applications[0].jobCounts.should.be.eql(application.job_counts)
                    result.applications[0].jobCounts.should.be.a('object')
                    result.applications[0].dedicatedWorkers.should.be.eql(application.dedicated_workers)
                    done()
                })
            })
        });

        it('should return a list of applications when last_name is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetApplications(null, null, null, null, null, null, 'test').then((result) => {
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
                    result.applications[0].defaultJobCallbackUrl.should.be.eql(application.default_job_callback_url)
                    result.applications[0].jobCounts.should.be.eql(application.job_counts)
                    result.applications[0].jobCounts.should.be.a('object')
                    result.applications[0].dedicatedWorkers.should.be.eql(application.dedicated_workers)
                    done()
                })
            })
        });

        it('should return a list of applications when application_type is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetApplications(null, null, null, null, null, null, null, 'admin').then((result) => {
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
                    result.applications[0].defaultJobCallbackUrl.should.be.eql(application.default_job_callback_url)
                    result.applications[0].jobCounts.should.be.eql(application.job_counts)
                    result.applications[0].jobCounts.should.be.a('object')
                    result.applications[0].dedicatedWorkers.should.be.eql(application.dedicated_workers)
                    done()
                })
            })
        });

        it('should return a list of applications when created_after is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetApplications(null, null, null, null, null, null, null, null, '2018-10-10T10:10:10').then((result) => {
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
                    result.applications[0].defaultJobCallbackUrl.should.be.eql(application.default_job_callback_url)
                    result.applications[0].jobCounts.should.be.eql(application.job_counts)
                    result.applications[0].jobCounts.should.be.a('object')
                    result.applications[0].dedicatedWorkers.should.be.eql(application.dedicated_workers)
                    done()
                })
            })
        });

        it('should return a list of applications when created_before is provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetApplications(null, null, null, null, null, null, null, null, null, '2018-10-10T10:10:10').then((result) => {
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
                    result.applications[0].defaultJobCallbackUrl.should.be.eql(application.default_job_callback_url)
                    result.applications[0].jobCounts.should.be.eql(application.job_counts)
                    result.applications[0].jobCounts.should.be.a('object')
                    result.applications[0].dedicatedWorkers.should.be.eql(application.dedicated_workers)
                    done()
                })
            })
        });

        it('should return a list of applications when all parameters are provided', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {

                leiaAPI.adminGetApplications(20, 20, ['applicationName', '-email'], 'test@test.com', 'appName', 'Jean', 'test', 'admin', '2018-10-10T10:10:10', '2018-10-10T10:10:10').then((result) => {
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
                    result.applications[0].defaultJobCallbackUrl.should.be.eql(application.default_job_callback_url)
                    result.applications[0].jobCounts.should.be.eql(application.job_counts)
                    result.applications[0].jobCounts.should.be.a('object')
                    result.applications[0].dedicatedWorkers.should.be.eql(application.dedicated_workers)
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplications(null, 6).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplications(null, 3).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        });

        it('should return a 403 status when LeiaAPI returns a 403 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplications(null, 4).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(403)
                    done()
                })
            })
        });

        it('should return an empty list when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminGetApplications(null, 5).then((result) => {
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
                    result.defaultJobCallbackUrl.should.be.eql(application.default_job_callback_url)
                    result.jobCounts.should.be.eql(application.job_counts)
                    result.jobCounts.should.be.a('object')
                    result.dedicatedWorkers.should.be.eql(application.dedicated_workers)
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
                    result.defaultJobCallbackUrl.should.be.eql(application.default_job_callback_url)
                    result.jobCounts.should.be.eql(application.job_counts)
                    result.jobCounts.should.be.a('object')
                    result.dedicatedWorkers.should.be.eql(application.dedicated_workers)
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
                leiaAPI.adminAddApplication("test@test.com", "appName", "admin", "jean", "test", "http://test.com", true).then((result) => {
                    result.should.be.a('object');
                    result.id.should.be.eql(application.id)
                    result.creationTime.should.be.eql(application.creation_time)
                    result.applicationName.should.be.eql(application.application_name)
                    result.applicationType.should.be.eql(application.application_type)
                    result.email.should.be.eql(application.email)
                    result.firstname.should.be.eql(application.first_name)
                    result.lastname.should.be.eql(application.last_name)
                    result.defaultJobCallbackUrl.should.be.eql(application.default_job_callback_url)
                    result.jobCounts.should.be.eql(application.job_counts)
                    result.jobCounts.should.be.a('object')
                    result.dedicatedWorkers.should.be.eql(application.dedicated_workers)
                    done()
                })
            })
        });

        it('should return a 400 status when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddApplication("test@test.com", "appName4", "admin", "jean", "test", "http://test.com", true).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        });

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddApplication("test@test.com", "appName2", "admin", "jean", "test", "http://test.com", true).then((_) => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return a 409 status when LeiaAPI returns a 409 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.adminAddApplication("test@test.com", "appName3", "admin", "jean", "test", "http://test.com", true).then((_) => {
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
                    result.defaultJobCallbackUrl.should.be.eql(application.default_job_callback_url)
                    result.jobCounts.should.be.eql(application.job_counts)
                    result.jobCounts.should.be.a('object')
                    result.dedicatedWorkers.should.be.eql(application.dedicated_workers)
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
