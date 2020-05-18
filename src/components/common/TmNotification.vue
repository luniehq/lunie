<template>
  <div v-if="active" :class="cssClass" @click="deactivate()">
    <header>
      <div v-if="icon" class="icon">
        <i class="material-icons notranslate">{{ icon }}</i>
      </div>
      <div v-if="title" class="title">
        {{ title }}
      </div>
      <menu>
        <div v-if="time" class="time">
          {{ fromNow }}
        </div>
        <i class="close material-icons">close</i>
      </menu>
    </header>
    <div class="body">
      {{ body }}
    </div>
  </div>
</template>

<script>
import moment from "moment"
export default {
  name: `TmNotification`,
  props: {
    type: {
      type: String,
      default: null,
    },
    layout: {
      type: String,
      default: null,
    },
    icon: {
      type: String,
      default: null,
    },
    time: {
      type: Number,
      required: true,
    },
    title: {
      type: String,
      default: null,
    },
    body: {
      type: String,
      required: true,
    },
  },
  data: () => ({
    duration: 5000,
    active: true,
  }),
  computed: {
    fromNow() {
      return moment(this.time).fromNow()
    },
    cssClass() {
      let value = `tm-notification`
      if (this.type) value += ` tm-notification-${this.type}`
      return value
    },
  },
  mounted() {
    this.setDeactivation()
  },
  methods: {
    deactivate() {
      this.active = false
    },
    setDeactivation() {
      if (!this.layout || this.layout === `banner`) {
        // notification active duration is 5 seconds - (time since creation)
        const activeDuration = this.duration - (Date.now() - this.time)

        // disable visibility if it's an old notification
        if (activeDuration < 0) {
          this.active = false
          return
        }

        // otherwise self destruct after duration
        setTimeout(() => this.deactivate(), activeDuration)
      }
    },
  },
}
</script>

<style>
.tm-notification {
  background: var(--app-nav);
  font-size: 0.75rem;
  cursor: pointer;
  user-select: none;
  margin: 0.5rem 0.5rem 0;
  border-radius: 0.25rem;
  border: 1px solid var(--bc-dim);
}

.tm-notification header {
  display: flex;
  align-items: center;
  padding: 0 0.375rem;
  height: 2em;
  border-radius: 0.25rem 0.25rem 0 0;
  background: var(--success);
}

.tm-notification.tm-notification-warning header {
  background: var(--warning);
}

.tm-notification.tm-notification-error header {
  background: var(--danger);
}

.tm-notification header .icon,
.tm-notification header .title {
  color: var(--bright);
}

.tm-notification header .icon {
  width: 1rem;
  display: flex;
  align-items: center;
  margin-right: 0.5rem;
}

.tm-notification header .title {
  flex: 1;
  font-weight: 500;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  padding-right: 0.375rem;
}

.tm-notification header menu {
  color: rgba(255, 255, 255, 0.67);
  font-size: 0.75rem;
}

.tm-notification header menu .close {
  display: none;
}

.tm-notification .body {
  padding: 0.375rem;
  color: var(--txt);
}

.tm-notification:hover menu .time {
  display: none;
}

.tm-notification:hover menu .close {
  display: block;
  cursor: pointer;
}

@media screen and (min-width: 360px) {
  .tm-notification {
    font-size: 0.875rem;
    margin: 0.625rem 0.625rem 0;
  }

  .tm-notification header {
    padding: 0 0.5rem;
  }

  .tm-notification .body {
    padding: 0 0.5rem;
  }
}

@media screen and (min-width: 400px) {
  .tm-notification {
    margin: 0.75rem 0.75rem 0;
  }

  .tm-notification header {
    padding: 0 0.75rem;
  }

  .tm-notification .body {
    padding: 0.75rem;
  }
}

@media screen and (min-width: 720px) {
  .tm-notification {
    margin: 1rem 1rem 0;
  }
}
</style>
