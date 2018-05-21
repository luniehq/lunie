<template lang="pug">
.ni-modal-node-wrapper
  .ni-modal-node(:class="modalClass")
    .ni-modal-node-header
      .title {{ node.title }}
      .version {{ node.version }}
    .ni-modal-node-body(v-if="node.notes") {{ node.notes }}
    .ni-modal-node-footer
      .completion.completion-success(v-if="node.date")
        | #[i.material-icons check_circle] Released {{ node.date }}
      .completion.completion-warning(v-else)
        | #[i.material-icons hourglass_empty] In Progress
      btn.url(type="anchor"
      :href="node.url"
      target="_blank"
      v-if="node.url"
      icon="search"
      value="Details")
</template>

<script>
import Btn from "@nylira/vue-button"
import disableScroll from "disable-scroll"
export default {
  name: "ni-modal-node",
  components: {
    Btn
  },
  computed: {
    modalClass() {
      let value = ""
      if (this.node.date) {
        value += " ni-modal-node--done"
      }
      if (this.type) {
        value += ` ni-modal-node--${this.type}`
      }
      return value
    }
  },
  mounted() {
    disableScroll.on()
  },
  beforeDestroy() {
    disableScroll.off()
  },
  props: ["node", "type"]
}
</script>

<style scoped lang="stylus">
@import '~variables'

.ni-modal-node-wrapper
  position fixed
  top 0
  left 0
  width 100vw
  height 100vh
  z-index z(modal)

  display flex
  align-items center
  justify-content center

  background hsla(0,0,0,0.5)
  backdrop-filter blur(0.5rem)

.ni-modal-node
  margin 1rem
  border 2px solid bc
  border-radius 0.25rem
  max-width 30rem
  width 100%
  background app-fg
  shadow()

  padding 1rem

  position relative
  z-index 100000

  &.ni-modal-node--done
    &.ni-modal-node--hub
      border-color link
    &.ni-modal-node--sdk
      border-color accent
    &.ni-modal-node--tmc
      border-color tmc
    &.ni-modal-node--gui
      border-color mc

  &:before
    display block
    position absolute
    top 0
    right 0

    width 3rem
    height 3rem
    display flex
    align-items center
    justify-content center

    content 'close'
    font-family 'Material Icons'
    font-size x
    cursor pointer
    color link

.ni-modal-node-header
  display flex
  align-items center
  font-size lg
  margin-bottom 1rem

  font-weight 500

  .title
    color bright
    font-weight 500
  .version
    color dim
    font-weight 300
    margin-left 0.333rem

.ni-modal-node-body
  margin-bottom 1.25rem

.ni-modal-node-footer
  display flex
  flex-flow row nowrap
  justify-content space-between

  .completion
    color dim
    display flex
    align-items center
    i
      margin-right 0.333rem

    &.completion-success i
      color success

    &.completion-warning i
      color warning

@media screen and (min-width: 768px)
  .ni-modal-node
    margin 3rem
    padding 1.5rem

    &:before
      width 4rem
      height 4rem
      font-size lg
</style>
