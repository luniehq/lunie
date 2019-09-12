<template>
  <!-- <div v-if="stopConnecting"> -->
  <div v-if="true">
    <Bar :show="show" :type="'info'" @click="reconnect()">
      You are currently not connected. <a class="link" @click="console.log("reconnect") $emit('click')">Try Reconnecting</a>?
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
/*   watch: {
    reconnect: function(val) {
      console.log(reconnect")
      if (val === true) {
        this.$store.dispatch("reconnect")
      }
    }
  } */
  methods: {
    reconnect() {
      console.log("reconnect")
      //this.$store.dispatch("reconnect")
    }
  }
}
</script>
