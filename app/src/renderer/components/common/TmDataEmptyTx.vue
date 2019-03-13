<template>
  <tm-data-msg icon="receipt">
    <div slot="title">
      No Transaction History
    </div>
    <div slot="subtitle">
      Looks like you there are no transactions associated with this address yet.
      Head over to your
      <router-link :to="{ name: 'wallet' }">
        Wallet
      </router-link>
      to make your first transaction!
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
