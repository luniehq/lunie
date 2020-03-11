<template>
  <div v-if="visible" class="currency-selector">
    <img
      class="currency-flag"
      :src="'/img/icons/currencies/' + selectedCurrency.toLowerCase() + '.png'"
      :alt="`${selectedCurrency}` + ' country flag'"
    />
    <select v-model="selectedCurrency" @change="setCurrency()">
      <option v-for="denom in supportedCurrencies" :key="denom" :value="denom">
        {{ denom }}
      </option>
    </select>
  </div>
</template>

<script>
export default {
  name: `currency-selector`,
  props: {
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      selectedCurrency: `EUR`,
      supportedCurrencies: [`EUR`, `USD`, `GBP`, `CHF`, `JPY`]
    }
  },
  //   mounted() {
  //     const localCurrency = localStorage.getItem(
  //       `selectedCurrency`,
  //       this.selectedCurrency
  //     )
  //     if (localCurrency) this.selectedCurrency = localCurrency
  //   },
  methods: {
    setCurrency() {
      localStorage.setItem(`selectedCurrency`, this.selectedCurrency)
    }
  }
}
</script>

<style scoped>
.currency-selector {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding: 1rem;
}

select {
  background: var(--input-bg);
  color: var(--txt, #333);
  border: none;
}

select option {
  background: var(--app-bg);
  color: var(--txt);
  font-family: var(--sans);
}

.currency-selector {
  display: flex;
  align-items: center;
}

.currency-flag {
  width: 1rem;
  margin-right: 0.25rem;
}
</style>
