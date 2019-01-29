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
      const time = moment(this.time)
      return time.format(
        `${moment().isSame(time, `day`) ? `` : `YYYY/MM/DD `}HH:mm`
      )
    }
  }
}
</script>

<style>
.tm-li-tx {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  border: 1px solid var(--bc-dim);
  background: var(--app-fg);
  width: 100%;
  font-weight: 400;
  font-family: "SF Pro Display";
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
  line-height: 18px;
  font-size: 18px;
  color: var(--bright);
}

.tm-li-tx__content__information,
.tm-li-tx__content__block {
  display: flex;
  width: 100%;
  color: var(--dim);
  line-height: 14px;
  font-size: 14px;
  align-items: baseline;
  font-family: "SF Pro Text";
}

.tm-li-tx__content__information {
  padding-top: 4px;
}

.tm-li-tx__content__block {
  margin-left: auto;
  flex-direction: row;
  align-items: flex-end;
  justify-content: flex-end;
}
</style>
