<template>
  <li class="li-coin">
    <div class="li-coin__icon">
      <img src="~assets/images/cosmos-logo.png" />
    </div>
    <div class="li-coin__content">
      <div class="li-coin__content__left__denom">
        <p class="coin-denom">{{ denomination }}</p>
      </div>
      <div class="li-coin__content__left__amount">
        <p class="coin-amount">{{ amount }}</p>
      </div>
      <router-link :to="{ name: 'send', params: { denom: coin.denom } }">
        <tm-btn
          value="Send"
          class="sendTx-btn"
          icon="chevron_right"
          icon-pos="right"
          color="primary"
        />
      </router-link>
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
  data: () => ({ num }),
  computed: {
    amount() {
      return num.full(parseFloat(this.coin.amount))
    },
    denomination() {
      return (
        this.coin.denom.substring(0, 1).toUpperCase() +
        this.coin.denom.substring(1).toLowerCase()
      )
    }
  }
}
</script>

<style>
.li-coin {
  display: flex;
  align-items: center;
  font-size: var(--m);
  margin-bottom: 0.5rem;
  border: 1px solid var(--bc-dim);
  background: var(--app-fg);
  min-width: 45rem;
}

.li-coin:hover {
  background: var(--hover-bg);
}

.li-coin b {
  font-weight: 500;
}

.li-coin__icon {
  padding: 12px 0 12px 1rem;
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
  width: 100%;
  padding: 1rem;
  font-size: var(--m);
}

.li-coin__content__left {
  display: flex;
  flex-direction: column;
}

.li-coin__content__left__amount,
.li-coin__content__left__denom {
  flex: 0.5;
  vertical-align: middle;
  font-size: var(--lg);
  color: var(--bright);
  font-weight: 500;
}
</style>
