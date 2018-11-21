<template>
  <tm-page data-title="404">
    <tm-part title="Try another page...">
      <tm-list-item to="/" title="Wallet"></tm-list-item>
      <tm-list-item to="/staking" title="Staking"></tm-list-item>
    </tm-part>
  </tm-page>
</template>

<script>
import { TmListItem, TmPage, TmPart } from "@tendermint/ui"
export default {
  name: `page-404`,
  components: {
    TmListItem,
    TmPage,
    TmPart
  }
}
</script>
