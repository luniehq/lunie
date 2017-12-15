 <template lang='pug'>
footer.app-footer
  .app-footer-container(v-if='connected')
    .afi.afi-success
      i.material-icons.success done
      span {{ lastHeader.chain_id }} (\#{{ lastHeader.height }})
    .afi
      i.material-icons settings_ethernet
      span {{ nodeIP }}
  .app-footer-container(v-else)
    .afi
      i.material-icons.fa-spin rotate_right
      span.afi-connecting Connecting&hellip;
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  name: 'app-footer',
  computed: {
    ...mapGetters(['lastHeader', 'nodeIP', 'connected'])
  }
}
</script>

<style lang="stylus">
@require '~variables'

.app-footer-container
  border-top px solid bc
  height 3rem + px
  display flex
  align-items center
  justify-content space-between
  background app-bg

  color dim

  .afi
    display flex
    align-items center
    padding 0 1rem

    i
      margin-right 0.5rem

    .success
      color success

@media screen and (max-width: 567px)
  .app-footer-container
    display none
</style>
