<template lang="pug">
.page.page-invite
  page-header
    div(slot="title") Invite User
    p Invite Tokens: {{ user.inviteTokens }} / {{ config.MAX_INVITE_TOKENS }}
  form-struct(:submit="onSubmit")
    div(slot="subtitle") Invite a Cosmos Atom holder to participate in the delegation game.
    form-group(:error="$v.fields.name.$error")
      field(
        theme="cosmos"
        type="text"
        placeholder="Name"
        v-model="fields.name")
      form-msg(
        name="Name"
        type="required"
        v-if="!$v.fields.name.required")
    form-group(:error="$v.fields.email.$error")
      field(
        theme="cosmos"
        type="text"
        placeholder="name@example.com"
        v-model="fields.email")
      form-msg(
        name="Email"
        type="required"
        v-if="!$v.fields.email.required")
      form-msg(
        name="Email"
        type="email"
        v-if="!$v.fields.email.email")
    div(slot="footer")
      div
      btn(theme="cosmos" type="submit" icon="envelope-o" value="Send Invitation")
</template>

<script>
import { mapGetters } from 'vuex'
import { required, email } from 'vuelidate/lib/validators'
import Btn from '@nylira/vue-button'
import Field from '@nylira/vue-input'
import FormGroup from './FormGroup'
import FormMsg from './FormMsg'
import FormStruct from './FormStruct'
import PageHeader from './PageHeader'
export default {
  name: 'page-invite-user',
  components: {
    Btn,
    Field,
    FormGroup,
    FormMsg,
    FormStruct,
    PageHeader
  },
  computed: {
    ...mapGetters(['user', 'config'])
  },
  data: () => ({
    fields: {
      name: '',
      email: ''
    }
  }),
  methods: {
    onSubmit () {
      this.$v.$touch()
      if (!this.$v.$error) {
        this.$store.commit('useInviteToken')
        this.$store.commit('notifyCustom',
          { title: 'Invitation Sent',
            body: `You have sent an invite to ${this.fields.email}` })
        this.resetFields()
      }
    },
    resetFields () {
      this.$v.$reset()
      this.fields = {
        name: '',
        email: ''
      }
    }
  },
  validations: () => ({
    fields: {
      name: {
        required
      },
      email: {
        required,
        email
      }
    }
  })
}
</script>
