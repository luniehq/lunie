// when refetching always force to load from the network
export default apolloQuery => {
  apolloQuery.setOptions({
    fetchPolicy: "network-only"
  })
  apolloQuery.refetch()
  apolloQuery.setOptions({
    fetchPolicy: "cache-and-network"
  })
}
