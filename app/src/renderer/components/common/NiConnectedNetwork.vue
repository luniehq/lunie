<template lang='pug'>
.ni-connected-network#ni-connected-network(v-if='connected' :class="cssClass")
  .ni-connected-network__connection
    .ni-connected-network__icon#ni-connected-network__icon: i.material-icons wifi
    .ni-connected-network__string#ni-connected-network__string
      span.desktop-only Connected to
      span.chain-id(v-tooltip.top="networkTooltip")  {{ chainId }}
      |  via #[span {{ nodeAddress }}]
      router-link#ni-connected-network_preferences-link.desktop-only(to="/preferences" @click.native="closeMenu" v-if="!onPreferencesPage")
        |  (change network)
  .ni-connected-network__string#ni-connected-network__block
    span.desktop-only Current Block:
    router-link(to="/blocks" v-tooltip.top="'View Block'")  {{ blockHeight }}
.ni-connected-network.ni-disconnected-network#ni-disconnected-network(v-else)
  .ni-connected-network__icon: i.material-icons.fa-spin rotate_right
  .ni-connected-network__string Connecting to network&hellip;
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
    "$route.name"(newName, oldName) {
      this.onPreferencesPage = newName === "preferences"
    }
  }
}
</script>

<style lang="stylus">
@require '~variables'

.ni-connected-network
  font-size 0.75rem
  background var(--app-bg-light)
  color var(--dim)
  display flex
  align-items center
  justify-content space-between
  padding 0.5rem 1rem
  margin 0.25rem 1rem

  a, .chain-id
    font-weight 500

.ni-connected-network__icon
  background var(--success-bc)
  padding 0.5rem
  display flex
  align-items center
  justify-content center
  color var(--txt)
  border-radius 2px

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

.ni-disconnected-network
  justify-content start
</style>
