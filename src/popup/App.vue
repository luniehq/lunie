<template>
  <div>
    <SessionRouter ref="router" @close="close" />
  </div>
</template>

<script>
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
};
</script>
<style>
/* TODO use the same styles from lunie overwriting what is necessary */
@import 'app.css';
</style>
