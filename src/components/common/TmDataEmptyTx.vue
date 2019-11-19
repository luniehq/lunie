<template>
  <TmDataMsg icon="receipt">
    <div slot="title">
      No Transaction History
    </div>
    <div slot="subtitle">
      There are no transactions associated with this address yet. Head over to
      your
      <router-link :to="{ name: 'portfolio' }">
        portfolio
      </router-link>
      to make your first transaction!
    </div>
  </TmDataMsg>
</template>

<script>
import TmDataMsg from "common/TmDataMsg"
export default {
  name: `tm-data-empty-tx`,
  components: { TmDataMsg }
}
</script>
