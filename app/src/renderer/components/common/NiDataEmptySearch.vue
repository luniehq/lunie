<template lang="pug">
data-msg(icon="search")
  div(slot="title") No Results
  div(slot="subtitle") Your search did not match any available data.
</template>

<script>
import DataMsg from "common/NiDataMsg"
export default {
  name: "ni-data-empty-search",
  components: { DataMsg }
}
</script>
