const {spawn} = require("child_process")

module.exports.loadPolkadotRewards = async function loadPolkadotRewards({ era, networkId }) {
  return new Promise((resolve, reject) => {
    const rewardsScript = spawn(
      'node',
      [
        '--max-old-space-size=4096',
        '../api/scripts/getOldPolkadotRewardEras.js', // the path is in context of the root directory
        `--currentEra=${era}`,
        `--network=${networkId}`
      ]
    )
    rewardsScript.stdout.pipe(process.stdout)
    rewardsScript.stderr.pipe(process.stderr)

    rewardsScript.on('close', function (code) {
      process.stdout.write(
        'rewardsScript finished with code ' + code + '\n'
      )

      if (code !== 0) {
        reject('getOldPolkadotRewardEras script failed')
      }
      resolve()
    })
  })
}