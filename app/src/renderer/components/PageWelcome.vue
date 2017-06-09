<template lang="pug">
  .page.page-welcome
    page-header(title="Welcome - Important Notice")
    article-body
      p Please read the following carefully before signing in to the Cosmos Delegation Game.
      p We want to discourage you from delegating your atoms to the validator with the most delegators, as that can cause them to achieve an unsafe amount of voting power.

      p When you delegate your atoms, they will be bonded to the validator and you won’t able to transfer them or sell them unless you activate a month-long unbonding period.

      p If you delegate your atoms to a malicious validator, you take the risk of having your atoms slashed when the validator makes poor decisions.

      p Now that you have been thoroughly warned, please type in “{{ fields.agreement }}” into the input field below.

    form-struct(:submit="onSubmit")
      form-group(:error="$v.fields.repeatAgreement.$error")
        field(
          theme="cosmos"
          type="text"
          placeholder="Type here..."
          v-model="fields.repeatAgreement")
        form-msg(
          name="Agreement"
          type="required"
          v-if="!$v.fields.repeatAgreement.required")
        form-msg(
          name="Agreement"
          type="match"
          v-if="!$v.fields.repeatAgreement.sameAsAgreement")
      div(slot="footer")
        btn(theme="cosmos" type="submit" icon="check" value="Continue")
</template>

<script>
import { required, minLength, maxLength, sameAs } from 'vuelidate/lib/validators'
import ArticleBody from './ArticleBody'
import NiSection from './NiSection'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-input'
import FormGroup from './FormGroup'
import FormMsg from './FormMsg'
import FormStruct from './FormStruct'
import PageHeader from './PageHeader'
export default {
  name: 'page-welcome',
  components: {
    ArticleBody,
    Btn,
    Field,
    FormGroup,
    FormMsg,
    FormStruct,
    NiSection,
    PageHeader
  },
  data: () => ({
    fields: {
      agreement: 'I understand the risks',
      repeatAgreement: ''
    }
  }),
  methods: {
    onSubmit () {
      this.$v.$touch()
      if (!this.$v.$error) {
        this.$store.commit('notifyCustom',
          { title: 'Agreement Complete',
            body: 'Thanks for reading. Now you may sign in.' })
        this.resetFields()
        this.$router.push('/signin')
      }
    },
    resetFields () {
      this.$v.$reset()
      this.fields = {
        agreement: 'I understand the risks',
        repeatAgreement: ''
      }
    }
  },
  validations: {
    fields: {
      repeatAgreement: {
        required,
        minLength: minLength(22),
        maxLength: maxLength(22),
        sameAs: sameAs('agreement')
      }
    }
  }
}
</script>
