<template lang="pug">
  .modal-deposit#modal-deposit(v-click-outside="close")
    .modal-deposit-header
      img.icon(class='modal-deposit-atom' src="~assets/images/cosmos-logo.png")
      span.tm-modal-title Deposit
      .tm-modal-icon.tm-modal-close#closeBtn(@click="close()")
        i.material-icons close

    div
      h2 Title: {{ proposalTitle }}
      h3 Proposal ID: {{ `#` + proposalId }}

    tm-form-group.modal-deposit-form-group(
      field-id='amount'
      field-label='Amount'
    )
      tm-field#denom(
        type="text"
        :placeholder="denom"
        readonly)

      tm-field#amount(
        type="number"
        :max="balance"
        :min="0"
        step="any"
        v-model="amount"
        v-focus)

    .modal-deposit-footer
      tm-btn#submit-deposit(
        @click.native="onDeposit"
        :disabled="$v.amount.$invalid"
        color="primary"
        value="Deposit"
        size="lg")
</template>

<script>
import { mapGetters } from "vuex"
import ClickOutside from "vue-click-outside"
import { required, between } from "vuelidate/lib/validators"
import Modal from "common/TmModal"
import { TmBtn, TmField, TmFormGroup } from "@tendermint/ui"

export default {
  name: `modal-deposit`,
  components: {
    Modal,
    TmBtn,
    TmField,
    TmFormGroup
  },
  directives: {
    ClickOutside
  },
  props: [`proposalId`, `proposalTitle`, `denom`],
  data: () => ({
    amount: 0
  }),
  computed: {
    // TODO: get coin denom from governance params
    ...mapGetters([`wallet`]),
    balance() {
      // TODO: refactor to get the selected coin when multicooin deposit is enabled
      if (!this.wallet.loading && !!this.wallet.balances.length) {
        let balance = this.wallet.balances.find(
          coin => coin.denom === this.denom
        )
        if (balance) return parseFloat(balance.amount)
      }
      return 0
    }
  },
  validations() {
    return {
      amount: {
        required,
        between: between(
          0.0000000001,
          this.balance > 0 ? this.balance : 0.0000000001
        )
      }
    }
  },
  methods: {
    close() {
      this.$emit(`update:showModalDeposit`, false)
    },
    onDeposit() {
      let amount = [
        {
          denom: this.denom,
          amount: String(this.amount)
        }
      ]
      this.$emit(`submitDeposit`, { amount })
      this.close()
    }
  }
}
</script>

<style lang="stylus">
@import '~variables'

.modal-deposit
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
