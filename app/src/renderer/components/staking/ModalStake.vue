<template lang="pug">
  .modal-stake
    //- Header
    .stake-header
      img.icon(class='stake-atom' src="~assets/images/cosmos-logo.png")
      span.tm-modal-title Stake

    //- To
    tm-form-group.stake-form-group(
      field-id='to' field-label='To')
      tm-field#to(readonly v-model="to")

    //- From
    tm-form-group.stake-form-group(
      field-id='from' field-label='From')
      tm-field#from(
        type="select"
        :options="fromOptions"
        v-model="fromIndex"
      )

    //- Amount
    tm-form-group.stake-form-group(
      field-id='amount'
      field-label='Amount'
    )
      tm-field#amount(
        :max="maximum"
        :min="1"
        type="number"
        v-focus
        v-model="amount")

    //- Footer
    .stake-footer
      tm-btn(
        @click.native="onStake"
        color="primary"
        size="lg"
        value="Stake"
      )
</template>

<script>
import Modal from "common/TmModal"
import { TmBtn, TmField, TmFormGroup, TmFormMsg } from "@tendermint/ui"

export default {
  props: [`fromOptions`, `maximum`, `to`],
  components: {
    Modal,
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg
  },
  data: () => ({
    amount: 1,
    fromIndex: 0
  }),
  methods: {
    close() {
      this.$emit("update:showModalStake", false)
    },
    onStake() {
      this.$emit(`submitDelegation`, {
        amount: this.amount,
        from: this.fromOptions[this.fromIndex]
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
</style>
