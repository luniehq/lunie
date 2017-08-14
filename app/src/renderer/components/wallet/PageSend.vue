<template>
  <div class="page-send">
    <!-- <page-header title="Send"></page-header> -->
    <form class="form" v-on:submit.prevent.default="verifySend">
      <div class="form-body">

        <div class="form-group" :class="{ 'form-group-error': $v.fields.denom.$error }">
          <label for="send-address">Denomination</label>
          <div class="input-group">
            <div class="denoms">
              <div class="denom"
                v-for="balance in wallet.balances"
                @click="setDenom(balance.denom, $event)">
                {{ balance.denom.toUpperCase() }}
              </div>
            </div>
            <!--
            <field
              id="send-denom"
              type="select"
              v-model="fields.denom"
              @input="$v.fields.denom.$touch()"
              placeholder="Denomination"
              required>
            </field>
            -->
          </div>
          <form-msg
            name="Denomination"
            type="required"
            v-if="!$v.fields.denom.required">
          </form-msg>
        </div>

        <div class="form-group" :class="{ 'form-group-error': $v.fields.address.$error }">
          <label for="send-address">Pay To</label>
          <div class="input-group">
            <field
              id="send-address"
              type="text"
              v-model="fields.address"
              @input="$v.fields.address.$touch()"
              placeholder="Address"
              required>
            </field>
          </div>
          <form-msg
            name="Address"
            type="required"
            v-if="!$v.fields.address.required">
          </form-msg>
          <form-msg
            name="Address"
            type="exactLength"
            length="40"
            v-if="!$v.fields.address.minLength || !$v.fields.address.maxLength">
          </form-msg>
          <form-msg
            name="Address"
            type="alphaNum"
            v-if="!$v.fields.address.alphaNum">
          </form-msg>
        </div>

        <div class="form-group" :class="{ 'form-group-error': $v.fields.amount.$error }">
          <label for="send-address">Amount</label>
          <div class="input-group">
            <field
              id="send-amount"
              type="number"
              v-model="fields.amount"
              @input="$v.fields.amount.$touch()"
              placeholder="Amount"
              required>
            </field>
            <div class="input-group-addon">Coins</div>
            <btn value="Max"></btn>
          </div>
          <form-msg
            name="Amount"
            type="required"
            v-if="!$v.fields.amount.required">
          </form-msg>
          <form-msg
            name="Amount"
            type="between"
            min="1"
            max="1000000"
            v-if="!$v.fields.amount.between">
          </form-msg>
        </div>

      </div><!--form-body-->

      <div class="form-footer">
        <btn value="Reset" @click.native="resetForm"></btn>
        <btn v-if="sending" class="disabled" value="Sending..."></btn>
        <btn v-else type="submit" value="Send Now"></btn>
      </div>
    </form>
  </div>
</template>

<script>
import { required, between, minLength, maxLength, alphaNum } from 'vuelidate/lib/validators'
import { mapActions, mapGetters } from 'vuex'
import Field from '@nylira/vue-input'
import Btn from '@nylira/vue-button'
import FormMsg from '@nylira/vue-form-msg'
export default {
  components: {
    Field,
    FormMsg,
    Btn
  },
  computed: {
    ...mapGetters(['wallet'])
  },
  methods: {
    setDenom (denom, $event) {
      let denomEls = document.querySelectorAll('.denoms .denom')
      // console.log('denomEls', denomEls)
      Array.from(denomEls).map(el => el.classList.remove('active'))

      let thisDenomEl = $event.target
      // console.log('denom el', thisDenomEl)
      thisDenomEl.classList.add('active')

      this.fields.denom = denom
      // console.log('setting denomination to', this.fields.denom)
    },
    trunc (value) {
      if (value.length > 20) value = this.value.substring(0, 20) + '...'
      return '“' + value + '”'
    },
    resetForm () {
      this.fields.address = ''
      this.fields.amount = null
      this.sending = false
      this.$v.$reset()
    },
    verifySend () {
      this.$v.$touch()
      if (this.$v.$error) return
      this.sending = true
      let amount = +this.fields.amount
      let address = this.fields.address
      let denom = this.fields.denom
      this.walletSend({
        fees: { denom, amount: 0 },
        to: address,
        amount: [{ denom, amount }]
      })
    },
    ...mapActions(['walletSend'])
  },
  data: () => ({
    fields: {
      address: '',
      amount: null,
      denom: ''
    },
    sending: false
  }),
  validations: {
    fields: {
      address: {
        required,
        minLength: minLength(39),
        maxLength: maxLength(42),
        alphaNum: alphaNum
      },
      amount: {
        required,
        between: between(1, 1000000)
      },
      denom: {
        required
      }
    }
  }
}
</script>

<style lang="stylus">
@require '../../styles/variables.styl'

.page-send
  flex 1
  display flex
  flex-flow column

.disabled
  color grey

#send-address
#send-amount
  mono()
  &::-webkit-input-placeholder
    df()
    color light
  &::-moz-placeholder
    df()
    color light
  &:-ms-input-placeholder
    df()
    color light
  &:-moz-placeholder
    df()
    color light

.denoms
  display flex
  .denom
    border 1px solid bc
    line-height 2*x - 2px
    padding 0 0.75rem
    margin-right 0.5rem

    user-select none
    cursor pointer
    &.active
      border-color link
      background lighten(link, 90%)
      color link
    &:last-of-type
      margin-right 0
</style>
