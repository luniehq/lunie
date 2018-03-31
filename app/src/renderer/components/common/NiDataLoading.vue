<template lang="pug">
data-msg(icon="rotate_right" spin="true")
  div(slot="title") {{ title }}
  div(slot="subtitle") Please wait a moment.
</template>

<script>
import DataMsg from 'common/NiDataMsg'
export default {
  name: 'ni-data-loading',
  components: { DataMsg },
  props: {
    title: {
      type: String,
      default: 'Data is loading...'
    }
  }
}
</script>
