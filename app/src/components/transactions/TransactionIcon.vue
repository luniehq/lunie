<template>
  <div class="tx__icon">
    <img :src="icon" :alt="transactionType" />
  </div>
</template>

<script>
import config from "src/../config"
export default {
  name: `transaction-icon`,
  props: {
    transactionType: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    isExtension: config.isExtension,
  }),
  computed: {
    icon() {
      return this.isExtension
        ? `/icons/activity/${this.transactionType}.svg`
        : `/img/icons/activity/${this.transactionType}.svg`
    },
  },
}
</script>

<style>
.tx__icon {
  padding: 1rem;
}

.tx__icon img {
  max-height: 100%;
  max-width: 40px;
  display: block;
}

@media screen and (min-width: 1023px) {
  .tx__icon img {
    max-width: 48px;
  }
}
</style>
