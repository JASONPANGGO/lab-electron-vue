// import fs from 'fs-extra'
import fs, { readFileSync, statSync } from 'fs'
import path from 'path'
import axios from 'axios'
import { execSync } from 'child_process'
import crypto from 'crypto'
import { getPatchList, getVersion } from './renderer/service'
// import unzipper from 'unzipper'
import JSzip from 'jszip'
const MAX_DELTA = 5000

/**
 * 
 * @param {Date} a 
 * @param {Date} b 
 */
function compareTimeStamp (a, b) {
  const delta = Math.abs(a.getTime() - b.getTime())
  return delta < MAX_DELTA
}

export const CONFIG_PATH = path.join(process.cwd(), 'CONFIG')
export const EXE_PATH = path.join(process.cwd(), 'InphaseNXD.EXE')
export const PATCHLIST_PATH = path.join(process.cwd(), 'PatchList')
export const VERSION = {
  patch: null,
  exe: null
}

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

/**
 *
 * @param {string} zipPath
 * @param {string} savePath
 */
export async function unzip (zipPath, savePath) {
  const zip = new JSzip()
  await zip.loadAsync(fs.readFileSync(zipPath))
  return Promise.all(Object.values(zip.files).map(file => {
    const dest = path.join(process.cwd(), savePath, file.name)
    if (file.dir) {
      return fs.mkdirSync(dest, { recursive: true })
    } else {
      return file.async('nodebuffer').then(data => {
        fs.writeFileSync(dest, data)
      })
    }
  }))
};

export function checkPatch () {
  return new Promise(async (resolve, reject) => {
    console.log('checking patch...');
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
    console.log('checking exe...');
    const { latestTime, downloadUrl } = await getVersion()
    const latestTimeDate = new Date(latestTime)
    let currentStat
    try {
      currentStat = statSync(EXE_PATH)
    } catch (error) {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject({ latestTime: new Date(latestTime), downloadUrl })
      return
    }
    const currentTimeDate = currentStat.mtime

    console.log('exe latest:', latestTimeDate)
    console.log('exe current:', currentTimeDate)

    if (compareTimeStamp(currentTimeDate, latestTimeDate)) {
      resolve()
    } else {
      // eslint-disable-next-line prefer-promise-reject-errors
      reject({ latestTime: latestTimeDate, downloadUrl })
    }
  })
}
