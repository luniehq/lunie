<template lang="pug">
data-msg(icon="info_outline")
  h4(v-if="title" slot="title") {{ title }}
  h4(v-else slot="title") N/A

  h5(v-if="subtitle" slot="subtitle") {{ subtitle }}
  h5(v-else slot="subtitle") No data available yet.
</template>

<script>
import DataMsg from 'common/NiDataMsg'
export default {
  name: 'ni-data-empty',
  props: ['title', 'subtitle'],
  components: {
    DataMsg
  }
}
</script>
