<template>
  <div class="li-tx__content__information">
    <!-- From
    <Bech32 :address="transaction.value.from_address" />to
    <Bech32 :address="transaction.value.to_address" />
    <span v-if="transaction.memo">&nbsp;- {{ transaction.memo }}</span>-->
    <component :is="msgTypeComponent"></component>
  </div>
</template>

<script>
import Vue from "vue"
import { atoms as toAtoms, viewDenom } from "../../scripts/num.js"
import Bech32 from "common/Bech32"

// Vue.component("transaction-send-component", {
//   template: `From
//     <Bech32 :address="transaction.value.from_address" />to
//     <Bech32 :address="transaction.value.to_address" />
//     <span v-if="transaction.memo">&nbsp;- {{ transaction.memo }}</span>`
// })

// Vue.component("transaction-send-component", {
//   template: `<div>hello</div>`
// })

const sendTemplate = {
  template: `<div>hello</div>`
}

export default {
  name: `transaction-details`,
  components: {
    Bech32
  },
  filters: {
    toAtoms,
    viewDenom
  },
  props: {
    transaction: {
      type: Object,
      required: true
    }
  },
  computed: {
    coin() {
      if (Array.isArray(this.transaction.value.amount)) {
        return this.transaction.value.amount[0]
      } else {
        return this.transaction.value.amount
      }
    },
    msgTypeComponent: function() {
      return Vue.compile(sendTemplate.template)
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
