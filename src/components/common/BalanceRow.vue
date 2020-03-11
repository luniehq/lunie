<template>
  <li class="balance-row">
    <div class="total">
      <img class="icon" src="" alt="" />
      <div class="total-values">
        <div class="crypto">
          <span class="crypto-amount">
            {{ cryptoDenom }} {{ cryptoAmount }}
          </span>
        </div>
        <div class="fiat">
          {{ fiatDenom }}&nbsp;{{ fiatSymbol }}{{ fiatAmount }}
        </div>
      </div>
    </div>
    <div class="rewards">
      +{{ rewardsAmount }}
      <div class="fiat">--</div>
    </div>
    <div class="available">
      <span v-show="availableAmount > 0">
        {{ availableAmount }}
      </span>
      <div class="fiat">--</div>
    </div>
    <div class="actions">
      <button><i class="material-icons">send</i></button>
      <button><i class="material-icons">get_app</i></button>
      <button><i class="material-icons">favorite</i></button>
    </div>
  </li>
</template>

<script>
export default {
  name: `balance-row`,
  props: {
    icon: {
      type: String,
      default: ""
    },
    cryptoAmount: {
      type: String,
      default: ""
    },
    cryptoDenom: {
      type: String,
      default: ""
    },
    fiatDenom: {
      type: String,
      default: ""
    },
    fiatSymbol: {
      type: String,
      default: ""
    },
    fiatAmount: {
      type: String,
      default: ""
    },
    rewardsAmount: {
      type: Number,
      default: 0
    },
    rewardsFiatAmount: {
      type: Number,
      default: 0
    },
    availableAmount: {
      type: String,
      default: ""
    }
  },
  data: function() {
    return {
      //   cryptoAmount: "15",
      //   cryptoDenom: "BTC",
      //   fiatDenom: "USD",
      //   fiatSymbol: "$",
      //   fiatAmount: "320,012",
      //   rewardsAmount: "0.4",
      //   rewardsDenom: "0.4",
      //   availableAmount: "1"
    }
  }
}
</script>

<style scoped>
.balance-row {
  display: flex;
  align-items: center;
  box-sizing: border-box;
  flex-grow: 1;
  width: 100%;
  font-size: 16px;
  font-weight: 400;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--bc-dim);
}

.balance-row:hover {
  background: var(--hover-bg);
}

.balance-row:last-child {
  border-bottom: none;
}

.total {
  width: 30%;
  display: flex;
  align-items: center;
}

.total-values {
  display: flex;
  flex-direction: column;
  padding-left: 2rem;
}

.icon {
  width: 1.5rem;
  height: 1.5rem;
  background: var(--app-fg);
  display: block;
  border-radius: 50%;
}

.crypto {
  display: flex;
  align-items: center;
  color: #ffffff;
}

.fiat {
  color: var(--dim);
  font-size: 14px;
}

.rewards {
  width: 23.3%;
  color: var(--success);
}

.available {
  width: 23.3%;
  color: #ffdc82;
}

.actions {
  width: 23.3%;
  display: flex;
  align-items: center;
  box-sizing: border-box;
  flex-grow: 1;
}

.actions button {
  width: 2rem;
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  margin-right: 1rem;
  background: #7a88b8;
  border: none;
  transition: background-color 0.2s;
}

.actions button:hover {
  background: #5c668a;
  cursor: pointer;
}

.actions i {
  color: white;
  font-size: 14px;
}
</style>
