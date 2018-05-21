<template lang="pug">
a.anchor-copy(:data-clipboard-text="value")
  i.material-icons {{ icon }}
  | {{ label }}
</template>

<script>
import Clipboard from 'clipboard'
export default {
  name: 'anchor-copy',
  mounted () {
    let clipboard = new Clipboard(this.$el)
    let self = this

    clipboard.on('success', function (e) {
      self.$store.commit('notify', { title: 'Copied to Clipboard', body: 'Selection has been successfully copied.' })
      e.clearSelection()
    })
  },
  props: ['value', 'label', 'icon']
}
</script>
