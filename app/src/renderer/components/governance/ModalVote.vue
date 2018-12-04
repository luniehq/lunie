<template>
  <div v-click-outside="close" id="modal-vote" class="modal-vote">
    <div class="modal-vote-header">
      <img
        class="icon modal-vote-atom"
        src="~assets/images/cosmos-logo.png"
      /><span class="tm-modal-title">Vote</span>
      <div id="closeBtn" class="tm-modal-icon tm-modal-close" @click="close()">
        <i class="material-icons">close</i>
      </div>
    </div>
    <div>
      <h2>Title: {{ proposalTitle }}</h2>
      <h3>Proposal ID: {{ `#` + proposalId }}</h3>
    </div>
    <tm-form-group class="modal-vote-form-group options">
      <tm-btn
        id="vote-yes"
        :class="[option === `Yes` ? 'active' : '']"
        color="secondary"
        value="Yes"
        size="md"
        @click.native="vote('Yes')"
      />
      <tm-btn
        id="vote-no"
        :class="[option === `No` ? 'active' : '']"
        color="secondary"
        value="No"
        size="md"
        @click.native="vote('No')"
      />
      <tm-btn
        id="vote-veto"
        :class="[option === `NoWithVeto` ? 'active' : '']"
        color="secondary"
        value="No With Veto"
        size="md"
        @click.native="vote('NoWithVeto')"
      />
      <tm-btn
        id="vote-abstain"
        :class="[option === `Abstain` ? 'active' : '']"
        color="secondary"
        value="Abstain"
        size="md"
        @click.native="vote('Abstain')"
      />
      <hr />
    </tm-form-group>
    <tm-form-group
      class="modal-vote-form-group"
      field-id="password"
      field-label="Account password"
    >
      <tm-field
        id="password"
        v-model="password"
        placeholder="password..."
        :type="showPassword ? `text` : `password`"
      />
      <input
        id="showPasswordCheckbox"
        type="checkbox"
        v-model="showPassword"
        @input="togglePassword"
      />
      <label for="showPasswordCheckbox">Show password</label>
    </tm-form-group>
    <tm-form-group class="modal-vote-form-group" />
    <div class="modal-vote-footer">
      <tm-btn
        id="cast-vote"
        :disabled="$v.option.$invalid"
        color="primary"
        value="Vote"
        size="lg"
        @click.native="onVote"
      />
    </div>
  </div>
</template>

<script>
import ClickOutside from "vue-click-outside"
import { required } from "vuelidate/lib/validators"
import Modal from "common/TmModal"
import { TmBtn, TmField, TmFormGroup, TmFormMsg } from "@tendermint/ui"

const isValid = option =>
  option === `Yes` ||
  option === `No` ||
  option === `NoWithVeto` ||
  option === `Abstain`

export default {
  name: `modal-vote`,
  components: {
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
    }
  },
  data: () => ({
    option: ``,
    password: ``,
    showPassword: false
  }),
  validations() {
    return {
      option: {
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
    togglePassword() {
      this.showPassword = !this.showPassword
    },
    vote(option) {
      if (this.option === option) {
        this.option = ``
      } else {
        this.option = option
      }
    },
    onVote() {
      this.$emit(`castVote`, { option: this.option, password: this.password })
      this.close()
    }
  }
}
</script>

<style>
.modal-vote {
  background: var(--app-nav);
  display: flex;
  flex-direction: column;
  height: 50%;
  justify-content: space-between;
  left: 50%;
  padding: 2rem;
  position: fixed;
  top: 50%;
  width: 40%;
  z-index: var(--z-modal);
}

.modal-vote-header {
  align-items: center;
  display: flex;
}

.modal-vote-atom {
  height: 4rem;
  width: 4rem;
}

.modal-vote-form-group {
  display: block;
  padding: 0;
}

.modal-vote-footer {
  display: flex;
  justify-content: flex-end;
}

.modal-vote h3 {
  margin: 0;
}

.modal-vote button {
  margin: 0;
  min-width: 50%;
}

.modal-vote button span {
  margin: 0.25rem;
}

.modal-vote button.active span {
  background: var(--tertiary);
}

.modal-vote button .tm-btn__container {
  padding: 0.5rem;
}
</style>
