import fs from 'fs-extra'

let testRoot = './test/unit/tmp/test_root/'

export function mockGenesis () {
  process.env.COSMOS_HOME = testRoot
  fs.writeFileSync(testRoot + 'genesis.json', JSON.stringify({
    'genesis_time': '2017-12-12T02:31:37Z',
    'chain_id': 'pure-test-net',
    'validators':
    [

      {
        'pub_key': {
          'data': '2BA51EDE20AFC1EB462F22C10623A24A9C7E1B50282A5FB1E86A2E9B4FF19C47',
          'type': 'ed25519'
        },
        'power': 1000,
        'name': '198.211.127.140'
      },
      {
        'pub_key': {
          'data': 'C9B26A21B62EF839523D2040C0C4C046D86574CB6DFF92F3C0AF58DF209846FD',
          'type': 'ed25519'
        },
        'power': 1000,
        'name': '207.154.200.196'
      }
    ],
    'app_hash': '',
    'app_options': {
      'accounts': [
        {
          'name': 'relay',
          'address': '1B1BE55F969F54064628A63B9559E7C21C925165',
          'pub_key': {
            'type': 'ed25519',
            'data': '619D3678599971ED29C7529DDD4DA537B97129893598A17C82E3AC9A8BA95279'
          },
          'coins': [
            {
              'denom': 'mycoin',
              'amount': 9007199254740992
            }
          ]
        },
        {
          'name': 'greg',
          'address': 'B01C264BFE9CBD45458256E613A6F07061A3A6B6',
          'pub_key': {
            'type': 'ed25519',
            'data': 'E1FFBD187FA2A922CE1B367532CEAC1AD8E606D576AB0D2E2CAA7EC6B7DAC10F'
          },
          'coins': [
            {
              'denom': 'fermion',
              'amount': 1000000
            },
            {
              'denom': 'gregcoin',
              'amount': 1000
            }
          ]
        }
      ],
      'plugin_options': [
        'coin/issuer', {'app': 'sigs', 'addr': 'B01C264BFE9CBD45458256E613A6F07061A3A6B6'}
      ] }
  }))
}

export function unmockGeneis () {
  jest.unmock(appRoot + 'src/root.js')
}
