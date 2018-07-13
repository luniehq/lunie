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
  name: "tm-field-seed",
  components: { TmField },
  methods: {
    update(value) {
      this.$emit("input", value)
    }
  },
  mounted() {
    // adjust the textarea element height to match content
    autosize(this.$el)
  },
  props: ["value"],
  watch: {
    value: {
      handler: async function() {
        await this.$nextTick()
        autosize.update(this.$el)
      }
    }
  }
}
</script>
