<template lang="pug">
.ni-modal-error__wrapper
  .ni-modal-error
    .ni-modal-error__icon: i.material-icons sync_problem
    .ni-modal-error__title Node has halted
    .ni-modal-error__body The node your are connected to appears to have halted. You can try to connect to another node or switch to a demo connection so you can try out Voyager.
    .ni-modal-error__footer
      tm-btn#ni-modal-error__btn-retry(
        size="lg"
        icon="autorenew"
        color="primary"
        value="Switch Node"
        @click.native="switchNode")
      tm-btn#ni-modal-error__btn-mock(
        size="lg"
        icon="pageview"
        value="Try Demo"
        @click.native="useMock")
</template>

<script>
import { ipcRenderer } from "electron"
import { mapGetters } from "vuex"
import { TmBtn } from "@tendermint/ui"
export default {
  name: "modal-node-halted",
  components: { TmBtn },
  methods: {
    switchNode() {
      ipcRenderer.send("reconnect")
      this.$store.commit("setModalNodeHalted", false)
    },
    useMock() {
      this.$store.dispatch("setMockedConnector", true)
      this.$store.commit("setModalNodeHalted", false)
    }
  }
}
</script>

<style lang="stylus">
@import '~variables'

.ni-modal-error__wrapper
  position absolute
  top 0
  left 0
  z-index z(modalError)
  background var(--app-bg)
  width 100vw
  height 100vh
  max-width 100%
  display flex
  align-items center
  justify-content center

.ni-modal-error
  padding 1.5rem
  max-width 40rem

.ni-modal-error__icon
  position fixed
  top 0
  left 0
  z-index z(below)

  i.material-icons
    font-size 25vw + 25vh
    line-height 1
    color var(--bc-dim)

.ni-modal-error__title
  font-size h1
  font-weight 500
  line-height 1
  margin-bottom 1.5rem

.ni-modal-error__body
  font-size lg
  color var(--dim)
  margin-bottom 3rem

.ni-modal-error__footer
  .ni-btn
    width 100%
    margin-right 1.5rem
    margin-bottom 1rem
    max-width 14rem

    &:last-child
      margin-bottom 0

@media screen and (min-width: 768px)
  .ni-modal-error__icon i.material-icons
    font-size 20vw + 20vh

  .ni-modal-error__body
    margin-bottom 4.5rem

  .ni-modal-error__footer
    min-width 31rem

  .ni-modal-error__footer .ni-btn
    margin-bottom 0
</style>
