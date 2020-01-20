<template>
  <ActionModal
    id="send-modal"
    ref="actionModal"
    :validate="validateForm"
    :amount="amount"
    title="Send"
    submission-error-prefix="Sending tokens failed"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="send"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <TmFormGroup
      :error="$v.address.$error && $v.address.$invalid"
      class="action-modal-form-group"
      field-id="send-address"
      field-label="Send To"
    >
      <TmField
        id="send-address"
        v-model.number="$v.address.$model"
        v-focus
        type="text"
        placeholder="Address"
        @keyup.enter.native="refocusOnAmount"
      />
      <TmFormMsg
        v-if="$v.address.$error && !$v.address.required"
        name="Address"
        type="required"
      />
      <TmFormMsg
        v-else-if="$v.address.$error && !$v.address.bech32Validate"
        name="Address"
        type="bech32"
      />
    </TmFormGroup>
    <TmFormGroup
      v-if="getDenoms.length > 1"
      :error="$v.selectedToken.$error"
      class="action-modal-form-group"
      field-id="selected-token"
      field-label="Token"
    >
      <TmField
        id="token"
        v-model="selectedToken"
        :title="`Select the token you wish to operate with`"
        :options="getDenoms"
        placeholder="Select the token"
        type="select"
      />
      <TmFormMsg
        v-if="$v.selectedToken.$error && !$v.selectedToken.required"
        name="Token"
        type="required"
      />
    </TmFormGroup>
    <TmFormGroup
      id="form-group-amount"
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span v-if="selectedToken" class="input-suffix max-button">{{
        selectedToken
      }}</span>
      <TmFieldGroup>
        <TmField
          id="amount"
          ref="amount"
          v-model="amount"
          class="tm-field-addon"
          placeholder="0"
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
      <TmFormMsg
        v-if="selectedBalance.amount === 0"
        :msg="`doesn't have any ${selectedToken}s`"
        name="Wallet"
        type="custom"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && (!$v.amount.required || amount === 0)"
        name="Amount"
        type="required"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.decimal"
        name="Amount"
        type="numeric"
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
        class="tm-form-msg--desc max-message"
      />
    </TmFormGroup>
    <a v-if="editMemo === false" id="edit-memo-btn" @click="showMemo()">
      Need to edit the memo field?
    </a>
    <TmFormGroup
      v-else
      id="memo"
      :error="$v.memo.$error && $v.memo.$invalid"
      class="action-modal-group"
      field-id="memo"
      field-label="Memo"
    >
      <TmField
        id="memo"
        v-model="memo"
        v-focus
        type="text"
        @keyup.enter.native="enterPressed"
      />
      <TmFormMsg
        v-if="$v.memo.$error && !$v.memo.maxLength"
        name="Memo"
        type="maxLength"
        :max="max_memo_characters"
      />
    </TmFormGroup>
  </ActionModal>
</template>

<script>
import gql from "graphql-tag"
import b32 from "scripts/b32"
import { required, between, decimal, maxLength } from "vuelidate/lib/validators"
import { uatoms, SMALLEST } from "src/scripts/num"
import { mapGetters } from "vuex"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmField from "src/components/common/TmField"
import TmFieldGroup from "src/components/common/TmFieldGroup"
import TmBtn from "src/components/common/TmBtn"
import TmFormMsg from "src/components/common/TmFormMsg"
import ActionModal from "./ActionModal"
import transaction from "../utils/transactionTypes"
import { toMicroDenom } from "src/scripts/common"
import config from "src/../config"
import { UserTransactionAdded } from "src/gql"

const defaultMemo = "(Sent via Lunie)"

export default {
  name: `send-modal`,
  components: {
    TmField,
    TmFieldGroup,
    TmFormGroup,
    TmFormMsg,
    ActionModal,
    TmBtn
  },
  props: {
    denoms: {
      type: Array,
      required: true
    }
  },
  data: () => ({
    address: ``,
    amount: config.development ? 0.000001 : null, // dev life, hard life > make simple
    memo: defaultMemo,
    max_memo_characters: 256,
    editMemo: false,
    isFirstLoad: true,
    selectedToken: ``,
    balances: []
  }),
  computed: {
    ...mapGetters([`network`]),
    ...mapGetters({ userAddress: `address` }),
    selectedBalance() {
      const selectedBalance = this.balances.filter(
        balance => balance.denom === this.selectedToken || this.denoms[0]
      )
      if (selectedBalance.length > 0) {
        return selectedBalance[0]
      }
      return { amount: 0 }
    },
    transactionData() {
      return {
        type: transaction.SEND,
        toAddress: this.address,
        amounts: [
          {
            amount: uatoms(+this.amount),
            denom: toMicroDenom(this.selectedToken)
          }
        ],
        memo: this.memo
      }
    },
    notifyMessage() {
      return {
        title: `Successful Send`,
        body: `Successfully sent ${+this.amount} ${this.selectedToken}s to ${
          this.address
        }`
      }
    },
    getDenoms() {
      return this.denoms
        ? this.denoms.map(denom => (denom = { key: denom, value: denom }))
        : []
    }
  },
  watch: {
    // we set the amount in the input to zero every time the user selects another token so they
    // realize they are dealing with a different balance each time
    selectedToken: function() {
      if (!this.isFirstLoad) {
        this.amount = 0
      } else {
        this.isFirstLoad = false
      }
    },
    balances: function(balances) {
      if (balances.length === 0) return
      this.selectedToken = balances[0].denom
    }
  },
  mounted() {
    this.$apollo.queries.balances.refetch()
  },
  methods: {
    open() {
      this.$refs.actionModal.open()
    },
    onSuccess(event) {
      this.$emit(`success`, event)
    },
    validateForm() {
      this.$v.$touch()

      return !this.$v.$invalid
    },
    clear() {
      this.$v.$reset()

      this.address = undefined
      this.amount = undefined
      this.editMemo = false
      this.memo = defaultMemo
      this.sending = false
    },
    setMaxAmount() {
      this.amount = this.selectedBalance.amount
    },
    isMaxAmount() {
      if (this.selectedBalance.amount === 0) {
        return false
      } else {
        return (
          parseFloat(this.amount) === parseFloat(this.selectedBalance.amount)
        )
      }
    },
    token() {
      if (!this.selectedToken) return ``

      return this.selectedToken
    },
    bech32Validate(param) {
      try {
        b32.decode(param)
        return true
      } catch (error) {
        return false
      }
    },
    enterPressed() {
      this.$refs.actionModal.validateChangeStep()
    },
    refocusOnAmount() {
      this.$refs.amount.$el.focus()
    },
    showMemo() {
      this.memo = ``
      this.editMemo = true
    }
  },
  validations() {
    return {
      address: {
        required,
        bech32Validate: this.bech32Validate
      },
      amount: {
        required: x => !!x && x !== `0`,
        decimal,
        between: between(SMALLEST, this.selectedBalance.amount)
      },
      denoms: { required },
      selectedToken: { required },
      memo: {
        maxLength: maxLength(this.max_memo_characters)
      }
    }
  },
  apollo: {
    balances: {
      query: gql`
        query BalancesSendModal($networkId: String!, $address: String!) {
          balances(networkId: $networkId, address: $address) {
            amount
            denom
          }
        }
      `,
      skip() {
        return !this.userAddress
      },
      variables() {
        return {
          networkId: this.network,
          address: this.userAddress
        }
      }
    },
    $subscribe: {
      userTransactionAdded: {
        variables() {
          /* istanbul ignore next */
          return {
            networkId: this.network,
            address: this.userAddress
          }
        },
        skip() {
          /* istanbul ignore next */
          return !this.userAddress
        },
        query: UserTransactionAdded,
        result() {
          /* istanbul ignore next */
          this.$apollo.queries.balances.refetch()
        }
      }
    }
  }
}
</script>
<style scoped>
#edit-memo-btn {
  margin-top: 2.4rem;
  font-size: 12px;
  cursor: pointer;
}

#form-group-amount {
  margin-bottom: 30px;
}
</style>
