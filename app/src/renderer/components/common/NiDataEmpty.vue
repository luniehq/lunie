<template lang="pug">
tm-data-msg(icon="info_outline")
  h4(v-if="title" slot="title") {{ title }}
  h4(v-else slot="title") N/A

  h5(v-if="subtitle" slot="subtitle") {{ subtitle }}
  h5(v-else slot="subtitle") No data available yet.
</template>

<script>
import { TmDataMsg } from "@tendermint/ui"
export default {
  name: "tm-data-empty",
  props: ["title", "subtitle"],
  components: { TmDataMsg }
}
</script>
