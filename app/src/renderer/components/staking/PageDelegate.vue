<template lang="pug">
page.page-delegate(title="Delegate Atoms")
  div(slot="menu"): tool-bar
    router-link(to='/staking')
      i.material-icons arrow_back
      .label Change Candidates

  .reserved-atoms(v-if="unallocatedAtoms == this.user.atoms")
    | You have #[.reserved-atoms__number {{ unallocatedAtoms }}] unbonded atoms. Begin the delegation process by allocating some of your atoms to these validator candidates.
  .reserved-atoms(v-else-if="unallocatedAtoms === 0")
    | You are allocating #[.reserved-atoms__number ALL {{ allocatedAtoms }}] atoms to these validator candidates. We suggest reserving some atoms for personal use&mdash;are you sure you wish to proceed? #[a(@click="resetAlloc") (start over?)]
  .reserved-atoms(v-else-if="unallocatedAtoms < 0")
    | #[.reserved-atoms__number.reserved-atoms__number--error You are allocating {{ unallocatedAtoms * -1 }} more atoms than exist in your balance.] Please reduce the number of atoms you are allocating to these validator candidates. #[a(@click="resetAlloc") (start over?)]
  .reserved-atoms(v-else)
    | You are reserving  #[.reserved-atoms__number {{ unallocatedAtoms }}] ({{ unallocatedAtomsPct }}) atoms. You are allocating #[.reserved-atoms__number {{ allocatedAtoms }}] ({{ allocatedAtomsPct }}) atoms to these validator candidates. #[a(@click="resetAlloc") (start over?)]

  form-struct(:submit="onSubmit")
    form-group(v-for='(candidate, index) in fields.candidates' key='candidate.id'
      :error="$v.fields.candidates.$each[index].$error")
      Label {{ candidate.candidate.keybaseID }} ({{ percentAtoms(candidate.atoms) }})
      field-group
        field(
          type="number"
          step="any"
          placeholder="Atoms"
          v-model.number="candidate.atoms")
        field-addon Atoms 
        // btn(type="button" value="Max"
          @click.native="fillAtoms(candidate.id)")
        btn(type="button" icon="clear" @click.native="rm(candidate.id)")
      form-msg(name="Atoms" type="required"
        v-if="!$v.fields.candidates.$each[index].atoms.required")
      form-msg(name="Atoms" type="numeric"
        v-if="!$v.fields.candidates.$each[index].atoms.numeric")
      form-msg(name="Atoms" type="between" :min="atomsMin" :max="user.atoms"
        v-if="!$v.fields.candidates.$each[index].atoms.between")

    div(slot="footer")
      btn(icon="drag_handle" value="Equalize" type="button" @click.native="equalAlloc")
      btn(icon="check" value="Delegate")
</template>

<script>
import { between, numeric, required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-field'
import FieldAddon from 'common/NiFieldAddon'
import FieldGroup from 'common/NiFieldGroup'
import FormGroup from 'common/NiFormGroup'
import FormMsg from 'common/NiFormMsg'
import FormStruct from 'common/NiFormStruct'
import Page from 'common/NiPage'
import ToolBar from 'common/NiToolBar'
export default {
  name: 'page-delegate',
  components: {
    Btn,
    Field,
    FieldAddon,
    FieldGroup,
    FormGroup,
    FormMsg,
    FormStruct,
    Page,
    ToolBar
  },
  computed: {
    ...mapGetters(['shoppingCart', 'user']),
    unreservedAtoms () {
      return this.user.atoms - this.fields.reservedAtoms
    },
    unallocatedAtoms () {
      let value = this.unreservedAtoms

      // reduce unreserved atoms by allocated atoms
      this.fields.candidates.forEach(f => (value -= f.atoms))

      return value
    },
    unallocatedAtomsPct () {
      return Math.round(this.unallocatedAtoms / this.user.atoms * 100 * 100) / 100 + '%'
    },
    allocatedAtoms () {
      let value = 0
      this.fields.candidates.forEach(f => (value += f.atoms))
      return value
    },
    allocatedAtomsPct () {
      return Math.round(this.allocatedAtoms / this.user.atoms * 100 * 100) / 100 + '%'
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
      this.equalize = true
      this.resetAlloc()
      let atoms = this.unreservedAtoms
      let candidates = this.fields.candidates.length
      let remainderAtoms = atoms % candidates

      // give equal atoms to every candidate
      this.fields.candidates.forEach(c => (c.atoms += Math.floor(atoms / candidates)))

      // give remainder atoms
      for (let i = 0; i < remainderAtoms; i++) {
        this.fields.candidates[i].atoms += 1
      }

      this.$store.commit('notify', { title: 'Equal Allocation',
        body: 'You have split your atoms equally among all of these validator candidates.'
      })
    },
    percentAtoms (allocatedAtoms) {
      return Math.round(allocatedAtoms / this.user.atoms * 100 * 100) / 100 + '%'
    },
    onSubmit () {
      if (this.unallocatedAtoms === this.user.atoms) {
        this.$store.commit('notifyError', { title: 'Unallocated Atoms',
          body: 'You haven\'t allocated any atoms yet.' })
        return
      } else if (this.unallocatedAtoms < 0) {
        this.$store.commit('notifyError', { title: 'Too Many Allocated Atoms',
          body: `You've allocated ${this.unallocatedAtoms * -1} more atoms than you have.`})
        return
      }
      this.$v.$touch()
      if (!this.$v.$error) {
        this.$store.commit('activateDelegation')
        this.$store.dispatch('submitDelegation', this.fields)
        this.$store.commit('notify', { title: 'Atoms Delegated',
          body: 'You have successfully delegated your atoms. You can change your delegation after the unbonding period (30 days).' })
      } else {
        this.$store.commit('notifyError', { title: 'Atoms Delegation Error',
          body: this.$v.$error })
      }
    },
    resetAlloc () {
      this.fields.candidates = []
      this.shoppingCart.map(c => this.fields.candidates.push(Object.assign({}, c)))
    },
    leaveIfEmpty (count) {
      if (count === 0) {
        this.$store.commit('notifyError', {
          title: 'No Candidates Selected',
          body: 'Choose one or more candidates before proceeding to delegate atoms.'
        })
        this.$router.push('/staking')
      }
    },
    rm (candidateId) {
      let confirm = window.confirm('Are you sure you want to remove this validator candidate?')
      if (confirm) {
        this.$store.commit('removeFromCart', candidateId)
        this.resetAlloc()
      }
    }
  },
  mounted () {
    this.leaveIfEmpty(this.shoppingCart.length)
    this.resetAlloc()
    if (this.user.delegationActive) {
      this.fields = JSON.parse(JSON.stringify(this.user.delegation))
    }
  },
  watch: {
    shoppingCart (newVal) {
      this.leaveIfEmpty(newVal.length)
      // this.resetAlloc()
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
@require '~variables'

.reserved-atoms
  padding 1rem
  background app-fg
  margin 0 0 1rem
  color dim

.reserved-atoms__number
  display inline
  color bright
  font-weight 500

.reserved-atoms__number--error
  color danger
</style>
