<template lang="pug">
btn.btn-copy(
  icon="content_copy"
  @click.native="click"
  value="Copy")
</template>

<script>
import {clipboard} from 'electron'
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
      clipboard.writeText(this.value)
      
      this.$store.commit('notify', {
        title: this.notifyTitle,
        body: this.notifyBody
      })
    }
  },
  props: ['value', 'title', 'body']
}
</script>
