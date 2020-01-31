async function main() {
  const { version } = await fetch("/version.json").then(res => res.json())

  if (version !== currentVersion) {
    window.reload()
  }
}

main()
