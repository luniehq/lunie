<template>
  <a
    class="anchor-copy"
    @click="click"
  >
    <i class="material-icons">{{ icon }}</i>{{ label }}
  </a>
</template>

<script>
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
  data: () => ({
    /* istanbul ignore next */
    copy: value => global.navigator.clipboard.writeText(value)
  }),
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
      this.copy(this.value)

      this.$store.commit(`notify`, {
        title: this.notifyTitle,
        body: this.notifyBody
      })
    }
  }
}
</script>
