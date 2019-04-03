<template>
  <tm-page data-title="404">
    <tm-part title="Try another page...">
      <tm-list-item to="/" title="Wallet" />
      <tm-list-item to="/staking" title="Staking" />
    </tm-part>
  </tm-page>
</template>

<script>
import TmListItem from "common/TmListItem"
import TmPage from "common/TmPage"
import TmPart from "common/TmPart"
export default {
  name: `page-404`,
  components: {
    TmListItem,
    TmPage,
    TmPart
  }
}
</script>
