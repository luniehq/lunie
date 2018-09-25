<template lang="pug">
  .modal-stake#modal-stake(v-click-outside="close")
    //- Header
    .stake-header
      img.icon(class='stake-atom' src="~assets/images/cosmos-logo.png")
      span.tm-modal-title Stake
      .tm-modal-icon.tm-modal-close#closeBtn(@click="close()")
        i.material-icons close

    //- Amount
    tm-form-group.stake-form-group(
      field-label='Amount'
    )
      tm-field#denom(
        type="number"
        :placeholder="bondingDenom"
        readonly
        )

      tm-field#amount(
        type="number"
        :max="fromOptions[selectedIndex].maximum"
        :min="0"
        step="1"
        v-model="amount"
        v-focus)

    //- To
    tm-form-group.stake-form-group(
      field-id='to' field-label='To')
      tm-field#to(readonly v-model="to")

    //- From
    tm-form-group.stake-form-group(
      field-id='from' field-label='From')
      tm-field#from(
        type="select"
        v-model="selectedIndex"
        :title="fromOptions[selectedIndex].address"
        :options="fromOptions"
      )

    .stake-footer
      tm-btn(
        @click.native="close"
        size="lg"
        value="Cancel"
      )
      tm-btn(
        @click.native="onStake"
        :disabled="$v.amount.$invalid"
        color="primary"
        value="Stake"
        size="lg")
</template>

<script>
import ClickOutside from "vue-click-outside"
import { required, between } from "vuelidate/lib/validators"
import Modal from "common/TmModal"
import { TmBtn, TmField, TmFormGroup, TmFormMsg } from "@tendermint/ui"

export default {
  props: ["bondingDenom", "fromOptions", "to"],
  components: {
    Modal,
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg
  },
  data: () => ({
    amount: 0,
    selectedIndex: 0
  }),
  validations() {
    return {
      amount: {
        required,
        integer: value => Number.isInteger(value),
        between: between(1, this.fromOptions[this.selectedIndex].maximum)
      }
    }
  },
  methods: {
    close() {
      this.$emit("update:showModalStake", false)
    },
    onStake() {
      if (!this.$v.$invalid) {
        this.$emit("submitDelegation", {
          amount: this.amount,
          from: this.fromOptions[this.selectedIndex].address
        })
        this.close()
      }
    }
  },
  directives: {
    ClickOutside
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
      height 4em
      width 4em

  .stake-form-group
    display block
    padding 0

    #amount
      margin-top -32px

    #denom
      text-align right
      width 72px
      margin-left 80%
      border none

  .stake-footer
    display flex
    justify-content flex-end

    button
      margin-left 1em
</style>
