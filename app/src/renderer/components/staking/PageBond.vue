<template lang="pug">
page.page-bond(title="Bond Atoms")
  div(slot="menu"): tool-bar
    router-link(to='/staking')
      i.material-icons arrow_back
      .label Back

  part(:title="'Start bonding your '+ totalAtoms + ' ATOM'"): form-struct(:submit="onSubmit")
    .bond-group(
      :class="bondGroupClass(unbondedAtomsDelta)")
      .bond-group__fields
        .bond-bar
          label.bond-bar__label Unbonded Atoms
          .bond-bar__input
            .bond-bar-old__outer
              .bond-bar-old__inner(:style="styleBondBarInner(oldUnbondedAtoms)")
            .bond-bar__outer
              .bond-bar__inner(
                :style="styleBondBarInner(newUnbondedAtoms)")
        .bond-percent
          label.bond-delta
            span(v-if="unbondedAtomsDeltaPct !== '0%'") {{ unbondedAtomsDeltaPct }}
          field.bond-percent__input(
            disabled
            placeholder="0%"
            :value="bondBarPercent(newUnbondedAtoms)")
        .bond-value
          label.bond-delta
            span(v-if="unbondedAtomsDelta !== 0") {{ unbondedAtomsDelta }}
          field.bond-value__input(
            type="number"
            placeholder="Atoms"
            step="1"
            v-model.number="newUnbondedAtoms")

    .bond-group(
      v-for='(d, index) in fields.delegates'
      :key='d.id'
      :error='$v.fields.delegates.$each[index].$error'
      :class="bondGroupClass(delta(d.atoms, d.oldAtoms))")
      .bond-group__fields
        .bond-bar
          label.bond-bar__label Delegate &ndash; {{ d.delegate.description.moniker }}
          .bond-bar__input
            .bond-bar-old__outer
              .bond-bar-old__inner(:style="styleBondBarInner(d.oldAtoms)")
            .bond-bar__outer
              .bond-bar__inner.bond-bar__inner--editable(:id="'delegate-' + d.id"
                :style="styleBondBarInner(d.atoms)")
        .bond-percent
          label.bond-delta
            span(v-if="d.deltaAtomsPercent !== '0%'") {{ d.deltaAtomsPercent }}
          field.bond-percent__input(
            disabled
            placeholder="0%"
            :value="bondBarPercent(d.atoms)")
        .bond-value
          label.bond-delta
            span(v-if="d.deltaAtoms !== 0") {{ d.deltaAtoms }}
          field.bond-value__input(
            type="number"
            placeholder="Atoms"
            step="1"
            v-model.number="d.atoms")

      form-msg(name="Atoms" type="required"
        v-if="!$v.fields.delegates.$each[index].atoms.required")
      form-msg(name="Atoms" type="numeric"
        v-if="!$v.fields.delegates.$each[index].atoms.numeric")
      form-msg(name="Atoms" type="between" :min="atomsMin" :max="user.atoms"
        v-if="!$v.fields.delegates.$each[index].atoms.between")

    .bond-group.bond-group--unbonding(
      :class="bondGroupClass(newUnbondingAtomsDelta)")
      .bond-group__fields
        .bond-bar
          label.bond-bar__label Unbonding&hellip;
          .bond-bar__input
            // TODO: different color for old unbonding atoms
            // .bond-bar-old__outer
              .bond-bar-old__inner(:style="styleBondBarInner(oldUnbondingAtoms)")
            .bond-bar__outer(v-if="newUnbondingAtoms")
              .bond-bar__inner#unbonding-atoms-bar(
                :style="styleBondBarInner(newUnbondingAtoms)")
        .bond-percent
          label.bond-delta
            span(v-if="newUnbondingAtomsDeltaPct !== '0%'") {{ newUnbondingAtomsDeltaPct }}
          field.bond-percent__input(
            disabled
            placeholder="0%"
            :value="bondBarPercent(newUnbondingAtoms)")
        .bond-value
          label.bond-delta
            span(v-if="newUnbondingAtomsDelta !== 0") {{ newUnbondingAtomsDelta }}
          field.bond-value__input(
            type="number"
            placeholder="Atoms"
            step="1"
            v-model.number="newUnbondingAtoms")

    form-group(field-id="bond-confirm" field-label=''
      :error='$v.fields.bondConfirm.$error')
      .ni-field-checkbox
        .ni-field-checkbox-input
          input#bond-confirm(type="checkbox" v-model="fields.bondConfirm")
        label.ni-field-checkbox-label(for="bond-confirm")
          | Yes, update my bonds. I understand unbonding will take 30 days.
      form-msg(name="Bonding Confirmation" type='required'
        v-if='!$v.fields.bondConfirm.required')

    div(slot='footer')
      btn(type="button" @click.native="resetAlloc" value="Reset")
      btn.bond.btn__primary(value="Submit")
</template>

<script>
import { between, numeric, required } from 'vuelidate/lib/validators'
import { mapGetters } from 'vuex'
import num from 'scripts/num'
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
      return this.totalAtoms - willBondSum + bondedSum - this.willUnbondAtoms
    },
    oldUnbondedAtoms () {
      return this.totalAtoms - this.committedBondedAtoms
    },
    newUnbondedRatio () {
      return this.newUnbondedAtoms / this.totalAtoms
    },
    newBondedAtoms () {
      return this.fields.delegates.reduce((sum, d) => sum + (d.atoms || 0), 0)
    },
    newUnbondedAtoms () {
      if (this.newBondedAtoms > this.committedBondedAtoms) {
        return this.totalAtoms - this.newBondedAtoms
      } else {
        return this.oldUnbondedAtoms
      }
    },
    newUnbondingAtoms () {
      return this.totalAtoms - this.newUnbondedAtoms - this.newBondedAtoms
    },
    newUnbondingAtomsDelta () {
      return this.delta(this.newUnbondingAtoms, 0)
    },
    newUnbondingAtomsDeltaPct () {
      return this.percent(this.newUnbondingAtomsDelta, this.totalAtoms)
    },
    totalAtoms () {
      return this.user.atoms + this.committedBondedAtoms
    },
    unbondedAtomsDelta () {
      return this.delta(this.newUnbondedAtoms, this.oldUnbondedAtoms)
    },
    unbondedAtomsDeltaPct () {
      return this.percent(this.unbondedAtomsDelta, this.totalAtoms)
    }
  },
  data: () => ({
    bondBarScrubWidth: 28,
    bondBarOuterWidth: 0,
    equalize: false,
    atomsMin: 0,
    fields: {
      bondConfirm: false,
      delegates: []
    },
    num: num
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
      let committedDelegations = this.committedDelegations
      let totalAtoms = this.totalAtoms
      this.fields.delegates = this.shoppingCart.map(c => JSON.parse(JSON.stringify(c)))
      this.fields.delegates = this.fields.delegates.map(function (d) {
        let atoms = committedDelegations[d.delegate.id]
        d.atoms = atoms
        d.oldAtoms = atoms
        d.bondedRatio = atoms / totalAtoms
        d.deltaAtoms = 0
        d.deltaAtomsPercent = '0%'
        return d
      })
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
      let divisor = this.totalAtoms
      let ratio = Math.round(dividend / divisor * 100)
      return ratio + '%'
    },
    bondBarInnerWidth (dividend) {
      let offset = this.bondBarScrubWidth
      let maxWidth = this.bondBarOuterWidth
      let divisor = this.totalAtoms
      let ratio = Math.round(dividend / divisor * 100) / 100
      let width = (ratio * (maxWidth - offset)) + offset
      return width + 'px'
    },
    styleBondBarInner (dividend) {
      return {
        width: this.bondBarInnerWidth(dividend)
      }
    },
    bondGroupClass (delta) {
      if (delta > 0) {
        return 'bond-group--positive'
      } else if (delta < 0) {
        return 'bond-group--negative'
      } else {
        return 'bond-group--neutral'
      }
    },
    bondBarsInput () {
      let offset = this.bondBarScrubWidth
      interact('.bond-bar__inner--editable')
        .resizable({
          edges: { left: false, right: true, bottom: false, top: false },
          restrictEdges: { outer: 'parent' },
          restrictSize: { min: { width: offset }, }
        })
        .on('resizemove', (event) => {
          let target = event.target
          let ratio = (event.rect.width - offset) / (this.bondBarOuterWidth - offset)
          let rawAtoms = ratio * this.totalAtoms

          target.style.width = event.rect.width + 'px'

          this.updateDelegateAtoms(target.id.split('-')[1], rawAtoms)
        })
    },
    updateDelegateAtoms (delegateId, rawAtoms) {
      let d = this.fields.delegates.find(d => d.id === delegateId)
      if (d) {
        d.bondedRatio = rawAtoms / this.totalAtoms
        d.atoms = Math.round(rawAtoms)
        d.deltaAtoms = this.delta(rawAtoms, d.oldAtoms, 'int')
        d.deltaAtomsPercent =
          this.percent(this.delta(rawAtoms, d.oldAtoms), this.totalAtoms)
      }
    },
    setBondBarOuterWidth () {
      let outerBar = this.$el.querySelector('.bond-bar__outer')
      this.bondBarOuterWidth = outerBar.clientWidth
    },
    delta (current, previous, fmt) {
      let x = current - previous
      if (fmt === 'int') {
        return Math.round(x)
      } else {
        return x
      }
    },
    percent (dividend, divisor, sigFigs) {
      let ratio = dividend / divisor
      let value
      if (Number.isInteger(sigFigs)) {
        value = Math.round(ratio * 100 * Math.pow(10, sigFigs)) / Math.pow(10, sigFigs)
      } else {
        value = Math.round(ratio * 100)
      }
      return value + '%'
    }
  },
  async mounted () {
    this.resetAlloc()
    this.leaveIfEmpty(this.shoppingCart.length)
    this.bondBarsInput()

    await this.$nextTick()
    this.setBondBarOuterWidth()
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
      bondConfirm: {
        required,
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

.bond-group
  padding 0.5rem 1rem
  display block


.bond-group--positive
  .bond-bar-old__outer
    z-index z(listItem)
    pointer-events none

  .bond-bar__inner
    background success

  .bond-delta
    color success
    span:before
      content '+'
      display inline

  &.bond-group--unbonding
    .bond-bar__inner
      background warning
    .bond-delta
      color warning

.bond-group--negative
  .bond-bar-old__inner
    background danger
  .bond-delta
    color danger

.bond-group__fields
  display flex
  flex-flow row nowrap
  height 4rem

.bond-bar
  flex 16
  margin-right 1rem
  min-width 10rem

.bond-bar__label
  line-height 2rem
  color bright
  font-size x
  text-align left

.bond-bar__input
  height 2rem
  border-radius 1rem
  border 1px solid input-bc
  padding 1px
  position relative

.bond-bar__outer
.bond-bar-old__outer
  height 2rem - 4*px
  border-radius 1rem
  position absolute
  top 1px
  left 1px
  right 1px
  bottom 1px

.bond-bar__inner
.bond-bar-old__inner
  height 2rem - 0.25rem
  border-radius 1rem
  background dim
  width 50%

.bond-bar__inner
  position relative

  // debug
  color app-bg
  font-size xs
  padding 0 0.5rem
  display flex
  align-items center

.bond-bar__inner--editable
  &:after
    position absolute
    top 1px
    right 1px
    width 2rem - 0.25rem - 0.125rem
    height 2rem - 0.25rem - 0.125rem
    background txt
    border-radius 1rem
    z-index z(toolBar)

    display flex
    align-items center
    justify-content center

    content 'drag_handle'
    font-size x
    font-family 'Material Icons'
    transform rotate(90deg)
    color bc

.bond-delta
  height 2rem
  display block
  display flex
  align-items center
  justify-content flex-end
  span
    font-size sm
    font-weight 500

.bond-percent
.bond-value
  input
    text-align right

.bond-percent
  flex 3
  max-width 3.75rem
  margin-right 1rem

.bond-value
  flex 6
  max-width 8rem
</style>
