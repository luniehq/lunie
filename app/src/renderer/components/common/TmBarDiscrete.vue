<template>
  <div class="tm-bar-discrete">
    <div class="tm-bar-discrete__container">
      <div class="tm-bar-discrete__edge"></div>
      <div
        v-for="(node, index) in nodes"
        :key="index"
        :class="classObject(index)"
        class="tm-bar-discrete__node"
        @click="clickFn(index)"
      ></div>
    </div>
  </div>
</template>

<script>
export default {
  name: `TmBarDiscrete`,
  props: {
    nodes: {
      type: Array,
      required: true
    },
    active: {
      type: Number,
      default: 0
    },
    "click-fn": {
      type: Function,
      required: true
    }
  },
  methods: {
    classObject(index) {
      return {
        "tm-bar-discrete__node--active": index === parseInt(this.active)
      }
    }
  }
}
</script>

<style>
.tm-bar-discrete {
  padding: 0 3rem;
  width: 100%;
  max-width: 24rem;
  margin: 0 auto;
}

.tm-bar-discrete__container {
  height: 2rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
}

.tm-bar-discrete__edge {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  content: "";
  height: 2px;
  background: var(--bc);
}

.tm-bar-discrete__node {
  position: relative;
  z-index: 2;
  width: 1rem;
  height: 1rem;
  border: 0.125rem solid var(--dim);
  border-radius: 0.5rem;
  background: var(--app-bg);
}

.tm-bar-discrete__node:hover {
  cursor: pointer;
  border-color: var(--hover);
}

.tm-bar-discrete__node:before {
  content: "";
  position: absolute;
  top: 0.125rem;
  left: 0.125rem;
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 0.5rem;
  background: transparent;
}

.tm-bar-discrete__node:hover:before {
  background: var(--hover);
}

.tm-bar-discrete__node.tm-bar-discrete__node--active {
  border-color: var(--mc);
}

.tm-bar-discrete__node.tm-bar-discrete__node--active:before {
  background: var(--mc);
}
</style>
