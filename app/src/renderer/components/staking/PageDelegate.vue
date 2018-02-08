<template lang="pug">
page(:title="delegateType + ' Profile'")
  div(slot="menu"): tool-bar
    router-link(to='/delegates')
      i.material-icons arrow_back
      .label Back

  part(:title="delegateType + ' Info'")
    list-item(dt='Moniker' :dd='delegate.moniker')
    list-item(dt='Website' :dd='delegate.website')
    list-item(dt='Address' :dd='delegate.owner.addr')
    list-item(dt='Public Key' :dd='delegate.pub_key.data')

  part(:title="delegateType + ' Description'")
    text-block(:content="delegate.details || 'No description available.'")

  part(:title="delegateType + ' Details'" v-if="isValidator")
    list-item(dt="Total Vote Power" :dd="delegate.voting_power")
</template>

<script>
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import ListItem from 'common/NiListItem'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
import TextBlock from 'common/TextBlock'
import ToolBar from 'common/NiToolBar'
export default {
  name: 'page-delegate',
  props: ['delegate'],
  components: {
    Btn,
    ListItem,
    Page,
    Part,
    TextBlock,
    ToolBar
  },
  computed: {
    ...mapGetters(['delegates']),
    delegate () {
      console.log(this.delegates.delegates)
      console.log(this.$route.params.delegate)
      if (this.delegates.delegates && this.$route.params.delegate) {
        return this.delegates.delegates.find(v => v.id === this.$route.params.delegate)
      } else {
        return {
          pub_key: {},
          voting_power: 0,
          owner: {}
        }
      }
    },
    isValidator () {
      if (this.delegate) {
        return this.delegate.voting_power > 0
      } else {
        return false
      }
    },
    delegateType () {
      return this.isValidator ? 'Validator' : 'Candidate'
    }
  }
}
</script>
