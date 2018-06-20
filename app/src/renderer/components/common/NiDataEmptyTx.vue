<template lang="pug">
tm-data-msg(icon="info_outline")
  div(slot="title") No Transaction History
  div(slot="subtitle") Looks like you haven't sent or received any transactions yet. Head over to #[router-link(:to="{ name: 'send' }") Send] to make your first transaction!
</template>

<script>
import { TmDataMsg } from "@tendermint/ui"
export default {
  name: "tm-data-empty-tx",
  components: { TmDataMsg }
}
</script>
