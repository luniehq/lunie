<template>
  <span class="parts-header">
    <template v-if="parts != null && parts.hash != null && parts.hash.length > 0">
      <span class="bytes">
        {{ parts.hash }}
      </span>
      <span class="bytes">
          ({{ parts.total }} parts)
      </span>
    </template>
    <template v-else>
      No Parts Header
    </template>
  </span>
</template>

<script>
export default {
  props: ['parts']
}
</script>
