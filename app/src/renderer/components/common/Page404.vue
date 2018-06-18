<template lang="pug">
tm-page(title='404 - Page Not Found')
  part(title='Try another page...')
    tm-list-item(to='/' title='Balances')
    tm-list-item(to='/staking' title='Staking')
</template>

<script>
import { TmListItem, TmPage } from "@tendermint/ui"
import Part from "common/NiPart"
export default {
  name: "page-404",
  components: {
    TmListItem,
    TmPage,
    Part
  }
}
</script>
