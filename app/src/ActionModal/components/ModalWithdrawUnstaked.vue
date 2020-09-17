<template>
  <ActionModal
    id="modal-withdraw-rewards"
    ref="actionModal"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    title="Withdraw Unstaked Tokens"
    class="modal-withdraw-unstaked"
    submission-error-prefix="Withdrawal failed"
    feature-flag="claim_rewards"
    :transaction-type="messageType.WITHDRAW_UNSTAKED"
  >
    <TmFormGroup
      class="action-modal-form-group"
      field-id="amount"
      field-label="Unstaked Tokens"
    >
      <input
        class="tm-field-addon"
        disabled="disabled"
        :value="totalUnbondedTokens | fullDecimals"
      />
      <span class="input-suffix">{{ stakingDenom }}</span>
    </TmFormGroup>
  </ActionModal>
</template>

<script>
import { mapGetters } from "vuex"
import { fullDecimals } from "src/scripts/num"
import ActionModal from "./ActionModal"
import TmFormGroup from "src/components/common/TmFormGroup"
import gql from "graphql-tag"
import { messageType } from "../../components/transactions/messageTypes"

export default {
  name: `modal-withdraw-unstaked`,
  components: {
    ActionModal,
    TmFormGroup,
  },
  filters: {
    fullDecimals,
  },
  data: () => ({
    messageType,
    undelegations: [],
  }),
  asyncComputed: {
    async transactionData() {
      return {
        type: messageType.WITHDRAW_UNSTAKED,
        amount: String(this.totalUnbondedTokens),
      }
    },
  },
  computed: {
    ...mapGetters([`address`, `stakingDenom`, `currentNetwork`]),
    notifyMessage() {
      return {
        title: `Successful withdrawal!`,
        body: `You have successfully withdrawn your unstaked tokens.`,
      }
    },
    totalUnbondedTokens() {
      const now = new Date()
      const readyUndelegations = this.undelegations.filter(
        ({ endTime }) => new Date(endTime) <= now
      )
      return readyUndelegations.reduce(
        (sum, { amount }) => sum + Number(amount),
        0
      )
    },
  },
  methods: {
    open() {
      this.$refs.actionModal.open()
    },
  },
  apollo: {
    undelegations: {
      query() {
        /* istanbul ignore next */
        return gql`
          query undelegations($networkId: String!, $delegatorAddress: String!) {
            undelegations(
              networkId: $networkId
              delegatorAddress: $delegatorAddress
            ) {
              amount
              endTime
            }
          }
        `
      },
      variables() {
        /* istanbul ignore next */
        return {
          networkId: this.currentNetwork.id,
          delegatorAddress: this.address,
        }
      },
    },
  },
}
</script>

<style scoped>
.form-message.withdraw-limit {
  white-space: normal;
}

.tm-field-addon {
  margin-bottom: 0.25rem;
}

.rewards-list-item {
  position: relative;
}
</style>
