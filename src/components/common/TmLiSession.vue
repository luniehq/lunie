<template>
  <div class="tm-li-session">
    <div class="tm-li-session-icon">
      <i class="material-icons">{{ icon }}</i>
    </div>
    <div class="tm-li-session-text">
      <div class="tm-li-session-title">
        <span>{{ title }}</span>
      </div>
      <div v-if="subtitle" class="tm-li-session-subtitle">
        {{ subtitle }}
      </div>
      <div v-else class="tm-li-session-subtitle">
        <slot name="li-session-subtitle"></slot>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: `tm-li-session`,
  props: {
    icon: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      required: false,
      default: ""
    }
  }
}
</script>

<style>
.tm-li-session {
  display: flex;
  flex-flow: row nowrap;
  user-select: none;
  border-bottom: 2px solid var(--bc-dim);
}

.tm-li-session:last-of-type {
  border-bottom: none;
}

.tm-li-session:hover {
  cursor: pointer;
  background: var(--hover-bg);
}

.tm-li-session-icon {
  height: 5rem;
  flex: 0 0 5rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tm-li-session-icon i {
  font-size: 2rem;
}

.tm-li-session-title {
  color: var(--txt);
  font-size: var(--lg);
  line-height: 1.25;
  margin-bottom: 0.375rem;
}

.tm-li-session:hover .tm-li-session-icon i,
.tm-li-session:hover .tm-li-session-title {
  color: var(--txt);
}

.tm-li-session-text {
  flex: 1;
  display: flex;
  justify-content: center;
  flex-flow: column nowrap;
  padding: 1rem 1rem;
}

.tm-li-session-subtitle {
  color: var(--dim);
  font-size: var(--sm);
}

.tm-li-session[disabled] .tm-li-session-icon,
.tm-li-session[disabled] .tm-li-session-title {
  color: var(--dim, #666) !important;
  user-select: none;
  cursor: not-allowed;
  opacity: 0.333;
}
</style>
