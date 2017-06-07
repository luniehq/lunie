<template lang="pug">
  .page.page-welcome
    page-header(title="Welcome")
    .scrollable-area: form-struct(v-on:submit.prevent="onSubmit")
      div(slot="title") #[i.fa.fa-search] IMPORTANT NOTICE
      div(slot="subtitle") Please read the following carefully before signing in to the Cosmos Delegation Game.
      p We want to discourage you from delegating your atoms to the validator with the most delegators, as that can cause them to achieve an unsafe amount of voting power.

      p When you delegate your atoms, they will be bonded to the validator and you won’t able to transfer them or sell them unless you activate a month-long unbonding period.

      p If you delegate your atoms to a malicious validator, you take the risk of having your atoms slashed when the validator makes poor decisions.

      p Now that you have been thoroughly warned, please type in “I understand the risks of staking my atoms” into the input field below.

      form-group
        field(
          theme="cosmos"
          type="textarea"
          placeholder="Type here..."
          required
          v-model="query"
          pattern=".{32,128}"
          title="32 to 128 characters")
      div(slot="footer")
        btn(theme="cosmos" icon="search" value="Continue")
</template>

<script>
import Btn from '@nylira/vue-button'
import PageHeader from './PageHeader'
import Field from '@nylira/vue-input'
import FormGroup from './FormGroup'
import FormStruct from './FormStruct'
export default {
  name: 'page-welcome',
  components: {
    Btn,
    Field,
    FormGroup,
    FormStruct,
    PageHeader
  }
}
</script>

<style lang="stylus">
@require '../styles/variables.styl'

.page-welcome
  flex 1
  display flex
  flex-flow column

</style>
