<template>
  <!-- <div v-if="stopConnecting"> -->
  <div v-if="true">
    <Bar :show="true" :type="'info'">
      You are currently not connected. <a class="link" @click="reconnect()">Try Reconnecting</a>?
    </Bar>
  </div>
</template>

<script>
import { mapState } from "vuex"
import Bar from "common/Bar"
export default {
  name: `disconnected-bar`,
  components: {
    Bar
  },
  computed: {
    ...mapState({
      stopConnecting: state => state.connection.stopConnecting
    })
  },
  methods: {
    reconnect() {
      console.log("reconnect")
      this.$store.dispatch("reconnect")
    }
  }
}
</script>
