export function getCommits(store, name) {
  return store.commit.mock.calls
    .filter(c => c[0] === name)
    .map(c => JSON.parse(JSON.stringify(c[1])))
}

export function getDispatches(store, name) {
  return store.dispatch.mock.calls
    .filter(c => c[0] === name)
    .map(c => JSON.parse(JSON.stringify(c[1])))
}
