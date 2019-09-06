<template>
  <div>
    <div v-if="session.maintenanceBar && show" class="maintenance-bar">
      <i></i>
      <p>
        We've identified problems with our servers that are causing issues for
        some of our users. We apologize for the disruption and are working on a
        fix.
      </p>
      <a class="close">
        <i class="material-icons" @click="close">close</i>
      </a>
    </div>
    <div v-if="maintenance.length > 0" class="maintenance-bar" v-bind:class="maintenance.type">
      <i></i>
      <p>
        {{ maintenance.message }}
      </p>
      <a class="close">
        <i class="material-icons" @click="close">close</i>
      </a>
    </div>
  </div>
</template>

<script>
import { mapState } from "vuex"
import gql from "graphql-tag"
export default {
  name: `maintenance-bar`,
  data: () => ({
    show: true,
    maintenance: []
  }),
  computed: {
    ...mapState([`session`])
  },
  methods: {
    close() {
      this.show = false
    }
  },
  apollo: {
    maintenance: {
      query: gql`
        query Maintenance {
          maintenance {
            message
            type
          }
        }
      `,
      update: result => result.maintenance,
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

@media (max-width: 1024px) {
  .maintenance-bar {
    position: fixed;
    top: auto;
    bottom: 0;
    z-index: 99;
    padding: 0.5rem;
    justify-content: space-around;
  }

  .hide-on-mobile {
    display: none;
  }
}
</style>
