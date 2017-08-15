<template lang="pug">
page(:title="`Block ${block.header.height}`")
  tool-bar
    router-link(to="/"): i.material-icons arrow_back
    a(:href="blockUrl" target="_blank") JSON
    router-link(:to="{ name: 'block', params: { block: block.header.height - 1 }}"): i.material-icons chevron_left
    router-link(:to="{ name: 'block', params: { block: block.header.height + 1 }}"): i.material-icons chevron_right

  part(title='Header')
    list-item(dt="Chain ID" :dd="block.header.chain_id")
    list-item(dt="Time" :dd="block.header.time")
    list-item(dt="Transactions" :dd="block.header.num_txs")
    list-item(dt="Last Commit Hash" :dd="block.header.last_commit_hash")
    list-item(dt="Validators Hash" :dd="block.header.validators_hash")
    list-item(dt="App Hash" :dd="block.header.app_hash")

  part(title='Last Block')
    list-item(dt="Hash" :dd="block.header.last_block_id.hash")
    list-item(dt="Parts Total"
      :dd="block.header.last_block_id.parts.total")
    list-item(dt="Parts Hash" :dd="block.header.last_block_id.parts.hash")

  part(title="Precommit"
    v-for="p in block.last_commit.precommits"
    :key="p.validator_address" v-if="p !== null")
    list-item(dt="Address" :dd="p.validator_address")
    list-item(dt="Index" :dd="p.validator_index")
    list-item(dt="Round" :dd="p.round")
    list-item(:dt="`Sig (${p.signature.type})`"
    :dd="p.signature.data")

  part(title='Transactions')
    list-item(v-for="tx in block.data.txs" :key="tx.id"
      dt="Transaction" :dd="TODO")
</template>

<script>
import request from 'superagent'
import ToolBar from '../common/NiToolBar'
import ListItem from '../common/NiListItem'
import Part from '../common/NiPart'
import Page from '../common/NiPage'
export default {
  name: 'page-block',
  components: {
    ToolBar,
    ListItem,
    Part,
    Page
  },
  data: () => ({
    blockUrl: '',
    block_meta: {
      block_id: {
        hash: '',
        parts: {
          total: 0,
          hash: ''
        }
      },
      header: {
        chain_id: '',
        height: 0,
        time: '',
        num_txs: 0,
        last_block_id: {
          hash: '',
          parts: {
            total: 0,
            hash: ''
          }
        },
        last_commit_hash: '',
        data_hash: '',
        validators_hash: '',
        app_hash: ''
      }
    },
    block: {
      header: {
        chain_id: '',
        height: 0,
        time: '',
        num_txs: 0,
        last_block_id: {
          hash: '',
          parts: {
            total: 0,
            hash: ''
          }
        },
        last_commit_hash: '',
        data_hash: '',
        validators_hash: '',
        app_hash: ''
      },
      data: {
        txs: []
      },
      last_commit: {
        blockID: {
          hash: '',
          parts: {
            total: 0,
            hash: ''
          }
        },
        precommits: [
          {
            validator_address: '',
            validator_index: 0,
            height: 0,
            round: 0,
            type: 0,
            block_id: {
              hash: '',
              parts: {
                total: 0,
                hash: ''
              }
            },
            signature: [0, '']
          }
        ]
      }
    }
  }),
  methods: {
    fetchBlock () {
      this.blockUrl = 'https://mercury-node0.testnets.interblock.io/block?height=' +
        this.$route.params.block

      request.get(this.blockUrl).end((err, res) => {
        if (err) console.log('err', err)
        let blockData = res.body.result
        // console.log('block', JSON.stringify(blockData, null, 2))

        this.block_meta = blockData.block_meta
        this.block = blockData.block
      })
    }
  },
  mounted () {
    this.fetchBlock()
  },
  watch: {
    '$route' (to, from) {
      this.fetchBlock()
    }
  }
}
</script>
