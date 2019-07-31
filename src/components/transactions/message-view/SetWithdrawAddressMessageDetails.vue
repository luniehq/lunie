<template>
  <div>
    <div class="tx__content__caption">
      <p class="tx__content__caption__title">
        Update withdraw address
      </p>
    </div>
    <div class="tx__content__information">
      To {{ transaction.value.withdraw_address }}
    </div>
  </div>
</template>

<script>
import { atoms, viewDenom, prettyLong } from "scripts/num.js"

export default {
  name: `set-withdraw-address-message-details`,
  filters: {
    atoms,
    viewDenom,
    prettyLong
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
    validators: {
      type: Object,
      required: true
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
