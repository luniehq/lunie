<template>
  <action-modal title="Vote" class="modal-vote">
    <tm-form-group class="action-modal-group vote-options">
      <div class="radio-container">
        <input
          type="radio"
          id="vote-yes"
          :disabled="lastVoteOption === `Yes`"
          name="Yes"
          value="Yes"
          v-model="vote"
        />
        <label for="vote-yes">Yes</label>
      </div>
      <div class="radio-container">
        <input
          type="radio"
          id="vote-no"
          :disabled="lastVoteOption === `No`"
          name="No"
          value="No"
          v-model="vote"
        />
        <label for="vote-no">No</label>
      </div>
      <div class="radio-container">
        <input
          type="radio"
          id="vote-veto"
          :disabled="lastVoteOption === `NoWithVeto`"
          name="NoWithVeto"
          value="NoWithVeto"
          v-model="vote"
        />
        <label for="vote-veto">No With Veto</label>
      </div>
      <div class="radio-container">
        <input
          type="radio"
          id="vote-abstain"
          :disabled="lastVoteOption === `Abstain`"
          name="Abstain"
          value="Abstain"
          v-model="vote"
        />
        <label for="vote-abstain">Abstain</label>
      </div>
    </tm-form-group>
    <tm-form-group
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
    </tm-form-group>
    <tm-form-group class="action-modal-group">
      <div class="action-modal-footer">
        <tm-btn
          id="cast-vote"
          :disabled="$v.$invalid"
          color="primary"
          value="Vote"
          @click.native="onVote"
        />
      </div>
    </tm-form-group>
  </action-modal>
</template>

<script>
import ClickOutside from "vue-click-outside"
import { required } from "vuelidate/lib/validators"
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
    option: ``,
    password: ``,
    showPassword: false,
    vote: null
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
  methods: {
    close() {
      this.$emit(`update:showModalVote`, false)
    },
    onVote() {
      this.$emit(`castVote`, { option: this.option, password: this.password })
      this.close()
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
</style>
