const request = require('supertest')
const nock = require('nock')
const app = require('../index')
const { nockDo } = require('./helpers')

nock.disableNetConnect()
nock.enableNetConnect('127.0.0.1')

describe('POST /transaction', function () {
  afterAll(async () => {
    app.close()
  })

  it('responds with json error when request is empty', function (done) {
    request(app)
      .get('/transaction')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect({ error: 'No Request Found' })
      .expect(200, done)
  })

  describe('POST /tranasction/estimate', function () {
    nockDo.accountResponse()

    nock('http://localhost:9071')
      .persist()
      .post('/bank/accounts/cosmos1abcdefg/transfers')
      .reply(200, { gas_estimate: 12345 })

    it('responds with correct gas estimate for send transaction', function (done) {
      const payload = {
        simulate: true,
        networkId: 'local-cosmos-hub-testnet',
        messageType: 'MsgSend',
        address: 'cosmos1abcdefg',
        txProperties: {
          toAddress: 'cosmos1abcdefg',
          amounts: [
            {
              amount: '123000000',
              denom: 'stake'
            }
          ]
        },
        memo: '(Sent via Lunie)'
      }

      request(app)
        .post('/transaction/estimate')
        .send({ payload })
        .set('Accept', 'application/json')
        .expect('Content-Type', /json/)
        // .expect({ gasEstimate: 74072, success: true })
        .expect({ gasEstimate: 550000, success: true }) // fixed for now
        .expect(200, done)
    })
  })
})
