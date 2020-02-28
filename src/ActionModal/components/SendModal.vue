<template>
  <ActionModal
    id="send-modal"
    ref="actionModal"
    :validate="validateForm"
    :amount="amount"
    title="Send"
    submission-error-prefix="Sending tokens failed"
    :transaction-data="transactionData"
    :selected-denom="selectedToken"
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
      :error="$v.amount.$error && $v.amount.$invalid"
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
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
        <TmField
          id="token"
          v-model="selectedToken"
          :title="`Select the token you wish to operate with`"
          :options="getDenoms"
          class="tm-field-token-selector"
          placeholder="Select the token"
          type="select"
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
    <div class="exchange-warning-div exchange-warning">
      <label for="send-to-exchange"
        ><input
          id="send-to-exchange"
          v-model="sendToExchange"
          type="checkbox"
        />Are you sending to an exchange?&nbsp;</label
      >
    </div>
    <div v-if="sendToExchange">
      <div class="exchange-warning-message">
        <p>
          If you are sending to an exchange you might need to edit the memo
          field. Check if this is the case, since otherwise you could
          <u>not receive your funds</u>
        </p>
      </div>
    </div>
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
    sendToExchange: false,
    isFirstLoad: true,
    selectedToken: undefined,
    balances: [],
    denom: ``
  }),
  computed: {
    ...mapGetters([`network`]),
    ...mapGetters({ userAddress: `address` }),
    selectedBalance() {
      return (
        this.balances.find(({ denom }) => denom === this.selectedToken) || {
          amount: 0
        }
      )
    },
    transactionData() {
      if (isNaN(this.amount) || !this.address || !this.selectedToken) {
        return {}
      }
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
      // if there is already a token selected don't reset it
      if (this.selectedToken) return

      // in case the account has no balances we will display the staking denom received from the denom query
      if (balances.length === 0) {
        this.selectedToken = this.denom
      } else {
        this.selectedToken = balances[0].denom
      }
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
      /* istanbul ignore next */
      skip() {
        return !this.userAddress
      },
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          address: this.userAddress
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
      fetchPolicy: "cache-first",
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network
        }
      },
      /* istanbul ignore next */
      update(data) {
        if (data.network) return data.network.stakingDenom
        return ""
      }
    },
    $subscribe: {
      userTransactionAdded: {
        /* istanbul ignore next */
        variables() {
          return {
            networkId: this.network,
            address: this.userAddress
          }
        },
        /* istanbul ignore next */
        skip() {
          return !this.userAddress
        },
        query: UserTransactionAdded,
        /* istanbul ignore next */
        result() {
          this.$apollo.queries.balances.refetch()
        }
      }
    }
  }
}
</script>
<style scoped>
#edit-memo-btn {
  display: block;
  font-size: 15px;
  cursor: pointer;
  margin-top: 1rem;
}
.exchange-warning-div {
  display: flex;
  flex-direction: row-reverse;
}
.exchange-warning {
  color: var(--link);
  font-size: 15px;
  font-style: italic;
  cursor: pointer;
}
.exchange-warning:hover {
  color: var(--link-hover);
}
.exchange-warning-message {
  background-color: var(--bc);
  font-size: 15px;
  color: var(--tx-distribution);
  padding: 5px;
}
.tm-field-addon {
  border-right: 0;
}
.tm-field-addon:focus {
  border-color: var(--input-bc);
}
.tm-field-token-selector {
  width: 80px;
}
.tm-field-token-selector >>> .tm-field-select {
  border-left: 0;
  border-radius: 0 !important;
}
.tm-field-token-selector >>> .tm-field-select:focus {
  border-color: var(--input-bc);
}
.tm-field-token-selector >>> .tm-field-select-addon {
  border: 0;
}
</style>
