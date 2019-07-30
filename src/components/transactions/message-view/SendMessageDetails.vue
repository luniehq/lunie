<template>
  <div>
    <div class="li-tx__content__caption">
      <p class="li-tx__content__caption__title">
        {{ caption }}
        <b>{{ coin.amount | atoms | prettyLong }}</b>
        <span>{{ coin.denom | viewDenom }}</span>
      </p>
    </div>
    <div class="li-tx__content__information">
      <template v-if="other">
        From&nbsp;
        <Bech32 :address="transaction.value.from_address" />&nbsp;to&nbsp;
        <Bech32 :address="transaction.value.to_address" />
      </template>
      <template v-else-if="toYourself">To yourself!</template>
      <template v-else-if="sentFromSessionAddress">
        To&nbsp;
        <Bech32 :address="transaction.value.to_address" />
      </template>
      <template v-else-if="receivedToSessionAddress">
        From&nbsp;
        <Bech32 :address="transaction.value.from_address" />
      </template>
      <span v-if="transaction.memo">&nbsp;- {{ transaction.memo }}</span>
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"
import Bech32 from "common/Bech32"

export default {
  name: `send-message-details`,
  filters: {
    atoms,
    viewDenom,
    prettyLong
  },
  components: {
    Bech32
  },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    coin: {
      type: Object,
      required: true
    },
    sessionAddress: {
      type: String,
      required: false,
      default: null
    }
  },
  computed: {
    toYourself() {
      const value = this.transaction.value
      return (
        value.from_address === this.sessionAddress &&
        value.to_address === this.sessionAddress
      )
    },
    other() {
      const value = this.transaction.value
      return (
        this.sessionAddress !== value.from_address &&
        this.sessionAddress !== value.to_address
      )
    },
    sentFromSessionAddress() {
      const value = this.transaction.value
      return (
        this.sessionAddress === value.from_address &&
        this.sessionAddress !== value.to_address
      )
    },
    receivedToSessionAddress() {
      const value = this.transaction.value
      return (
        this.sessionAddress === value.to_address &&
        this.sessionAddress !== value.from_address
      )
    },
    caption() {
      const value = this.transaction.value
      if (value.from_address == this.sessionAddress) {
        return "Sent"
      } else {
        return "Received"
      }
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
