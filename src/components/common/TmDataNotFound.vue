<template>
  <TmDataMsg icon="sentiment_very_dissatisfied">
    <div slot="title">
      Not found!
    </div>
    <div slot="subtitle">
      We could not find the requested resource
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