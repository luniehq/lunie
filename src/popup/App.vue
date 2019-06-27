<template>
  <div>
    <SessionRouter ref="router" @close="close" />
  </div>
</template>

<script>
import 'babel-polyfill';
import SessionRouter from 'common/SessionRouter';

// DEMO, uncomment to mimic sign request, replace address with one of your addresses
// chrome.runtime.sendMessage({
//   type: 'SIGN_REQUEST',
//   payload: {
//     stdTx: {},
//     senderAddress: 'cosmos15dmhvlgge2ylgshk8k0chveez8c6qeng226jtl',
//   },
// });

export default {
  components: {
    SessionRouter,
  },
  methods: {
    close() {
      this.$refs.router.goTo('welcome');
    },
  },
  async mounted() {
    const signRequest = await this.$store.dispatch('getSignRequest');
    if (signRequest) {
      this.$refs.router.goTo('approve');
    }
  },
};
</script>
<style>
/* TODO use the same styles from lunie overwriting what is necessary */
@import 'app.css';
</style>
