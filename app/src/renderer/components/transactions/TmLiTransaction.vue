<template>
  <div class="tm-li-tx">
    <div class="tm-li-tx__icon">
      <img
        :style="{ borderColor: color }"
        src="~assets/images/cosmos-logo.png"
      />
    </div>
    <div class="tm-li-tx__content">
      <div class="tm-li-tx__content__left">
        <div class="tm-li-tx__content__caption">
          <p class="tm-li-tx__content__caption__title">
            <slot name="caption"></slot>
          </p>
        </div>
        <div class="tm-li-tx__content__information">
          <slot name="details"></slot>
        </div>
      </div>
      <div class="tm-li-tx__content__block">
        <a :href="'https://explorecosmos.network/blocks/' + block"
          >Block #{{ block }}&nbsp;</a
        >@ {{ date }}
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment"

export default {
  name: `tm-li-transaction`,
  props: {
    color: {
      type: String,
      default: null
    },
    time: {
      type: Number,
      default: null
    },
    block: {
      type: [String, Number], // for convenience we allow strings and numbers
      required: true
    }
  },
  computed: {
    date() {
      return moment(this.time).format(`h:mm a`)
    }
  }
}
</script>

<style>
.tm-li-tx {
  display: flex;
  align-items: center;
  font-size: m;
  margin-bottom: 0.5rem;
  border: 1px solid var(--bc-dim);
  background: var(--app-fg);
  min-width: 45rem;
}

.tm-li-tx:hover {
  background: var(--hover-bg);
}

.tm-li-tx b {
  font-weight: 500;
}

.tm-li-tx__icon {
  padding: 12px 0 12px 1rem;
}

.tm-li-tx__icon img {
  max-height: 100%;
  max-width: 52px;
  border: 2px solid;
  border-radius: 50%;
  display: block;
}

.tm-li-tx__content {
  display: flex;
  flex-direction: row;
  width: 100%;
  padding: 1rem;
  font-size: m;
}

.tm-li-tx__content__left,
.tm-li-tx__content__action,
.tm-li-tx__content__block {
  display: flex;
  flex-direction: column;
}

.tm-li-tx__content__left {
  flex: 0.5;
}

.tm-li-tx__content__action {
  flex: 0.3;
  justify-content: center;
  padding: 0 1rem;
  border-left: 1px solid var(--bc-dim);
}

.tm-li-tx__content__action button {
  width: 9rem;
}

.tm-li-tx__content__block {
  flex: 0.3;
}

.tm-li-tx__content__caption {
  line-height: lg;
  font-size: lg;
  color: var(--bright);
}

.tm-li-tx__content__information,
.tm-li-tx__content__block {
  display: flex;
  width: 100%;
  font-size: 14px;
  color: var(--dim);
  align-items: baseline;
}

.tm-li-tx__content__information {
  padding-top: 3px;
}

.tm-li-tx__content__block {
  margin-left: auto;
  flex-direction: row;
  align-items: flex-end;
  justify-content: flex-end;
}
</style>
