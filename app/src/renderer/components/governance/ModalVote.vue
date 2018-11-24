<template>
  <div class="modal-vote" id="modal-vote" v-click-outside="close">
    <div class="modal-vote-header">
      <img
        class="icon modal-vote-atom"
        src="~assets/images/cosmos-logo.png"
      /><span class="tm-modal-title">Vote</span>
      <div class="tm-modal-icon tm-modal-close" id="closeBtn" @click="close()">
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
        @click.native="vote('Yes')"
        :class="[option === `Yes` ? 'active' : '']"
        color="secondary"
        value="Yes"
        size="md"
      ></tm-btn>
      <tm-btn
        id="vote-no"
        @click.native="vote('No')"
        :class="[option === `No` ? 'active' : '']"
        color="secondary"
        value="No"
        size="md"
      ></tm-btn>
      <tm-btn
        id="vote-veto"
        @click.native="vote('NoWithVeto')"
        :class="[option === `NoWithVeto` ? 'active' : '']"
        color="secondary"
        value="No With Veto"
        size="md"
      ></tm-btn>
      <tm-btn
        id="vote-abstain"
        @click.native="vote('Abstain')"
        :class="[option === `Abstain` ? 'active' : '']"
        color="secondary"
        value="Abstain"
        size="md"
      ></tm-btn>
    </tm-form-group>
    <tm-form-group class="modal-vote-form-group"></tm-form-group>
    <div class="modal-vote-footer">
      <tm-btn
        id="cast-vote"
        @click.native="onVote"
        :disabled="$v.option.$invalid"
        color="primary"
        value="Vote"
        size="lg"
      ></tm-btn>
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
    option: ``
  }),
  validations() {
    return {
      option: {
        required,
        isValid
      }
    }
  },
  methods: {
    close() {
      this.$emit(`update:showModalVote`, false)
    },
    vote(option) {
      if (this.option === option) {
        this.option = ``
      } else {
        this.option = option
      }
    },
    onVote() {
      this.$emit(`castVote`, { option: this.option })
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
  z-index: z(modal);
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
