<template lang="pug">
form-group(:class='cssClass' :error="$v.fields.atoms.$error")
  i.fa.fa-check-square-o(@click='rm(candidate.id)')
  router-link.id(:to="{ name: 'candidate', params: { candidate: candidate.id } }")
    | {{ candidate.keybaseID }}
  field(
    theme="cosmos"
    type="number"
    placeholder="Atoms"
    v-model="fields.atoms")
  form-msg(
    name="Atoms"
    type="required"
    v-if="!$v.fields.atoms.required")
</template>

<script>
import { mapGetters } from 'vuex'
import Field from '@nylira/vue-field'
import Btn from '@nylira/vue-button'
import FormGroup from '../common/NiFormGroup'
import FormMsg from '../common/NiFormMsg'
export default {
  name: 'card-candidate-atoms',
  props: ['candidate'],
  components: {
    Btn,
    Field,
    FormGroup,
    FormMsg
  },
  computed: {
    ...mapGetters(['shoppingCart', 'candidates']),
    cssClass () {
      let value = 'card-candidate-atoms'
      return value
    }
  },
  methods: {
    rm (candidateId) {
      this.$store.commit('removeFromCart', candidateId)
    }
  }
}
</script>

<style lang="stylus">
@require '../../styles/variables.styl'
.card-candidate-atoms
  border 1px solid bc-dim
  margin-bottom 1rem

  .id
    color txt
</style>
