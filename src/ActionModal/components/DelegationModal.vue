<template>
  <ActionModal
    id="delegation-modal"
    ref="actionModal"
    :validate="validateForm"
    :amount="isRedelegation() ? 0 : amount"
    :title="isRedelegation() ? 'Redelegate' : 'Delegate'"
    class="delegation-modal"
    submission-error-prefix="Delegating failed"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    @close="clear"
  >
    <TmFormGroup class="action-modal-form-group">
      <div class="form-message notice">
        <span v-if="!isRedelegation()">
          It will take 21 days to unlock your tokens after a delegation and
          there is a risk that some tokens will be lost depending on the
          behaviour of the validator.
        </span>
        <span v-else>
          Voting power and rewards will change instantly upon redelegation —
          your tokens will still be subject to the risks associated with the
          original delegation for the duration of the undelegation period.
        </span>
      </div>
    </TmFormGroup>
    <TmFormGroup class="action-modal-form-group" field-id="to" field-label="To">
      <TmField id="to" v-model="to" type="text" readonly />
      <TmFormMsg
        v-if="validator.status === 'INACTIVE' && !isRedelegation()"
        :msg="
          `You are about to delegate to an inactive validator (${validator.statusDetailed})`
        "
        type="custom"
        class="tm-form-msg--desc"
      />
      <TmFormMsg
        v-if="validator.status === 'INACTIVE' && isRedelegation()"
        :msg="
          `You are about to redelegate to an inactive validator (${validator.statusDetailed})`
        "
        type="custom"
        class="tm-form-msg--desc"
      />
    </TmFormGroup>

    <TmFormGroup
      v-if="fromOptions.length > 1"
      class="action-modal-form-group"
      field-id="from"
      field-label="From"
    >
      <TmField
        id="from"
        v-model="selectedIndex"
        :title="from"
        :options="fromOptions"
        type="select"
      />
    </TmFormGroup>
    <TmFormGroup
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix-denom">{{ denom }}</span>
      <TmFieldGroup>
        <TmField
          id="amount"
          v-model="amount"
          v-focus
          class="tm-field-addon"
          type="number"
          placeholder="Amount"
          @keyup.enter.native="enterPressed"
        />
        <TmBtn
          type="button"
          class="secondary addon-max"
          value="Set Max"
          @click.native="setMaxAmount()"
        />
      </TmFieldGroup>
      <span v-if="!isRedelegation()" class="form-message">
        Available to Delegate:
        {{ balance.amount }}
        {{ denom }}s
      </span>
      <span v-else-if="isRedelegation()" class="form-message">
        Available to Redelegate:
        {{ balance.amount }}
        {{ denom }}s
      </span>
      <TmFormMsg
        v-if="balance === 0"
        :msg="`doesn't have any ${denom}s`"
        name="Wallet"
        type="custom"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.decimal"
        name="Amount"
        type="numeric"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.between"
        :max="$v.amount.$params.between.max"
        :min="$v.amount.$params.between.min"
        name="Amount"
        type="between"
      />
      <TmFormMsg
        v-else-if="isMaxAmount() && !isRedelegation()"
        msg="You are about to use all your tokens for this transaction. Consider leaving a little bit left over to cover the network fees."
        type="custom"
        class="tm-form-msg--desc"
      />
    </TmFormGroup>
  </ActionModal>
</template>

<script>
import { mapState, mapGetters } from "vuex"
import { between, decimal } from "vuelidate/lib/validators"
import gql from "graphql-tag"
import { uatoms, SMALLEST } from "src/scripts/num"
import TmField from "src/components/common/TmField"
import TmFieldGroup from "src/components/common/TmFieldGroup"
import TmBtn from "src/components/common/TmBtn"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmFormMsg from "src/components/common/TmFormMsg"
import ActionModal from "./ActionModal"
import transaction from "../utils/transactionTypes"
import { toMicroDenom, fromMicroDenom } from "src/scripts/common"

export default {
  name: `delegation-modal`,
  components: {
    TmField,
    TmFieldGroup,
    TmBtn,
    TmFormGroup,
    TmFormMsg,
    ActionModal
  },
  props: {
    fromOptions: {
      type: Array,
      required: true
    },
    to: {
      type: String,
      required: true
    },
    validator: {
      type: Object,
      required: true
    },
    denom: {
      type: String,
      required: true
    }
  },
  data: () => ({
    amount: 0,
    selectedIndex: 0,
    balance: {
      amount: 0,
      denom: ``
    }
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`network`]),
    from() {
      if (!this.session.signedIn) return ``

      return this.fromOptions[this.selectedIndex].address
    },
    transactionData() {
      if (!this.from) return {}

      if (this.from === this.session.address) {
        return {
          type: transaction.DELEGATE,
          validatorAddress: this.validator.operatorAddress,
          amount: uatoms(this.amount),
          denom: toMicroDenom(this.denom)
        }
      } else {
        const validatorSrc = this.delegations.find(
          delegation => this.from === delegation.validator.operatorAddress
        ).validator
        return {
          type: transaction.REDELEGATE,
          validatorSourceAddress: validatorSrc.operatorAddress,
          validatorDestinationAddress: this.validator.operatorAddress,
          amount: uatoms(this.amount),
          denom: toMicroDenom(this.denom)
        }
      }
    },
    notifyMessage() {
      if (this.from === this.session.address) {
        return {
          title: `Successful delegation!`,
          body: `You have successfully delegated your ${this.denom}s`
        }
      } else {
        return {
          title: `Successful redelegation!`,
          body: `You have successfully redelegated your ${this.denom}s`
        }
      }
    }
  },
  methods: {
    open(options) {
      if (options && options.redelegation && this.fromOptions.length > 1) {
        this.selectedIndex = 1
      }
      this.$refs.actionModal.open()
    },
    validateForm() {
      this.$v.$touch()

      return !this.$v.$invalid
    },
    clear() {
      this.$v.$reset()

      this.selectedIndex = 0
      this.amount = 0
    },
    setMaxAmount() {
      this.amount = this.balance.amount
    },
    isMaxAmount() {
      return parseFloat(this.amount) === parseFloat(this.balance.amount)
    },
    enterPressed() {
      this.$refs.actionModal.validateChangeStep()
    },
    isRedelegation() {
      return this.from !== this.session.address
    }
  },
  validations() {
    return {
      amount: {
        required: x => !!x && x !== `0`,
        decimal,
        between: between(SMALLEST, this.balance.amount)
      }
    }
  },
  apollo: {
    delegations: {
      query: gql`
        query Delegations($networkId: String!, $delegatorAddress: String!) {
          delegations(
            networkId: $networkId
            delegatorAddress: $delegatorAddress
          ) {
            amount
            validator {
              operatorAddress
            }
          }
        }
      `,
      skip() {
        return !this.session.address
      },
      variables() {
        return {
          networkId: this.network,
          delegatorAddress: this.session.address
        }
      },
      update(data) {
        /* istanbul ignore next */
        return data.delegations
      }
    },
    balance: {
      query: gql`
        query balance($networkId: String!, $address: String!, $denom: String!) {
          balance(networkId: $networkId, address: $address, denom: $denom) {
            amount
            denom
          }
        }
      `,
      skip() {
        return !this.session.address
      },
      variables() {
        return {
          networkId: this.network,
          address: this.session.address,
          denom: fromMicroDenom(this.denom)
        }
      }
    }
  }
}
</script>
