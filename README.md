# play-magic-cube

> An electron-vue project
#### Build Setup

推荐使用 Node v14.15.4
使用yarn作为包管理工具

## 魔方工具规范

### 前言

桌面应用魔方的架构逻辑是集成不同工具的运行代码以及UI界面的代码在桌面应用中，但两者代码在生产环境中是相互分离的，以实现局部的更新，比如只更新相应的工具代码而无需更新桌面应用的UI界面等内容。

桌面应用中呈现工具UI的前端代码在桌面应用中实现，工具详情页包含输入框，文件选择器，下拉选择器，单/多选（持续更新迭代）等等的表单UI，以供给用户可视化交互的形式来操控相关的工具调用指令。命令行工具的维护者只需要配置JSON使得工具的每个参数和实际的UI关联即可，工具的维护者无需关心桌面应用本身的逻辑。

目前魔方的运行逻辑大致如下：

1. 启动时发起http请求`/pmc/tools`，后端从`public/pmc/`目录下遍历每个子目录进行`git pull`，并读取目录中的`package.json`的`pmc`字段获取工具的描述对象，其中就包括UI的渲染逻辑。

2. 后端返回一个包含每个工具的描述对象的数组，桌面工具根据该数组渲染出`Home`中的应用图标。

3. 在工具详情页中根据配置渲染出具体的交互UI，并根据描述对象拼接出命令，工具本身的逻辑代码在项目根目录的`bin/<工具名称>`目录下，执行时根据用户平台而执行不同的可执行文件。

工具规范的制定是为了实现工具开发者可以无需额外操作的情况，维护工具的 git 仓库的同时，就能做到魔方工具的热更新。

### 工具描述对象pmc

在工具的根目录`package.json`中添加以下配置：
```json
...
"pmc": {
    "name": "多语言导表工具",
    "bin": "lang2json",
    "params": [
      {
        "label": "Excel文件",
        "component": "upload",
        "prop": "src"
      },
      {
        "label": "输出保存到",
        "component": "path",
        "prop": "output"
      }
    ]
  },
...
```

### 打包
> 待定
1. 使用pkg把node工具打包成可执行文件

这样的产物包含完整的node run time，80mb+更新消耗很大

2. 使用rollup把node工具打包成单个bundle.js

产物大小<2mb，使用electron集成的node run time来执行该js




``` bash
# install dependencies
npm install

# serve with hot reload at localhost:9080
npm run dev

# build electron application for production
npm run build


# lint all JS/Vue component files in `src/`
npm run lint

```

---

This project was generated with [electron-vue](https://github.com/SimulatedGREG/electron-vue)@[45a3e22](https://github.com/SimulatedGREG/electron-vue/tree/45a3e224e7bb8fc71909021ccfdcfec0f461f634) using [vue-cli](https://github.com/vuejs/vue-cli). Documentation about the original structure can be found [here](https://simulatedgreg.gitbooks.io/electron-vue/content/index.html).
