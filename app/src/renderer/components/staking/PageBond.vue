<template lang="pug">
page.page-bond(title="Bond Atoms")
  div(slot="menu"): tool-bar
    router-link(to='/staking')
      i.material-icons arrow_back
      .label Back

  part(title="Delegation Form"): form-struct(:submit="onSubmit")
    .bond-group(
      :class="bondGroupClass(deltaAtoms(newUnbondedAtoms, oldUnbondedAtoms))")
      .bond-group__fields
        .bond-bar
          label.bond-group__label.bond-bar__label Unbonded Atoms
          .bond-bar__input: .bond-bar__outer
            .bond-bar__inner#unbonded-bar-inner(
              :style="styleBondBarInner(oldUnbondedAtoms)")
                | {{ newUnbondedRatio }}
        .bond-percent
          label.bond-group__label.bond-percent__label
            | {{ deltaAtomsPercent(newUnbondedAtoms, oldUnbondedAtoms) }}
          field.bond-percent__input(
            disabled
            placeholder="0%"
            :value="bondBarPercent(newUnbondedAtoms)")
        .bond-value
          label.bond-group__label.bond-value__label
            | {{ deltaAtoms(newUnbondedAtoms, oldUnbondedAtoms) }}
          field.bond-value__input(
            type="number"
            placeholder="Atoms"
            step="1"
            v-model.number="Math.round(newUnbondedAtoms)")
    .bond-group(
      v-for='(d, index) in fields.delegates'
      :key='d.id'
      :error='$v.fields.delegates.$each[index].$error')
      .bond-group__fields
        .bond-bar
          label.bond-group__label.bond-bar__label {{ d.delegate.description.moniker }}
          .bond-bar__input(:id="'delegate-' +d.id"): .bond-bar__outer
            .bond-bar__inner(
              :style="styleBondBarInner(committedDelegations[d.delegate.id])")
        .bond-percent
          label.bond-group__label.bond-percent__label + 0%
          field.bond-percent__input(
            disabled
            placeholder="0%"
            :value="bondBarPercent(committedDelegations[d.delegate.id])")
        .bond-value
          label.bond-group__label.bond-value__label + 0
          field.bond-value__input(
            type="number"
            placeholder="Atoms"
            v-model.number="d.atoms")

      form-msg(name="Atoms" type="required"
        v-if="!$v.fields.delegates.$each[index].atoms.required")
      form-msg(name="Atoms" type="numeric"
        v-if="!$v.fields.delegates.$each[index].atoms.numeric")
      form-msg(name="Atoms" type="between" :min="atomsMin" :max="user.atoms"
        v-if="!$v.fields.delegates.$each[index].atoms.between")

    div.submit-container
      span: btn.bond.btn__primary(value="Submit")
</template>

<script>
import { between, numeric, required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
import interact from 'interactjs'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-field'
import FieldAddon from 'common/NiFieldAddon'
import FieldGroup from 'common/NiFieldGroup'
import FormGroup from 'common/NiFormGroup'
import FormMsg from 'common/NiFormMsg'
import FormStruct from 'common/NiFormStruct'
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
    Page,
    Part,
    ToolBar
  },
  computed: {
    ...mapGetters(['shoppingCart', 'user', 'committedDelegations']),
    committedBondedAtoms () {
      return Object.values(this.committedDelegations).reduce((sum, d) => sum + d, 0)
    },
    willUnbondAtoms () {
      let sum = 0
      /* eslint-disable no-unused-vars */
      for (let [k, selectedDelegate] of this.fields.delegates.entries()) {
        // set previously committed delegations for each delegate in cart
        let previouslyCommitted = this.committedDelegations[selectedDelegate.id]

        // check to see if user has allocated any atoms in cart
        let currentlyAllocatedAtoms = selectedDelegate ? selectedDelegate.atoms : 0

        // amount user intends to unbond from each delegate in cart
        let unbondAmount = Math.max(previouslyCommitted - currentlyAllocatedAtoms, 0)

        // set NaN's to 0
        unbondAmount = unbondAmount || 0

        // total amount user intends to unbond from all delegates in cart
        sum += unbondAmount
      }
      return sum
    },
    unbondedAtoms () {
      let willBondSum = this.newBondedAtoms
      let bondedSum = this.committedBondedAtoms
      return this.oldAtoms - willBondSum + bondedSum - this.willUnbondAtoms
    },
    newBondedAtoms () {
      return this.fields.delegates.reduce((sum, d) => sum + (d.atoms || 0), 0)
    },
    oldAtoms () {
      return this.user.atoms
    },
    oldUnbondedAtoms () {
      return this.oldAtoms - this.committedBondedAtoms
    },
    newUnbondedAtoms () {
      return this.oldAtoms * this.newUnbondedRatio
    }
  },
  data: () => ({
    bondBarScrubWidth: 28,
    newUnbondedRatio: 0,
    bondBarOuterWidth: 0,
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
    async onSubmit () {
      if (this.unbondedAtoms < 0) {
        this.$store.commit('notifyError', { title: 'Too Many Allocated Atoms',
          body: `You've tried to bond ${this.unbondedAtoms * -1} more atoms than you have.`})
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
      this.fields.delegates.map((d) => { (d.atoms = this.committedDelegations[d.delegate.id]) })
      this.fields.delegates.map((d) => { (d.oldAtoms = this.committedDelegations[d.delegate.id]) })
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
    bondBarPercent (dividend) {
      let divisor = this.oldAtoms
      let ratio = Math.round(dividend / divisor * 100)
      return ratio + '%'
    },
    bondBarInnerWidth (dividend) {
      let offset = this.bondBarScrubWidth
      let maxWidth = this.bondBarOuterWidth
      let divisor = this.oldAtoms
      let ratio = Math.round(dividend / divisor * 100) / 100
      let width = (ratio * (maxWidth - offset)) + offset
      return width + 'px'
    },
    styleBondBarInner (dividend) {
      return {
        width: this.bondBarInnerWidth(dividend)
      }
    },
    bondGroupClass (deltaAtoms) {
      if (deltaAtoms > 0) {
        return 'bond-group--positive'
      } else if (deltaAtoms < 0) {
        return 'bond-group--negative'
      } else {
        return 'bond-group--neutral'
      }
    },
    bondBarsInput () {
      let offset = this.bondBarScrubWidth
      interact('.bond-bar__inner')
        .resizable({
          edges: { left: false, right: true, bottom: false, top: false },
          restrictEdges: { outer: 'parent' },
          restrictSize: { min: { width: offset }, }
        })
        .on('resizemove', (event) => {
          var target = event.target

          // update the bar width
          target.style.width = event.rect.width + 'px'

          let ratio = (event.rect.width - offset) / (this.bondBarOuterWidth - offset)

          if (target.id === 'unbonded-bar-inner') {
            this.newUnbondedRatio = ratio
          } else {
            target.textContent = ratio
          }

        })
    },
    setBondBarOuterWidth () {
      let outerBar = this.$el.querySelector('.bond-bar__outer')
      this.bondBarOuterWidth = outerBar.clientWidth
    },
    deltaAtoms (cur, prev) {
      return Math.round(cur - prev)
    },
    deltaAtomsPercent (cur, prev) {
      let deltaAtoms = this.deltaAtoms(cur, prev)
      let ratio = deltaAtoms / this.oldAtoms
      return Math.round(ratio * 1000) / 10 + '%'
    }
  },
  async mounted () {
    this.resetAlloc()
    this.leaveIfEmpty(this.shoppingCart.length)
    this.bondBarsInput()

    await this.$nextTick()
    this.setBondBarOuterWidth()
    this.newUnbondedRatio = this.oldUnbondedAtoms / this.oldAtoms
  },
  watch: {
    shoppingCart (newVal) {
      this.leaveIfEmpty(newVal.length)
      this.resetAlloc()
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

.bond-group
  max-width 32rem + 2rem
  padding 0.5rem 1rem
  display block

  .ni-field
    &[disabled]
      background app-fg
      border-color app-fg

.bond-group--positive
  .bond-percent__label
  .bond-value__label
    color success
    &:before
      content '+'
      display inline

.bond-group--negative
  .bond-percent__label
  .bond-value__label
    color danger

.bond-group__fields
  display flex
  flex-flow row nowrap
  height 4rem

.bond-group__label
  line-height 2rem
  font-size sm
  text-align right
  display block

.bond-bar
  flex 16
  margin-right 1rem
  min-width 10rem

.bond-bar__label
  color bright
  font-size x
  text-align left

.bond-bar__input
  height 2rem
  border-radius 1rem
  border 1px solid bc
  padding 1px

.bond-bar__outer
  height 2rem - 4*px
  border-radius 1rem
  background app-fg

.bond-bar__inner
  height 2rem - 0.25rem
  border-radius 1rem
  background dim
  width 50%
  position relative

  // debug
  color app-bg
  font-size xs
  padding 0 0.5rem
  display flex
  align-items center

  &:after
    position absolute
    top 1px
    right 1px
    width 2rem - 0.25rem - 0.125rem
    height 2rem - 0.25rem - 0.125rem
    background txt
    border-radius 1rem

    display flex
    align-items center
    justify-content center

    content 'drag_handle'
    font-size x
    font-family 'Material Icons'
    transform rotate(90deg)
    color bc

.bond-percent
.bond-value
  input
    text-align right

.bond-percent
  flex 3
  margin-right 1rem

.bond-value
  flex 6
</style>
