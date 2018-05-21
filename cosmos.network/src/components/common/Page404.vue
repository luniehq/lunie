<template lang="pug">
page(title='404 - Page Not Found')
  part(title='Try another page...')
    list-item(to='/staking' title='Staking')
    list-item(to='/signin' title='Sign In')
</template>

<script>
import ListItem from "common/NiListItem"
import Page from "common/NiPage"
import Part from "common/NiPart"
export default {
  name: "page-404",
  components: {
    ListItem,
    Page,
    Part
  }
}
</script>
