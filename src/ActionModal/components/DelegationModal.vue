<template>
  <ActionModal
    id="delegation-modal"
    ref="actionModal"
    :validate="validateForm"
    :amount="amount"
    title="Stake"
    class="delegation-modal"
    submission-error-prefix="Staking failed"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="delegate"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <TmFormGroup class="action-modal-form-group">
      <div class="form-message notice">
        <span>
          It will take 21 days to unlock your tokens after they are staked.
          There is a risk that some tokens will be lost depending on the
          behaviour of the validator you choose.
        </span>
      </div>
    </TmFormGroup>
    <TmFormGroup class="action-modal-form-group" field-id="to" field-label="To">
      <TmField
        id="to"
        v-model="targetValidator.operatorAddress"
        type="text"
        readonly
      />
      <TmFormMsg
        v-if="targetValidator.status === 'INACTIVE'"
        :msg="
          `You are about to stake to an inactive validator (${targetValidator.statusDetailed})`
        "
        type="custom"
        class="tm-form-msg--desc"
      />
    </TmFormGroup>
    <TmFormGroup
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
      <span class="input-suffix max-button">{{ denom }}</span>
      <TmFieldGroup>
        <TmField
          id="amount"
          v-model="amount"
          v-focus
          placeholder="0"
          class="tm-field-addon"
          type="number"
          @keyup.enter.native="enterPressed"
        />
        <TmBtn
          type="button"
          class="secondary addon-max"
          value="Set Max"
          @click.native="setMaxAmount()"
        />
      </TmFieldGroup>
      <span class="form-message">
        Available to stake:
        {{ maxAmount }}
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
        v-else-if="isMaxAmount()"
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
import { toMicroDenom } from "src/scripts/common"
import { formatBech32 } from "src/filters"
import { UserTransactionAdded } from "src/gql"

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
    targetValidator: {
      type: Object,
      required: true
    }
  },
  data: () => ({
    amount: null,
    selectedIndex: 0,
    balance: {
      amount: null,
      denom: ``
    },
    delegations: [],
    denom: ``
  }),
  computed: {
    ...mapState([`session`]),
    ...mapGetters([`network`, `address`]),
    fromOptions() {
      return [
        // from wallet
        {
          address: this.address,
          maximum: Number(this.balance.amount),
          key: `My Wallet - ${formatBech32(this.address, false, 20)}`,
          value: 0
        }
      ]
    },
    from() {
      if (!this.session.signedIn) return ``

      return this.fromOptions[this.selectedIndex].address
    },
    transactionData() {
      if (!this.targetValidator.operatorAddress) return {}

      return {
        type: transaction.DELEGATE,
        validatorAddress: this.targetValidator.operatorAddress,
        amount: uatoms(this.amount),
        denom: toMicroDenom(this.denom)
      }
    },
    notifyMessage() {
      return {
        title: `Successfully staked!`,
        body: `You have successfully staked your ${this.denom}s`
      }
    },
    maxAmount() {
      return this.fromOptions[this.selectedIndex].maximum
    }
  },
  mounted() {
    this.$apollo.queries.balance.refetch()
    this.$apollo.queries.delegations.refetch()
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
      this.amount = null
    },
    setMaxAmount() {
      this.amount = this.maxAmount
    },
    isMaxAmount() {
      return parseFloat(this.amount) === parseFloat(this.maxAmount)
    },
    enterPressed() {
      this.$refs.actionModal.validateChangeStep()
    },
    onSuccess(event) {
      this.$emit(`success`, event)
    }
  },
  validations() {
    return {
      amount: {
        required: x => !!x && x !== `0`,
        decimal,
        between: between(SMALLEST, this.maxAmount)
      }
    }
  },
  apollo: {
    delegations: {
      query: gql`
        query DelegationsDelegationModal(
          $networkId: String!
          $delegatorAddress: String!
        ) {
          delegations(
            networkId: $networkId
            delegatorAddress: $delegatorAddress
          ) {
            amount
            validator {
              operatorAddress
              name
            }
          }
        }
      `,
      skip() {
        return !this.address
      },
      variables() {
        return {
          networkId: this.network,
          delegatorAddress: this.address
        }
      },
      update(data) {
        /* istanbul ignore next */
        return data.delegations
      }
    },
    balance: {
      query: gql`
        query BalanceDelegationModal(
          $networkId: String!
          $address: String!
          $denom: String!
        ) {
          balance(networkId: $networkId, address: $address, denom: $denom) {
            amount
            denom
          }
        }
      `,
      skip() {
        return !this.address
      },
      variables() {
        return {
          networkId: this.network,
          address: this.address,
          denom: this.denom
        }
      }
    },
    denom: {
      query: gql`
        query NetworksDelegationModal($networkId: String!) {
          network(id: $networkId) {
            id
            stakingDenom
          }
        }
      `,
      variables() {
        return {
          networkId: this.network
        }
      },
      update(data) {
        /* istanbul ignore next */
        return data.network.stakingDenom
      }
    }
  },
  $subscribe: {
    userTransactionAdded: {
      variables() {
        return {
          networkId: this.network,
          address: this.address
        }
      },
      skip() {
        return !this.address
      },
      query: UserTransactionAdded,
      result({ data }) {
        if (data.userTransactionAdded.success) {
          this.$apollo.queries.delegations.refetch()
        }
      }
    }
  }
}
</script>
