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
  part(v-for="tx in block.data.txs" :title="tx.hash" :key="tx.hash")
    list-item(v-for="(tx, key) in tx" :key="tx.hash + 'key'" :dt="key" :dd="tx")
</template>

<script>
import { mapGetters } from 'vuex'
import axios from 'axios'
import createHash from 'create-hash'
import varint from 'varint'
import b64 from 'base64-js'
import ToolBar from './NiToolBar'
import ListItem from './NiListItem'
import Part from './NiPart'
import Page from './NiPage'
export default {
  name: 'page-block',
  components: {
    ToolBar,
    ListItem,
    Part,
    Page
  },
  computed: {
    ...mapGetters(['bc'])
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
    async fetchBlock () {
      let url = `${this.bc.url}/block?height=${this.$route.params.block}`
      let json = await axios.get(url)
      this.block_meta = json.data.result.block_meta
      this.block = json.data.result.block
      this.block.data.txs && this.queryTxs().catch((err) => console.log(err))
    },
    queryTxs () {
      return this.queryTx(this.block.data.txs.length)
    },
    queryTx (len, key = 0) {
      return new Promise((resolve, reject) => {
        if (key >= len) resolve()
        let txstring = atob(this.block.data.txs[key])
        // console.log(txstring)
        let txbytes = b64.toByteArray(this.block.data.txs[key])
        // console.log(txbytes)
        let varintlen = new Uint8Array(varint.encode(txbytes.length))
        // console.log(varintlen)
        let tmp = new Uint8Array(varintlen.byteLength + txbytes.byteLength)
        tmp.set(new Uint8Array(varintlen), 0)
        tmp.set(new Uint8Array(txbytes), varintlen.byteLength)
        // console.log(tmp)
        let hash = createHash('ripemd160').update(Buffer.from(tmp)).digest('hex')
        // console.log(hash)
        let url = `${this.bc.url}/tx?hash=0x${hash}`
        axios.get(url).then(json => {
          // console.log(json)
          json.data.result.string = txstring
          this.block.data.txs.splice(key, 1, json.data.result)
          this.queryTx(len, key + 1).then(resolve).catch(reject)
        }).catch(reject)
      })
    }
  },
  async mounted () {
    await this.fetchBlock()
  },
  watch: {
    '$route' (to, from) {
      this.fetchBlock()
    }
  }
}
</script>
