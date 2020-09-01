<template>
  <div class="proposal-description">
    <section>
      <h4>Description</h4>
      <div class="description">
        <pre v-if="type === `PARAMETER_CHANGE`">
          {{ description }}
        </pre>
        <p v-else>{{ description }}</p>
      </div>
    </section>
    <aside class="supporting-links">
      <h4>Supporting Links</h4>
      <ul>
        <li v-for="link in supportingLinks" :key="link.url">
          <a href="link.url">{{ link.title }}</a>
        </li>
      </ul>
    </aside>
  </div>
</template>

<script>
export default {
  name: `proposal-description`,
  props: {
    description: {
      type: String,
      required: true,
    },
    supportingLinks: {
      type: Array,
      default: () => [],
    },
    type: {
      type: String,
      required: true,
    },
  },
}
</script>

<style scoped>
h4 {
  font-size: 12px;
  padding-bottom: 1rem;
}

.proposal-description {
  padding: 2rem 0;
  display: flex;
}

.description {
  max-width: 640px;
  margin: 0 4rem 0 0;
  padding: 0 0 4rem 0;
  white-space: pre-wrap;
}

.supporting-links {
  width: 100%;
  max-width: 400px;
  padding: 0 0 4rem 0;
}

pre {
  font-family: "Menlo", "Consolas", monospace;
  background: var(--app-nav);
  border-radius: 0.25rem;
  color: var(--menu-text);
  font-size: 14px;
  padding: 1rem;
  white-space: pre-line;
}

@media screen and (max-width: 1024px) {
  .proposal-description {
    display: block;
    word-break: break-word;
    text-align: justify;
  }

  .description {
    margin: 0;
  }
}
</style>
