<template>
  <btn
    class="btn-copy"
    icon="copy"
    @click.native="click"
    :data-clipboard-text="value"
    value="Copy">
  </btn>
</template>

<script>
/* eslint-disable no-new */
import Clipboard from 'clipboard'
import Btn from '@nylira/vue-button'
export default {
  components: {
    Btn
  },
  methods: {
    trunc (value) {
      if (value.length > 20) value = this.value.substring(0, 10) + '...'
      return '“' + value + '”'
    },
    click () {
      this.$store.commit('notify', {
        title: 'Copy Success!',
        body: `${this.trunc(this.value)} has been copied to your clipboard.`
      })
    }
  },
  mounted () {
    new Clipboard('.btn-copy')
  },
  props: ['value']
}
</script>

<style lang="stylus">
@require '../../styles/variables.styl'
</style>
