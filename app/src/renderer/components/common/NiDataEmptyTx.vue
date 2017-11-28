<template lang="pug">
data-msg(icon="info_outline")
  div(slot="title") No Transaction History 
  div(slot="subtitle") Looks like you haven't sent or received any transactions yet. Head over to #[router-link(:to="{ name: 'balances' }") Balances] to make your first transaction!
</template>

<script>
import DataMsg from 'common/NiDataMsg'
export default {
  name: 'ni-data-empty-tx',
  components: {
    DataMsg
  }
}
</script>
