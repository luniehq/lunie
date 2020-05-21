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
    <span class="form-message notice withdraw-limit">
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
      <TmFormMsg
        v-if="currentNetwork.network_type === 'polkadot'"
        type="custom"
        class="tm-form-msg--desc"
        msg="Currently only rewards from era 718 onwards are claimable"
      />
    </TmFormGroup>
  </ActionModal>
</template>

<script>
import { mapGetters } from "vuex"
import { fullDecimals } from "src/scripts/num"
import ActionModal from "./ActionModal"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmFormMsg from "common/TmFormMsg"
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
    TmFormMsg,
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
  computed: {
    ...mapGetters([`address`, `network`, `stakingDenom`, `currentNetwork`]),
    ...mapGetters({ userAddress: `address` }),
    transactionData() {
      if (this.totalRewards.length === 0) return {}
      return {
        type: messageType.CLAIM_REWARDS,
        amounts: this.totalRewards,
        from: this.top5Validators,
      }
    },
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
          delegatorAddress: this.address,
        }
      },
      /* istanbul ignore next */
      update(data) {
        return data.rewards
      },
      /* istanbul ignore next */
      skip() {
        return !this.address
      },
    },
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
          address: this.userAddress,
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
