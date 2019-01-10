<template>
  <transition name="slide-fade">
    <div v-click-outside="close" class="action-modal">
      <div class="action-modal-header">
        <img
          class="icon action-modal-atom"
          src="~assets/images/cosmos-logo.png"
        /><span class="action-modal-title">{{ title }}</span>
        <div
          id="closeBtn"
          class="action-modal-icon action-modal-close"
          @click="close"
        >
          <i class="material-icons">close</i>
        </div>
      </div>
      <div class="action-modal-form"><slot></slot></div>
      <div class="action-modal-footer">
        <slot name="action-modal-footer"></slot>
        <p
          v-if="submissionError"
          class="tm-form-msg sm tm-form-msg--error submission-error"
        >
          {{ submissionError }}
        </p>
      </div>
    </div>
  </transition>
</template>

<script>
import ClickOutside from "vue-click-outside"

export default {
  name: `action-modal`,
  directives: {
    ClickOutside
  },
  props: {
    title: {
      type: String,
      required: true
    },
    submissionError: {
      type: String,
      required: false
    }
  },
  methods: {
    close() {
      this.$emit(`close-action-modal`)
    }
  }
}
</script>

<style>
.action-modal {
  background: var(--app-nav);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  right: 2rem;
  padding: 3rem;
  position: fixed;
  bottom: 0;
  width: 100%;
  max-width: 664px;
  z-index: var(--z-modal);
  border-top-left-radius: 0.25rem;
  border-top-right-radius: 0.25rem;
  box-shadow: 0 2px 8px rgba(200, 200, 200, 0.1);
}

.action-modal-header {
  align-items: center;
  display: flex;
  padding-bottom: 2rem;
}

.action-modal-atom {
  height: 3rem;
  width: 3rem;
}

.action-modal-title {
  flex: 1;
  font-size: var(--h3);
  font-weight: 500;
  color: var(--bright);
  padding-left: 1rem;
}

.action-modal-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.action-modal-icon i {
  font-size: var(--lg);
}

.action-modal-icon.action-modal-close {
  cursor: pointer;
}

.action-modal-icon.action-modal-close:hover i {
  color: var(--link);
}

.action-modal-form .tm-form-group {
  display: block;
  padding: 0.5rem 0 1rem;
}

.action-modal-footer {
  display: flex;
  justify-content: flex-end;
  padding: 2rem 0 0;
}

.submission-error {
  position: absolute;
  right: 3rem;
  bottom: 1rem;
}

/* Enter and leave animations can use different */
/* durations and timing functions.              */
.slide-fade-enter-active {
  transition: all 0.1s ease;
}
.slide-fade-leave-active {
  transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active below version 2.1.8 */ {
  transform: translateX(2rem);
  opacity: 0;
}
</style>
