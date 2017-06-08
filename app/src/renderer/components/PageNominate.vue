<template lang="pug">
.page.page-nominate
  page-header(title="Nominate Self")
  form-struct(v-on:submit.prevent="onSubmit")
    div(slot="title") Nominate Self
    div(slot="subtitle") Fill out the form below to nominate yourself as a candidate for validator.
    form-group
      Label Keybase ID
      field(
        theme="cosmos"
        type="text"
        placeholder="Keybase ID"
        required)
    form-group
      Label Pubkey
      field(
        theme="cosmos"
        type="text"
        placeholder="Pubkey Here"
        required)
    form-group
      Label Website
      field(
        theme="cosmos"
        type="text"
        placeholder="https://"
        required)
    div(slot="footer")
      btn(theme="cosmos" value="Submit Nomination")
</template>

<script>
import Btn from '@nylira/vue-button'
import PageHeader from './PageHeader'
import Field from '@nylira/vue-input'
import FormGroup from './FormGroup'
import FormStruct from './FormStruct'
export default {
  name: 'page-nominate',
  components: {
    Btn,
    Field,
    FormGroup,
    FormStruct,
    PageHeader
  }
}
</script>
