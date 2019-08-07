<template>
  <ActionModal
    id="modal-vote"
    ref="actionModal"
    :validate="validateForm"
    title="Vote"
    class="modal-vote"
    submission-error-prefix="Voting failed"
    :transaction-data="transactionData"
    :notify-message="notifyMessage"
    @close="clear"
  >
    <TmFormGroup class="action-modal-group vote-options">
      <TmBtn
        id="vote-yes"
        :class="[vote === `Yes` ? 'active' : '']"
        :disabled="lastVoteOption === `Yes`"
        color="secondary"
        value="Yes"
        size="md"
        @click.native="vote = 'Yes'"
      />
      <TmBtn
        id="vote-no"
        :class="[vote === `No` ? 'active' : '']"
        :disabled="lastVoteOption === `No`"
        color="secondary"
        value="No"
        size="md"
        @click.native="vote = 'No'"
      />
      <TmBtn
        id="vote-veto"
        :class="[vote === `NoWithVeto` ? 'active' : '']"
        :disabled="lastVoteOption === `NoWithVeto`"
        color="secondary"
        value="No With Veto"
        size="md"
        @click.native="vote = 'NoWithVeto'"
      />
      <TmBtn
        id="vote-abstain"
        :class="[vote === `Abstain` ? 'active' : '']"
        :disabled="lastVoteOption === `Abstain`"
        color="secondary"
        value="Abstain"
        size="md"
        @click.native="vote = 'Abstain'"
      />
      <TmFormMsg
        v-if="$v.vote.$error && !$v.vote.required"
        name="Vote"
        type="required"
      />
    </TmFormGroup>
  </ActionModal>
</template>

<script>
import { mapGetters } from "vuex"
import { required } from "vuelidate/lib/validators"
import ActionModal from "./ActionModal"
import TmBtn from "src/components/common/TmBtn"
import TmFormGroup from "src/components/common/TmFormGroup"
import TmFormMsg from "src/components/common/TmFormMsg"

import transaction from "../utils/transactionTypes"

const isValid = option =>
  option === `Yes` ||
  option === `No` ||
  option === `NoWithVeto` ||
  option === `Abstain`

export default {
  name: `modal-vote`,
  components: {
    ActionModal,
    TmBtn,
    TmFormGroup,
    TmFormMsg
  },
  props: {
    proposalId: {
      type: [Number, String],
      required: true
    },
    proposalTitle: {
      type: String,
      required: true
    },
    lastVoteOption: {
      default: undefined,
      type: String
    }
  },
  data: () => ({
    vote: null
  }),
  computed: {
    ...mapGetters([`bondDenom`]),
    transactionData() {
      return {
        type: transaction.VOTE,
        proposalId: this.proposalId,
        option: this.vote
      }
    },
    notifyMessage() {
      return {
        title: `Successful vote!`,
        body: `You have successfully voted ${this.vote} on proposal #${this.proposalId}`
      }
    }
  },
  validations() {
    return {
      vote: {
        required,
        isValid
      }
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
    }
  }
}
</script>

<style>
.proposal-title {
  font-weight: 500;
}

.action-modal-group.tm-form-group.vote-options {
  padding: 2rem 0;
}

.radio-container {
  display: flex;
  align-items: center;
  padding: 0.25rem 0;
}

.radio-container label {
  padding-left: 0.5rem;
}

.vote-options button {
  margin: 0;
  min-width: 49%;
}

.vote-options button span {
  margin: 0.25rem;
}

.vote-options button.active span {
  background: var(--tertiary);
}
</style>
