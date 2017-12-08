<template lang="pug">
field.ni-field-seed(
  type="textarea"
  @input="update($event)"
  :value="value")
</template>

<script>
import Field from '@nylira/vue-field'
export default {
  name: 'ni-field-seed',
  components: {
    Field
  },
  methods: {
    update (value) {
      this.$emit('input', value)
    }
  },
  props: ['value']
}
</script>

<style lang="stylus">
@require '~variables'

.ni-field.ni-field-seed
  height 5rem
</style>
