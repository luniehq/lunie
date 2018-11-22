<template lang="pug">
a.anchor-copy(@click="click")
  i.material-icons {{ icon }}
  | {{ label }}
</template>

<script>
import { clipboard } from "electron"
export default {
  name: `anchor-copy`,
  props: {
    title: {
      type: String,
      required: true
    },
    body: {
      type: String,
      required: true
    },
    value: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    }
  },
  computed: {
    notifyTitle() {
      if (this.title) return this.title
      else return `Copy Success!`
    },
    notifyBody() {
      if (this.body) return this.body
      else return `"${this.value}" has been copied to your clipboard.`
    }
  },
  methods: {
    click() {
      clipboard.writeText(this.value)

      this.$store.commit(`notify`, {
        title: this.notifyTitle,
        body: this.notifyBody
      })
    }
  }
}
</script>
