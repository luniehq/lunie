<template>
  <div class="tm-li-session">
    <div class="tm-li-session-icon">
      <i class="material-icons circle">{{ icon }}</i>
    </div>
    <div class="tm-li-session-text">
      <div class="tm-li-session-title">
        <span>{{ title }}</span>
      </div>
      <div class="tm-li-session-subtitle">
        <span>{{ subtitle }}</span>
      </div>
    </div>
    <div class="tm-li-session-icon">
      <i class="material-icons">arrow_forward</i>
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
      required: false
    }
  }
}
</script>

<style scoped>
.tm-li-session {
  display: flex;
  padding: 1rem;
  border-top: 2px solid var(--bc);
  border-left: 2px solid var(--bc);
  border-right: 2px solid var(--bc);
  background-color: var(--app-nav-light);
}

.tm-li-session:first-child {
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
}

.tm-li-session:last-of-type {
  border-bottom: 2px solid var(--bc);
  border-bottom-left-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
}

.tm-li-session:hover {
  cursor: pointer;
  background: var(--hover-bg);
}

.tm-li-session-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.tm-li-session-icon i {
  font-size: 1.25rem;
}

.tm-li-session-title {
  color: var(--bright);
  font-size: var(--h4);
  font-weight: 400;
}

.tm-li-session-text {
  flex: 1;
  display: flex;
  justify-content: center;
  flex-flow: column nowrap;
  padding: 0 1rem;
}

.tm-li-session-subtitle {
  color: var(--dim);
  font-size: var(--sm);
}

/* .tm-li-session[disabled] .tm-li-session-icon,
.tm-li-session[disabled] .tm-li-session-title {
  color: var(--dim, #666) !important;
  user-select: none;
  cursor: not-allowed;
  opacity: 0.333;
} */

.material-icons.circle {
  border: 2px solid var(--dim);
  border-radius: 50%;
  padding: 0.5rem;
  max-width: 39px;
  height: 39px;
}
</style>
