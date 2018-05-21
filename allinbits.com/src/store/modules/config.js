function startDatetime () {
  let date = ''
  if (process.env.NODE_ENV === 'development') date = '2017-04-06 13:00:00'
  if (process.env.NODE_ENV === 'production') date = '2017-04-06 13:00:00'
  return date
}

const state = {
  ENDS_AFTER: 14,
  FUNDRAISER_URL: 'https://fundraiser.cosmos.network',
  SELF_URL: 'https://cosmos.network/',
  TIMEZONE: 'America/Los_Angeles',
  ANNOUNCE_DATETIME: '2017-03-15 07:10:00',
  START_DATETIME: startDatetime(),
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 512,
  CAP_START: 6,              // when cap starts being enforced, after START_DATETIME (in hours)
  CAP_AMOUNT: 0e6          // cap in ATOMs XXX XXX XXX XXX XXX
}

export default {
  state
}
