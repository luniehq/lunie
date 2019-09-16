<template>
  <div v-if="maintenance.length > 0">
    <div v-for="(message, index) in maintenance" :key="index">
      <div
        v-if="message.show"
        class="maintenance-bar"
        :class="`${message.type} message-${index + 1}`"
      >
        <i></i>
        <p>
          {{ message.message }}
        </p>
        <a class="close">
          <i class="material-icons close-icon" @click="close(message)">close</i>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag"
export default {
  name: `maintenance-bar`,
  data: () => ({
    maintenance: []
  }),
  methods: {
    close(message) {
      message.show = false
    }
  },
  apollo: {
    maintenance: {
      query: gql`
        query Maintenance {
          maintenance {
            message
            type
            show
          }
        }
      `,
      /* istanbul ignore next */
      update: result => result.maintenance
    }
  }
}
</script>

<style scoped>
.maintenance-bar {
  left: 0;
  right: 0;
  top: 0;
  width: 100%;
  padding: 1rem;
  font-family: var(--sans);
  background-color: #551f38;
  font-size: 14px;
  line-height: 20px;
  font-weight: 400;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: var(--bright);
}

.maintenance-bar.success {
  background-color: var(--success);
}

.maintenance-bar.warning {
  background-color: var(--warning);
}

.maintenance-bar.danger {
  background-color: var(--danger);
}

.maintenance-bar .link {
  text-decoration: underline;
  color: var(--bright);
}

.maintenance-bar .close {
  cursor: pointer;
  height: 1rem;
  width: 1rem;
  color: var(--bright);
}

.close-icon {
  line-height: 18px;
}

@media (max-width: 1024px) {
  .maintenance-bar {
    position: fixed;
    top: auto;
    bottom: 0;
    z-index: 99;
    padding: 0.5rem;
    justify-content: space-around;
  }

  .message-2 {
    bottom: 36px;
  }

  .message-3 {
    bottom: 72px;
  }

  .message-4 {
    bottom: 108px;
  }

  .message-5 {
    bottom: 144px;
  }

  .hide-on-mobile {
    display: none;
  }
}
</style>
