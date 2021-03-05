import axios from 'axios'

const service = axios.create({
  baseURL: 'http://playsmart.mintegral.com/3d/api',
  timeout: 30000 // request timeout
})

export default service
