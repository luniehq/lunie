<template lang="pug">
  .modal-stake
    .stake-header
      img.icon(class='stake-atom' src="~assets/images/cosmos-logo.png")
      span.tm-modal-title Stake

    tm-form-group.stake-form-group(
      :error='$v.amount.$invalid'
      field-id='amount'
      field-label='Amount'
    )
      tm-field#amount(
        type="number"
        v-model="amount")
      tm-form-msg(name='Amount' type='between' :min='1' :max='maximum'
        v-if='$v.amount.$invalid')

    tm-form-group.stake-form-group(
      field-id='to' field-label='To')
      tm-field#to(v-model="to" readonly)

    tm-form-group.stake-form-group(
      field-id='from' field-label='From')
      tm-field#from(
        type="select"
        :title="fromOptions[fromIndex].address"
        :options="fromOptions"
        v-model="fromIndex"
      )

    .stake-footer
      tm-btn(@click.native="onStake" color="primary" value="Stake" size="lg")
</template>

<script>
import { between } from "vuelidate/lib/validators"
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
  validations() {
    return {
      amount: {
        between: between(1, this.maximum)
      }
    }
  },
  methods: {
    close() {
      this.$emit("update:showModalStake", false)
    },
    onStake() {
      if (!this.$v.$invalid) {
        this.$emit(`stake`, {
          amount: this.amount,
          from: this.fromOptions[this.fromIndex]
        })

        this.close()
      }
    }
  }
}
</script>

<style lang="stylus">
@import '~variables'

.modal-stake
  background: var(--app-nav)
  display: flex
  flex-direction: column
  height: 50%
  justify-content: space-between
  left: 50%
  padding: 3%
  position: fixed
  top: 50%
  width: 40%
  z-index: z(modal)

  .stake-header
    align-items: center
    display: flex

    .stake-atom
      height: 3em
      width: 3em

  .stake-form-group
    display: block
    padding: 0

  .stake-footer
    display: flex
    justify-content: flex-end
</style>
