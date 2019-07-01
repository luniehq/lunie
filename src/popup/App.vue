<template>
  <div>
    <SessionRouter ref="router" @close="close" />
  </div>
</template>

<script>
import 'babel-polyfill';
import SessionRouter from 'common/SessionRouter';

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
