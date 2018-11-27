<template>
  <tm-data-msg>
    <div slot="title">Waiting for connection</div>
    <div slot="subtitle">
      You are currently not connected to a node. Voyager will load the data when
      the connection is established again.
    </div>
  </tm-data-msg>
</template>

<script>
import { TmDataMsg } from "@tendermint/ui"
export default {
  name: `tm-data-connecting`,
  components: { TmDataMsg }
}
</script>
