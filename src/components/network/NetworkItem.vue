<template>
  <div class="network-item">
    <div class="network-icon">
      <img :src="network.logo_url" alt="cosmic atom token" />
    </div>
    <div class="network-content">
      <h5 class="network-title">
        {{ network.title }} (<small>{{ network.id }}</small
        >)
      </h5>
      <p class="network-caption">
        {{ network.chain_id }}
      </p>
      <pre>{{ network }}</pre>
    </div>
  </div>
</template>

<script>
export default {
  name: `network-item`,
  props: {
    network: {
      type: Object,
      required: true
    }
  }
}
</script>

<style>
.network-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.5rem;
  border: 1px solid var(--bc-dim);
  background: var(--app-fg);
  width: 100%;
  position: relative;
}

.network-item b {
  font-weight: 500;
}

.network-icon {
  padding: 12px 0 12px 1rem;
}

.network-icon img {
  max-height: 100%;
  max-width: 52px;
  border: 2px solid;
  border-radius: 50%;
  display: block;
  border-color: grey;
}

.network-content {
  display: flex;
  flex-flow: column nowrap;
  justify-content: space-between;
  width: 100%;
  padding: 1rem;
}

.network-title {
  line-height: 18px;
  font-size: 18px;
  color: var(--bright);
}

.network-caption {
  display: flex;
  flex-direction: row;
  font-size: 14px;
  color: var(--dim);
}
</style>
