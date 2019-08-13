<template>
  <div class="li-tx">
    <div class="li-tx__icon">
      <img
        :style="{ borderColor: color }"
        src="~assets/images/cosmos-logo.png"
        alt="cosmic atom token"
      />
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
          <span v-if="memo">&nbsp;- {{ memo }}</span>
        </div>
      </div>
      <div v-if="!hideMetaData" class="li-tx__content__right">
        <div>
          Network Fee:&nbsp;
          <b>{{ fees.amount | toAtoms }}</b>
          <span>{{ fees.denom | viewDenom }}</span>
        </div>
        <div class="li-tx__content__block">
          <router-link :to="{ name: `block`, params: { height: block } }">Block #{{ block }}&nbsp;</router-link>
          @&nbsp;{{ date }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import moment from "moment"
import { atoms as toAtoms, viewDenom } from "../../scripts/num.js"

export default {
  name: `li-transaction`,
  filters: {
    toAtoms,
    viewDenom
  },
  props: {
    color: {
      type: String,
      default: null
    },
    time: {
      type: String,
      default: null
    },
    block: {
      type: Number,
      required: true
    },
    memo: {
      type: String,
      default: null
    },
    fees: {
      type: Object,
      required: true
    },
    hideMetaData: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    date({ time } = this) {
      const momentTime = moment(time)
      return momentTime.format(
        `${moment().isSame(momentTime, `day`) ? `` : `MMMM Do YYYY `}HH:mm`
      )
    }
  }
}
</script>

<style>
.li-tx {
  display: flex;
  align-items: center;
  border: 1px solid var(--bc-dim);
  border-radius: 0.25rem;
  background: var(--app-fg);
  width: 100%;
  position: relative;
  max-width: 800px;
  margin: 0 auto 0.5rem;
  white-space: nowrap;
}

.li-tx .copied {
  position: absolute;
  bottom: 0;
}

.li-tx b {
  font-weight: 500;
}

.li-tx__icon {
  padding: 0 0 0 1rem;
}

.li-tx__icon img {
  max-height: 100%;
  max-width: 2rem;
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
  .li-tx__icon {
    display: none;
  }

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
