<template lang="pug">
page.page-bond(title="Bond Atoms")
  div(slot="menu"): tool-bar
    router-link(to='/staking')
      i.material-icons arrow_back
      .label Back

  .reserved-atoms(v-if="unbondedAtoms == this.user.atoms")
    | You have #[.reserved-atoms__number {{ unbondedAtoms }}] unbonded atoms. Start by bonding some of your atoms to these delegates.
  .reserved-atoms(v-else-if="unbondedAtoms === 0")
    | You are bonding #[.reserved-atoms__number ALL {{ bondedAtoms }}] atoms to these delegates. We suggest reserving some atoms for personal use&mdash;are you sure you wish to proceed? #[a(@click="resetAlloc") (start over?)]
  .reserved-atoms(v-else-if="unbondedAtoms < 0")
    | #[.reserved-atoms__number.reserved-atoms__number--error You are bonding {{ unbondedAtoms * -1 }} more atoms than exist in your balance.] Please reduce the number of atoms you are bonding to these delegates. #[a(@click="resetAlloc") (start over?)]
  .reserved-atoms(v-else)
    | You are reserving  #[.reserved-atoms__number {{ unbondedAtoms }}] ({{ unbondedAtomsPct }}) atoms. You are bonding #[.reserved-atoms__number {{ bondedAtoms }}] ({{ bondedAtomsPct }}) atoms to these delegates. #[a(@click="resetAlloc") (start over?)]

  form-struct(:submit="onSubmit")
    form-group(v-for='(delegate, index) in fields.delegates' key='delegate.id'
      :error="$v.fields.delegates.$each[index].$error")
      Label {{ shortenLabel(delegate.delegate.description.moniker, 10) }} - {{ shortenLabel(delegate.delegate.id, 20) }} ({{ percentAtoms(delegate.atoms) }})
      field-group
        field(
          type="number"
          step="any"
          placeholder="Atoms"
          v-model.number="delegate.atoms")
        field-addon Atoms
        // btn(type="button" value="Max"
          @click.native="fillAtoms(delegate.id)")
        btn(type="button" icon="clear" @click.native="rm(delegate.id)")
      form-msg(name="Atoms" type="required"
        v-if="!$v.fields.delegates.$each[index].atoms.required")
      form-msg(name="Atoms" type="numeric"
        v-if="!$v.fields.delegates.$each[index].atoms.numeric")
      form-msg(name="Atoms" type="between" :min="atomsMin" :max="user.atoms"
        v-if="!$v.fields.delegates.$each[index].atoms.between")

    div(slot="footer")
      btn(icon="drag_handle" value="Equalize" type="button" @click.native="equalAlloc")
      btn(icon="check" value="Bond")
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
  name: 'page-bond',
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
    ...mapGetters(['shoppingCart', 'user', 'committedDelegations']),
    reservedAtoms () {
      return this.shoppingCart.reduce((sum, d) => sum + (d.reservedAtoms || 0), 0)
    },
    unreservedAtoms () {
      return this.user.atoms - this.reservedAtoms
    },
    unbondedAtoms () {
      let value = this.unreservedAtoms

      // reduce unreserved atoms by bonded atoms
      this.fields.delegates.forEach(f => (value -= f.atoms))

      return value
    },
    unbondedAtomsPct () {
      return Math.round(this.unbondedAtoms / this.user.atoms * 100 * 100) / 100 + '%'
    },
    bondedAtoms () {
      let value = 0
      this.fields.delegates.forEach(f => (value += f.atoms))
      return value
    },
    bondedAtomsPct () {
      return Math.round(this.bondedAtoms / this.user.atoms * 100 * 100) / 100 + '%'
    }
  },
  data: () => ({
    equalize: false,
    atomsMin: 1,
    reservedAtomsMin: 0,
    fields: {
      reservedAtoms: 0,
      delegates: []
    }
  }),
  methods: {
    fillAtoms (delegateId) {
      if (delegateId === 'unreserved') {
        this.fields.reservedAtoms += this.unbondedAtoms
      } else {
        let delegate = this.fields.delegates.find(c => c.id === delegateId)
        delegate.atoms += this.unbondedAtoms
      }
    },
    clearAtoms (delegateId) {
      if (delegateId === 'unreserved') {
        console.log('clearing reserved atoms')
        this.fields.reservedAtoms = 0
      } else {
        console.log('clearing atoms for', delegateId)
        let delegate = this.fields.delegates.find(c => c.delegateId === delegateId)
        delegate.atoms = 0
      }
    },
    equalAlloc () {
      this.equalize = true
      this.resetAlloc()
      let atoms = this.unreservedAtoms
      let delegates = this.fields.delegates.length
      let remainderAtoms = atoms % delegates

      // give equal atoms to every delegate
      this.fields.delegates.forEach(c => (c.atoms += Math.floor(atoms / delegates)))

      // give remainder atoms
      for (let i = 0; i < remainderAtoms; i++) {
        this.fields.delegates[i].atoms += 1
      }

      this.$store.commit('notify', { title: 'Equal Allocation',
        body: 'You have split your atoms equally among all of these delegates.'
      })
    },
    percentAtoms (bondedAtoms) {
      return Math.round(bondedAtoms / this.user.atoms * 100 * 100) / 100 + '%'
    },
    async onSubmit () {
      if (this.unbondedAtoms === this.user.atoms) {
        this.$store.commit('notifyError', { title: 'Unbonded Delegates',
          body: 'You either haven\'t bonded any atoms yet, or some delegates have 0 atoms bonded.' })
        return
      } else if (this.unbondedAtoms < 0) {
        this.$store.commit('notifyError', { title: 'Too Many Allocated Atoms',
          body: `You've bonded ${this.unbondedAtoms * -1} more atoms than you have.`})
        return
      }
      this.$v.$touch()
      if (!this.$v.$error) {
        this.$store.commit('activateDelegation')
        try {
          await this.$store.dispatch('submitDelegation', this.fields)
          this.$store.commit('notify', { title: 'Atoms Bonded',
            body: 'You have successfully bonded your atoms. You can rebond after the  30 day unbonding period.' })
        } catch (err) {
          this.$store.commit('notifyError', { title: 'Error While Bonding Atoms',
            body: err.message })
        }
      }
    },
    resetAlloc () {
      this.fields.delegates = this.shoppingCart.map(c => JSON.parse(JSON.stringify(c)))
    },
    leaveIfEmpty (count) {
      if (count === 0) {
        this.$store.commit('notifyError', {
          title: 'No Delegates Selected',
          body: 'Choose one or more delegates before proceeding to bond atoms.'
        })
        this.$router.push('/staking')
      }
    },
    rm (delegateId) {
      let confirm = window.confirm('Are you sure you want to remove this delegate?')
      if (confirm) {
        this.$store.commit('removeFromCart', delegateId)
        this.resetAlloc()
      }
    },
    shortenLabel (label, maxLength) {
      if (label.length <= maxLength) {
        return label
      }
      return label.substr(0, maxLength - 3) + '...'
    }
  },
  mounted () {
    this.resetAlloc()
    this.leaveIfEmpty(this.shoppingCart.length)
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
      delegates: {
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
