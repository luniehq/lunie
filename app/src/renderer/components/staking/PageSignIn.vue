<template lang='pug'>
.page.page-welcome(v-if="signInStep === 0")
  page-header
    div(slot="title") Welcome - Important Notice
  article-body
    p Please read the following carefully before signing in to the Cosmos Delegation Game.
    p We want to discourage you from delegating your atoms to the validator with the most delegators, as that can cause them to achieve an unsafe amount of voting power.

    p When you delegate your atoms, they will be bonded to the validator and you won’t able to transfer them or sell them unless you activate a month-long unbonding period.

    p If you delegate your atoms to a malicious validator, you take the risk of having your atoms slashed when the validator makes poor decisions.

    p Now that you have been thoroughly warned, please type in “{{ welcomeFields.agreement }}” into the input field below.

  form-struct(:submit="welcomeOnSubmit")
    form-group(:error="$v.welcomeFields.repeatAgreement.$error")
      field(
        theme="cosmos"
        type="text"
        placeholder="Type here..."
        v-model="welcomeFields.repeatAgreement")
      form-msg(
        name="Agreement"
        type="required"
        v-if="!$v.welcomeFields.repeatAgreement.required")
      form-msg(
        name="Agreement"
        type="match"
        v-if="!$v.welcomeFields.repeatAgreement.sameAsAgreement")
    div(slot="footer")
      btn(theme="cosmos" type="submit" icon="check" value="Continue")

.page.page-sign-in(v-else)
  page-header
    div(slot="title") Sign In
  form-struct(:submit='signInOnSubmit')
    form-group(:error='$v.signInFields.seed.$error')
      label 12-Word Seed
      field(
        theme='cosmos'
        type='text'
        placeholder='Input seed...'
        v-model='signInFields.seed')
      form-msg(
        name='Seed'
        type='required'
        v-if='!$v.signInFields.seed.required')
      form-msg(
        name='Seed'
        type='error'
        v-if='!$v.signInFields.seed.valid')
    div(slot='footer')
      btn(theme='cosmos' type='submit' icon='search' value='Sign In')
</template>

<script>
import { required, minLength, maxLength, sameAs } from 'vuelidate/lib/validators'
import ArticleBody from './NiArticleBody'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-input'
import FormGroup from './FormGroup'
import FormMsg from './FormMsg'
import FormStruct from './FormStruct'
import PageHeader from './PageHeader'
export default {
  name: 'page-sign-in',
  components: {
    ArticleBody,
    Btn,
    Field,
    FormGroup,
    FormMsg,
    FormStruct,
    PageHeader
  },
  data: () => ({
    signInStep: 0,
    welcomeFields: {
      agreement: 'I understand the risks',
      repeatAgreement: ''
    },
    signInFields: {
      seed: ''
    }
  }),
  methods: {
    welcomeOnSubmit () {
      this.$v.welcomeFields.$touch()
      if (!this.$v.welcomeFields.$error) {
        // console.log('welcome on submit...')
        this.signInStep += 1
      }
    },
    signInOnSubmit () {
      this.$v.signInFields.$touch()
      if (!this.$v.signInFields.$error) {
        this.$store.dispatch('signIn', this.signInFields.seed)
        this.$router.push('/')
      }
    }
  },
  validations: () => ({
    welcomeFields: {
      repeatAgreement: {
        required,
        minLength: minLength(22),
        maxLength: maxLength(22),
        sameAs: sameAs('agreement')
      }
    },
    signInFields: {
      seed: {
        required
      }
    }
  })
}
</script>
