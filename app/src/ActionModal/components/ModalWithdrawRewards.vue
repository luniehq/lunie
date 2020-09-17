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
    :transaction-type="messageType.CLAIM_REWARDS"
    :rewards="rewards"
    :disable="validatorsWithRewards"
  >
    <span
      v-if="currentNetwork.network_type === 'cosmos'"
      class="form-message notice withdraw-limit"
    >
      Lunie will only withdraw rewards from 5 validators at a time because of a
      limitation with the Ledger Nano&nbsp;S.
    </span>
    <TmFormGroup
      class="action-modal-form-group"
      field-id="amount"
      :field-label="`Rewards from ${top5Validators.length} ${
        top5Validators.length > 1 ? `validators` : `validator`
      }`"
    >
      <div
        v-for="reward in totalRewards"
        :key="reward.denom"
        class="rewards-list-item"
      >
        <input
          class="tm-field-addon"
          disabled="disabled"
          :value="reward.amount | fullDecimals"
        />
        <span class="input-suffix">{{ reward.denom }}</span>
      </div>
    </TmFormGroup>
  </ActionModal>
</template>

<script>
import { mapGetters } from "vuex"
import { fullDecimals } from "src/scripts/num"
import ActionModal from "./ActionModal"
import TmFormGroup from "src/components/common/TmFormGroup"
import { getTop5RewardsValidators } from "../../signing/transaction-manager"
import gql from "graphql-tag"
import { messageType } from "../../components/transactions/messageTypes"

function rewardsToDictionary(rewards) {
  return rewards.reduce((all, reward) => {
    return {
      ...all,
      [reward.denom]: Number(reward.amount) + (all[reward.denom] || 0),
    }
  }, {})
}

export default {
  name: `modal-withdraw-rewards`,
  components: {
    ActionModal,
    TmFormGroup,
  },
  filters: {
    fullDecimals,
  },
  data: () => ({
    rewards: [],
    balances: [],
    getTop5RewardsValidators,
    messageType,
  }),
  asyncComputed: {
    async transactionData() {
      if (this.totalRewards.length === 0) return {}
      if (this.currentNetwork.network_type === "cosmos") {
        return {
          type: messageType.CLAIM_REWARDS,
          amounts: this.totalRewards,
          from: this.top5Validators,
        }
      }
      if (this.currentNetwork.network_type === "polkadot") {
        const rewards = await this.getPolkadotRewards()
        return {
          type: messageType.CLAIM_REWARDS,
          amounts: this.totalRewards,
          from: this.getPolkadotValidators(rewards),
          rewards,
        }
      }
    },
  },
  computed: {
    ...mapGetters([`address`, `network`, `stakingDenom`, `currentNetwork`]),
    top5Validators() {
      if (this.rewards && this.rewards.length > 0) {
        const top5Validators = this.getTop5RewardsValidators(this.rewards)
        return top5Validators
      } else {
        return []
      }
    },
    notifyMessage() {
      return {
        title: `Successful withdrawal!`,
        body: `You have successfully withdrawn your rewards.`,
      }
    },
    validatorsWithRewards() {
      if (this.rewards) {
        return this.rewards.length > 0
      } else {
        return false
      }
    },
    feeDenom() {
      // since it is cheaper to pay fees with the staking denom (at least in Tendermint), we return this denom
      // as default if there is any available balance. Otherwise, we return the first balance over 0
      // TODO: change to be preferrably the same token that is shown as claimed, although not so important
      if (this.balances && this.balances.length > 0) {
        const nonZeroBalances = this.balances.filter(({ amount }) => amount > 0)
        const stakingDenomBalance = nonZeroBalances.find(
          ({ denom }) => denom === this.stakingDenom
        )
        return stakingDenomBalance
          ? stakingDenomBalance.denom
          : nonZeroBalances.length > 0
          ? nonZeroBalances[0].denom
          : this.stakingDenom
      } else {
        return this.stakingDenom
      }
    },
    totalRewards() {
      const filteredRewards = this.rewards.filter(({ validator }) => {
        return this.top5Validators.includes(validator.operatorAddress)
      })
      const top5ValidatorsRewardsObject = rewardsToDictionary(filteredRewards)
      const rewardsDenomArray = Object.entries(top5ValidatorsRewardsObject)
      return rewardsDenomArray
        .map(([denom, amount]) => ({ denom, amount }))
        .sort((a, b) => b.amount - a.amount)
    },
  },
  methods: {
    open() {
      this.$refs.actionModal.open()
    },
    async getPolkadotRewards() {
      const {
        data: { rewards },
      } = await this.$apollo.query({
        query: gql`
          query {
            rewards(
              networkId:"${this.currentNetwork.id}"
              delegatorAddress:"${this.address}"
              withHeight: true
            ) {
              validator { operatorAddress }
              height
            }
          }
        `,
      })
      return rewards
        .sort((a, b) => a.height - b.height)
        .slice(0, 10) // only claiming 10 eras at a time to not exhaust limits
        .map(({ height, validator: { operatorAddress } }) => ({
          height: Number(height),
          validator: operatorAddress,
        }))
    },
    getPolkadotValidators(rewards) {
      const allValidators = rewards.reduce((allValidators, reward) => {
        if (!allValidators.includes(reward.validator)) {
          allValidators.push(reward.validator)
        }
        return allValidators
      }, [])
      return allValidators
    },
  },
  apollo: {
    rewards: {
      query: gql`
        query rewards($networkId: String!, $delegatorAddress: String!) {
          rewards(networkId: $networkId, delegatorAddress: $delegatorAddress) {
            id
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
          delegatorAddress: this.address,
        }
      },
      /* istanbul ignore next */
      update(data) {
        return data.rewards
      },
      /* istanbul ignore next */
      skip() {
        return (
          !this.address ||
          !this.$refs.actionModal ||
          !this.$refs.actionModal.show
        )
      },
    },
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
          !this.address ||
          !this.$refs.actionModal ||
          !this.$refs.actionModal.show
        )
      },
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.network,
          address: this.address,
        }
      },
      update(data) {
        return data.balances || []
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
