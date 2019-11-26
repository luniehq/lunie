<template>
  <div class="tx__icon">
    <img :class="transactionGroup" :src="icon" :alt="transactionType" />
  </div>
</template>

<script>
export default {
  name: `transaction-icon`,
  props: {
    transactionGroup: {
      type: String,
      required: true
    },
    transactionType: {
      type: String,
      required: true
    }
  },
  computed: {
    icon() {
      if (this.transactionType.indexOf(` `) !== -1) {
        if (this.transactionType === `Update withdraw address`) {
          return `/img/icons/activity/Withdrawal.svg`
        } else {
          return `/img/icons/activity/${this.transactionType.substr(
            0,
            this.transactionType.indexOf(` `)
          )}.svg`
        }
      } else {
        return `/img/icons/activity/${this.transactionType}.svg`
      }
    }
  }
}
</script>

<style>
@import "../../styles/variables.css";

.tx__icon {
  padding: 1rem 0 1rem 1rem;
}

.tx__icon img {
  max-height: 100%;
  max-width: 52px;
  display: block;
}
</style>
