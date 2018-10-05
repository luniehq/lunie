<template lang="pug">
  .undelegation-modal#undelegation-modal(v-click-outside="close")
    .undelegation-modal-header
      img.icon(class='undelegation-modal-atom' src="~assets/images/cosmos-logo.png")
      span.tm-modal-title Undelegate
      .tm-modal-icon.tm-modal-close(@click="close()")
        i.material-icons close

    tm-form-group.undelegation-modal-form-group(
      field-label='Amount'
    )
      tm-field#denom(
        type="text"
        :placeholder="bondingDenom"
        readonly)

      tm-field#amount(
        :max="maximum"
        :min="0"
        type="number"
        v-model="amount"
        v-focus)

    //- To
    tm-form-group.undelegation-modal-form-group(
      field-id='to' field-label='To')
      tm-field#to(readonly v-model="to")

    //- Footer
    .undelegation-modal-footer
      tm-btn(
        @click.native="onUndelegate"
        :disabled="$v.amount.$invalid"
        color="primary"
        value="Undelegate"
        size="lg")
</template>

<script>
import { mapGetters } from "vuex"
import ClickOutside from "vue-click-outside"
import { required, between } from "vuelidate/lib/validators"
import Modal from "common/TmModal"
import { TmBtn, TmField, TmFormGroup, TmFormMsg } from "@tendermint/ui"

export default {
  name: `undelegation-modal`,
  props: [`maximum`, `to`],
  computed: {
    ...mapGetters([`bondingDenom`])
  },
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
        between: between(0.0000000001, this.maximum)
      }
    }
  },
  methods: {
    close() {
      this.$emit(`update:showUndelegationModal`, false)
    },
    onUndelegate() {
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

.undelegation-modal
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
    text-align right
    width 72px
    margin-left 80%
    border none

  &-footer
    display flex
    justify-content flex-end

    button
      margin-left 1rem
</style>
