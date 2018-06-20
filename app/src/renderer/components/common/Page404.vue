<template lang="pug">
tm-page(title='404 - Page Not Found')
  tm-part(title='Try another page...')
    tm-list-item(to='/' title='Balances')
    tm-list-item(to='/staking' title='Staking')
</template>

<script>
import { TmListItem, TmPage, TmPart } from "@tendermint-ui"
export default {
  name: "page-404",
  components: {
    TmListItem,
    TmPage,
    TmPart
  }
}
</script>
