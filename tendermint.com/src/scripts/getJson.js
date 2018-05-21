import { Base64 } from "js-base64"
import axios from "axios"
export default async function getJson(url) {
  let data = (await axios.get(url)).data
  let json = JSON.parse(Base64.decode(data.content))
  return json
}
