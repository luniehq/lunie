<template>
  <div class="li-tx">
    <div class="li-tx__icon">
      <img :style="{ borderColor: color }" src="~assets/images/cosmos-logo.png" />
    </div>
    <div class="li-tx__content">
      <div class="li-tx__content__left">
        <div class="li-tx__content__caption">
          <p class="li-tx__content__caption__title">
            <slot name="caption" />
          </p>
        </div>
        <div class="li-tx__content__information">
          <slot name="details" />
          <span v-if="memo">&nbsp;- {{ memo }}</span>
        </div>
      </div>
      <TransactionFees
        v-if="!hideMetaData"
        class="li-tx__content__right"
        :block="block"
        :fees="fees"
        :time="time"
      ></TransactionFees>
    </div>
  </div>
</template>

<script>
import { atoms as toAtoms, viewDenom } from "../../scripts/num.js"
import TransactionFees from "./TransactionFees"

export default {
  name: `li-transaction`,
  filters: {
    toAtoms,
    viewDenom
  },
  components: {
    TransactionFees: TransactionFees
  },
  props: {
    color: {
      type: String,
      default: null
    },
    time: {
      type: Date,
      default: null
    },
    block: {
      type: Number,
      required: true
    },
    memo: {
      type: String,
      default: null
    },
    fees: {
      type: Object,
      required: true
    },
    hideMetaData: {
      type: Boolean,
      default: false
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
