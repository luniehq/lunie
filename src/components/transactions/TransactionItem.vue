<template>
  <BankingTransactionProperties>
    <div class="li-tx">
      <TransactionIcon :transaction-type="transaction.type"></TransactionIcon>
      <div class="li-tx__content">
        <div class="li-tx__content__left">
          <TransactionCaption :transaction="transaction"></TransactionCaption>
          <TransactionDetails :transaction="transaction"></TransactionDetails>
        </div>
        <NetworkFeeMetaData
          class="li-tx__content__right"
          :block="transaction.blockNumber"
          :fees="transaction.fees"
          :time="transaction.time"
        ></NetworkFeeMetaData>
      </div>
    </div>
  </BankingTransactionProperties>
</template>

<script>
import { atoms as toAtoms, viewDenom } from "../../scripts/num.js"
import BankingTransactionProperties from "./BankingTransactionProperties"
import TransactionIcon from "./TransactionIcon"
import TransactionCaption from "./TransactionCaption"
import TransactionDetails from "./TransactionDetails"
import NetworkFeeMetaData from "./NetworkFeeMetaData"

export default {
  name: `li-transaction`,
  filters: {
    toAtoms,
    viewDenom
  },
  components: {
    TransactionIcon: TransactionIcon,
    TransactionCaption: TransactionCaption,
    TransactionDetails: TransactionDetails,
    NetworkFeeMetaData: NetworkFeeMetaData,
    BankingTransactionProperties: BankingTransactionProperties
  },
  props: {
    transaction: {
      type: Object,
      required: true
    }
  }
}
</script>

<style>
.li-tx {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  border: 1px solid var(--bc-dim);
  background: var(--app-fg);
  width: 100%;
  font-weight: 300;
  position: relative;
}

.li-tx .copied {
  position: absolute;
  bottom: 0;
}

.li-tx b {
  font-weight: 500;
}

.li-tx__icon {
  padding: 12px 0 12px 1rem;
}

.li-tx__icon img {
  max-height: 100%;
  max-width: 52px;
  border: 2px solid;
  border-radius: 50%;
  display: block;
}

.li-tx__content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 1rem;
}

.li-tx__content__left,
.li-tx__content__right {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.li-tx__content__right {
  text-align: right;
}

.li-tx__content__information,
.li-tx__content__information > * {
  display: flex;
  flex-direction: row;
}

.li-tx__content__information,
.li-tx__content__right {
  font-size: 14px;
  color: var(--dim);
}

.li-tx__content__caption {
  line-height: 18px;
  font-size: 18px;
  color: var(--bright);
}

@media screen and (max-width: 767px) {
  .li-tx__content {
    flex-direction: column;
    text-align: left;
  }

  .li-tx__content__right {
    text-align: left;
    padding-top: 0.5rem;
  }
}
</style>
