<template lang="pug">
field.ni-field-seed(
  type="textarea"
  @input="update($event)"
  :value="value"
  resize="none")
</template>

<script>
import Field from "@nylira/vue-field"
export default {
  name: "ni-field-seed",
  components: { Field },
  methods: {
    update(value) {
      this.$emit("input", value)
    }
  },
  mounted() {
    this.$el.style.height = this.$el.scrollHeight + "px"
  },
  props: ["value"]
}
</script>

<style lang="stylus">
@require '~variables'

.ni-field.ni-field-seed
  resize none
</style>
