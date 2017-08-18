<template lang="pug">
.ni-page
  page-header(:icon='icon')
    div(slot='title') {{ title }}
    div(v-if='subtitle' slot='subtitle') {{ subtitle }}
  main.ni-page-main: slot
  page-footer
</template>

<script>
import PageHeader from './NiPageHeader'
import PageFooter from './NiPageFooter'
export default {
  name: 'ni-page',
  props: ['title', 'subtitle', 'icon'],
  components: {
    PageHeader,
    PageFooter
  }
}
</script>
