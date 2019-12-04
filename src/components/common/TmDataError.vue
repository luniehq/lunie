<template>
  <TmDataMsg icon="sentiment_very_dissatisfied">
    <div slot="title">
      Aw shucks!
    </div>
    <div slot="subtitle">
      Even though you're connected a full node, we can't display this data for
      you right now. Please try again later or
      <a href="https://github.com/luniehq/lunie/issues">file a bug report</a>.
      Apologies!
    </div>
  </TmDataMsg>
</template>

<script>
import TmDataMsg from "common/TmDataMsg"
export default {
  name: `tm-data-error`,
  components: { TmDataMsg }
}
</script>
