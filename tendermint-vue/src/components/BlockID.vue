<template>
  <span class="block-id">
    <template v-if="blockID.hash.length > 0">
      <span class="bytes">
        hash: {{ blockID.hash }}
      </span><br/>
      <span class="bytes" color="#888">
        parts: {{ blockID.parts.hash }}
        ({{ blockID.parts.total }} parts)
      </span>
    </template>
    <template v-else>
      Empty BlockID
    </template>
  </span>
</template>

<script>
export default {
  props: ['blockID']
}
</script>
