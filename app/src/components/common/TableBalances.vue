<template>
  <div>
    <table class="data-table">
      <tbody>
        <LiBalance
          v-for="balance in balances"
          :key="balance.id"
          class="li-balance"
          :balance="balance"
          :total-rewards-denom="totalRewardsDenom"
        />
      </tbody>
    </table>
  </div>
</template>

<script>
import LiBalance from "common/LiBalance"
export default {
  name: `table-proposals`,
  components: {
    LiBalance,
  },
  props: {
    balances: {
      type: Array,
      required: true,
    },
    totalRewardsDenom: {
      type: Object,
      default: () => {},
    },
  },
  data: () => ({
    sort: {
      property: `id`,
      order: `desc`,
    },
  }),
}
</script>
<style scoped>
.li-balance {
  display: flex;
}
</style>
