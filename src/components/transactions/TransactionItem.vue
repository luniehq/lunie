<template>
  <div class="tx">
    <TransactionIcon :transaction-group="transaction.group"></TransactionIcon>
    <TransactionDetails
      :transaction="transaction"
      :validators="validators"
      :address="address"
    />
  </div>
</template>

<script>
import TransactionIcon from "./TransactionIcon"
import TransactionDetails from "./TransactionDetails"

export default {
  name: `tx-item`,
  components: {
    TransactionIcon,
    TransactionDetails
  },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    validators: {
      type: Object,
      required: true
    },
    address: {
      type: String,
      default: null
    }
  }
}
</script>

<style>
.tx {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  border: 1px solid var(--bc-dim);
  background: var(--app-fg);
  width: 100%;
  font-weight: 300;
  position: relative;
}

.tx .copied {
  position: absolute;
  bottom: 0;
}

.tx b {
  font-weight: 500;
}

.tx__icon {
  padding: 12px 0 12px 1rem;
}

.tx__icon img {
  max-height: 100%;
  max-width: 52px;
  border: 2px solid;
  border-radius: 50%;
  display: block;
}

.tx__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem;
}

.tx__content__left,
.tx__content__right {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.tx__content__right {
  text-align: right;
}

.tx__content__information,
.tx__content__information > * {
  display: flex;
  flex-direction: row;
}

.tx__content__information,
.tx__content__right {
  font-size: 14px;
  color: var(--dim);
}

.tx__content__caption {
  line-height: 18px;
  font-size: 18px;
  color: var(--bright);
}

@media screen and (max-width: 767px) {
  .tx__content {
    flex-direction: column;
    text-align: left;
  }

  .tx__content__right {
    text-align: left;
    padding-top: 0.5rem;
  }
}
</style>
