<template lang="pug">
tm-page(:title="delegateType + ' Profile'")
  div(slot="menu"): tool-bar

  tm-part(:title="delegateType + ' Info'")
    tm-list-item(dt='Moniker' :dd='delegate.moniker')
    tm-list-item(dt='Website' :dd='delegate.website')
    tm-list-item(dt='Address' :dd='delegate.address')
    tm-list-item(dt='Public Key' :dd='delegate.pub_key.data')

  tm-part(:title="delegateType + ' Description'")
    text-block(:content="delegate.details || 'No description available.'")

  tm-part(:title="delegateType + ' Details'" v-if="isValidator")
    tm-list-item(dt="Total Vote Power" :dd="delegate.voting_power")
</template>

<script>
import { mapGetters } from "vuex"
import { TmListItem, TmPage, TmPart } from "@tendermint-ui"
import TextBlock from "common/TextBlock"
import ToolBar from "common/VrToolBar"
export default {
  name: "page-delegate",
  components: {
    TmListItem,
    TmPage,
    TmPart,
    TextBlock,
    ToolBar
  },
  computed: {
    ...mapGetters(["delegates"]),
    delegate() {
      if (this.delegates.delegates && this.$route.params.delegate) {
        return this.delegates.delegates.find(
          v => v.id === this.$route.params.delegate
        )
      } else {
        return {
          pub_key: {},
          voting_power: 0,
          owner: {}
        }
      }
    },
    isValidator() {
      if (this.delegate) {
        return this.delegate.voting_power > 0
      } else {
        return false
      }
    },
    delegateType() {
      return this.isValidator ? "Validator" : "Candidate"
    }
  }
}
</script>
