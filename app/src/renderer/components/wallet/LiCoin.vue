<template>
  <li :id="`li-coin--` + denomination.toLowerCase()" class="li-coin">
    <div class="li-coin__icon">
      <img src="~assets/images/cosmos-logo.png">
    </div>
    <div class="li-coin__content">
      <div class="li-coin__content-left">
        <p class="coin-denom">
          {{ denomination }}
        </p>
        <p class="coin-amount">
          {{ amount }}
        </p>
      </div>
      <!-- here we use the unconverted denom, as the SendModal checks for balances based on the actual denom -->
      <tm-btn
        value="Send"
        color="primary"
        @click.native="$emit(`show-modal`, coin.denom)"
      />
    </div>
  </li>
</template>

<script>
import num from "scripts/num"
import TmBtn from "common/TmBtn"
export default {
  name: `li-coin`,
  components: {
    TmBtn
  },
  props: {
    coin: {
      type: Object,
      required: true
    }
  },
  computed: {
    viewCoin() {
      return num.viewCoin(this.coin)
    },
    amount() {
      return this.viewCoin.amount
    },
    denomination() {
      return this.viewCoin.denom
    }
  }
}
</script>

<style scoped>
.li-coin {
  display: flex;
  align-items: center;
  font-size: var(--m);
  margin-bottom: 0.5rem;
  border: 1px solid var(--bc-dim);
  background: var(--app-fg);
  padding: 1rem;
}

.li-coin:hover {
  background: var(--hover-bg);
}

.li-coin__icon img {
  max-height: 100%;
  max-width: 52px;
  border: 0.5px solid;
  border-radius: 50%;
  display: block;
}

.li-coin__content {
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  padding-left: 1rem;
  font-size: var(--m);
}

.li-coin__content__left {
  display: flex;
  flex-direction: column;
}

.coin-denom {
  font-size: var(--lg);
  color: var(--bright);
  font-weight: 500;
}

@media screen and (max-width: 425px) {
  .li-coin__icon {
    display: none;
  }

  .li-coin__content-left {
    padding-bottom: 0.5rem;
  }
}
</style>
