<template lang="pug">
.page.page-invite
  page-header(title="Invite User")
  form-struct(v-on:submit.prevent="onSubmit")
    div(slot="title") Invite user
    div(slot="subtitle") Invite a Cosmos ICO participant to play in this Delegation Game.
    form-group
      Label Name
      field(
        theme="cosmos"
        type="text"
        placeholder="Name"
        required)
    form-group
      Label Email
      field(
        theme="cosmos"
        type="email"
        placeholder="name@example.com"
        required)
    div(slot="footer")
      btn(theme="cosmos" value="Send Invitation")
</template>

<script>
import Btn from '@nylira/vue-button'
import PageHeader from './PageHeader'
import Field from '@nylira/vue-input'
import FormGroup from './FormGroup'
import FormStruct from './FormStruct'
export default {
  name: 'page-invite',
  components: {
    Btn,
    Field,
    FormGroup,
    FormStruct,
    PageHeader
  }
}
</script>
