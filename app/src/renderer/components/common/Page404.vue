<template lang="pug">
page(title='404 - Page Not Found')
  part(title='Try another page...')
    tm-list-item(to='/' title='Balances')
    tm-list-item(to='/staking' title='Staking')
</template>

<script>
import { TmListItem } from "@tendermint/ui"
import Page from "common/NiPage"
import Part from "common/NiPart"
export default {
  name: "page-404",
  components: {
    TmListItem,
    Page,
    Part
  }
}
</script>
