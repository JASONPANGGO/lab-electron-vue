<template>
  <div class="setting">
    <h2
      class="title"
      :class="{
        blue: !isGreen,
        green: isGreen,
      }"
    >
      {{ title }}
    </h2>
    <div
      class="selection"
      @click="select(index)"
      v-for="(item, index) in selections"
      :key="index"
    >
      <div class="check">
        <div class="checked" v-show="selectIndex === index"></div>
      </div>
      <div class="name">{{ item.label }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    settingSelections: Object,
    settingKey: String,
    title: String,
    isGreen: Boolean,
    currentSelection: Object,
    isBoolean: Boolean
  },
  data: () => ({ selectIndex: 0 }),
  computed: {
    selections () {
      return this.settingSelections[this.settingKey]
    }
  },
  watch: {
    currentSelection (val) {
      if (!val[this.settingKey]) this.selectIndex = 0
      else this.selectIndex = val[this.settingKey]
    }
  },
  methods: {
    select (index) {
      if (this.isBoolean) {
        if (this.selectIndex) {
          this.selectIndex = 0
        } else {
          this.selectIndex = 1
        }
        this.$emit('change', {[this.settingKey]: this.selectIndex})
      } else {
        this.selectIndex = index
        this.$emit('change', { [this.settingKey]: index })
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.setting{
  width: 160px;
  margin-bottom: 10px;
}
.title {
  font-weight: bold;
  margin: 0;
  font-size: 17px;
}
.blue {
  color: rgb(61, 124, 177);
}
.green {
  color: rgb(63, 127, 53);
}
.selection {
  color: #000;
  display: flex;
  align-items: center;
  user-select: none;
  .check {
    position: relative;
    width: 10px;
    height: 10px;
    margin-right: 10px;
    background-image: url("../assets/images/选择框.png");
        min-width: 10px;
    min-height: 10px;
  }
  .checked {
    width: 14px;
    height: 13px;
    position: absolute;
    bottom: 0;
    background-image: url("../assets/images/打勾icon.png");
  }
  .name {
    white-space: nowrap;
  }
}
</style>