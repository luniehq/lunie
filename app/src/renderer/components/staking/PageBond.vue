<template lang="pug">
page.page-bond(title="Bond Atoms")
  div(slot="menu"): tool-bar
    router-link(to='/staking')
      i.material-icons arrow_back
      .label Back

  part(title="Your Atoms")
    list-item(
      dt="Total Atoms"
      :dd="totalAtoms")
    list-item(
      dt="Bonded Atoms"
      :dd="previouslyBondedAtoms || 0")
    list-item(
      dt="Unbonded Atoms"
      :dd="unbondedAtoms || 0")

  form-struct(:submit="onSubmit")
    part(title='Selected Delegates')
      //- ul.reserved-atoms
      //-   li(v-if="bondedAtoms")
      //-     | You have {{ bondedAtoms }} Atoms already bonded.
      //-   li.reserved-atoms--warning(v-else-if="unbondedAtoms === 0")
      //-     | You're trying to bond #[.reserved-atoms__number ALL {{ bondedAtoms }}] atoms to these delegates. We suggest reserving some atoms for personal use &mdash; are you sure you wish to proceed?
      //-   li.reserved-atoms--error(v-else-if="unbondedAtoms < 0")
      //-     | You're trying to bond #[.reserved-atoms__number {{ unbondedAtoms * -1 }}] more atoms than you have.
      //-   li(v-else)
      //-     | You are bonding #[.reserved-atoms__number {{ bondedAtoms }}] ({{ bondedAtomsPct }}) atoms to these delegates. You will keep  #[.reserved-atoms__number {{ unbondedAtoms }}] ({{ unbondedAtomsPct }}) atoms in your wallet.
      //-   li(v-if="willUnbondAtoms > 0")
      //-     | You will begin unbonding #[.reserved-atoms__number {{ willUnbondAtoms }}] atoms, which will be available in 30 days.
      //-   li
      //-     | #[a.reserved-atoms__restart(@click="resetAlloc") &nbsp;(Reset Allocations)]

      form-group(
        v-for='(delegate, index) in fields.delegates'
        key='delegate.id'
        :error='$v.fields.delegates.$each[index].$error'
        :field-label='delegate.delegate.description.moniker'
        field-id='delegate-field')
        field-group
          field(
            type="number"
            step="any"
            placeholder="Atoms"
            v-model.number="delegate.atoms")
          field-addon Atoms
          btn.remove(type="button" icon="clear" @click.native="rm(delegate.id)")
        form-msg(name="Atoms" type="required"
          v-if="!$v.fields.delegates.$each[index].atoms.required")
        form-msg(name="Atoms" type="numeric"
          v-if="!$v.fields.delegates.$each[index].atoms.numeric")
        form-msg(name="Atoms" type="between" :min="atomsMin" :max="user.atoms"
          v-if="!$v.fields.delegates.$each[index].atoms.between")

    div(slot="footer")
      btn.equalize(value="Allocate Atoms Equally" type="button" @click.native="equalAlloc")
      btn.bond(value="Bond")
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
import ListItem from 'common/NiListItem'
import Page from 'common/NiPage'
import Part from 'common/NiPart'
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
    ListItem,
    Page,
    Part,
    ToolBar
  },
  computed: {
    ...mapGetters(['shoppingCart', 'user', 'committedDelegations']),
    previouslyBondedAtoms () {
      return Object.values(this.committedDelegations).reduce((sum, d) => sum + d, 0)
    },
    willUnbondAtoms () {
      let sum = 0
      for (let id of Object.keys(this.committedDelegations)) {
        let committed = this.committedDelegations[id]
        let delegate = this.fields.delegates.find(c => c.id === id)
        let willBond = delegate ? delegate.atoms : 0
        let unbondAmount = Math.max(committed - willBond, 0)
        sum += unbondAmount
      }
      return sum
    },
    unbondedAtoms () {
      let willBondSum = this.bondedAtoms
      let bondedSum = this.previouslyBondedAtoms
      return this.user.atoms - willBondSum + bondedSum - this.willUnbondAtoms
    },
    unbondedAtomsPct () {
      return Math.round(this.unbondedAtoms / this.totalAtoms * 100 * 10) / 10 + '%'
    },
    bondedAtoms () {
      return this.fields.delegates.reduce((sum, d) => sum + (d.atoms || 0), 0)
    },
    bondedAtomsPct () {
      return Math.round(this.bondedAtoms / this.totalAtoms * 100 * 10) / 10 + '%'
    },
    totalAtoms () {
      return this.bondedAtoms + this.unbondedAtoms
    }
  },
  data: () => ({
    equalize: false,
    atomsMin: 0,
    fields: {
      delegates: []
    }
  }),
  methods: {
    equalAlloc () {
      this.equalize = true
      this.resetAlloc()
      let atoms = this.unbondedAtoms
      let delegates = this.fields.delegates.length
      let remainderAtoms = atoms % delegates

      // give equal atoms to every delegate
      this.fields.delegates.forEach(c => (c.atoms += Math.floor(atoms / delegates)))

      // give remainder atoms
      for (let i = 0; i < remainderAtoms; i++) {
        this.fields.delegates[i].atoms += 1
      }
    },
    percentAtoms (bondedAtoms) {
      return Math.round(bondedAtoms / this.user.atoms * 100 * 100) / 100 + '%'
    },
    async onSubmit () {
      if (this.unbondedAtoms < 0) {
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
            body: 'You have successfully updated your delegations.' })
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

  span
    display block

  &__number
    display inline
    color bright
    font-weight 500

  &__restart
    cursor pointer

  &--error
    color danger

  &--warning
    color warning
</style>
