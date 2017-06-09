<template lang="pug">
.page.page-nominate
  page-header(title="Nominate Self")
  form-struct(:submit="onSubmit")
    div(slot="title") Nominate Yourself
    div(slot="subtitle") Nominate yourself as a candidate for validator.
    form-group(:error="$v.fields.keybase.$error")
      field(
        theme="cosmos"
        type="text"
        placeholder="Keybase ID"
        v-model="fields.keybase")
      form-msg(
        name="Keybase ID"
        type="required"
        v-if="!$v.fields.keybase.required")
    form-group(:error="$v.fields.pubkey.$error")
      field(
        theme="cosmos"
        type="text"
        placeholder="Public Key"
        v-model="fields.pubkey")
      form-msg(
        name="Public Key"
        type="required"
        v-if="!$v.fields.pubkey.required")
    form-group(:error="$v.fields.website.$error")
      field(
        theme="cosmos"
        type="text"
        placeholder="https://"
        v-model="fields.website")
      form-msg(
        name="Website"
        type="required"
        v-if="!$v.fields.website.required")
    div(slot="footer")
      btn(theme="cosmos" type="submit" icon="check" value="Submit Nomination")
</template>

<script>
import { required } from 'vuelidate/lib/validators'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-input'
import FormGroup from './FormGroup'
import FormMsg from './FormMsg'
import FormStruct from './FormStruct'
import PageHeader from './PageHeader'
export default {
  name: 'page-nominate',
  components: {
    Btn,
    Field,
    FormGroup,
    FormMsg,
    FormStruct,
    PageHeader
  },
  data: () => ({
    fields: {
      keybase: '',
      pubkey: '',
      website: ''
    }
  }),
  methods: {
    onSubmit () {
      this.$v.$touch()
      if (!this.$v.$error) {
        this.$store.commit('notifyCustom',
          { title: 'Nominination Submitted',
            body: `Well done! You should appear on the list of candidates shortly.` })
        this.resetFields()
        this.$router.push('/')
      }
    },
    resetFields () {
      this.$v.$reset()
      this.fields = {
        keybase: '',
        pubkey: '',
        website: ''
      }
    }
  },
  validations: () => ({
    fields: {
      keybase: {
        required
      },
      pubkey: {
        required
      },
      website: {
        required
      }
    }
  })
}
</script>
