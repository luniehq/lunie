<template>
  <ActionModal
    id="modal-withdraw-rewards"
    ref="actionModal"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    :selected-denom="feeDenom"
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
      <span class="input-suffix">{{ stakingDenom }}</span>
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
    rewards: [],
    balances: []
  }),
  computed: {
    ...mapGetters([`address`, `network`, `stakingDenom`]),
    transactionData() {
      return {
        type: transaction.WITHDRAW
      }
    },
    totalRewards() {
      if (this.rewards && this.rewards.length > 0) {
        return this.rewards
          .filter(({ denom }) => denom === this.stakingDenom)
          .reduce((sum, { amount }) => sum + Number(amount), 0)
          .toFixed(6)
      } else {
        return null
      }
    },
    notifyMessage() {
      return {
        title: `Successful withdrawal!`,
        body: `You have successfully withdrawn your rewards.`
      }
    },
    validatorsWithRewards() {
      if (this.rewards) {
        return this.rewards.length > 0
      } else {
        return false
      }
    },
    claimedReward() {
      if (this.denom && this.rewards && this.rewards.length > 0) {
        // we return the staking denom reward if it has any. Otherwise, we return the first reward from the other tokens
        const rewardsGreaterThanZero = this.rewards.filter(
          reward => reward.amount > 0
        )
        return (
          rewardsGreaterThanZero.find(reward => reward.denom === this.denom) ||
          rewardsGreaterThanZero[0]
        )
      } else {
        return ""
      }
    },
    feeDenom() {
      // since it is cheaper to pay fees with the staking denom (at least in Tendermint), we return this denom
      // as default if there is any available balance. Otherwise, we return the first balance over 0
      // TODO: change to be preferrably the same token that is shown as claimed, although not so important
      if (this.balances && this.balances.length > 0) {
        const nonZeroBalances = this.balances.filter(({ amount }) => amount > 0)
        const stakingDenomBalance = nonZeroBalances.find(
          ({ denom }) => denom === this.denom
        )
        return stakingDenomBalance
          ? stakingDenomBalance.denom
          : nonZeroBalances.length > 0
          ? nonZeroBalances[0].denom
          : this.denom
      } else {
        return this.denom
      }
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
    }
  }
}
</script>

<style scope>
.form-message.withdraw-limit {
  white-space: normal;
}
</style>
