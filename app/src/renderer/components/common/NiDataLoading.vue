<template lang="pug">
tm-data-msg(icon="rotate_right" spin="true")
  div(slot="title") {{ title }}
  div(slot="subtitle") Please wait a moment.
</template>

<script>
import { TmDataMsg } from "@tendermint/ui"
export default {
  name: "ni-data-loading",
  components: { TmDataMsg },
  props: {
    title: {
      type: String,
      default: "Data is loading…"
    }
  }
}
</script>
