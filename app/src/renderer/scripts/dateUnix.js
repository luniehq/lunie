import moment from 'moment'
export default function (date) {
  return moment(date, 'x').format('MMM D, YYYY, h:mm A')
}
