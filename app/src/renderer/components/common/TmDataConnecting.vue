<template>
  <tm-data-msg>
    <div slot="title">Waiting for connection</div>
    <div slot="subtitle">
      You are currently not connected to a node. Voyager will load this data
      when a connection is established.
    </div>
  </tm-data-msg>
</template>

<script>
import TmDataMsg from "common/TmDataMsg"
export default {
  name: `tm-data-connecting`,
  components: { TmDataMsg }
}
</script>
