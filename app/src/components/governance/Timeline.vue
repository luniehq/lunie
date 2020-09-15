<template>
  <section>
    <ul class="timeline">
      <li v-for="phase in timeline" :key="phase.title" class="phase">
        <h4>{{ phase.title }}</h4>
        <span class="time">{{ phase.time | moment }}</span>
      </li>
    </ul>
  </section>
</template>

<script>
import moment from "moment"

export default {
  name: `timeline`,
  filters: {
    moment,
  },
  props: {
    timeline: {
      type: Array,
      required: true,
    },
  },
}
</script>

<style scoped>
section {
  padding: 2rem 0;
  margin: 2rem 0;
  border-top: 2px solid var(--bc);
}

.timeline {
  max-width: 1024px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 0 auto;
  width: 100%;
}

.phase {
  font-size: 14px;
  text-align: center;
}

.phase::before {
  display: block;
  content: "";
  width: 1rem;
  height: 1rem;
  border: 2px solid var(--bc);
  border-radius: 50%;
  margin: -2.7rem auto 1rem;
  background: var(--app-bg);
}

.time {
  font-size: 12px;
  color: var(--dim);
}
</style>
