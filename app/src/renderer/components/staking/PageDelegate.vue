<template lang="pug">
page(:title="pageTitle")
  tool-bar
    btn(theme='cosmos' type='link' to='/' icon='angle-left' value='Change Candidates')

  form-struct(:submit="onSubmit")
    form-group(:error="$v.fields.reservedAtoms.$error")
      Label Reserved Atoms
      field-group
        h1 {{unallocatedAtoms}}
          small Atoms not delegated.

      form-msg: div Reserved Atoms will be held by you and remain unbonded

    form-group(v-for='(candidate, index) in fields.candidates' key='candidate.id'
      :error="$v.fields.candidates.$each[index].$error")
      Label {{ candidate.candidate.keybaseID }}
      field-group
        field(
          theme="cosmos"
          type="number"
          step="any"
          placeholder="Atoms"
          v-model.number="candidate.atoms")
        .ni-field-addon Atoms
        .percentage {{ percentAtoms(candidate.atoms) }}
        btn(type="button" theme="cosmos" value="Max"
          @click.native="fillAtoms(candidate.id)")
        // btn(type="button" theme="cosmos" value="Clear"
          @click.native="clearAtoms(candidate.id)")
        btn(type="button" theme="cosmos" value="Remove"
          @click.native="rm(candidate.id)")
      form-msg(name="Atoms" type="required"
        v-if="!$v.fields.candidates.$each[index].atoms.required")
      form-msg(name="Atoms" type="numeric"
        v-if="!$v.fields.candidates.$each[index].atoms.numeric")
      form-msg(name="Atoms" type="between" :min="atomsMin" :max="user.atoms"
        v-if="!$v.fields.candidates.$each[index].atoms.between")

    div(slot="footer")
      div
        btn(theme="cosmos" icon="balance-scale" value="Equalize" type="button" @click.native="equalAlloc")
      btn(theme="cosmos" icon="check" value="Set Allocation")
</template>

<script>
import { between, numeric, required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-field'
import FieldGroup from '../common/NiFieldGroup'
import FormGroup from '../common/NiFormGroup'
import FormMsg from '../common/NiFormMsg'
import FormStruct from '../common/NiFormStruct'
import Page from '../common/NiPage'
export default {
  name: 'page-delegate',
  components: {
    Btn,
    Field,
    FieldGroup,
    FormGroup,
    FormMsg,
    FormStruct,
    Page
  },
  computed: {
    ...mapGetters(['shoppingCart', 'user']),
    pageTitle () {
      let title = 'Delegate Atoms'
      if (this.unallocatedAtoms > 0) {
        title += this.unallocatedAtoms + ', ' + this.unallocatedAtomsPercent
      } else {
        title += '(DONE)'
      }
      return title
    },
    unreservedAtoms () {
      return this.user.atoms - this.fields.reservedAtoms
    },
    unallocatedAtoms () {
      let value = this.unreservedAtoms

      // reduce unallocated atoms by assigned atoms
      this.fields.candidates.forEach(f => (value -= f.atoms))

      return value
    },
    unallocatedAtomsPercent () {
      return Math.round(this.unallocatedAtoms / this.user.atoms * 100 * 100) / 100 + '%'
    }
  },
  data: () => ({
    equalize: false,
    atomsMin: 1,
    reservedAtomsMin: 0,
    fields: {
      reservedAtoms: 0,
      candidates: []
    }
  }),
  methods: {
    fillAtoms (candidateId) {
      if (candidateId === 'unreserved') {
        console.log('filling reserved atoms')
        this.fields.reservedAtoms += this.unallocatedAtoms
      } else {
        let candidate = this.fields.candidates.find(c => c.id === candidateId)
        candidate.atoms += this.unallocatedAtoms
      }
    },
    clearAtoms (candidateId) {
      if (candidateId === 'unreserved') {
        console.log('clearing reserved atoms')
        this.fields.reservedAtoms = 0
      } else {
        console.log('clearing atoms for', candidateId)
        let candidate = this.fields.candidates.find(c => c.candidateId === candidateId)
        candidate.atoms = 0
      }
    },
    equalAlloc () {
      console.log(this.fields)
      this.equalize = true
      this.resetCandidates()
      let atoms = this.unreservedAtoms
      let candidates = this.fields.candidates.length
      let remainderAtoms = atoms % candidates

      // give equal atoms to every candidate
      this.fields.candidates.forEach(c => (c.atoms += Math.floor(atoms / candidates)))

      // give remainder atoms
      for (let i = 0; i < remainderAtoms; i++) {
        this.fields.candidates[i].atoms += 1
      }
    },
    percentAtoms (assignedAtoms) {
      return Math.round(assignedAtoms / this.user.atoms * 100 * 100) / 100 + '%'
    },
    onSubmit () {
      if (this.unallocatedAtoms === this.user.atoms) {
        this.$store.commit('notifyWarn', { title: 'Unallocated Atoms',
          body: 'You haven\'t allocated any atoms yet.' })
        return
      } else if (this.unallocatedAtoms < 0) {
        this.$store.commit('notifyWarn', { title: 'Too Many Allocated Atoms',
          body: `You've allocated ${this.unallocatedAtoms * -1} more atoms than you have.`})
        return
      }
      this.$v.$touch()
      if (!this.$v.$error) {
        this.$store.commit('activateDelegation')
        this.$store.dispatch('submitDelegation', this.fields)
        this.$store.commit('notify',
          { title: 'Atom Allocation Set',
            body: 'You have successfully set your atom allocation. You can change it up until the end of the game.' })
      } else {
        console.log('onSubmit error', this.$v.$error)
      }
    },
    resetCandidates () {
      this.fields.candidates = []
      this.shoppingCart.map(c => this.fields.candidates.push(Object.assign({}, c)))
    },
    getShoppingCartItem (candidateId) {
      return this.shoppingCart.find(c => c.candidateId === candidateId)
    },
    leaveIfNoCandidates (count) {
      if (count < 1) {
        this.$store.commit('notify', {
          title: 'No Candidates Selected',
          body: 'Choose one or more candidates before proceeding to delegate atoms.'
        })
        this.$router.push('/staking')
      }
    },
    rm (candidateId) {
      this.$store.commit('removeFromCart', candidateId)
      this.resetCandidates()
    }
  },
  mounted () {
    this.resetCandidates()
    this.leaveIfNoCandidates(this.shoppingCart.length)
    if (this.user.delegationActive) {
      this.fields = JSON.parse(JSON.stringify(this.user.delegation))
    }
  },
  watch: {
    shoppingCart (newVal) {
      this.leaveIfNoCandidates(newVal.length)
      // this.resetCandidates()
      if (this.equalize) { this.equalAlloc }
    }
  },
  validations: () => ({
    fields: {
      reservedAtoms: {
        required,
        numeric,
        between (atoms) {
          return between(this.reservedAtomsMin, this.user.atoms)(atoms)
        }
      },
      candidates: {
        $each: {
          atoms: {
            required,
            numeric,
            between (atoms) {
              return between(this.atomsMin, this.user.atoms)(atoms)
            }
          }
        }
      }
    }
  })
}
</script>
<style lang="stylus">
@import '../../styles/variables.styl'
.page-delegate
  .cards
    margin 1rem 0

  .ni-form
    .ni-field-group
      .ni-btn
        margin-left 1rem
    .ni-form-footer
      .left
        .ni-btn
          margin-right 1rem
          &:last-child
            margin 0

  h1
    font-size 2em

  small
    font-size .5em

  .percentage
    border 1px solid bc-dim
    border-left none
    height 2rem
    width 3.625rem
    display flex
    align-items center
    justify-content center
    font-label()
    color dim
</style>
