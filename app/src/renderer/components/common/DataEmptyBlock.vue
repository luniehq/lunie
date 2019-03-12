<template>
  <tm-data-msg icon="info_outline">
    <div slot="title">
      No Transactions
    </div>
    <div slot="subtitle">
      This block doesn't contain any transaction.
    </div>
  </tm-data-msg>
</template>

<script>
import TmDataMsg from "common/TmDataMsg"
export default {
  name: `data-empty-block`,
  components: { TmDataMsg }
}
</script>
