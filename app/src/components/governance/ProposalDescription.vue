<template>
  <div id="proposal-description" class="proposal-description">
    <div class="description-content-container">
      <section v-if="proposal && proposal.description">
        <h4>Description</h4>
        <div class="description">
          <pre
            v-if="
              proposal.type === `PARAMETER_CHANGE` ||
              proposal.type === `TREASURY`
            "
          >
          {{ proposal.description }}
        </pre
          >
          <p v-else>{{ proposal.description }}</p>
        </div>
      </section>
      <aside
        v-if="supportingLinks && supportingLinks.length > 0"
        class="supporting-links"
      >
        <h4>Supporting Links</h4>
        <ul>
          <li v-for="link in supportingLinks" :key="link.link">
            <a :href="link.link" target="_blank" rel="noopener norefferer">{{
              link.title
            }}</a>
            <i class="material-icons notranslate">link</i>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script>
export default {
  name: `proposal-description`,
  props: {
    proposal: {
      type: Object,
      default: () => {},
    },
    supportingLinks: {
      type: Array,
      default: () => [],
    },
  },
}
</script>

<style scoped>
h4 {
  font-size: 12px;
  padding-bottom: 1rem;
  color: var(--dim);
}

.proposal-description {
  padding: 2rem;
  background: var(--app-fg);
  width: 100%;
}

.description-content-container {
  max-width: 1024px;
  margin: 0 auto;
  width: 100%;
  display: flex;
}

.description {
  max-width: 640px;
  margin: 0 4rem 0 0;
  padding: 0 0 4rem 0;
  white-space: pre-wrap;
  color: var(--txt);
}

.supporting-links {
  width: 100%;
  max-width: 400px;
  padding: 0 0 4rem 0;
  font-size: 14px;
}

.supporting-links li {
  border-bottom: 2px solid var(--bc-dim);
  padding: 1rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.supporting-links i {
  font-size: 18px;
  color: var(--dim);
}

pre {
  font-family: "Menlo", "Consolas", monospace;
  background: var(--app-nav);
  border-radius: 0.25rem;
  color: var(--menu-text);
  font-size: 14px;
  padding: 1rem;
  white-space: pre-line;
  word-break: break-word;
}

@media screen and (max-width: 1023px) {
  .description-content-container {
    flex-direction: column;
  }

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
