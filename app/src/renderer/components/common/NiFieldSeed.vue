<template lang="pug">
field.ni-field-seed(
  type="textarea"
  v-model="value")
</template>

<script>
import Field from '@nylira/vue-field'
export default {
  name: 'ni-field-seed',
  components: {
    Field
  },
  props: ['value']
}
</script>

<style lang="stylus">
@require '~variables'

.ni-field.ni-field-seed
  height 5rem
</style>
