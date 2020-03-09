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
      <span v-if="claimedReward" class="input-suffix">{{
        claimedReward.denom
      }}</span>
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
    ...mapGetters([`address`, `network`]),
    transactionData() {
      return {
        type: transaction.WITHDRAW
      }
    },
    totalRewards() {
      const stakingRewards = this.rewards
        .filter(({ denom }) => denom === this.denom)
        .reduce((sum, { amount }) => sum + Number(amount), 0)
        .toFixed(6)
      return stakingRewards > 0 ? stakingRewards : this.claimedReward.amount
    },
    notifyMessage() {
      return {
        title: `Successful withdrawal!`,
        body: `You have successfully withdrawn your rewards.`
      }
    },
    validatorsWithRewards() {
      return this.rewards.length > 0
    },
    claimedReward() {
      if (this.denom && this.rewards && this.rewards.length > 0) {
        // we return the staking denom reward if it has any. Otherwise, we return the first reward from the other tokens
        return (
          this.rewards.filter(
            reward => reward.denom === this.denom && reward.amount > 0
          )[0] || this.rewards.filter(reward => reward.amount > 0)[0]
        )
      } else {
        return ""
      }
    },
    feeDenom() {
      // since it is cheaper to pay fees with the staking denom (at least in Tendermint), we return this denom
      // as default if there is any available balance. Otherwise, we return the same denom than from the claimed reward
      if (this.balances && this.balances.length > 0) {
        return this.balances.filter(({ denom }) => denom === this.denom)[0] &&
          this.balances.filter(({ denom }) => denom === this.denom)[0].amount >
            0
          ? this.denom
          : this.claimedReward.denom
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
    },
    balances: {
      query: gql`
        query balances($networkId: String!, $address: String!) {
          balances(networkId: $networkId, address: $address) {
            denom
            amount
            gasPrice
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          address: this.address
        }
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
