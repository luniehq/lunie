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
      <span class="locked-balance">{{ lockedBalance }}</span>
      <span
        >{{ currentNetwork.stakingDenom.concat(`s`) }} locked for
        {{ lockingPeriod }} days</span
      >
      <div class="flex-row locking-options">
        <div
          v-for="(lockingOption, index) in lockingOptions"
          :key="lockingOption"
        >
          <span class="locking-option">{{ lockingOption }}</span>
          <span
            v-if="index === lockingOptions.length - 1"
            class="locking-option"
            >Set Max</span
          >
        </div>
      </div>
    </div>
    <div class="totals flex-row">
      <div class="card">
        <span class="card-title">Multiplier</span>
        <span>3.019</span>
        <span>{{ currentNetwork.stakingDenom }}</span>
      </div>
      <div class="card">
        <span class="card-title">Total</span>
        <span>3.019</span>
        <span>{{ currentNetwork.stakingDenom }}</span>
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
import { required } from "vuelidate/lib/validators"
import ActionModal from "./ActionModal"
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
    TmFormMsg,
    TmBtn,
  },
  props: {
    lastVoteOption: {
      default: undefined,
      type: String,
    },
  },
  data: () => ({
    balances: [],
    lockedBalance: 0,
    lockingPeriod: 0,
    lockingOptions: ["0.1x", "1x", "2x", "3x", "4x", "5x", "6x"],
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
        lockedBalance: 0,
        conviction: 0,
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

.locked-balance {
  color: var(--app-nav);
  font-size: var(--h1);
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
