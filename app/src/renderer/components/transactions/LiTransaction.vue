<template>
  <div class="li-tx">
    <div class="li-tx__icon">
      <img
        :style="{ borderColor: color }"
        src="~assets/images/cosmos-logo.png"
      >
    </div>
    <div class="li-tx__content">
      <div class="li-tx__content__left">
        <div class="li-tx__content__caption">
          <p class="li-tx__content__caption__title">
            <slot name="caption" />
          </p>
        </div>
        <div class="li-tx__content__information">
          <slot name="details" />
        </div>
      </div>
      <div class="li-tx__content__block">
        <router-link
          :to="{ name: `block`, params: { height: block } }"
        >
          Block #{{ block }}&nbsp;
        </router-link>@ {{ date }}
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment"

export default {
  name: `li-transaction`,
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
    date({ time } = this) {
      const momentTime = moment(time)
      return momentTime.format(
        `${moment().isSame(momentTime, `day`) ? `` : `MMM Do YYYY `}HH:mm:ss`
      )
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
}

.li-tx:hover {
  background: var(--hover-bg);
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
  flex-direction: row;
  width: 100%;
  padding: 1rem;
}

.li-tx__content__left,
.li-tx__content__action,
.li-tx__content__block {
  display: flex;
  flex-direction: column;
}

.li-tx__content__left {
  flex: 0.5;
}

.li-tx__content__action {
  flex: 0.3;
  justify-content: center;
  padding: 0 1rem;
  border-left: 1px solid var(--bc-dim);
}

.li-tx__content__action button {
  width: 9rem;
}

.li-tx__content__block {
  flex: 0.3;
  margin-left: auto;
  flex-direction: row;
  align-items: flex-end;
  justify-content: flex-end;
}

.li-tx__content__caption {
  line-height: 18px;
  font-size: 18px;
  color: var(--bright);
}

.li-tx__content__information,
.li-tx__content__block {
  display: flex;
  width: 100%;
  color: var(--dim);
  line-height: 14px;
  font-size: 14px;
  align-items: baseline;
}

.li-tx__content__information {
  padding-top: 4px;
}
</style>
