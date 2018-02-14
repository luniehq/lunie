<template lang="pug">
data-msg(icon="sentiment_very_dissatisfied")
  div(slot="title") Aw shucks!
  div(slot="subtitle") Even though you're connected a full node, we can't display this data for you right now. Please try again later or #[a(href="https://github.com/cosmos/voyager/issues") file a bug report]. Apologies!
</template>

<script>
import DataMsg from 'common/NiDataMsg'
export default {
  name: 'ni-data-error',
  components: {
    DataMsg
  }
}
</script>
