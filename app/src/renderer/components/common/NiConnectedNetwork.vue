<template lang='pug'>
.tm-connected-network#tm-connected-network(v-if='connected' :class="cssClass")
  .tm-connected-network__connection
    .tm-connected-network__icon#tm-connected-network__icon: i.material-icons wifi
    .tm-connected-network__string#tm-connected-network__string
      span.desktop-only Connected to
      span.chain-id(v-tooltip.top="networkTooltip")  {{ chainId }}
      |  via #[span {{ nodeAddress }}]
      router-link#tm-connected-network_preferences-link.desktop-only(to="/preferences" v-if="!onPreferencesPage")
        |  (change network)
  .tm-connected-network__string#tm-connected-network__block
    span.desktop-only Current Block:
    router-link(to="/blocks" v-tooltip.top="'View Block'")  {{ blockHeight }}
.tm-connected-network#tm-disconnected-network(v-else)
  .tm-connected-network__icon: i.material-icons.fa-spin rotate_right
  .tm-connected-network__string Connecting to network&hellip;
</template>

<script>
import { mapGetters } from "vuex"
import num from "scripts/num"
export default {
  name: "tm-connected-network",
  computed: {
    ...mapGetters(["lastHeader", "nodeIP", "connected", "mockedConnector"]),
    cssClass() {
      if (this.mockedConnector) {
        return "tm-connected-network--mocked"
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

      return this.nodeIP
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
      this.onPreferencesPage = newName === "preferences"
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.tm-connected-network
  font-size 0.75rem
  background var(--app-fg)
  border 0.5rem solid var(--app-bg)
  color var(--dim)
  display flex
  align-items center
  justify-content space-between

  a, .chain-id
    font-weight 500

.tm-connected-network__icon
  background var(--success)
  width 2rem
  display flex
  align-items center
  justify-content center
  color var(--bright)

.tm-connected-network__string
  padding 0 1em
  line-height 2rem

.tm-connected-network--mocked
  .tm-connected-network__icon
    background var(--warning)

  .chain-id
    color var(--warning)

.tm-connected-network__connection
  display flex
</style>
