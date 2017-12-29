<template lang='pug'>
footer.app-footer
  connectivity
</template>

<script>
import Connectivity from 'common/NiConnectivity'
export default {
  name: 'app-footer',
  components: {
    Connectivity
  }
}
</script>

<style lang="stylus">
@require '~variables'

.app-footer
  display none

@media screen and (min-width: 1024px)
  .app-footer
    display block
</style>
