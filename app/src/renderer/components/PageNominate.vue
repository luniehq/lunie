<template lang="pug">
  .page.page-nominate
    page-header(title="Nominate Self")
    .scrollable-area: form-struct(v-on:submit.prevent="onSubmit")
      div(slot="title") #[i.fa.fa-search] Nominate Self
      div(slot="subtitle") Nominate yourself for validator status.
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
        btn(theme="cosmos" icon="search" value="Authenticate")
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
