<template lang='pug'>
section.tm-part
  .tm-part-container
    header.tm-part-header(v-if="$slots['title'] || title")
      .tm-part-header-container
        .tm-part-title.h5
          template(v-if='title') {{ title }}
          slot(name='title', v-else='')
        menu.tm-part-menu
          slot(name='menu')
    main.tm-part-main: slot
</template>

<script>
export default {
  name: "tm-part",
  props: ["title"]
}
</script>
