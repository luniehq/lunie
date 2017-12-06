<template lang="pug">
btn.btn-copy(
  icon="copy"
  @click.native="click"
  :data-clipboard-text="value"
  value="Copy")
</template>

<script>
import Clipboard from 'clipboard'
import Btn from '@nylira/vue-button'
export default {
  components: {
    Btn
  },
  computed: {
    notifyTitle () {
      if (this.title) return this.title
      else return 'Copy Success!'
    },
    notifyBody () {
      if (this.body) return this.body
      else return `"${this.trunc(this.value)}" has been copied to your clipboard.`
    }
  },
  methods: {
    trunc (value) {
      if (value.length > 20) value = value.substring(0, 10) + '...'
      return value
    },
    click () {
      this.$store.commit('notify', {
        title: this.notifyTitle,
        body: this.notifyBody
      })
    }
  },
  mounted () {
    this.clipboard = new Clipboard('.btn-copy')
  },
  props: ['value', 'title', 'body']
}
</script>
