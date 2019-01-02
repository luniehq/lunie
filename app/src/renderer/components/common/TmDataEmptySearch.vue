<template>
  <tm-data-msg icon="search">
    <div slot="title">No Results</div>
    <div slot="subtitle">Your search did not match any available data.</div>
  </tm-data-msg>
</template>

<script>
import TmDataMsg from "common/TmDataMsg"
export default {
  name: `tm-data-empty-search`,
  components: { TmDataMsg }
}
</script>
