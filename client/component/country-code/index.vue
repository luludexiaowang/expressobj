<template>
  <el-select size="medium" v-model="countryCode" placeholder="中国＋86" @change="selectCode" @visible-change="visbleChange">
    <el-option
      v-for="item in telprefixoption"
      :label="item.label"
      :value="item.value"
      :key="item.value">
    </el-option>
  </el-select>
</template>
<script>
import telprefixoption from 'client/assets/javascript/telprefix'

export default {
  data () {
    return {
      countryCode: '86',
      telprefixoption
    }
  },
  methods: {
    selectCode () {
      this.$emit('update:codeValue', this.countryCode)
    },
    visbleChange (value) {
      this.$emit('visbleChange', value)
    }
  }
}
</script>
