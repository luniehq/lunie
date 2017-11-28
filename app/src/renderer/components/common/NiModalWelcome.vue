<template lang="pug">
.ni-modal-welcome(v-if="active")

  .ni-mw(v-if="status == 'welcome'"): .ni-mw-container
    .ni-mw-header
      .ni-mw-title Welcome to Cosmos!
    .ni-mw-main
      list-item(@click.native="setStatus('new-wallet')" title="Create new wallet") 
      list-item(@click.native="setStatus('existing-wallet')" title="Sign in with existing wallet")
      list-item(@click.native="setStatus('hardware-wallet')" title="Sign in with hardware wallet")
    .ni-mw-footer

  .ni-mw(v-if="status == 'new-wallet'"): form-struct(:submit='signUp').ni-mw-container
    .ni-mw-header
      btn(@click.native="setStatus('welcome')" icon="arrow_back")
      .ni-mw-title New Wallet
      div
    .ni-mw-main
      form-group(:error='$v.fields.signUpSeed.$error'
        field-id='sign-up-seed' field-label='Mnemonic (12 words)')
        field#sign-up-seed(
          v-model="fields.signUpSeed"
          @input="$v.fields.signUpSeed.$touch()")
        form-msg(name='Seed' type='required' v-if='!$v.fields.signUpSeed.required')
    .ni-mw-footer
      btn(@click='signUp' icon="check" value="Create Wallet")

  .ni-mw(v-if="status == 'existing-wallet'"): form-struct(:submit='signIn').ni-mw-container
    .ni-mw-header
      btn(@click.native="setStatus('welcome')" icon="arrow_back")
      .ni-mw-title Existing wallet
      div
    .ni-mw-main
    .ni-mw-footer

  .ni-mw(v-if="status == 'hardware-wallet'"): .ni-mw-container
    .ni-mw-header
      btn(@click.native="setStatus('welcome')" icon="arrow_back")
      .ni-mw-title Hardware Wallet
      div
    .ni-mw-main
    .ni-mw-footer
</template>

<script>
import {required} from 'vuelidate/lib/validators'
import {mapGetters} from 'vuex'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-field'
import FieldGroup from 'common/NiFieldGroup'
import FormGroup from 'common/NiFormGroup'
import FormMsg from '@nylira/vue-form-msg'
import FormStruct from 'common/NiFormStruct'
import ListItem from 'common/NiListItem'
export default {
  name: 'ni-mw',
  components: {
    Btn,
    Field,
    FieldGroup,
    FormGroup,
    FormMsg,
    FormStruct,
    ListItem
  },
  computed: {
    ...mapGetters(['config']),
    active () { return this.config.modals.welcome.active }
  },
  data: () => ({
    status: 'welcome',
    fields: {
      signUpSeed: 'one two three four five six seven eight nine ten eleven twelve',
      signInSeed: ''
    }
  }),
  methods: {
    setStatus (status) {
      this.status = status
    },
    signUp () {
      this.$store.commit('notify', { title: 'Signed Up!', subtitle: 'TODO: Make it work' })
    },
    signIn () {
      this.$store.commit('notify', { title: 'Signed In.', subtitle: 'TODO: Make it work' })
    }
  },
  validations: () => ({
    fields: {
      signUpSeed: {
        required
      },
      signInSeed: {
        required
      }
    }
  })
}
</script>

<style lang="stylus">
@import '~variables'

.ni-mw
  position fixed
  top 0
  left 0
  z-index 1000

  width 100vw
  height 100vh
  background app-bg

  display flex
  justify-content center
  align-items center

.ni-mw-container
  display flex
  flex-flow column nowrap

  max-width 40rem
  max-height 40rem
  
.ni-mw-header
  display flex
  flex-flow row nowrap
  align-items center
  flex 0 0 3rem
  margin-bottom 1rem

  .ni-mw-title
    flex 1
    padding 0 1rem
    font-size lg
    text-align center

.ni-mw-main
  flex 1
  display flex
  flex-flow column
  justify-content center

  border px solid bc
  border-bottom none

  .ps-scrollbar-y-rail
    display none

.ni-mw-footer
  flex 0 0 4.0625rem
  &:empty
    display none

.ni-mw-footer > div
  display flex
  justify-content space-between
</style>
