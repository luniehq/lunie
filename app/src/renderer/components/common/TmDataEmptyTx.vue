<template>
  <tm-data-msg icon="info_outline">
    <div slot="title">No Transaction History</div>
    <div slot="subtitle">
      Looks like you haven't sent or received any transactions yet. Head over to
      your <router-link :to="{ name: 'wallet' }">Wallet</router-link> to make
      your first transaction!
    </div>
  </tm-data-msg>
</template>

<script>
import TmDataMsg from "common/TmDataMsg"
export default {
  name: `tm-data-empty-tx`,
  components: { TmDataMsg }
}
</script>
