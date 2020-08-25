<template>
  <!-- <SessionFrame :icon="`thumbs_up_down`"> -->
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
          :class="{ active: vote === `Yes` }"
          :disabled="lastVoteOption === `Yes`"
          color="secondary"
          value="Yes"
          size="md"
          @click.native="vote = 'Yes'"
        />
        <TmBtn
          id="vote-no"
          :class="{ active: vote === `No` }"
          :disabled="lastVoteOption === `No`"
          color="secondary"
          value="No"
          size="md"
          @click.native="vote = 'No'"
        />
      </div>
    </div>
    <div class="line"></div>
    <div class="locking-area">
      <p>
        Available to vote <span>{{ stakingDenomBalance.available }}</span>
      </p>
      <div class="locked-balance-container">
        <TmFormGroup
          :error="$v.lockedBalance.$error && $v.lockedBalance.$invalid"
          class="action-modal-group"
          field-id="lockedBalance"
        >
          <TmField
            id="lockedBalance"
            v-model="lockedBalance"
            v-focus
            class="locked-balance"
            type="text"
            :placeholder="lockedBalance"
            @change="totalVotingController()"
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
      <span
        >{{ currentNetwork.stakingDenom.concat(`s`) }} locked for
        {{ lockingPeriod }} days</span
      >
      <div class="flex-row locking-options">
        <div
          v-for="lockingOption in lockingOptions"
          :key="lockingOption.display"
        >
          <span
            :class="{
              activeLocking:
                lockingOption.display === selectedLockingOption.display,
            }"
            class="locking-option"
            @click="lockingOptionController(lockingOption)"
            >{{ lockingOption.display }}</span
          >
        </div>
      </div>
    </div>
    <div class="totals flex-row">
      <div class="card" @click="totalVotingController()">
        <span class="card-title">Total</span>
        <span>{{ totalVotingPower }}</span>
        <span>&nbsp;{{ currentNetwork.stakingDenom }}</span>
      </div>
    </div>
    <div class="buttons">
      <!-- <TmBtn value="Send your Vote" /> -->
    </div>
    <TmFormMsg
      v-if="$v.vote.$error && !$v.vote.required"
      name="Vote"
      type="required"
    />
  </ActionModal>
  <!-- </SessionFrame> -->
</template>
<script>
import { mapGetters } from "vuex"
import { required, decimal } from "vuelidate/lib/validators"
import { SMALLEST } from "src/scripts/num"
import ActionModal from "./ActionModal"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmField from "src/components/common/TmField"
// import SessionFrame from "common/SessionFrame"
import TmBtn from "src/components/common/TmBtn"
import TmFormMsg from "src/components/common/TmFormMsg"
import { messageType } from "../../components/transactions/messageTypes"
import gql from "graphql-tag"

const isValid = (option) => option === `Yes` || option === `No`

export default {
  name: `modal-vote-substrate`,
  components: {
    ActionModal,
    // SessionFrame,
    TmFormGroup,
    TmField,
    TmFormMsg,
    TmBtn,
  },
  props: {
    proposalId: {
      type: [Number, String],
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
    lockingOptions: [
      { display: `0.1x`, multiplier: 0.1 },
      { display: `1x`, multiplier: 1 },
      { display: `2x`, multiplier: 2 },
      { display: `3x`, multiplier: 3 },
      { display: `4x`, multiplier: 4 },
      { display: `5x`, multiplier: 5 },
      { display: `6x`, multiplier: 6 },
      { display: `Set Max`, multiplier: 6 },
    ],
    selectedLockingOption: { display: `0.1x`, multiplier: 0.1 },
    totalVotingPower: 0,
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
        conviction: this.selectedlockingOption
          ? this.selectedlockingOption.multiplier
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
        isValid,
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
    lockingOptionController(lockingOption) {
      this.selectedLockingOption = lockingOption
      this.totalVotingController()
      switch (lockingOption.display) {
        case `0.1x`:
          return (this.lockingPeriod = "0")
        case `1x`:
          return (this.lockingPeriod = "28")
        case `2x`:
          return (this.lockingPeriod = "56")
        case `3x`:
          return (this.lockingPeriod = "112")
        case `4x`:
          return (this.lockingPeriod = "224")
        case `5x`:
          return (this.lockingPeriod = "448")
        case `6x`:
          return (this.lockingPeriod = "896")
        case `Set Max`:
          return (this.lockingPeriod = "896")
        default:
          return (this.lockingPeriod = "0")
      }
    },
    totalVotingController() {
      this.totalVotingPower = (
        this.lockedBalance * this.selectedLockingOption.multiplier
      ).toFixed(6)
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
        this.totalVotingPower = this.lockedBalance
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
  border: solid 1px var(--app-fg-hover);
  padding: 1rem;
  border-radius: 5px;
  margin-right: 0.5rem;
}

.card-title {
  display: block;
  font-size: var(--sm);
  color: var(--input-bc);
}

.line {
  border: solid 1px var(--app-fg-hover);
}

.flex-row {
  display: flex;
  justify-content: space-evenly;
}

.locked-balance-container {
  border: solid 1px var(--app-fg-hover);
}

.locked-balance {
  color: var(--app-nav);
  font-size: var(--h1);
  width: 9rem;
}

.locking-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 1rem;
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
  margin-right: 0.5rem;
  padding: 0.5rem;
  cursor: pointer;
}

.activeLocking {
  background-color: var(--app-nav);
  color: var(--app-bg);
  border-radius: 1rem;
}

.locking-option:hover {
  background-color: var(--app-nav);
  color: var(--app-bg);
  border-radius: 1rem;
}

.action-modal-group.vote-options {
  padding: 1rem 0;
  display: flex;
  flex-direction: column;
  max-width: 75%;
  margin: 0 auto;
}

.vote-options button {
  margin: 0.5rem;
  height: 4rem;
  width: 100%;
}

.vote-options button.active {
  background: var(--highlight);
  border-color: var(--highlight);
}
</style>
