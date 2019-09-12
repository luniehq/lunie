<template>
  <div v-if="stopConnecting">
    <Bar :show="show" :type="'info'">
      You are currently not connected. <a class="link" @click="this.$emit('reconnect', true)">Try Reconnecting</a>?
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
  data: () => ({
    show: true,
    reconnect: false
  }),
  computed: {
    ...mapState({
      stopConnecting: state => state.connection.stopConnecting
    })
  },
  watch: {
    reconnect: function(val) {
      if (val === true) {
        this.$store.dispatch("reconnect")
      }
    }
  }
}
</script>
