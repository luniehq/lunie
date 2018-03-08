<template lang="pug">
data-msg(icon="rotate_right" spin="true")
  div(slot="title") Data is loading&hellip;
  div(slot="subtitle") Please wait a moment.
</template>

<script>
import DataMsg from 'common/NiDataMsg'
export default {
  name: 'ni-data-loading',
  components: { DataMsg }
}
</script>
