const fs = require('fs');

const dockerSecret = {};

dockerSecret.read = secretName => {
  try {
    if (fs.existsSync(`/run/secrets/${secretName}`)) {
      return fs.readFileSync(`/run/secrets/${secretName}`, 'utf8');
    }
    return false;
  } catch (err) {
    if (err.code !== 'ENOENT') {
      console.error(`An error occurred while trying to read the secret: ${secretName}. Err: ${err}`);
    } else {
      console.debug(`Could not find the secret, probably not running in swarm mode: ${secretName}. Err: ${err}`);
    }
    return false;
  }
};

module.exports = dockerSecret;