<template lang="pug">
.ni-session: .ni-session-container
  .ni-session-header
    .ni-session-title Loading&hellip;
  .ni-session-main &nbsp
  .ni-session-footer &nbsp;
  notifications(:notifications='notifications' theme='cosmos')
</template>

<script>
import Notifications from '@nylira/vue-notifications'
import { mapGetters } from 'vuex'
import store from '../../vuex/store'
export default {
  name: 'ni-session-loading',
  components: { Notifications },
  computed: mapGetters(['notifications'])
}
</script>
