<template lang="pug">
page(title='Proposal: Freeform Text')
  part
    form.form-default(v-on:submit.prevent="propose")
      .form-group
        label(for="proposal-title") Proposal Title
        .input-region: .input-group
          input#proposal-title-title(v-model="proposalText.title"
            type="text", placeholder="Proposal Title", required,
            pattern=".{3,60}", title="3 to 140 characters")

      .form-group
        label(for="proposal-text") Body
        .input-region: .input-group
          textarea.textarea-tall#proposal-text(v-model="proposalText.data.body",
            placeholder="Write your proposal here (Markdown is available).", required)

      .form-group
        label(for="proposal-active-at") Activation
        .input-region
          field-date(field-id="proposal-activate-at", v-model="proposalText.active_at")

      .form-footer
        .form-footer-left
          .btn.btn-large(@click="resetForm") #[i.fa.fa-refresh] Reset
        .form-footer-right
          button.btn.btn-primary.btn-large(type="submit") #[i.fa.fa-envelope] Propose
</template>

<script>
import { mapGetters } from 'vuex'
import FieldDate from '../common/NiFieldDate'
import Page from '../common/NiPage'
import Part from '../common/NiPart'
import Field from '@nylira/vue-field'
export default {
  name: 'page-proposals-text',
  components: {
    Field,
    FieldDate,
    Page,
    Part
  },
  computed: {
    ...mapGetters(['groups', 'me', 'proposalText'])
  },
  methods: {
    resetForm () {
      this.$store.dispatch('RESET_PROPOSAL_TEXT')
    },
    propose () {
      // set up the creation details
      this.proposalText.entity_id = this.me.id

      // push the new proposal to the list
      this.$store.commit('ADD_PROPOSAL', this.proposalText)

      // create votes for the new proposal
      this.$store.commit('ADD_BLANK_VOTES', this.proposalText.vote_id)

      // reset it
      this.$store.commit('RESET_PROPOSAL_TEXT')

      this.$router.push('/proposals')
    }
  }
}
</script>
