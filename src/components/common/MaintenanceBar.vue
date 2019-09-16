<template>
  <div>
    <div v-for="message in maintenance" :key="message.id">
      <Bar :bar-type="message.type" :show="message.show">{{ message.message }}</Bar>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag"
import Bar from "common/Bar"
export default {
  name: `maintenance-bar`,
  components: {
    Bar
  },
  data: () => ({
    maintenance: []
  }),
  apollo: {
    maintenance: {
      query: gql`
        query Maintenance {
          maintenance {
            message
            type
            show
          }
        }
      `,
      update: result => result.maintenance
    }
  }
}
</script>
