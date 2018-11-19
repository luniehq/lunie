<template lang="pug">
  .delegation-modal#delegation-modal(v-click-outside="close")
    .delegation-modal-header
      img.icon(class='delegation-modal-atom' src="~assets/images/cosmos-logo.png")
      span.tm-modal-title Delegation
      .tm-modal-icon.tm-modal-close#closeBtn(@click="close()")
        i.material-icons close

    tm-form-group.delegation-modal-form-group(
      field-id='amount'
      field-label='Amount'
    )
      tm-field#denom(
        type="text"
        :placeholder="bondingDenom"
        readonly)

      tm-field#amount(
        type="number"
        :max="fromOptions[selectedIndex].maximum"
        :min="0"
        step="any"
        v-model="amount"
        v-focus)

    tm-form-group.delegation-modal-form-group(
      field-id='to' field-label='To')
      tm-field#to(readonly v-model="to")

    tm-form-group.delegation-modal-form-group(
      field-id='from' field-label='From')
      tm-field#from(
        type="select"
        v-model="selectedIndex"
        :title="fromOptions[selectedIndex].address"
        :options="fromOptions"
      )

    .delegation-modal-footer
      tm-btn#submit-delegation(
        @click.native="onDelegation"
        :disabled="$v.amount.$invalid"
        color="primary"
        value="Confirm Delegation"
        size="lg")
</template>

<script>
import { mapGetters } from "vuex"
import ClickOutside from "vue-click-outside"
import { required, between } from "vuelidate/lib/validators"
import Modal from "common/TmModal"
import { TmBtn, TmField, TmFormGroup, TmFormMsg } from "@tendermint/ui"

export default {
  name: `delegation-modal`,
  directives: {
    ClickOutside
  },
  components: {
    Modal,
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg
  },
  props: [`fromOptions`, `to`],
  data: () => ({
    amount: 0,
    selectedIndex: 0
  }),
  computed: {
    ...mapGetters([`bondingDenom`])
  },
  validations() {
    return {
      amount: {
        required,
        between: between(
          0.0000000001,
          this.fromOptions[this.selectedIndex].maximum
        )
      }
    }
  },
  methods: {
    close() {
      this.$emit(`update:showDelegationModal`, false)
    },
    onDelegation() {
      this.$emit(`submitDelegation`, {
        amount: this.amount,
        from: this.fromOptions[this.selectedIndex].address
      })
      this.close()
    }
  }
}
</script>

<style lang="stylus">
@import '~variables'

.delegation-modal
  background var(--app-nav)
  display flex
  flex-direction column
  height 50%
  justify-content space-between
  left 50%
  padding 2rem
  position fixed
  top 50%
  width 40%
  z-index z(modal)

  &-header
    align-items center
    display flex

  &-atom
    height 4rem
    width 4rem

  &-form-group
    display block
    padding 0

  #amount
    margin-top -32px

  #denom
    border none
    margin-left 80%
    text-align right
    width 72px

  &-footer
    display flex
    justify-content flex-end

    button
      margin-left 1rem
</style>
