<template lang="pug">
modal.tm-modal-send-confirmation(:close="close")
  div(slot='title') Confirm Your Transaction
  tm-list-item(dt='Amount' :dd='amount + " " + denom')
  tm-list-item(dt='Recipient' :dd='recipient' v-tooltip.top="recipient")
  p
  p Are you sure you want to send this transaction? Make sure to check the address again. This transaction cannot be undone.

  .tm-modal-send-confirmation__footer
    tm-btn(
          id="send-confirmation-btn"
          icon='send'
          type='button'
          color="primary"
          @click.native="approve"
          value='Approve Send')
    tm-btn(
          id="send-cancel-btn"
          icon='cancel'
          type='button'
          @click.native="close"
          value='Cancel Send')
</template>

<script>
import { TmBtn, TmListItem } from "@tendermint/ui"
import Modal from "common/TmModal"
export default {
  name: "tm-modal-send-confirmation",
  props: ["amount", "denom", "recipient"],
  components: {
    TmBtn,
    TmListItem,
    Modal
  },
  methods: {
    close() {
      this.$emit("canceled")
    },
    approve() {
      this.$emit("approved")
    }
  }
}
</script>

<style lang="stylus">
@import '~variables'

.tm-modal-send-confirmation
  &__row
    > *
      display inline-block

    &__property
      width 6rem
      overflow hidden

    &__value
      width calc(100% - 6rem)
      text-overflow ellipsis
      overflow hidden
      white-space nowrap

  &__footer
    flex-direction row
    justify-content flex-start

    .tm-btn
      margin-right 1.5rem
      margin-bottom 1rem
      max-width 14rem

      &:last-child
        margin-bottom 0
        margin-right 0

@media screen and (min-width: 768px)
  .tm-modal-send-confirmation
    &__icon i.material-icons
      font-size 20vw + 20vh

    &__footer
      min-width 31rem

    &__footer .tm-btn
      margin-bottom 0
</style>
