<template>
  <ActionModal
    id="modal-vote"
    ref="actionModal"
    :validate="validateForm"
    title="Back Proposal"
    class="modal-vote"
    submission-error-prefix="Voting failed"
    :transaction-type="messageType.VOTE"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    feature-flag="vote"
    @close="clear"
    @txIncluded="onSuccess"
  >
    <div class="action-modal-group back">
      <div>
        <h1>{{ minimumDeposit }}</h1>
      </div>
      <div>
        <TmBtn
          id="vote-yes"
          :class="{ active: vote === `Yes` }"
          color="secondary"
          value="Yes"
          size="md"
          @click.native="vote = 'Yes'"
        />
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
import { mapGetters, mapState } from "vuex"
import BigNumber from "bignumber.js"
import { required } from "vuelidate/lib/validators"
import ActionModal from "./ActionModal"
import TmBtn from "src/components/common/TmBtn"
import TmFormMsg from "src/components/common/TmFormMsg"
import { messageType } from "../../components/transactions/messageTypes"
import { getPolkadotAPI } from "../../../../common/polkadotApiConnector"

const isValid = (option) =>
  option === `Yes` ||
  option === `No` ||
  option === `NoWithVeto` ||
  option === `Abstain`

export default {
  name: `modal-vote`,
  components: {
    ActionModal,
    TmBtn,
    TmFormMsg,
  },
  props: {
    proposalId: {
      type: [Number, String],
      required: true,
    },
    proposalTitle: {
      type: String,
      required: true,
    },
    numberOfSeconds: {
      type: Number,
      default: 0,
    },
  },
  data: () => ({
    vote: null,
    messageType,
  }),
  asyncComputed: {
    async minimumDeposit() {
      const polkadotAPI = await getPolkadotAPI(this.currentNetwork)
      const minimumDeposit = BigNumber(
        polkadotAPI.consts.democracy.minimumDeposit
      ).times(
        this.currentNetwork.coinLookup.find(
          ({ viewDenom }) => viewDenom === this.currentNetwork.stakingDenom
        ).chainToViewConversionFactor
      )
      return `${minimumDeposit} ${this.currentNetwork.stakingDenom.concat(`s`)}`
    },
  },
  computed: {
    ...mapGetters([`currentNetwork`]),
    transactionData() {
      return {
        type: messageType.VOTE,
        proposalId: this.proposalId,
        numberOfSeconds: this.numberOfSeconds,
      }
    },
    notifyMessage() {
      return {
        title: `Successful vote!`,
        body: `You have successfully backed proposal #${this.proposalId}`,
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
}
</script>

<style scoped>
h1 {
  text-align: center;
  width: 100%;
  color: var(--bright);
  font-size: 40px;
  outline: none;
  border: none;
}

.action-modal-group.back {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0;
  margin: 0;
}

button.active {
  background: var(--highlight);
  border-color: var(--highlight);
}

.action-modal-group.back > div {
  margin-bottom: 2rem;
}

#vote-yes {
  height: 5rem;
  width: 100%;
  min-width: 15rem;
}
</style>
