<template>
  <div class="tx__icon">
    <img :class="transactionGroup" src="~assets/images/cosmos-logo.png" />
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
.tx__icon {
  padding: 12px 0 12px 1rem;
}

.tx__icon img {
  max-height: 100%;
  max-width: 52px;
  border: 2px solid;
  border-radius: 50%;
  display: block;
  border-color: grey;
}

.tx__icon img.banking {
  border-color: #ed553b;
}

.tx__icon img.staking {
  border-color: #47ab6c;
}

.tx__icon img.governance {
  border-color: #15cfcc;
}

.tx__icon img.distribution {
  border-color: #f2b134;
}
</style>
