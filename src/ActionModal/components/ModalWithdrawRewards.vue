<template>
  <ActionModal
    id="modal-withdraw-rewards"
    ref="actionModal"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    title="Claim Rewards"
    class="modal-withdraw-rewards"
    submission-error-prefix="Withdrawal failed"
    feature-flag="claim_rewards"
    :rewards="rewards"
    :disable="validatorsWithRewards"
  >
    <span class="form-message notice withdraw-limit">
      Lunie will only withdraw rewards from 5 validators at a time because of a
      limitation with the Ledger Nano&nbsp;S.
    </span>
    <TmFormGroup
      class="action-modal-form-group"
      field-id="amount"
      field-label="Amount"
    >
      <span class="input-suffix">{{ denom }}</span>
      <TmField
        id="amount"
        v-model="totalRewards"
        class="tm-field-addon"
        type="number"
        disabled="disabled"
      />
    </TmFormGroup>
  </ActionModal>
</template>

<script>
import { mapGetters } from "vuex"
import { fullDecimals } from "src/scripts/num"
import ActionModal from "./ActionModal"
import TmField from "src/components/common/TmField"
import TmFormGroup from "src/components/common/TmFormGroup"
import gql from "graphql-tag"

import transaction from "../utils/transactionTypes"

export default {
  name: `modal-withdraw-rewards`,
  components: {
    ActionModal,
    TmFormGroup,
    TmField
  },
  filters: {
    fullDecimals
  },
  data: () => ({
    rewards: []
  }),
  computed: {
    ...mapGetters([`address`, `network`]),
    transactionData() {
      return {
        type: transaction.WITHDRAW
      }
    },
    totalRewards() {
      return this.rewards
        .filter(({ denom }) => denom === this.denom)
        .reduce((sum, { amount }) => sum + Number(amount), 0)
        .toFixed(6)
    },
    notifyMessage() {
      return {
        title: `Successful withdrawal!`,
        body: `You have successfully withdrawn your rewards.`
      }
    },
    validatorsWithRewards() {
      return this.rewards.length > 0
    }
  },
  methods: {
    open() {
      this.$refs.actionModal.open()
    }
  },
  apollo: {
    rewards: {
      query: gql`
        query rewards($networkId: String!, $delegatorAddress: String!) {
          rewards(networkId: $networkId, delegatorAddress: $delegatorAddress) {
            validator {
              operatorAddress
            }
            amount
            denom
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          delegatorAddress: this.address
        }
      },
      /* istanbul ignore next */
      update(data) {
        return data.rewards
      },
      /* istanbul ignore next */
      skip() {
        return !this.address
      }
    },
    denom: {
      query: gql`
        query Networks($networkId: String!) {
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
    }
  }
}
</script>

<style scope>
.form-message.withdraw-limit {
  white-space: normal;
}
</style>
