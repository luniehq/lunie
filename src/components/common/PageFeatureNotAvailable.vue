<template>
  <TmPage data-title="Feature Not Available" hide-header>
    <FeatureNotAvailable :feature="feature" />
  </TmPage>
</template>

<script>
import TmPage from "common/TmPage"
import FeatureNotAvailable from "common/FeatureNotAvailable"

export default {
  name: `page-not-available`,
  components: {
    TmPage,
    FeatureNotAvailable
  },
  props: {
    feature: {
      type: String,
      required: true
    }
  }
}
</script>