<template lang="pug">
.page.page-delegate
  page-header(title='Delegate Atoms')
    btn(theme='cosmos' type='link' to='/' icon='angle-left' value='Change Candidates')
  form-struct(:submit="onSubmit")
    div(slot="title") Unallocated Atoms: {{ unallocatedAtoms }}
    form-group(v-for='c in filteredCandidates' key='c.id' :error="$v.fields.atoms.$error")
      Label {{ c.id }} - Allocation
      field-group
        field(
          theme="cosmos"
          type="text"
          placeholder="Atoms"
          v-model="fields.atoms")
        .ni-field-addon Atoms
        btn(theme="cosmos" icon="times" value="Remove" @click.native="rm(c.id)")
      form-msg(name="Atoms" type="required" v-if="!$v.fields.atoms.required")
      form-msg(name="Atoms" type="numeric" v-if="!$v.fields.atoms.numeric")
      form-msg(name="Atoms"
        type="between" :min="atomsMin" :max="atomsMax" v-if="!$v.fields.atoms.between")
    div(slot="footer")
      btn(theme="cosmos" icon="refresh" value="Reset")
      btn(theme="cosmos" icon="check" value="Confirm Allocation" type="submit")
</template>

<script>
import { between, numeric, required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
// import FormGroupCandidate from './FormGroupCandidate'
import Field from './NiField'
import FieldGroup from './NiFieldGroup'
import FormGroup from './FormGroup'
import FormMsg from './FormMsg'
import FormStruct from './FormStruct'
import PageHeader from './PageHeader'
export default {
  name: 'page-delegate',
  components: {
    Btn,
    // FormGroupCandidate,
    Field,
    FieldGroup,
    FormGroup,
    FormMsg,
    FormStruct,
    PageHeader
  },
  computed: {
    ...mapGetters(['shoppingCart', 'candidates', 'user']),
    unallocatedAtoms () {
      return this.user.atoms - this.fields.atoms
    },
    filteredCandidates () {
      let ids = this.shoppingCart.map(c => c.candidateId)
      return this.candidates.filter(c => ids.includes(c.id))
    },
    atomsMax () {
      return this.user.atoms
    }
  },
  data: () => ({
    atomsMin: 100,
    fields: {
      atoms: ''
    }
  }),
  methods: {
    onSubmit () {
      this.$v.$touch()
      if (!this.$v.$error) {
        console.log('submission is fine')
        /*
        this.$store.commit('notifyCustom',
          { title: 'Invitation Sent',
            body: `You have sent an invite to ${this.fields.email}` })
        */
        this.resetFields()
      } else {
        console.log('submission has an error', this.$v.$error)
      }
    },
    resetFields () {
      this.$v.$reset()
      this.fields = {
        atoms: 0
      }
    },
    getShoppingCartItem (candidateId) {
      return this.shoppingCart.find(c => c.candidateId === candidateId)
    },
    leaveIfNoCandidates (count) {
      if (count < 1) {
        this.$store.commit('notifyCustom', {
          title: 'No Candidates Selected',
          body: 'Choose one or more candidates before proceeding to delegate atoms.'
        })
        this.$router.push('/')
      }
    },
    rm (candidateId) {
      this.$store.commit('removeFromCart', candidateId)
    }
  },
  mounted () {
    this.leaveIfNoCandidates(this.shoppingCart.length)
  },
  watch: {
    shoppingCart (newVal) {
      this.leaveIfNoCandidates(newVal.length)
    }
  },
  validations: () => ({
    fields: {
      atoms: {
        required,
        numeric,
        between (atoms) {
          return between(this.atomsMin, this.atomsMax)(atoms)
        }
      }
    }
  })
}
</script>
<style lang="stylus">
@import '../styles/variables.styl'
.page-delegate .cards
  margin 1rem 0

.delegation-form
  border 2px solid bc-dim
  margin-top 1rem
  border-radius 0.25rem
  padding 1rem - 2*px
  &:last-of-type
    margin-bottom 1rem

  .ni-form-group
    display flex
    margin -0.5rem -1rem -1rem
    label
      flex 1
    .ni-field
      flex 1
      width inherit
</style>

