<template lang="pug">
a.anchor-copy(:data-clipboard-text="value")
  i.material-icons {{ icon }}
  | {{ label }}
</template>

<script>
import { clipboard } from "electron"
export default {
  name: "anchor-copy",
  computed: {
    notifyTitle() {
      if (this.title) return this.title
      else return "Copy Success!"
    },
    notifyBody() {
      if (this.body) return this.body
      else
        return `"${this.trunc(this.value)}" has been copied to your clipboard.`
    }
  },
  mounted() {
    clipboard.writeText(this.value)

    this.$store.commit("notify", {
      title: this.notifyTitle,
      body: this.notifyBody
    })
  },
  props: ["value", "label", "icon", "body"]
}
</script>
