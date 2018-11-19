<template lang="pug">
  .modal-propose#modal-propose(v-click-outside="close")
    .modal-propose-header
      img.icon(class='modal-propose-atom' src="~assets/images/cosmos-logo.png")
      span.tm-modal-title Create Proposal
      .tm-modal-icon.tm-modal-close#closeBtn(@click="close()")
        i.material-icons close

    tm-form-group.page-proposal-form-group
      span Title
      tm-field#title(
        type="text"
        placeholder="Proposal title"
        v-model="title"
        v-focus)

    tm-form-group.page-proposal-form-group
      span Description
      tm-field#description(
        type="textarea"
        placeholder="Write your proposal here..."
        v-model="description")

    tm-form-group.modal-propose-form-group(
      field-id='amount')
      span Deposit amount
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

    .modal-propose-footer
      tm-btn#submit-proposal(
        @click.native="onPropose"
        :disabled="$v.$invalid"
        color="primary"
        value="Submit proposal"
        size="lg")
</template>

<script>
import { mapGetters } from "vuex"
import ClickOutside from "vue-click-outside"
import {
  minLength,
  maxLength,
  required,
  between
} from "vuelidate/lib/validators"
import { isEmpty, trim } from "lodash"
import Modal from "common/TmModal"
import { TmBtn, TmField, TmFormGroup } from "@tendermint/ui"

const isValid = type =>
  type === `Text` || type === `ParameterChange` || type === `SoftwareUpgrade`

const notBlank = text => !isEmpty(trim(text))

export default {
  name: `modal-propose`,
  directives: {
    ClickOutside
  },
  components: {
    Modal,
    TmBtn,
    TmField,
    TmFormGroup
  },
  props: [`denom`],
  data: () => ({
    titleMinLength: 1,
    titleMaxLength: 64,
    descriptionMinLength: 1,
    descriptionMaxLength: 200,
    title: ``,
    description: ``,
    type: `Text`,
    amount: 0
  }),
  computed: {
    // TODO: get coin denom from governance params
    ...mapGetters([`wallet`]),
    balance() {
      // TODO: refactor to get the selected coin when multicoin deposit is enabled
      if (!this.wallet.balancesLoading && !!this.wallet.balances.length) {
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
      title: {
        required,
        minLength(x) {
          return minLength(this.titleMinLength)(x)
        },
        maxLength(x) {
          return maxLength(this.titleMaxLength)(x)
        },
        notBlank
      },
      description: {
        required,
        minLength(x) {
          return minLength(this.descriptionMinLength)(x)
        },
        maxLength(x) {
          return maxLength(this.descriptionMaxLength)(x)
        },
        notBlank
      },
      type: {
        isValid
      },
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
      this.$emit(`update:showModalPropose`, false)
    },
    onPropose() {
      this.$emit(`createProposal`, {
        title: this.title,
        description: this.description,
        type: this.type,
        amount: this.amount
      })
      this.close()
    }
  }
}
</script>

<style lang="stylus">
@import '~variables'

.modal-propose
  background var(--app-nav)
  display flex
  flex-direction column
  justify-content space-between
  left 50%
  padding 2rem
  position fixed
  bottom 0
  width 50%
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
      margin-top 1rem

  .page-proposal-form-group
    display block
    padding 0

    textarea
      min-height 300px

  .tm-form-group
    margin 0.5rem 0
</style>
