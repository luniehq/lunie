<template>
  <action-modal
    id="modal-vote"
    ref="actionModal"
    :submit-fn="submitForm"
    :simulate-fn="simulateForm"
    :validate="validateForm"
    title="Vote"
    class="modal-vote"
    submission-error-prefix="Voting failed"
    @close="clear"
  >
    <tm-form-group class="action-modal-group vote-options">
      <tm-btn
        id="vote-yes"
        :class="[vote === `Yes` ? 'active' : '']"
        :disabled="lastVoteOption === `Yes`"
        color="secondary"
        value="Yes"
        size="md"
        @click.native="vote = 'Yes'"
      />
      <tm-btn
        id="vote-no"
        :class="[vote === `No` ? 'active' : '']"
        :disabled="lastVoteOption === `No`"
        color="secondary"
        value="No"
        size="md"
        @click.native="vote = 'No'"
      />
      <tm-btn
        id="vote-veto"
        :class="[vote === `NoWithVeto` ? 'active' : '']"
        :disabled="lastVoteOption === `NoWithVeto`"
        color="secondary"
        value="No With Veto"
        size="md"
        @click.native="vote = 'NoWithVeto'"
      />
      <tm-btn
        id="vote-abstain"
        :class="[vote === `Abstain` ? 'active' : '']"
        :disabled="lastVoteOption === `Abstain`"
        color="secondary"
        value="Abstain"
        size="md"
        @click.native="vote = 'Abstain'"
      />
      <tm-form-msg
        v-if="$v.vote.$error && !$v.vote.required"
        name="Vote"
        type="required"
      />
    </tm-form-group>
  </action-modal>
</template>

<script>
import { mapGetters } from "vuex"
import { required } from "vuelidate/lib/validators"
import { uatoms } from "../../scripts/num.js"
import ActionModal from "common/ActionModal"
import TmBtn from "common/TmBtn"
import TmFormGroup from "common/TmFormGroup"
import TmFormMsg from "common/TmFormMsg"

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
    ...mapGetters([`bondDenom`])
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
    },
    async simulateForm() {
      return await this.$store.dispatch(`simulateVote`, {
        proposal_id: this.proposalId,
        option: this.vote
      })
    },
    async submitForm(gasEstimate, gasPrice, password, submitType) {
      await this.$store.dispatch(`submitVote`, {
        proposal_id: this.proposalId,
        option: this.vote,
        gas: String(gasEstimate),
        gas_prices: [
          {
            amount: String(uatoms(gasPrice)),
            denom: this.bondDenom
          }
        ],
        password,
        submitType
      })

      this.$store.commit(`notify`, {
        title: `Successful vote!`,
        body: `You have successfully voted ${this.vote} on proposal #${
          this.proposalId
        }`
      })
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
