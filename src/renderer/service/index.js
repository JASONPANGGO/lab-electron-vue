import { request } from '../../utils'

export async function getPatchList () {
  const res = await request({
    url: 'http://www.mhtw.org/updates/PatchList',
    method: 'GET'
  })
  const data = res.data.split('\n')

  return {
    downloadUrl: data[1],
    latestTime: data[0]
  }
}

export async function getVersion () {
  const res = await request({
    url: 'http://www.mhtw.org/updates/version',
    method: 'GET'
  })
  const data = res.data.split('\n')
  return {
    latestTime: data[0],
    downloadUrl: data[1]
  }
}
