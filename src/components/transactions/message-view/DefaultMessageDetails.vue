<template functional>
  <div>
    <div class="tx__content__caption">
      <p>
        Default
        <b v-if="coin">{{ coin.amount | atoms | prettyLong }}</b>
        <span v-if="coin">{{ coin.denom | viewDenom }}</span>
      </p>
    </div>
    <div class="tx__content__information">
      <!-- From
      <Bech32 :address="sender" />to
      <Bech32 :address="receiver" />-->
      <!-- <span v-if="transaction.memo">&nbsp;- {{ transaction.memo }}</span> -->
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"

export default {
  name: `default-message-details`,
  filters: {
    atoms,
    viewDenom,
    prettyLong
  },
  props: {
    transaction: {
      type: Object,
      required: true
    }
  }
}
