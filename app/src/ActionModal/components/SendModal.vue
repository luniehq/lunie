<template>
  <ActionModal
    id="send-modal"
    ref="actionModal"
    :validate="validateForm"
    :amount="amount"
    title="Send"
    submission-error-prefix="Sending tokens failed"
    :transaction-type="messageType.SEND"
    :transaction-data="transactionData"
    :selected-denom="selectedToken"
    :notify-message="notifyMessage"
    feature-flag="send"
    :disabled="
      $asyncComputed.transactionData.updating ||
      $asyncComputed.transactionData.error
    "
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
        ref="sendAddress"
        v-model="address"
        v-focus
        type="text"
        placeholder="Address or Starname"
        @change.native="trimSendAddress"
        @keyup.enter.native="refocusOnAmount"
      />
      <TmFormMsg
        v-if="$v.address.$error && !$v.address.required"
        name="Address"
        type="required"
      />
      <TmFormMsg
        v-else-if="$v.address.$error && !$v.address.validAddress"
        name="Address"
        type="custom"
        msg="doesn't have a format known by Lunie"
      />
      <span v-if="$asyncComputed.transactionData.updating" class="memo-span">
        Getting address for Starname...
      </span>
      <TmFormMsg
        v-else-if="$asyncComputed.transactionData.error"
        msg="could not be resolved to an address"
        name="Starname"
        type="custom"
      />
      <span v-else class="memo-span">
        Lunie supports
        <a href="https://starname.me/" target="_blank">IOV Starnames</a>
      </span>
    </TmFormGroup>
    <TmFormGroup
      id="form-group-amount"
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
          class="addon-max"
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
        v-else-if="$v.amount.$error && !$v.amount.max"
        type="custom"
        :msg="`You don't have enough ${selectedToken}s to proceed.`"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.min"
        :min="smallestAmount"
        name="Amount"
        type="min"
      />
      <TmFormMsg
        v-else-if="$v.amount.$error && !$v.amount.maxDecimals"
        name="Amount"
        type="maxDecimals"
      />
      <TmFormMsg
        v-else-if="isMaxAmount()"
        msg="You are about to use all your tokens for this transaction. Consider leaving a little bit left over to cover the network fees."
        type="custom"
        class="tm-form-msg--desc max-message"
      />
    </TmFormGroup>
    <TmFormGroup
      id="memo"
      :error="$v.memo.$error && $v.memo.$invalid"
      class="action-modal-group"
      field-id="memo"
      field-label="Memo"
    >
      <TmField
        id="memo"
        v-model="memo"
        type="text"
        @keyup.enter.native="enterPressed"
      />
      <span class="memo-span"
        >To learn more about how to use the memo field, read
        <a
          href=" https://intercom.help/lunie/en/articles/3776563-using-the-memo-option-when-sending-tokens-to-and-from-exchanges"
          rel="noopener norefferer"
          target="_blank"
          >our guide</a
        >.</span
      >
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
import { required, decimal, maxLength } from "vuelidate/lib/validators"
import { SMALLEST } from "src/scripts/num"
import { mapGetters } from "vuex"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmField from "src/components/common/TmField"
import TmFieldGroup from "src/components/common/TmFieldGroup"
import TmBtn from "src/components/common/TmBtn"
import TmFormMsg from "src/components/common/TmFormMsg"
import ActionModal from "./ActionModal"
import { messageType } from "../../components/transactions/messageTypes"
import config from "src/../config"
import { UserTransactionAdded } from "src/gql"
import BigNumber from "bignumber.js"
import { formatAddress } from "src/filters"
import { isStarname, resolveStarname } from "src/../../common/starname"

const defaultMemo = ""

const isPolkadotAddress = (address) => {
  const polkadotRegexp = /^(([0-9a-zA-Z]{47})|([0-9a-zA-Z]{48}))$/
  return polkadotRegexp.test(address)
}

export default {
  name: `send-modal`,
  components: {
    TmField,
    TmFieldGroup,
    TmFormGroup,
    TmFormMsg,
    ActionModal,
    TmBtn,
  },
  props: {
    denoms: {
      type: Array,
      required: true,
    },
  },
  data: () => ({
    address: ``,
    amount: config.development ? 0.000001 : null, // dev life, hard life > make simple
    memo: defaultMemo,
    max_memo_characters: 256,
    isFirstLoad: true,
    selectedToken: undefined,
    balances: [],
    messageType,
    smallestAmount: SMALLEST,
    networkFeesLoaded: false,
  }),
  computed: {
    ...mapGetters([`network`, `networks`, `stakingDenom`]),
    ...mapGetters({ userAddress: `address` }),
    selectedBalance() {
      return (
        this.balances.find(({ denom }) => denom === this.selectedToken) || {
          amount: 0,
        }
      )
    },
    notifyMessage() {
      return {
        title: `Successful Send`,
        body: `Successfully sent ${this.amount} ${
          this.selectedToken
        }s to ${formatAddress(this.address)}`,
      }
    },
    getDenoms() {
      return this.denoms
        ? this.denoms.map((denom) => (denom = { key: denom, value: denom }))
        : []
    },
    // TODO: maxAmount should be handled from ActionModal
    maxAmount() {
      if (this.networkFeesLoaded) {
        return this.maxDecimals(
          this.selectedBalance.amount - this.networkFees.transactionFee.amount,
          6
        )
      } else {
        return this.maxDecimals(this.selectedBalance.amount, 6)
      }
    },
  },
  asyncComputed: {
    async transactionData() {
      if (isNaN(this.amount) || !this.address || !this.selectedToken) {
        return {}
      }
      return {
        type: messageType.SEND,
        to: [this.address],
        from: [this.userAddress],
        amount: {
          amount: this.amount,
          denom: this.selectedToken,
        },
        memo: this.memo,
      }
    },
  },
  watch: {
    // we set the amount in the input to zero every time the user selects another token so they
    // realize they are dealing with a different balance each time
    selectedToken: function () {
      if (!this.isFirstLoad) {
        this.amount = 0
      } else {
        this.isFirstLoad = false
      }
    },
    balances: function (balances) {
      // if there is already a token selected don't reset it
      if (this.selectedToken) return

      // in case the account has no balances we will display the staking denom received from the denom query
      if (balances.length === 0) {
        this.selectedToken = this.stakingDenom
      } else {
        this.selectedToken = balances[0].denom
      }
    },
    address: async function (address) {
      if (isStarname(this.address)) {
        // resolve starname to address
        const recipientAddress = await resolveStarname(
          this.address,
          this.network
        )
        this.setAddress(recipientAddress)
      }
    },
  },
  mounted() {
    this.$apollo.queries.balances.refetch()
  },
  methods: {
    open(denom = undefined) {
      if (denom) {
        this.selectedToken = denom
      } else {
        this.selectedToken =
          this.balances && this.balances.length > 0
            ? this.balances[0].denom
            : this.stakingDenom
      }
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
      this.memo = defaultMemo
      this.sending = false
    },
    setMaxAmount() {
      this.amount = this.maxAmount
    },
    setAddress(recipientAddress) {
      this.address = recipientAddress
    },
    isMaxAmount() {
      if (this.selectedBalance.amount === 0) {
        return false
      } else {
        return parseFloat(this.amount) === this.maxAmount
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
    trimSendAddress() {
      this.address = this.$refs.sendAddress.value.trim()
    },
    refocusOnAmount() {
      this.$refs.amount.$el.focus()
    },
    maxDecimals(value, decimals) {
      return Number(BigNumber(value).toFixed(decimals)) // TODO only use bignumber
    },
  },
  validations() {
    return {
      address: {
        required,
        validAddress: (address) =>
          this.bech32Validate(address) ||
          isPolkadotAddress(address) ||
          isStarname(address),
      },
      amount: {
        required: (x) => !!x && x !== `0`,
        decimal,
        max: (x) => Number(x) <= this.maxAmount,
        min: (x) => Number(x) >= SMALLEST,
        maxDecimals: (x) => {
          return x.toString().split(".").length > 1
            ? x.toString().split(".")[1].length <= 6
            : true
        },
      },
      denoms: { required },
      selectedToken: { required },
      memo: {
        maxLength: maxLength(this.max_memo_characters),
      },
    }
  },
  apollo: {
    balances: {
      query: gql`
        query BalancesSendModal($networkId: String!, $address: String!) {
          balances(networkId: $networkId, address: $address) {
            id
            amount
            denom
          }
        }
      `,
      /* istanbul ignore next */
      skip() {
        return (
          !this.userAddress ||
          !this.$refs.actionModal ||
          !this.$refs.actionModal.show
        )
      },
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          address: this.userAddress,
        }
      },
      update(data) {
        // if no token preselected, pick first token available
        if (!this.selectedToken) {
          data.balances.find(({ denom }) => denom).denom
        }
        return data.balances || []
      },
    },
    networkFees: {
      query: gql`
        query NetworkFees(
          $networkId: String!
          $messageType: String!
          $message: TransactionDetailsInput!
          $senderAddress: String!
        ) {
          networkFees(
            networkId: $networkId
            messageType: $messageType
            message: $message
            senderAddress: $senderAddress
          ) {
            transactionFee {
              denom
              amount
            }
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        let { type, ...message } = this.transactionData
        delete message.memo
        // make sure the amounts are strings when sending
        if (message.amount) {
          message.amount = {
            amount: String(message.amount.amount),
            denom: message.amount.denom,
          }
        }
        if (message.amounts) {
          message.amounts = message.amounts.map(({ amount, denom }) => ({
            amount: String(amount),
            denom,
          }))
        }
        return {
          networkId: this.network,
          messageType: type,
          message,
          senderAddress: this.userAddress,
        }
      },
      /* istanbul ignore next */
      update(data) {
        if (data.networkFees) {
          this.networkFeesLoaded = true
          return data.networkFees
        }
      },
      /* istanbul ignore next */
      skip() {
        return (
          !this.userAddress ||
          !this.$refs.actionModal ||
          !this.$refs.actionModal.show ||
          !this.transactionData ||
          Object.keys(this.transactionData).length === 0
        )
      },
    },
    $subscribe: {
      userTransactionAdded: {
        /* istanbul ignore next */
        variables() {
          return {
            networkId: this.network,
            address: this.userAddress,
          }
        },
        /* istanbul ignore next */
        skip() {
          return (
            !this.userAddress ||
            !this.$refs.actionModal ||
            !this.$refs.actionModal.show
          )
        },
        query: UserTransactionAdded,
        /* istanbul ignore next */
        result() {
          this.$apollo.queries.balances.refetch()
        },
      },
    },
  },
}
</script>
<style scoped>
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

.memo-span {
  font-size: var(--sm);
  font-style: italic;
}
</style>
