<template lang='pug'>
.ni-connected-network#ni-connected-network(v-if='connected' :class="cssClass")
  .ni-connected-network__connection
    .ni-connected-network__icon#ni-connected-network__icon: i.material-icons wifi
    .ni-connected-network__string#ni-connected-network__string
      span.desktop-only Connected to
      span.chain-id(v-tooltip.top="networkTooltip")  {{ chainId }}
      |  via #[span {{ nodeAddress }}]
      router-link.desktop-only(to="/preferences" v-if="!onPreferencesPage")
        |  (change network)
  .ni-connected-network__string#ni-connected-network__block
    span.desktop-only Current Block:
    router-link(to="/blocks" v-tooltip.top="'View Block'")  {{ blockHeight }}
.ni-connected-network(v-else)
  .ni-connected-network__icon: i.material-icons.fa-spin rotate_right
  .ni-connected-network__string Connected to network&hellip;
</template>

<script>
import { mapGetters } from "vuex"
import ListItem from "common/NiListItem"
import num from "scripts/num"
export default {
  name: "ni-connected-network",
  components: { ListItem },
  computed: {
    ...mapGetters(["lastHeader", "nodeIP", "connected", "mockedConnector"]),
    cssClass() {
      if (this.mockedConnector) {
        return "ni-connected-network--mocked"
      }
    },
    networkTooltip() {
      if (this.mockedConnector) {
        return "Note: `mock-chain` does not have real peers."
      } else {
        return "This testnet is a blockchain with live peers."
      }
    },
    nodeAddress() {
      if (this.mockedConnector) {
        return "127.0.0.1"
      }
      if (this.nodeIP) {
        return this.nodeIP
      }
    },
    chainId() {
      return this.lastHeader.chain_id
    },
    blockHeight() {
      return "#" + num.prettyInt(this.lastHeader.height)
    }
  },
  data: () => ({
    num: num,
    onPreferencesPage: false
  }),
  watch: {
    "$route.name"(newName, oldName) {
      console.log("newName", newName)
      this.onPreferencesPage = newName === "preferences"
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.ni-connected-network
  font-size 0.75rem
  background var(--app-fg)
  border 0.5rem solid var(--app-bg)
  color var(--dim)

  display flex
  align-items center
  justify-content space-between

  a, .chain-id
    font-weight 500

.ni-connected-network__icon
  background var(--success)
  width 2rem
  display flex
  align-items center
  justify-content center
  color var(--bright)

.ni-connected-network__string
  padding 0 1em
  line-height 2rem

.ni-connected-network--mocked
  .ni-connected-network__icon
    background var(--warning)
  .chain-id
    color var(--warning)

.ni-connected-network__connection
  display flex
</style>
