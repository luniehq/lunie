<template>
  <action-modal
    id="modal-vote"
    ref="actionModal"
    title="Vote"
    class="modal-vote"
    @close-action-modal="close"
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
    <tm-form-group
      :error="$v.password.$error && $v.password.$invalid"
      class="action-modal-group"
      field-id="password"
      field-label="Password"
    >
      <tm-field
        id="password"
        v-model="password"
        type="password"
        placeholder="Password"
      />
      <tm-form-msg
        v-if="$v.password.$error && !$v.password.required"
        name="Password"
        type="required"
      />
    </tm-form-group>
    <tm-form-group class="action-modal-group">
      <div class="action-modal-footer">
        <tm-btn
          v-if="sending"
          value="Sending..."
          disabled="disabled"
          color="primary"
        />
        <tm-btn
          v-else-if="!connected"
          value="Connecting..."
          disabled="disabled"
          color="primary"
        />
        <tm-btn
          v-else
          id="cast-vote"
          color="primary"
          value="Submit Vote"
          @click.native="validateForm"
        />
      </div>
    </tm-form-group>
  </action-modal>
</template>

<script>
import ClickOutside from "vue-click-outside"
import { required } from "vuelidate/lib/validators"
import { mapGetters } from "vuex"
import ActionModal from "common/ActionModal"
import Modal from "common/TmModal"
import TmBtn from "common/TmBtn"
import TmField from "common/TmField"
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
    Modal,
    TmBtn,
    TmField,
    TmFormGroup,
    TmFormMsg
  },
  directives: {
    ClickOutside
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
      type: String,
      required: false
    }
  },
  data: () => ({
    password: ``,
    vote: null,
    sending: false
  }),
  validations() {
    return {
      vote: {
        required,
        isValid
      },
      password: {
        required
      }
    }
  },
  computed: {
    ...mapGetters([`connected`])
  },
  methods: {
    close() {
      this.$emit(`update:showModalVote`, false)
    },
    async validateForm() {
      this.$v.$touch()

      if (!this.$v.$invalid) {
        await this.submitForm()
      }
    },
    async submitForm() {
      this.sending = true

      await this.$refs.actionModal.submit(async () => {
        await this.$store.dispatch(`submitVote`, {
          proposal_id: this.proposalId,
          option: this.vote,
          password: this.password
        })

        this.$store.commit(`notify`, {
          title: `Successful vote!`,
          body: `You have successfully voted ${this.vote} on proposal #${
            this.proposalId
          }`
        })
      }, `Voting failed`)

      this.sending = false
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

.vote-options button.active span {
  background: var(--tertiary);
}

.vote-options button {
  margin: 0;
  min-width: 49%;
}
.vote-options button span {
  margin: 0.25rem;
}
</style>
