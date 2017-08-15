import moment from 'moment'

export default function (date) {
  if (date === 0) {
    return 'N/A'
  } else {
    return moment(date, 'x').fromNow()
  }
}
