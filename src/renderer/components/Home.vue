<template>
  <div class="home">
    <div class="topbar">
      <div class="title">梦幻天翼www.mhtw.org</div>
      <div class="drag"></div>
      <div @click="minimize"
           class="mini"></div>
      <div @click="close"
           class="close"></div>
    </div>
    <img :src="backgroundImage"
         class="background" />
    <div class="navbar">
      <div class="loading">
        <div class="progress">{{ loading }} <span>%</span></div>
        <div class="text"
             v-if="loading">正在连接服务器……</div>
        <div class="text"
             v-else>服务器已准备就绪</div>
        <img class="loading-gif"
             src="../assets/images/loading01.gif"
             alt="" />
      </div>
      <div class="middle">
        <div class="buttons">
          <div class="button official"
               @click="openLink('http://www.mhtw.org')"></div>
          <div class="button setting"
               @click="toggleSetting"></div>
          <div class="button register"
               @click="openLink('http://www.mhtw.org/html/notice/register.html')"></div>
          <div class="button charge"
               @click="openLink('http://www.mhtw.org/html/notice/donate.php')"></div>
          <div class="button shop"
               @click="openLink('http://shop.mhtw.org/')"></div>
        </div>
        <div class="progress-bar">
          <div class="progress"
               :style="{
              width: `${loading}%`,
            }"></div>
        </div>
      </div>
      <div class="start"
           @click="launch"></div>
    </div>

    <div v-show="setting"
         class="setting-board">
      <div class="display">
        <Setting :title="'游戏画面模式'"
                 :settingSelections="selections"
                 :settingKey="'screen'"
                 @change="change"
                 :currentSelection="currentSelection" />

        <Setting :title="'分辨率'"
                 :settingSelections="selections"
                 :settingKey="'ratio'"
                 @change="change"
                 :currentSelection="currentSelection" />

        <Setting :title="'高级设置'"
                 :settingSelections="selections"
                 :settingKey="'senior'"
                 @change="change"
                 :currentSelection="currentSelection"
                 isBoolean />

        <Setting :title="'画面刷新率'"
                 :settingSelections="selections"
                 :settingKey="'refresh'"
                 @change="change"
                 :currentSelection="currentSelection" />
      </div>
      <div class="volume">
        <Setting :title="'游戏音乐'"
                 :settingSelections="selections"
                 :settingKey="'music'"
                 @change="change"
                 :currentSelection="currentSelection"
                 isGreen />
        <Setting :title="'游戏音效'"
                 :settingSelections="selections"
                 :settingKey="'sound'"
                 @change="change"
                 :currentSelection="currentSelection"
                 isGreen />
        <Setting :title="'音响设置'"
                 :settingSelections="selections"
                 :settingKey="'volume'"
                 @change="change"
                 :currentSelection="currentSelection"
                 isGreen />
      </div>
      <div class="confirm"
           @click="confirm"></div>
      <div class="reset"
           @click="reset"></div>
    </div>

    <a-modal :maskClosable="false"
             :keyboard="false"
             @ok="openLink('http://www.mhtw.org/html/notice/download.html')"
             width="200"
             v-model="downloadingPatch"
             title="补丁版本过低">
      <p>下载补丁中</p>
      <a-progress :percent="patchProgress"></a-progress>
      <template slot="footer">
        <a-button type="primary"
                  @click="openLink('http://www.mhtw.org/html/notice/download.html')">手动下载补丁</a-button>
        <a-button :loading="patchProgress < 100"
                  @click="startLoading">
          <span v-if="patchProgress < 100">下载中</span>
          <span v-else>完成</span>
        </a-button>
      </template>
    </a-modal>

    <a-modal :maskClosable="false"
             :keyboard="false"
             width="200"
             v-model="downloadingEXE"
             title="正在更新游戏主程序">
      更新中
      <a-progress :percent="downloadProgress"></a-progress>
      <template slot="footer">
        <a-button :loading="downloadProgress < 100"
                  @click="startLoading">
          <span v-if="downloadProgress < 100">下载中</span>
          <span v-else>完成</span>
        </a-button>
      </template>
    </a-modal>
  </div>
</template>

<script>
import Setting from './Setting'
import VERSION from '../../version'
// import { md5, CONFIG_PATH, EXE_PATH, PATCHLIST_PATH, checkPatch, checkVersion } from '../../utils'
import {
  CONFIG_PATH,
  EXE_PATH,
  checkPatch,
  checkEXE,
  PATCHLIST_PATH
} from '../../utils'
const { ipcRenderer } = require('electron')
const backgroundImage = require('../assets/images/展览图-1.png')
const axios = require('axios')
const fs = require('fs')
const path = require('path')
const settings = {
  screen: [
    {
      label: '窗口模式（默认）',
      value: '/WINDOW'
    },
    {
      label: '全屏模式',
      value: '/FULLSCREEN'
    }
  ],
  ratio: [
    {
      label: '800*600（默认）',
      value: '/800600 1'
    },
    {
      label: '1024*768',
      value: '/1024768 1'
    },
    {
      label: '1366*768',
      value: '/1366768 1'
    },
    {
      label: '1600*900',
      value: '/1600900 1'
    },
    {
      label: '1920*1080',
      value: '/19201080 1'
    }
  ],
  senior: [
    {
      label: '使用纹理过滤（textue filtering）',
      value: '/UseBlinearFiltering 1'
    }
  ],
  refresh: [
    {
      label: '56Hz（默认）',
      value: ''
    },
    {
      label: '60Hz',
      value: ''
    },
    {
      label: '70Hz',
      value: ''
    },
    {
      label: '72Hz',
      value: ''
    },
    {
      label: '75Hz',
      value: ''
    }
  ],
  music: [
    {
      label: '打开（默认）',
      value: ''
    },
    {
      label: '关闭',
      value: '/BGMOFF 1'
    }
  ],
  sound: [
    {
      label: '打开（默认）',
      value: ''
    },
    {
      label: '关闭',
      value: '/SEOFF 1'
    }
  ],
  volume: [
    {
      label: '2扬声器（默认）',
      value: ''
    },
    {
      label: '顶音',
      value: ''
    },
    {
      label: '环绕音',
      value: ''
    },
    {
      label: '4扬声器',
      value: ''
    }
  ]
}

const initSetting = { senior: 0 }
export default {
  components: { Setting },
  data () {
    return {
      backgroundImage: backgroundImage,
      loading: 0,
      setting: false,
      selections: settings,
      currentSelection: initSetting,
      downloadingPatch: false,
      VERSION,
      downloadingEXE: false,
      downloadProgress: 0,
      patchProgress: 0
    }
  },
  watch: {
    loading (val) {
      // if (val >= 100) {
      //   this.close()
      // }
    }
  },
  mounted () {
    this.initSetting()
  },
  methods: {
    initSetting () {
      const config = fs.readFileSync(CONFIG_PATH).toString()
      if (config) {
        console.log(config)
        this.currentSelection = JSON.parse(config)
      }
    },
    minimize () {
      ipcRenderer.send('window-minimize')
    },
    close () {
      ipcRenderer.send('quit')
    },
    openLink (url) {
      console.log(url)
      ipcRenderer.send('open-link', url)
    },
    toggleSetting () {
      this.setting = !this.setting
    },
    change (val) {
      this.currentSelection = Object.assign(this.currentSelection, val)
    },
    checkPatch () {
      const that = this
      return new Promise((resolve, reject) => {
        checkPatch()
          .then(() => {
            that.downloadingPatch = false
            resolve()
          })
          .catch(({ latestTime, downloadUrl }) => {
            that.downloadPatch(downloadUrl, latestTime)
            reject(new Error('patch需要更新'))
          })
      })
    },
    async downloadPatch (downloadUrl, latestTime) {
      if (this.downloadingPatch) return
      this.downloadingPatch = true
      if (this.patchProgress > 0) return
      const that = this
      const request = axios.create({
        timeout: 0,
        onDownloadProgress (e) {
          const p = Math.floor((e.loaded / e.total) * 100)
          that.patchProgress = p === 100 ? 99 : p
        }
      })
      const res = await request({
        url: downloadUrl,
        method: 'get',
        responseType: 'arraybuffer'
      })
      const zipPath = path.join(process.cwd(), `${Date.now()}.zip`)
      fs.writeFileSync(zipPath, Buffer.from(res.data))

      ipcRenderer.once('unzipped-patch', () => {
        this.patchProgress = 100
        fs.writeFileSync(PATCHLIST_PATH, latestTime)
        setTimeout(() => {
          this.startLoading()
        }, 500)
      })
      ipcRenderer.send('unzip-patch', {
        zipPath,
        latestTime
      })
    },
    checkEXE () {
      const that = this
      return new Promise((resolve, reject) => {
        checkEXE()
          .then(() => {
            that.downloadingEXE = false
            resolve()
          })
          .catch(({ latestTime, downloadUrl }) => {
            that.downloadEXE(downloadUrl, latestTime)
            reject(new Error('exe需要更新'))
          })
      })
    },
    async downloadEXE (downloadUrl, latestTime) {
      if (this.downloadingEXE) return
      this.downloadingEXE = true
      if (this.downloadProgress > 0) return
      const that = this
      const request = axios.create({
        onDownloadProgress (event) {
          that.downloadProgress = Math.floor(
            (event.loaded / event.total) * 100
          )
        },
        timeout: 0,
        responseType: 'arraybuffer'
      })
      const res = await request({
        url: downloadUrl,
        method: 'get'
      }).catch((e) => {
        console.log(downloadUrl)
        console.log(e)
        throw e
      })
      fs.writeFileSync(EXE_PATH, Buffer.from(res.data))
      fs.utimesSync(EXE_PATH, latestTime, latestTime)
      setTimeout(() => {
        this.startLoading()
      }, 500)
    },
    async checkStatus () {
      await Promise.all([this.checkPatch(), this.checkEXE()])
    },
    startLoading () {
      this.checkStatus()
        .then(() => {
          this.finishLoading()
        })
        .catch((e) => {
          console.log(e)
        })
      const fakeStop = Math.round(
        (Math.random() * 35 + Math.random() * 70) / 2
      )
      let timer = setInterval(() => {
        if (this.loading < fakeStop) {
          this.loading += 1
        } else {
          clearInterval(timer)
        }
      }, 50)
    },
    finishLoading () {
      let timer = setInterval(() => {
        if (this.loading < 100) {
          this.loading += 1
        } else {
          clearInterval(timer)
          this.downloadingEXE = false
        }
      }, 5)

      let params = ''
      for (const [key, value] of Object.entries(
        Object.assign({}, this.currentSelection)
      )) {
        const set = settings[key][value]
        if (set) params += set.value
      }
      ipcRenderer.send('launch-game', {
        name: 'InphaseNXD.EXE',
        params: params
      })
    },
    launch () {
      this.startLoading()
    },
    reset () {
      this.currentSelection = {}
    },
    saveSetting () {
      fs.writeFileSync(CONFIG_PATH, JSON.stringify(this.currentSelection))
    },
    confirm () {
      this.saveSetting()
      this.setting = false
    }
  }
}
</script>

<style lang="scss" scoped>
.home /deep/ {
  .setting-board {
    width: 100vw;
    height: 394px;
    background-color: #000;
    position: fixed;
    top: 31px;
    left: 0;
    border-radius: 4px;
    background-image: url("../assets/images/游戏设定版面.png");
    background-repeat: no-repeat;
    background-position-x: -10px;
    background-position-y: -5px;
    .confirm {
      background-image: url("../assets/images/确认设置按钮.png");
      width: 70px;
      height: 22px;
      position: absolute;
      bottom: 25px;
      left: 17px;
      &:hover {
        background-position-y: 22px;
      }
    }
    .reset {
      background-image: url("../assets/images/恢复初始按钮.png");
      width: 70px;
      height: 22px;
      position: absolute;
      bottom: 25px;
      left: 92px;
      &:hover {
        background-position-y: 22px;
      }
    }
    .display,
    .volume {
      position: absolute;
      width: 330px;
      height: 339px;
      top: 42px;
      padding: 10px;
      display: flex;
      flex-direction: column;
      flex-wrap: wrap;
    }
    .display {
      left: 10px;
    }
    .volume {
      right: 0px;
    }
    .display .title,
    .volume .title {
      width: 100%;
    }
  }
}
.version {
  position: absolute;
  left: 10px;
  top: 33px;
}
.topbar {
  position: absolute;
  width: 100vw;
  height: 30px;
  top: 0;
  left: 0;
  background-color: #222;
  .drag {
    position: absolute;
    width: 610px;
    height: 29px;
    -webkit-app-region: drag;
    -webkit-user-select: none;
  }
  .title {
    font-size: 12px;
    position: absolute;
    bottom: 3px;
    color: #ddd;
    font-weight: bold;
    letter-spacing: 3px;
    left: 10px;
  }
  .mini {
    width: 14px;
    height: 14px;
    border-radius: 25%;
    position: absolute;
    right: 40px;
    top: 8px;
    background-image: url("../assets/images/最小化icon.png");
  }
  .close {
    width: 14px;
    height: 14px;
    position: absolute;
    right: 16px;
    top: 8px;
    background-image: url("../assets/images/关闭icon.png");
  }
}
.home {
  background-color: #333;
}
.background {
  position: absolute;
  top: 30px;
  margin-left: 2px;
  user-select: none;
  -webkit-user-drag: none;
}
.navbar {
  width: 100vw;
  position: absolute;
  bottom: 0;
  left: 0;
  height: 54px;
  background: linear-gradient(0, #222, #333);

  .loading {
    width: 112px;
    height: 53px;
    position: absolute;
    top: -2px;
    left: 8px;

    .progress {
      width: 63px;
      position: absolute;
      left: 10px;
      color: #fff;
      font-size: 25px;
      span {
        position: absolute;
        right: 0;
      }
    }
    .text {
      position: absolute;
      bottom: 0;
      font-size: 10px;
      color: #ffd401;
      font-weight: bold;
      letter-spacing: 2px;
    }
    .loading-gif {
      position: absolute;
      top: 8px;
      right: -4px;
      zoom: 0.7;
      -webkit-user-drag: none;
    }
  }
  .middle {
    position: absolute;
    width: 478px;
    height: 50px;
    left: 120px;
    top: 0px;
    .buttons {
      position: absolute;
      width: 100%;
      height: 25px;
      display: flex;
      top: 4px;

      .button {
        width: 92px;
        height: 18px;
        margin: 2px;
        &:hover {
          background-position-y: 18px;
        }
      }
      .official {
        background-image: url("../assets/images/进入官网按钮.png");
      }
      .setting {
        background-image: url("../assets/images/游戏设置按钮.png");
      }
      .register {
        background-image: url("../assets/images/账号注册按钮.png");
      }
      .charge {
        background-image: url("../assets/images/点数充值按钮.png");
      }
      .shop {
        background-image: url("../assets/images/商城道具按钮.png");
      }
    }
    .progress-bar {
      width: 100%;
      height: 18px;
      bottom: 0;
      position: absolute;
      border: 1px solid #fff;
      .progress {
        height: 16px;
        width: 0px;
        background-color: #6fb248;
      }
    }
  }
  .start {
    position: absolute;
    right: 6px;
    bottom: 5px;
    width: 71px;
    height: 45px;
    background-image: url("../assets/images/游戏开始按钮.png");
    cursor: pointer;
    &:hover {
      background-position-y: 45px;
    }
  }
}
</style>