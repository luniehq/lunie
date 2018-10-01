<template lang="pug">
  .modal-undelegation#modal-undelegation(v-click-outside="close")
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
        @click.native="unUndelegate"
        :disabled="$v.amount.$invalid"
        color="primary"
        size="lg"
        value="Unstake"
      )
</template>

<script>
import ClickOutside from "vue-click-outside"
import { required, between } from "vuelidate/lib/validators"
import Modal from "common/TmModal"
import { TmBtn, TmField, TmFormGroup, TmFormMsg } from "@tendermint/ui"

export default {
  name: `undelegation-modal`,
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
  validations() {
    return {
      amount: {
        required,
        between: between(0, this.maximum)
      }
    }
  },
  methods: {
    close() {
      this.$emit(`update:showUndelegationModal`, false)
    },
    unUndelegate() {
      this.$emit(`submitUndelegation`, {
        amount: this.amount
      })

      this.close()
    }
  },
  directives: {
    ClickOutside
  }
}
</script>

<style lang="stylus">
@import '~variables'

.modal-unstake
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
