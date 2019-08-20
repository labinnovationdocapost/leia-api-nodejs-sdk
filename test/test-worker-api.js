let chai = require('chai');
let chaiHttp = require('chai-http');
let nock = require('nock')
let LeiaAPI = require('../index')
chai.use(chaiHttp);
chai.should();

const serverURL = "https://test.com"

const worker = {
    "job_type": "predict-507f191e810c19729de860ec",
    "number": 3,
    "statuses": [
        "RUNNING",
        "RUNNING",
        "RUNNABLE"
    ]
}

function mockWorkerAPI() {
    nock(serverURL)
        .get('/login/mockApiKey')
        .reply(200, { token: 'faketoken', application: { id: 'id1', application_type: 'admin' } });

    nock(serverURL)
        .get('/worker')
        .reply(200, [worker]);


    nock(serverURL)
        .get('/worker/predict-507f191e810c19729de860ec')
        .reply(200, worker);

    nock(serverURL)
        .get('/worker/400-job')
        .reply(400, null);

    nock(serverURL)
        .get('/worker/401-job')
        .reply(401, null);

    nock(serverURL)
        .get('/worker/404-job')
        .reply(404, null);

}

describe('LeIA Worker API', () => {
    beforeEach((done) => {
        mockWorkerAPI()
        done()
    });

    describe('getWorkers()', () => {
        it('should return a list of workers', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getWorkers().then((result) => {

                    result.should.be.a('array');
                    result[0].jobType.should.be.eql(worker.job_type)
                    result[0].number.should.be.eql(worker.number)
                    result[0].statuses.should.be.eql(worker.statuses)
                    done()
                })
            })
        });
    })

    describe('getWorker()', () => {
        it('should return a worker', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getWorker('predict-507f191e810c19729de860ec').then((result) => {
                    result.should.be.a('object');
                    result.jobType.should.be.eql(worker.job_type)
                    result.number.should.be.eql(worker.number)
                    result.statuses.should.be.eql(worker.statuses)
                    done()
                })
            })
        })

        it('should return 400 when LeiaAPI returns a 400 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getWorker('400-job').then(() => {
                }).catch((error) => {
                    error.status.should.be.eql(400)
                    done()
                })
            })
        })

        it('should return a 401 status when LeiaAPI returns a 401 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getWorker('401-job').then(() => {
                }).catch((error) => {
                    error.status.should.be.eql(401)
                    done()
                })
            })
        })

        it('should return an empty list when LeiaAPI returns a 404 status', (done) => {
            var leiaAPI = new LeiaAPI(serverURL)
            leiaAPI.login('mockApiKey').then((_) => {
                leiaAPI.getWorker('404-job').then((result) => {
                }).catch((error) => {
                    error.status.should.be.eql(404)
                    done()
                })
            })
        })
    });

})
