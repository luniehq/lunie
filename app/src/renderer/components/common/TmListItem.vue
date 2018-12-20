<template>
  <a v-if="dt && href" :href="href" class="tm-li tm-li-link">
    <div class="tm-li-container">
      <div class="tm-li-thumb">
        <template v-if="icon"
          ><i :class="spinClass" class="material-icons">{{ icon }}</i></template
        ><template v-else-if="image"
          ><img :src="image"/></template
        ><template v-else-if="$slots['graphic']">
          <slot name="graphic"></slot>
        </template>
      </div>
      <div class="tm-li-dl">
        <div class="tm-li-dt">{{ dt }}</div>
        <div v-if="$slots['dd']" class="tm-li-dd tm-li-dd-flush">
          <slot name="dd"></slot>
        </div>
        <div v-else class="tm-li-dd">{{ dd }}</div>
      </div>
      <div class="tm-li-icon">
        <i class="material-icons inactive">chevron_right</i
        ><i class="material-icons active">my_location</i>
      </div>
    </div>
  </a>
  <div v-else-if="type === 'field'" class="tm-li tm-li-field">
    <div class="tm-li-container">
      <div class="tm-li-thumb">
        <template v-if="icon"
          ><i :class="spinClass" class="material-icons">{{ icon }}</i></template
        ><template v-else-if="image"
          ><img :src="image"/></template
        ><template v-else-if="$slots['graphic']">
          <slot name="graphic"></slot>
        </template>
      </div>
      <div class="tm-li-label">
        <div class="tm-li-title">{{ title }}</div>
        <div class="tm-li-subtitle">{{ subtitle }}</div>
      </div>
      <div class="tm-li-input"><slot></slot></div>
    </div>
  </div>
  <router-link v-else-if="dt && to && !btn" :to="to" class="tm-li tm-li-link">
    <div class="tm-li-container">
      <div class="tm-li-thumb">
        <template v-if="icon"
          ><i :class="spinClass" class="material-icons">{{ icon }}</i></template
        ><template v-else-if="image"
          ><img :src="image"/></template
        ><template v-else-if="$slots['graphic']">
          <slot name="graphic"></slot>
        </template>
      </div>
      <div class="tm-li-dl">
        <div class="tm-li-dt">{{ dt }}</div>
        <div v-if="$slots['dd']" class="tm-li-dd tm-li-dd-flush">
          <slot name="dd"></slot>
        </div>
        <div v-else class="tm-li-dd">{{ dd }}</div>
      </div>
      <div class="tm-li-icon">
        <i class="material-icons inactive">chevron_right</i
        ><i class="material-icons active">my_location</i>
      </div>
    </div>
  </router-link>
  <router-link v-else-if="btn && to" :to="to" class="tm-li tm-li-link">
    <div class="tm-li-container">
      <div class="tm-li-thumb">
        <template v-if="icon"
          ><i :class="spinClass" class="material-icons">{{ icon }}</i></template
        ><template v-else-if="image"
          ><img :src="image"/></template
        ><template v-else-if="$slots['graphic']">
          <slot name="graphic"></slot>
        </template>
      </div>
      <div class="tm-li-dl">
        <div class="tm-li-dt">{{ dt }}</div>
        <div v-if="$slots['dd']" class="tm-li-dd tm-li-dd-flush">
          <slot name="dd"></slot>
        </div>
        <div v-else class="tm-li-dd">{{ dd }}</div>
      </div>
      <tm-btn
        :value="btn"
        icon="chevron_right"
        icon-pos="right"
        color="primary"
      ></tm-btn>
    </div>
  </router-link>
  <div v-else-if="dt" class="tm-li">
    <div class="tm-li-container">
      <div class="tm-li-thumb">
        <template v-if="icon"
          ><i :class="spinClass" class="material-icons">{{ icon }}</i></template
        ><template v-else-if="image"
          ><img :src="image"/></template
        ><template v-else-if="$slots['graphic']">
          <slot name="graphic"></slot>
        </template>
      </div>
      <div class="tm-li-dl">
        <div class="tm-li-dt">{{ dt }}</div>
        <div v-if="$slots['dd']" class="tm-li-dd tm-li-dd-flush">
          <slot name="dd"></slot>
        </div>
        <div v-else class="tm-li-dd">{{ dd }}</div>
      </div>
    </div>
  </div>
  <a v-else-if="href" :href="href" class="tm-li tm-li-link">
    <div class="tm-li-container">
      <div class="tm-li-thumb">
        <template v-if="icon"
          ><i :class="spinClass" class="material-icons">{{ icon }}</i></template
        ><template v-else-if="image"
          ><img :src="image"/></template
        ><template v-else-if="$slots['graphic']">
          <slot name="graphic"></slot>
        </template>
      </div>
      <div class="tm-li-label">
        <div class="tm-li-title">{{ title }}</div>
        <div class="tm-li-subtitle">{{ subtitle }}</div>
      </div>
      <div class="tm-li-icon">
        <i class="material-icons inactive">chevron_right</i
        ><i class="material-icons active">my_location</i>
      </div>
    </div>
  </a>
  <router-link v-else-if="to" :to="to" class="tm-li tm-li-link">
    <div class="tm-li-container">
      <div class="tm-li-thumb">
        <template v-if="icon"
          ><i :class="spinClass" class="material-icons">{{ icon }}</i></template
        ><template v-else-if="image"
          ><img :src="image"/></template
        ><template v-else-if="$slots['graphic']">
          <slot name="graphic"></slot>
        </template>
      </div>
      <div class="tm-li-label">
        <div class="tm-li-title">{{ title }}</div>
        <div class="tm-li-subtitle">{{ subtitle }}</div>
      </div>
      <div class="tm-li-icon">
        <i class="material-icons inactive">chevron_right</i
        ><i class="material-icons active">my_location</i>
      </div>
    </div>
  </router-link>
  <div v-else-if="title && btn && !to" class="tm-li tm-li-receive">
    <div class="tm-li-container">
      <div class="tm-li-thumb">
        <template v-if="icon"
          ><i :class="spinClass" class="material-icons">{{ icon }}</i></template
        ><template v-else-if="image"
          ><img :src="image"/></template
        ><template v-else-if="$slots['graphic']">
          <slot name="graphic"></slot>
        </template>
      </div>
      <div class="tm-li-label">
        <div class="tm-li-title">{{ title }}</div>
        <div class="tm-li-subtitle">{{ subtitle }}</div>
      </div>
      <slot name="btn-receive"></slot>
    </div>
  </div>
  <div v-else-if="title" class="tm-li">
    <div class="tm-li-container">
      <div class="tm-li-thumb">
        <template v-if="icon"
          ><i :class="spinClass" class="material-icons">{{ icon }}</i></template
        ><template v-else-if="image"
          ><img :src="image"/></template
        ><template v-else-if="$slots['graphic']">
          <slot name="graphic"></slot>
        </template>
      </div>
      <div class="tm-li-label">
        <div class="tm-li-title">{{ title }}</div>
        <div class="tm-li-subtitle">{{ subtitle }}</div>
      </div>
    </div>
  </div>
  <div v-else-if="type === 'image'" class="tm-li">
    <div class="tm-li-container"><slot></slot></div>
  </div>
</template>

<script>
import TmBtn from "./TmBtn.vue"
export default {
  name: `tm-list-item`,
  components: { TmBtn },
  props: {
    type: {
      type: String,
      default: null
    },
    title: {
      type: String,
      default: null
    },
    subtitle: {
      type: String,
      default: null
    },
    image: {
      type: String,
      default: null
    },
    icon: {
      type: String,
      default: null
    },
    to: {
      type: String,
      default: null
    },
    dt: {
      type: String,
      default: null
    },
    dd: {
      type: String,
      default: null
    },
    href: {
      type: String,
      default: null
    },
    btn: {
      type: String,
      default: null
    },
    spin: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    spinClass() {
      if (this.spin) {
        return `fa-spin`
      }
    }
  }
}
</script>

<style>
.tm-li {
  display: block;
  min-height: 3rem;
  position: relative;
  border-bottom: calc(2 * var(--px)) solid var(--bc-dim);
}

.tm-li:last-child {
  border-bottom: calc(2 * var(--px)) solid transparent;
}

.tm-li.tm-li-link:hover,
.tm-li.tm-li-link.router-link-exact-active {
  background: var(--hover-bg);
}

.tm-li.tm-li-link:hover .tm-li-label,
.tm-li.tm-li-link.router-link-exact-active .tm-li-label {
  cursor: pointer;
}

.tm-li.tm-li-link:hover .tm-li-title,
.tm-li.tm-li-link.router-link-exact-active .tm-li-title {
  color: var(--bright);
}

.tm-li.tm-li-link:before {
  content: "";
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  height: 3rem;
  width: var(--bw);
  background: transparent;
  z-index: var(--z-listItem);
}

.tm-li.tm-li-link .tm-li-dt,
.tm-li.tm-li-link .tm-li-dd {
  color: var(--link);
}

.tm-li.router-link-exact-active .tm-li-title {
  color: var(--bright);
}

.tm-li.router-link-exact-active:before {
  background: var(--mc);
}

.tm-li.router-link-exact-active .tm-li-icon i.material-icons {
  color: var(--mc);
}

.tm-li-label .tm-btn,
.tm-li-dl .tm-btn {
  position: absolute;
  top: calc(0.5rem - var(--px));
  right: 1rem;
}

.tm-li-container {
  display: flex;
  flex-flow: row nowrap;
  align-items: center;
  position: relative;
  min-height: calc(3rem - 2 * var(--px));
  max-width: 60rem;
}

.tm-li-thumb,
.tm-li-label,
.tm-li-icon {
  min-height: calc(3rem - 2 * var(--px));
}

.tm-li-thumb:empty {
  display: none;
}

.tm-li-thumb {
  width: calc(3rem - var(--px));
}

.tm-li-thumb i.material-icons,
.tm-li-thumb img {
  display: block;
  width: calc(3rem - var(--px));
  height: calc(3rem - var(--px));
}

.tm-li-thumb i.material-icons {
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--txt);
}

.tm-li-label {
  flex: 1;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 0 1rem;
  flex-flow: column nowrap;
}

.tm-li-label .tm-li-title {
  color: var(--txt);
  line-height: 1.25;
}

.tm-li-label .tm-li-subtitle {
  color: var(--dim);
  font-size: var(--xs);
  line-height: 1.25;
}

.tm-li-field .tm-li-container {
  display: flex;
}

.tm-li-field .tm-li-container .tm-li-label {
  flex: 2;
}

.tm-li-field .tm-li-container .tm-li-input {
  flex: 1;
  display: flex;
}

.tm-li-field .tm-li-container .tm-li-input .tm-btn {
  flex: 1;
}

.tm-li-field .tm-li-container .tm-li-input .tm-select {
  width: 100%;
}

.tm-li-dl {
  flex: 1;
  height: calc(3rem - var(--px));
  padding: 0 0.5rem;
  display: flex;
  align-items: center;
  min-width: 0;
}

.tm-li-dt,
.tm-li-dd {
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  color: var(--txt);
}

.tm-li-dt:empty,
.tm-li-dd:empty {
  display: none;
}

.no-overflow .tm-li-dt,
.no-overflow .tm-li-dd {
  overflow: visible;
}

.tm-li-dt {
  padding-left: 0.5rem;
  padding-right: 0.25rem;
  max-width: width-side;
  flex: 2;
}

.tm-li-dd {
  padding-left: 0.25rem;
  padding-right: 0.5rem;
  flex: 3;
  line-height: 1.25;
}

.tm-li-dd.tm-li-dd-flush {
  padding: 0;
}

.tm-li-dd.tm-li-dd-flush > div {
  display: flex;
  height: calc(3rem - var(--px));
}

a.tm-li-dd {
  color: var(--mc);
  cursor: pointer;
}

.tm-li-icon {
  width: 1.5rem;
  display: flex;
  align-items: center;
  position: absolute;
  top: 0;
  right: 0;
}

.tm-li-icon .inactive {
  display: block;
}

.tm-li-icon .active {
  display: none;
}
</style>
