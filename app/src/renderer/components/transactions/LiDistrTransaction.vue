<template>
  <li-transaction
    :color="`#5effe9`"
    :time="transaction.time"
    :block="transaction.height"
  >
    <template v-if="txType === `cosmos-sdk/MsgWithdrawDelegationReward`">
      <div slot="caption">
        Withdraw rewards
      </div>
      <div slot="details">
        From:&nbsp;<router-link :to="url + '/' + tx.validator_addr">
          {{
            moniker(tx.validator_addr)
          }}
        </router-link>
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgSetWithdrawAddress`">
      <div slot="caption">
        Update withdraw address
      </div>
      <div slot="details">
        To {{ tx.withdraw_address }}
      </div>
    </template>
    <template v-else-if="txType === `cosmos-sdk/MsgWithdrawValidatorCommission`">
      <div slot="caption">
        Withdraw validator commission
      </div>
      <div slot="details">
        From&nbsp;<router-link :to="url + '/' + tx.validator_address">
          {{
            moniker(tx.validator_address)
          }}
        </router-link>
      </div>
    </template>
  </li-transaction>
</template>

<script>
import LiTransaction from "./LiTransaction"
import { pretty, atoms } from "../../scripts/num.js"

/*
 * undelegation tx need a preprocessing, where shares are translated into transaction.balance: {amount, denom}
 */

export default {
  name: `li-distr-transaction`,
  components: { LiTransaction },
  props: {
    transaction: {
      type: Object,
      required: true
    },
    url: {
      type: String,
      required: true
    },
    bondingDenom: {
      type: String,
      required: true
    },
    txType: {
      type: String,
      required: true
    },
    validators: {
      type: Array,
      required: true
    }
  },
  data: () => ({
    atoms,
    pretty
  }),
  computed: {
    tx() {
      return this.transaction.tx.value.msg[0].value
    }
  },
  methods: {
    moniker(validatorAddr) {
      const validator = this.validators.find(
        c => c.operator_address === validatorAddr
      )
      return validator ? validator.description.moniker : validatorAddr
    }
  }
}
</script>

<style>
.li-tx {
	display: flex;
	font-size: sm;
}

.li-tx .tx-icon {
	padding: 0 0.5rem;
	background: var(--app-fg);
	display: flex;
	align-items: center;
	justify-content: center;
}

.li-tx .tx-container {
	flex-direction: column;
	flex-wrap: nowrap;
	padding: 0.5rem 0;
	margin: 0.5rem 0;
	display: flex;
	width: 100%;
	min-width: 0;
}

.li-tx .tx-element {
	padding: 0 2rem 0 1.5rem;
	line-height: 1.5rem;
}

.li-tx .tx-coin .value {
	flex: 0 0 100%;
	font-size: sm;
	color: var(--dim);
}

.li-tx .tx-coin .value::before {
	content: "";
	display: inline;
}

.li-tx .tx-coin .key {
	font-weight: 500;
	font-size: m;
}

.li-tx .tx-coin .value,
.li-tx .tx-coin .key {
	line-height: 1.5rem;
}

.li-tx .tx-address {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	color: var(--dim);
	font-size: sm;
}

.li-tx.li-tx-sent .tx-coin .value::before {
	content: "-";
}

.li-tx.li-tx-received .tx-icon {
	background: var(--app-fg);
}

.li-tx.li-tx-received .tx-coin .value {
	color: success;
}

.li-tx.li-tx-received .tx-coin .value::before {
	content: "+";
}

.li-tx:hover {
	cursor: pointer;
}

@media screen and (min-width: 700px) {
	.li-tx {
		font-size: 0.875rem;
	}

	.li-tx .tx-container {
		flex-direction: row;
	}

	.li-tx .tx-container .tx-coins {
		flex: 0 0 9rem;
		padding: 0;
		min-width: 0;
	}

	.li-tx .tx-container .tx-coins .tx-coin {
		padding: 0 1.5rem 0;
	}

	.li-tx .tx-container .tx-coins .tx-coin .key {
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
}
</style>
