// import fs from 'fs-extra'
import fs, { readFileSync, statSync } from 'fs'
import path from 'path'
import axios from 'axios'
import { execSync } from 'child_process'
import crypto from 'crypto'
import { getPatchList, getVersion } from './renderer/service'
// import unzipper from 'unzipper'
const unzipper = require('unzipper')
export const CONFIG_PATH = path.join(process.cwd(), 'CONFIG')
export const EXE_PATH = path.join(process.cwd(), 'InphaseNXD.EXE')
export const PATCHLIST_PATH = path.join(process.cwd(), 'PatchList')

export const request = axios.create({
  headers: {
    'cache-control': 'no-cache'
  }
})

export const kill = name => {
  console.log('kill:::')
  const getList = name => {
    try {
      return execSync(`tasklist | findstr ${name}`).toString().split('\n')
    } catch (error) {
      console.log('catch')
      // throw error
      return null
    }
  }
  const list = getList(name)
  if (!list) return
  const process = list[0]
  const pid = process.match(/[1-9]\d*/)[0]
  execSync(`taskkill /pid ${pid}`)
  if (getList(name).length !== 0) kill(name)
}

export const md5 = string => {
  return crypto.createHash('md5').update(string).digest('hex')
}

export async function unzip (zipPath) {
  async function save (file) {
    if (file.type === 'Directory') {
      try {
        fs.statSync(file.path)
      } catch (error) {
        fs.mkdirSync(file.path)
      }
      return
    }
    const buffer = await file.buffer()
    fs.writeFileSync(file.path, buffer)
  }
  const dir = await unzipper.Open.buffer(fs.readFileSync(zipPath))
  await Promise.all(dir.files.map(file => save(file)))
}

export function checkPatch () {
  return new Promise(async (resolve, reject) => {
    const { latestTime, downloadUrl } = await getPatchList()
    const latestHash = md5(latestTime)
    let currentHash
    try {
      currentHash = readFileSync(PATCHLIST_PATH).toString()
    } catch (error) {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject({ downloadUrl, latestTime: latestHash })
    }
    console.log('patch latest:', latestHash)
    console.log('patch current:', currentHash)

    if (currentHash === md5(latestTime)) {
      resolve()
    } else {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject({ downloadUrl, latestTime: latestHash })
    }
  })
}

export function checkEXE () {
  return new Promise(async (resolve, reject) => {
    const { latestTime, downloadUrl } = await getVersion()
    const latestTimeString = new Date(latestTime).toString()
    let currentStat
    try {
      currentStat = statSync(EXE_PATH)
    } catch (error) {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject({ latestTime: new Date(latestTime), downloadUrl })
      return
    }
    const currentTimeString = currentStat.mtime.toString()

    console.log('exe latest:', latestTimeString)
    console.log('exe current:', currentTimeString)

    if (currentTimeString === latestTimeString) {
      resolve()
    } else {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject({ latestTime: new Date(latestTime), downloadUrl })
    }
  })
}
