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
      :field-label="
        `Rewards from ${validatorsNumber} ${
          validatorsNumber > 1 ? `validators` : `validator`
        }`
      "
    >
      <div v-for="reward in totalRewards" :key="JSON.stringify(reward.denom)">
        <span class="input-suffix-reward">{{ reward.denom }}</span>
        <input
          class="tm-field-addon"
          disabled="disabled"
          :value="reward.amount"
        />
      </div>
    </TmFormGroup>
  </ActionModal>
</template>

<script>
import { mapGetters } from "vuex"
import { fullDecimals } from "src/scripts/num"
import ActionModal from "./ActionModal"
import TmFormGroup from "src/components/common/TmFormGroup"
import { getTop5RewardsValidators } from "../utils/ActionManager"
import uniqWith from "lodash.uniqwith"
import gql from "graphql-tag"

import transactionTypes from "../utils/transactionTypes"
import { messageType } from "../../components/transactions/messageTypes"

export default {
  name: `modal-withdraw-rewards`,
  components: {
    ActionModal,
    TmFormGroup
  },
  filters: {
    fullDecimals
  },
  data: () => ({
    rewards: [],
    balances: [],
    getTop5RewardsValidators,
    transactionTypes,
    messageType
  }),
  computed: {
    ...mapGetters([`address`, `network`, `stakingDenom`]),
    ...mapGetters({ userAddress: `address` }),
    transactionData() {
      if (!this.claimedReward) return {}
      return {
        type: transactionTypes.WITHDRAW,
        amounts: [
          {
            amount: this.claimedReward.amount,
            denom: this.claimedReward.denom
          }
        ]
      }
    },
    validatorsNumber() {
      if (this.rewards && this.rewards.length > 0) {
        const totalValidatorNumber = uniqWith(
          this.rewards,
          (a, b) => JSON.stringify(a.validator) === JSON.stringify(b.validator)
        ).length
        return totalValidatorNumber > 5 ? 5 : totalValidatorNumber
      } else {
        return 0
      }
    },
    totalRewards() {
      if (this.rewards && this.rewards.length > 0) {
        const top5Validators = this.getTop5RewardsValidators(
          this.stakingDenom,
          this.rewards
        )
        return this.getTop5ValidatorsRewards(top5Validators)
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
      if (this.rewards && this.rewards.length > 0) {
        // we return the staking denom reward if it has any. Otherwise, we return the first reward from the other tokens
        const rewardsGreaterThanZero = this.rewards.filter(
          reward => reward.amount > 0
        )
        return (
          rewardsGreaterThanZero.find(
            reward => reward.denom === this.stakingDenom
          ) || rewardsGreaterThanZero[0]
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
    }
  },
  methods: {
    open() {
      this.$refs.actionModal.open()
    },
    getTop5ValidatorsRewards(top5validators) {
      const top5ValidatorsRewardsObject = this.rewards
        .filter(({ validator }) =>
          top5validators.includes(validator.operatorAddress)
        )
        .reduce((all, reward) => {
          return {
            ...all,
            [reward.denom]:
              Math.round((reward.amount + (all[reward.denom] || 0)) * 1000000) /
              1000000
          }
        }, {})
      const rewardsDenomArray = Object.keys(top5ValidatorsRewardsObject)
      return rewardsDenomArray.reduce((rewardsAggregator, rewardDenom) => {
        if (top5ValidatorsRewardsObject[rewardDenom]) {
          rewardsAggregator.push({
            denom: rewardDenom,
            amount: top5ValidatorsRewardsObject[rewardDenom]
          })
        }
        return rewardsAggregator
      }, [])
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
    }
  }
}
</script>

<style scope>
.input-suffix-reward {
  background: var(--bc-dim);
  display: inline-block;
  position: absolute;
  padding: 8px;
  font-size: var(--sm);
  text-transform: uppercase;
  right: 30px;
  letter-spacing: 1px;
  text-align: right;
  font-weight: 500;
  border-radius: 2px;
}
.form-message.withdraw-limit {
  white-space: normal;
}
</style>
