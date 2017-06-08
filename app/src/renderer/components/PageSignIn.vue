<template lang="pug">
  .page.page-sign-in
    page-header(title="Sign In")
    form-struct(v-on:submit.prevent="onSubmit")
      form-group
        field(
          theme="cosmos"
          type="text"
          placeholder="Input seed..."
          required
          v-model="fields.seed"
          pattern=".{32,128}"
          title="32 to 128 characters")
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
  name: 'page-sign-in',
  components: {
    Btn,
    Field,
    FormGroup,
    FormStruct,
    PageHeader
  },
  data: () => ({
    fields: {
      seed: ''
    }
  })
}
</script>
