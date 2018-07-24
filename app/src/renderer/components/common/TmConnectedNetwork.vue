<template lang='pug'>
.tm-connected-network#tm-connected-network(v-if='connected' :class="cssClass")
  .tm-connected-network__connection
    .tm-connected-network__icon#tm-connected-network__icon: i.material-icons wifi
    .tm-connected-network__string#tm-connected-network__string
      span.desktop-only Connected to
      span.chain-id(v-tooltip.top="networkTooltip")  {{ chainId }}
      |  via #[span {{ nodeAddress }}]
      router-link#tm-connected-network_preferences-link.desktop-only(to="/preferences" @click.native="closeMenu" v-if="!onPreferencesPage")
        |  (change network)
  .tm-connected-network__string#tm-connected-network__block
    span.desktop-only Current Block:
    router-link(to="/blocks" v-tooltip.top="'View Block'")  {{ blockHeight }}
.tm-connected-network.tm-disconnected-network#tm-disconnected-network(v-else)
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
        return "Note: `offline demo` does not have real peers."
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
  methods: {
    closeMenu() {
      console.log("closing menu")
      this.$store.commit("setActiveMenu", "")
    }
  },
  watch: {
    "$route.name"(newName) {
      this.onPreferencesPage = newName === "preferences"
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.tm-connected-network
  font-size 0.75rem
  background var(--app-nav)
  color var(--dim)
  display flex
  align-items center
  justify-content space-between
  padding 0.5rem 1rem
  margin 0.25rem 1rem

  a, .chain-id
    font-weight 500

.tm-connected-network__icon
  background var(--success-bc)
  padding 0.5rem
  display flex
  align-items center
  justify-content center
  color var(--txt)
  border-radius 2px

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

.tm-disconnected-network
  justify-content start
</style>
