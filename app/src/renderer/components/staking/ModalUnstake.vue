<template lang="pug">
  .modal-stake#modal-stake
    //- Header
    .stake-header
      img.icon(class='stake-atom' src="~assets/images/cosmos-logo.png")
      span.tm-modal-title Unstake
      .tm-modal-icon.tm-modal-close(@click="close()")
        i.material-icons close

    //- To
    tm-form-group.stake-form-group(
      field-id='to' field-label='To')
      tm-field#to(
        readonly v-model="to")

    //- Amount
    tm-form-group.stake-form-group(
      field-id='amount'
      field-label='Amount'
    )
      tm-field#amount(
        :max="maximum"
        :min="0"
        type="number"
        v-focus
        v-model="amount")

    //- Footer
    .stake-footer
      tm-btn(
        @click.native="close"
        size="lg"
        value="Cancel"
      )
      tm-btn(
        @click.native="onUnstake"
        color="primary"
        size="lg"
        value="Unstake"
      )
</template>

<script>
import Modal from "common/TmModal"
import { TmBtn, TmField, TmFormGroup, TmFormMsg } from "@tendermint/ui"

export default {
  props: [`maximum`, `to`],
  components: {
    Modal,
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg
  },
  data: () => ({
    amount: 0
  }),
  methods: {
    close() {
      this.$emit("update:showModalUnstake", false)
    },
    onUnstake() {
      this.$emit(`submitUndelegation`, {
        amount: this.amount
      })

      this.close()
    }
  }
}
</script>

<style lang="stylus">
@import '~variables'

.modal-stake
  background var(--app-nav)
  display flex
  flex-direction column
  height 50%
  justify-content space-between
  left 50%
  padding 2em
  position fixed
  top 50%
  width 40%
  z-index z(modal)

  .stake-header
    align-items center
    display flex

    .stake-atom
      height 3em
      width 3em

  .stake-form-group
    display block
    padding 0

  .stake-footer
    display flex
    justify-content flex-end

    button
      margin-left 1em
</style>
