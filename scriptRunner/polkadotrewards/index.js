const {scheduleJob} = require('../executor')

module.exports = async function (req, res) {
  const {era} = req.body;
  try {
      scheduleJob("polkadotRewards", {era})
      // we don't wait for the job to end because of timeouts
      res.status(200)
      res.send()
      return
  } catch (error) {
    res.status(500)
    res.send(error.message)
    return
  }
}
exports.handler = async function(event, context, callback) {
    const authenticationToken = event.headers.Authentication
    if (authenticationToken !== process.env.AUTHENTICATION_TOKEN) {
        return callback(null, {
          statusCode: 403
        });
    }

    if(event.httpMethod === 'POST'  && event.path === '/polkadotrewards') {
        const {era} = JSON.parse(event.body);
        try {
            await scheduleJob("polkadotRewards", {era})
            return callback(null, {
              statusCode: 200
            });
        } catch (error) {
          return callback(null, {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message
            })
          });
        }
    }
    
    return callback(null, {
      statusCode: 400
    });
  }