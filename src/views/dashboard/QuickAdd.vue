<template>
  <div style="height: calc(100vh - 72px); background: #fff; position: relative">
    <img src="../../assets/bg.svg" alt="dark" class="img-bg" />
    <div class="quick-wrap">
      <div style="width: 332px; height: 412px">
        <div class="quick-line">
          <div class="quick-item" @click="handleOpenAdd('OtherInModal')">
            <span class="icon iconfont">&#xe617;</span>
            <span class="text"> 入库单 </span>
          </div>
          <div class="quick-item" @click="handleOpenAdd('OtherOutModal')">
            <span class="icon iconfont">&#xe611;</span>
            <span class="text"> 出库单</span>
          </div>
        </div>
        <div class="quick-line" @click="handleOpenAdd('AllocationOutModal')">
          <div class="quick-item">
            <span class="icon iconfont">&#xe612;</span>
            <span class="text"> 调拨单</span>
          </div>
          <div class="quick-item" @click="handleOpenAdd('AssembleModal')">
            <span class="icon iconfont">&#xe618;</span>
            <span class="text"> 库存盘点单</span>
          </div>
        </div>
      </div>
    </div>

    <other-in-modal :billType="2" ref="OtherInModal"></other-in-modal>
    <other-out-modal :billType="1" ref="OtherOutModal"></other-out-modal>
    <assemble-modal ref="AssembleModal"></assemble-modal>
    <allocation-out-modal ref="AllocationOutModal"></allocation-out-modal>
  </div>
</template>
<script>
import OtherInModal from "@/views/bill/modules/OtherInModal";
import OtherOutModal from "@/views/bill/modules/OtherOutModal";
import AssembleModal from "@/views/bill/modules/AssembleModal";
import AllocationOutModal from "@/views/bill/modules/AllocationOutModal";
export default {
  components: {
    OtherInModal,
    OtherOutModal,
    AssembleModal,
    AllocationOutModal,
  },
  methods: {
    handleOpenAdd(refName) {
      if (this.$refs?.[refName].visible == false) {
        this.$refs?.[refName].add();
      }
    },
  },
};
</script>
<style lang="less" scoped>
@import "~@assets/less/common.less";
.img-bg {
  position: absolute;
  z-index: 1;
  bottom: 30px;
  right: 30px;
  width: 300px;
  opacity: 0.6;
}
.quick-wrap {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  z-index: 2;
}
.quick-line {
  display: flex;
  & + .quick-line {
    margin-top: 12px;
  }
}
.quick-item {
  display: flex;
  width: 160px;
  height: 200px;
  border-radius: 10px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  .icon {
    font-size: 40px;
  }

  & + .quick-item {
    margin-left: 12px;
  }
}
</style>
