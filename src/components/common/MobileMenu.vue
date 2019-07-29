<template>
  <v-footer :padless="true" :fixed="true">
    <v-card flat tile width="100%" class="text-center">
      <v-card-text>
        <v-btn
          v-for="link in links"
          :key="link.icon"
          icon
          exact
          small
          :to="link.route"
        >
          <v-icon size="24px">{{ link.icon }}</v-icon>
          <!-- <span>{{ link.title }}</span> -->
        </v-btn>
      </v-card-text>
    </v-card>
  </v-footer>
</template>

<script>
export default {
  name: `mobile-menu`,
  props: {
    links: {
      type: Array,
      required: true
    }
  }
}
</script>

<style scoped>
.v-footer {
  background: var(--app-bg);
  text-align: center;
}
.v-card__text {
  padding: 0.5rem;
}
.v-btn:not(:last-child) {
  margin-right: 1.5rem;
}
</style>
