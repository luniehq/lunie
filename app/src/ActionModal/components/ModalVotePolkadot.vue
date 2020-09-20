<template>
  <ActionModal
    id="modal-vote-substrate"
    ref="actionModal"
    :validate="validateForm"
    title="Vote"
    class="modal-vote"
    submission-error-prefix="Voting failed"
    :transaction-type="messageType.VOTE"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="vote"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <div class="action-modal-group vote-options">
      <h3>Select your vote</h3>
      <div class="flex-row">
        <TmBtn
          id="vote-yes"
          :class="{ active: vote === voteEnum.YES }"
          :disabled="lastVoteOption === voteEnum.YES"
          color="secondary"
          :value="voteEnum.YES"
          size="md"
          @click.native="vote = voteEnum.YES"
        />
        <TmBtn
          id="vote-no"
          :class="{ active: vote === voteEnum.NO }"
          :disabled="lastVoteOption === voteEnum.NO"
          color="secondary"
          :value="voteEnum.NO"
          size="md"
          @click.native="vote = voteEnum.NO"
        />
      </div>
    </div>
    <div class="line"></div>
    <div class="locking-area">
      <p class="available">
        Available to vote
        <span class="bold"
          >{{ stakingDenomBalance.available }}&nbsp;{{
            currentNetwork.stakingDenom.concat(`s`)
          }}</span
        >
      </p>
      <div class="locked-balance-container">
        <TmFormGroup
          :error="$v.lockedBalance.$error && $v.lockedBalance.$invalid"
          class="action-modal-group"
          field-id="lockedBalance"
        >
          <TmField
            id="locked-balance"
            v-model="lockedBalance"
            v-focus-last
            class="locked-balance"
            type="text"
            :placeholder="`0`"
          />
          <TmFormMsg
            v-if="$v.lockedBalance.$error && !$v.lockedBalance.required"
            name="Balance"
            type="required"
          />
          <TmFormMsg
            v-if="$v.lockedBalance.$error && !$v.lockedBalance.decimal"
            name="Balance"
            type="numeric"
          />
          <TmFormMsg
            v-else-if="$v.lockedBalance.$error && !$v.lockedBalance.max"
            type="custom"
            :msg="`You don't have enough ${currentNetwork.stakingDenom}s to proceed.`"
          />
          <TmFormMsg
            v-if="$v.lockedBalance.$error && !$v.lockedBalance.min"
            name="Balance"
            type="min"
          />
          <TmFormMsg
            v-if="$v.lockedBalance.$error && !$v.lockedBalance.maxDecimals"
            name="Balance"
            type="maxDecimals"
          />
        </TmFormGroup>
      </div>
      <span class="available"
        >{{ currentNetwork.stakingDenom.concat(`s`) }} locked for
        <span class="bold">{{ lockingPeriod }} days</span></span
      >
      <div class="flex-row locking-options">
        <span
          v-for="voteTokenTimeLock in voteTokenTimeLocks"
          :key="voteTokenTimeLock.display"
          :class="{
            activeLocking:
              voteTokenTimeLock.display === selectedVoteTokenTimeLock.display,
          }"
          class="locking-option"
          @click="voteTokenTimeLockController(voteTokenTimeLock)"
          >{{ voteTokenTimeLock.display }}</span
        >
      </div>
    </div>
    <div class="totals flex-row">
      <div class="card">
        <span class="card-title">Total Value of Vote</span>
        <div class="card-value">
          <span>{{ totalVotingPower }}</span>
          <span>&nbsp;{{ currentNetwork.stakingDenom.concat(`s`) }}</span>
        </div>
      </div>
    </div>
    <TmFormMsg
      v-if="$v.vote.$error && !$v.vote.required"
      name="Vote"
      type="required"
    />
  </ActionModal>
</template>
<script>
import { mapGetters } from "vuex"
import { required, decimal } from "vuelidate/lib/validators"
import { SMALLEST } from "src/scripts/num"
import ActionModal from "./ActionModal"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmField from "src/components/common/TmField"
import TmBtn from "src/components/common/TmBtn"
import TmFormMsg from "src/components/common/TmFormMsg"
import { messageType } from "../../components/transactions/messageTypes"
import gql from "graphql-tag"

export default {
  name: `modal-vote-substrate`,
  components: {
    ActionModal,
    TmFormGroup,
    TmField,
    TmFormMsg,
    TmBtn,
  },
  props: {
    proposalId: {
      type: String,
      required: true,
    },
    lastVoteOption: {
      default: undefined,
      type: String,
    },
  },
  data: () => ({
    balances: [],
    lockedBalance: 0,
    lockingPeriod: 0,
    voteEnum: { YES: `Yes`, NO: `No` },
    voteTokenTimeLocks: [
      { display: `0.1x`, timeLock: `none`, multiplier: 0.1 },
      { display: `1x`, timeLock: `locked1x`, multiplier: 1 },
      { display: `2x`, timeLock: `locked2x`, multiplier: 2 },
      { display: `3x`, timeLock: `locked3x`, multiplier: 3 },
    ],
    selectedVoteTokenTimeLock: {
      display: `0.1x`,
      timeLock: `none`,
      multiplier: 0.1,
    },
    vote: null,
    messageType,
  }),
  computed: {
    ...mapGetters([`address`, `currentNetwork`]),
    transactionData() {
      return {
        type: messageType.VOTE,
        proposalId: this.proposalId,
        voteOption: this.vote,
        lockedBalance: Number(this.lockedBalance) || 0,
        timeLock: this.selectedVoteTokenTimeLock
          ? this.selectedVoteTokenTimeLock.timeLock
          : 0,
      }
    },
    notifyMessage() {
      return {
        title: `Successful vote!`,
        body: `You have successfully voted ${this.vote} on proposal #${this.proposalId}`,
      }
    },
    stakingDenomBalance() {
      if (this.balances.length > 0) {
        return this.balances.find(
          ({ denom }) => denom === this.currentNetwork.stakingDenom
        )
      } else {
        return {
          available: 0,
        }
      }
    },
    totalVotingPower() {
      return (
        this.lockedBalance * this.selectedVoteTokenTimeLock.multiplier
      ).toFixed(6)
    },
  },
  validations() {
    return {
      lockedBalance: {
        required,
        decimal,
        max: (x) => Number(x) <= this.stakingDenomBalance.available,
        min: (x) => Number(x) >= SMALLEST,
        maxDecimals: (x) => {
          if (x) {
            return x.toString().split(".").length > 1
              ? x.toString().split(".")[1].length <= 6
              : true
          } else {
            return false
          }
        },
      },
      vote: {
        required,
      },
    }
  },
  methods: {
    open() {
      this.$refs.actionModal.open()
    },
    validateForm() {
      this.$v.$touch()

      return !this.$v.$invalid
    },
    clear() {
      this.$v.$reset()

      this.vote = null
    },
    onSuccess(event) {
      this.$emit(`success`, event)
    },
    voteTokenTimeLockController(voteTokenTimeLock) {
      this.selectedVoteTokenTimeLock = voteTokenTimeLock
      switch (voteTokenTimeLock.display) {
        case `0.1x`:
          return (this.lockingPeriod = "0")
        case `1x`:
          return (this.lockingPeriod = "28")
        case `2x`:
          return (this.lockingPeriod = "56")
        case `3x`:
          return (this.lockingPeriod = "112")
        default:
          return (this.lockingPeriod = "0")
      }
    },
  },
  apollo: {
    balances: {
      query: gql`
        query($networkId: String!, $address: String!) {
          balancesV2(networkId: $networkId, address: $address) {
            id
            denom
            available
            total
          }
        }
      `,
      /* istanbul ignore next */
      variables() {
        return {
          networkId: this.currentNetwork.id,
          address: this.address,
        }
      },
      /* istanbul ignore next */
      skip() {
        return !this.address
      },
      update(result) {
        this.lockedBalance = result.balancesV2.find(
          ({ denom }) => denom === this.currentNetwork.stakingDenom
        ).available
        return result.balancesV2
      },
    },
  },
}
</script>

<style scoped>
.buttons {
  display: flex;
  justify-content: right;
}

.card {
  border-top: solid 1px var(--bc);
  padding: 2rem 1rem;
  border-radius: 0.25rem;
  width: 100%;
}

.card-title {
  display: block;
  font-size: var(--sm);
  color: var(--dim);
  padding-bottom: 1rem;
  text-align: center;
}

.card-value {
  font-size: 18px;
  text-align: center;
  font-weight: 600;
}

.flex-row {
  display: flex;
  justify-content: space-evenly;
}

.available {
  font-size: 14px;
}

.bold {
  font-weight: 600;
}

.locking-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem 0;
}

.locking-options {
  width: 100%;
  margin-top: 1rem;
  border: solid 1px var(--app-fg-hover);
  border-radius: 1rem;
  padding: 0.5rem;
  justify-content: space-evenly;
}

.locking-option {
  margin: 0 0.25rem;
  padding: 0.25rem;
  cursor: pointer;
  width: 100%;
  text-align: center;
  font-size: 14px;
}

.activeLocking {
  background-color: var(--app-nav);
  color: var(--bright);
  border-radius: 1rem;
}

.locking-option:hover {
  background-color: var(--app-nav);
  color: var(--bright);
  border-radius: 1rem;
}

.vote-options {
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  border-bottom: solid 1px var(--bc);
}

.vote-options h3 {
  font-size: 12px;
  padding-bottom: 1rem;
}

.vote-options button {
  height: 3.5rem;
  color: var(--bright);
  background: transparent;
  width: 100%;
}

.vote-options button:hover {
  color: white;
}

.vote-options button:first-child {
  margin-right: 0.5rem;
}

.vote-options button.active {
  background: var(--highlight);
  color: white;
}

input {
  text-align: center;
  width: 100%;
  color: var(--bright);
  font-size: 40px;
  outline: none;
  border: none;
}

input:focus {
  outline: none;
  border: none;
}

.action-modal-group {
  width: 100%;
}

.locked-balance-container {
  width: 100%;
}

.tm-form-group {
  padding: 2rem 0;
  width: 100%;
}
</style>
