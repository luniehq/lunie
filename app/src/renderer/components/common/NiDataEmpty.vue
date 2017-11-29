<template lang="pug">
data-msg(icon="info_outline")
  div(slot="title") N/A
  div(slot="subtitle") No data available yet.
</template>

<script>
import DataMsg from 'common/NiDataMsg'
export default {
  name: 'ni-data-empty',
  components: {
    DataMsg
  }
}
</script>
