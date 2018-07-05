 <template lang='pug'>
footer.app-footer: connected-network
</template>

<script>
import ConnectedNetwork from "common/TmConnectedNetwork"
export default {
  name: "app-footer",
  components: { ConnectedNetwork }
}
</script>

<style lang="stylus">
@require '~variables'

@media screen and (min-width: 1024px)
  .app-footer
    display block

.app-footer
  display none
</style>
