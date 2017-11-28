<template lang="pug">
.ni-modal-welcome(v-if="active")

  .ni-mw(v-if="status == 'welcome'"): .ni-mw-container
    .ni-mw-header
      .ni-mw-title Welcome to Cosmos
    .ni-mw-main
      list-item(@click.native="setStatus('sign-up')" title="Create new account") 
      list-item(@click.native="setStatus('sign-in-seed')" title="Sign in with seed")
      list-item(@click.native="setStatus('sign-in-hardware')" title="Sign in with hardware")
    .ni-mw-footer

  .ni-mw(v-if="status == 'sign-up'"): form-struct(:submit='signUp').ni-mw-container
    .ni-mw-header
      a(@click="setStatus('welcome')"): i.material-icons arrow_back
      .ni-mw-title New Account
      a: i.material-icons help_outline
    .ni-mw-main
      form-group(:error='$v.fields.signUpSeed.$error'
        field-id='sign-up-seed' field-label='Seed (12 words)')
        field#sign-up-seed(
          type="textarea"
          v-model="fields.signUpSeed"
          @input="$v.fields.signUpSeed.$touch()")
        form-msg(name='Seed' type='required' v-if='!$v.fields.signUpSeed.required')
        form-msg(body='There is no such thing as seed recovery. You need to back up these words.')

      form-group(:error='$v.fields.signUpWarning.$error')
        .ni-field-checkbox
          .ni-field-checkbox-input
            input#sign-up-warning(type="checkbox" v-model="fields.signUpWarning")
          label.ni-field-checkbox-label(for="sign-up-warning")
            | I understand that Cosmos cannot recover lost seed phrases.
        form-msg(name='Warning' type='required' v-if='!$v.fields.signUpWarning.required')

      form-group(:error='$v.fields.signUpBackup.$error')
        .ni-field-checkbox(for="sign-up-backup")
          .ni-field-checkbox-input
            input#sign-up-backup(type="checkbox" v-model="fields.signUpBackup")
          label.ni-field-checkbox-label(for="sign-up-backup")
            | I have securely backed up my generated seed phrase.
        form-msg(name='Backup' type='required' v-if='!$v.fields.signUpBackup.required')

    .ni-mw-footer
      btn(@click.native='signUp' icon="check" value="Create Wallet")

  .ni-mw(v-if="status == 'sign-in-seed'"): form-struct(:submit='signIn').ni-mw-container
    .ni-mw-header
      a(@click="setStatus('welcome')"): i.material-icons arrow_back
      .ni-mw-title Enter Seed
      a: i.material-icons help_outline
    .ni-mw-main
    .ni-mw-footer

  .ni-mw(v-if="status == 'sign-in-hardware'"): .ni-mw-container
    .ni-mw-header
      a(@click="setStatus('welcome')"): i.material-icons arrow_back
      .ni-mw-title Plug In Hardware
      a: i.material-icons help_outline
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
      signUpWarning: false,
      signUpBackup: false,
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
      signUpSeed: { required },
      signUpWarning: { required },
      signUpBackup: { required },
      signInSeed: {
        required
      }
    }
  })
}
</script>

<style lang="stylus">
@import '~variables'

.ni-field-checkbox
  display flex
  flex-flow row nowrap

  .ni-field-checkbox-input
    flex 0 0 3rem
    height 3rem
    display flex
    align-items center
    justify-content center
    background app-fg

  .ni-field-checkbox-label
    line-height 1.5
    padding-left 1rem

.ni-mw
  position fixed
  top 0
  left 0
  z-index 1000

  background app-bg

.ni-mw-container
  &:not(.ni-form)
    width 100vw
    height 100vh
    display flex
    flex-flow column nowrap
  &.ni-form
    .ni-form-main
      width 100vw
      height 100vh
      display flex
      flex-flow column nowrap

.ni-mw-header
  display flex
  flex-flow row nowrap
  justify-content space-between
  align-items center
  flex 0 0 3rem

  a
    width 3rem
    display flex
    align-items center
    justify-content center
    i
      color txt
      font-size lg
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

  overflow-y scroll

  border px solid bc
  border-bottom none

  .ps-scrollbar-y-rail
    display none

  > p
    font-size sm
    padding 1rem
    border-bottom px solid bc

.ni-mw-footer
  border-top px solid bc
  flex 0 0 4rem + px
  display flex
  align-items center
  justify-content center

  &:empty
    display none

.ni-mw-footer > div
  display flex
  justify-content space-between
</style>
