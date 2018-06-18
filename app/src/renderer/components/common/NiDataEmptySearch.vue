<template lang="pug">
tm-data-msg(icon="search")
  div(slot="title") No Results
  div(slot="subtitle") Your search did not match any available data.
</template>

<script>
import { TmDataMsg } from "@tendermint/ui"
export default {
  name: "ni-data-empty-search",
  components: { TmDataMsg }
}
</script>
