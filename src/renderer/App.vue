<template>
  <div>
      <router-view></router-view>
  </div>
</template>

<script>
export default {

}
</script>

<style lang="scss">
* {
  user-select: none;
}
html {
  background-color: #333;
}
body{
  background-color: #333;
  overflow: hidden;
  .ant-modal {
    width: 270px;
  }
}
</style>