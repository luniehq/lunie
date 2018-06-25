 <template lang='pug'>
footer.app-footer: connected-network
</template>

<script>
import ConnectedNetwork from "common/NiConnectedNetwork"
export default {
  name: "app-footer",
  components: { ConnectedNetwork }
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
