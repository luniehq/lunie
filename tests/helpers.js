const nock = require('nock')

function getAccountResponse() {
  nock('http://localhost:9071')
    .persist()
    .get('/auth/accounts/cosmos1abcdefg')
    .reply(200, {
      type: 'auth/Account',
      value: {
        account_number: '1',
        sequence: '1'
      }
    })
}

module.exports = {
  nockDo: {
    accountResponse: getAccountResponse
  }
}
