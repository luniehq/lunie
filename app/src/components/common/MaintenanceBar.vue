<template>
  <div>
    <div v-for="message in maintenance" :key="message.id">
      <Bar
        :bar-type="message.type"
        :show="message.show"
        :link="message.link"
        :link-caption="message.linkCaption"
        >{{ message.message }}
      </Bar>
    </div>
  </div>
</template>

<script>
import gql from "graphql-tag"
import Bar from "common/Bar"
export default {
  name: `maintenance-bar`,
  components: {
    Bar,
  },
  data: () => ({
    maintenance: [],
  }),
  apollo: {
    maintenance: {
      query: gql`
        query Maintenance {
          maintenance {
            message
            link
            linkCaption
            type
            show
          }
        }
      `,
      update: (result) => result.maintenance,
    },
  },
}
</script>
