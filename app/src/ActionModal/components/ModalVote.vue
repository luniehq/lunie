<template>
  <ActionModal
    id="modal-vote"
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
      <div>
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
          id="vote-veto"
          :class="{ active: vote === `NoWithVeto` }"
          :disabled="lastVoteOption === `NoWithVeto`"
          color="secondary"
          value="No With Veto"
          size="md"
          @click.native="vote = 'NoWithVeto'"
        />
      </div>
      <div>
        <TmBtn
          id="vote-no"
          :class="{ active: vote === `No` }"
          :disabled="lastVoteOption === `No`"
          color="secondary"
          value="No"
          size="md"
          @click.native="vote = 'No'"
        />
        <TmBtn
          id="vote-abstain"
          :class="{ active: vote === `Abstain` }"
          :disabled="lastVoteOption === `Abstain`"
          color="secondary"
          value="Abstain"
          size="md"
          @click.native="vote = 'Abstain'"
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
import { required } from "vuelidate/lib/validators"
import ActionModal from "./ActionModal"
import TmBtn from "src/components/common/TmBtn"
import TmFormMsg from "src/components/common/TmFormMsg"

import { messageType } from "../../components/transactions/messageTypes"

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
    lastVoteOption: {
      type: String,
      default: undefined,
    },
  },
  data: () => ({
    vote: null,
    messageType,
  }),
  computed: {
    transactionData() {
      return {
        type: messageType.VOTE,
        proposalId: this.proposalId,
        voteOption: this.vote,
      }
    },
    notifyMessage() {
      return {
        title: `Successful vote!`,
        body: `You have successfully voted ${this.vote} on proposal #${this.proposalId}`,
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
.action-modal-group.vote-options {
  padding: 1rem 0;
  display: flex;
  max-width: 75%;
  margin: 0 auto;
}

.action-modal-group.vote-options > div {
  width: 50%;
  margin: 0 0.25rem;
}

.vote-options button {
  margin: 0.5rem 0;
  height: 5rem;
  width: 100%;
}

.vote-options button.active {
  background: var(--highlight);
  border-color: var(--highlight);
}
</style>
