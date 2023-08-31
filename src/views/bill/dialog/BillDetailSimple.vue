<template>
  <j-modal
    :title="title"
    :width="width"
    :visible="visible"
    :maskClosable="false"
    :keyboard="false"
    :style="modalStyle"
    @cancel="handleCancel"
    wrapClassName="ant-modal-cust-warp"
  >
    <template slot="footer">
      <a-button v-print="'#print'">普通打印</a-button>
      <a-button key="back" @click="handleCancel">取消</a-button>
    </template>
    <div ref="printRef" id="print">
      <div class="info-line">
        <div class="left"></div>
        <div class="middle">库存入库单</div>
        <div class="rigth">
          <div class="info-item">
            <div class="label">编号：</div>
            <div class="value">
              {{ model.number }}
            </div>
          </div>
        </div>
      </div>
      <div class="info-line">
        <div class="left">
          <div class="info-item">
            <div class="label">客户：</div>
            <div class="value line">
              {{ model.supplierName }}
            </div>
          </div>
        </div>
        <div class="rigth">
          <div class="info-item">
            <div class="label">日期：</div>
            <div class="value line">
              {{ model.createTime }}
            </div>
          </div>
        </div>
      </div>
      <div class="info-line">
        <div class="left">
          <div class="info-item">
            <div class="label">电话：</div>
            <div class="value line">
              {{ model.telephone }}
            </div>
          </div>
        </div>
        <div class="rigth">
          <div class="info-item">
            <div class="label">车牌号：</div>
            <div class="value line">
              {{ model.carNumber }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- <bill-print-iframe ref="modalDetail"></bill-print-iframe> -->
    <!-- <financial-detail ref="financialDetailModal"></financial-detail> -->
  </j-modal>
</template>

<script>
import pick from "lodash.pick";
import { getAction, postAction, getFileAccessHttpUrl } from "@/api/manage";
import {
  findBillDetailByNumber,
  findFinancialDetailByNumber,
  getPlatformConfigByKey,
  getCurrentSystemConfig,
} from "@/api/api";
import {
  getMpListShort,
  getCheckFlag,
  openDownloadDialog,
  sheet2blob,
} from "@/utils/util";
import BillPrintIframe from "./BillPrintIframe";
import FinancialDetail from "../../financial/dialog/FinancialDetail";
import JUpload from "@/components/jeecg/JUpload";
import Vue from "vue";
export default {
  name: "BillDetailSimple",
  components: {
    BillPrintIframe,
    FinancialDetail,
    JUpload,
  },
  data() {
    return {
      title: "详情",
      width: "1600px",
      visible: false,
      modalStyle: "",
      model: {},
      tableWidth: {
        width: "1500px",
      },
      tableWidthRetail: {
        width: "1150px",
      },
      loading: false,
      dataSource: [],
      url: {
        detailList: "/documentItem/head",
      },
      //表头
      columns: [],
    };
  },
  created() {
    let realScreenWidth = window.screen.width;
    this.width = realScreenWidth < 1500 ? "1200px" : "1550px";
    this.tableWidth = {
      width: realScreenWidth < 1500 ? "1150px" : "1500px",
    };
    this.tableWidthRetail = {
      width: realScreenWidth < 1500 ? "800px" : "1100px",
    };
  },
  methods: {
    show(record, type) {
      //查询单条单据信息
      findBillDetailByNumber({ id: record.id, type }).then((res) => {
        if (res && res.code === 200) {
          let item = res.data;
          this.visible = true;
          this.modalStyle = "top:20px;height: 95%;";
          this.model = Object.assign({}, item);
        }
      });
    },
    handleCancel() {
      this.close();
    },
    close() {
      this.$emit("close");
      this.visible = false;
      this.modalStyle = "";
    },
  },
};
</script>

<style scoped lang="less">
.info-line {
  display: flex;
  justify-content: space-between;
  line-height: 24px;
  font-size: 16px;

  &:first-child {
    padding-top: 20px;
    padding-bottom: 8px;
  }

  & + .info-line {
    margin-top: 12px;
  }
}
.left {
  min-width: 220px;
  text-align: left;
}
.right {
  min-width: 220px;
  text-align: right;
}
.info-item {
  display: inline-flex;
  .label {
    display: inline-block;
    width: 100px;
    text-align: right;
    padding-bottom: 4px;
  }
  .value {
    display: inline-block;
    min-width: 120px;
    padding-bottom: 4px;
    &.line {
      border-bottom: 1px solid #000;
    }
  }
}
@page {
  size: auto A4 landscape;
  margin: 3mm;
}
</style>
