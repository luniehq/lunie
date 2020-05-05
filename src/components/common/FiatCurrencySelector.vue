<template>
  <SessionFrame>
    <div class="currency-selector">
      <h2>Select a fiat currency to make your purchase</h2>
      <ul>
        <li @click="selectCurrency('USD')">USD</li>
        <li @click="selectCurrency('EUR')">EUR</li>
        <li @click="selectCurrency('GBP')">GBP</li>
      </ul>
    </div>
  </SessionFrame>
</template>

<script>
import SessionFrame from "common/SessionFrame"
import config from "src/../config"

export default {
  name: `fiat-currency-selector`,
  components: {
    SessionFrame
  },
  data: () => {
    return {
      coinDenom: undefined
    }
  },
  created() {
    this.coinDenom = this.$store.state.moonpay.coinDenom
  },
  methods: {
    selectCurrency(fiat) {
      if (this.coinDenom) {
        window.open(
          `https://buy-staging.moonpay.io?apiKey=${
            config.moonpayAPIKey
          }&currencyCode=${this.coinDenom.toLowerCase()}&baseCurrencyCode=${fiat}`,
          "_blank"
        ) // TODO: Look how this would look like on mobile
      }
    }
  }
}
</script>
<style scoped>
.currency-selector {
  max-width: 600px;
  padding: 0 1rem 2rem;
  margin: 0 auto;
  width: 100%;
}

li {
  display: flex;
  padding: 1.5rem;
  margin: 0.5rem 0;
  background-color: var(--app-fg);
  border-radius: 0.25rem;
  transition: background-color 0.2s ease;
}

li:hover {
  cursor: pointer;
  background: var(--app-fg-hover);
}
</style>
