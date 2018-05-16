<template lang="pug">
field.ni-field-seed(
  type="textarea"
  @input="update($event)"
  :value="value")
</template>

<script>
import autosize from "autosize"
import Field from "@nylira/vue-field"
export default {
  name: "ni-field-seed",
  components: { Field },
  methods: {
    update(value) {
      this.$emit("input", value)
    }
  },
  mounted() 
    // adjust the textarea element height to match content
    autosize(this.$el)
  },
  props: ["value"],
  watch: {
    value: {
      handler: async function(newVal) {
        await this.$nextTick()
        autosize.update(this.$el)
      }
    }
  }
}
</script>
