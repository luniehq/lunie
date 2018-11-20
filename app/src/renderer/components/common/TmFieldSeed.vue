<template lang="pug">
tm-field.tm-field-seed(
  type="textarea"
  @input="update($event)"
  :value="value")
</template>

<script>
import autosize from "autosize"
import { TmField } from "@tendermint/ui"
export default {
  name: `tm-field-seed`,
  components: { TmField },
  props: [`value`],
  watch: {
    value: {
      handler: async function() {
        await this.$nextTick()
        autosize.update(this.$el)
      }
    }
  },
  mounted() {
    // adjust the textarea element height to match content
    autosize(this.$el)
  },
  methods: {
    update(value) {
      this.$emit(`input`, value)
    }
  }
}
</script>
<style lang="stylus">
.tm-field:disabled.tm-field-seed
  border 1px solid var(--bc)
</style>
