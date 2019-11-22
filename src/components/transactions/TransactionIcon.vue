<template>
  <div class="tx__icon">
    <img
      :class="transactionGroup"
      src="~assets/images/cosmos-logo.png"
      alt="cosmic atom token"
    />
  </div>
</template>

<script>
export default {
  name: `transaction-icon`,
  props: {
    transactionGroup: {
      type: String,
      required: true
    }
  }
}
</script>

<style>
@import "../../styles/variables.css";

.tx__icon {
  padding: 1rem;
}

.tx__icon img {
  max-height: 100%;
  max-width: 52px;
  border: 2px solid;
  display: block;
  border-color: grey;
}

.tx__icon img.banking {
  border-color: var(--tx-banking);
}

.tx__icon img.staking {
  border-color: var(--tx-staking);
}

.tx__icon img.governance {
  border-color: var(--tx-governance);
}

.tx__icon img.distribution {
  border-color: var(--tx-distribution);
}
</style>
