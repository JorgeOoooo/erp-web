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
      <div class="info-table">
        <div class="left">
          <div class="text-vertical">
            {{ tableTitle }}
          </div>
        </div>
        <div class="table">
          <a-table
            ref="table"
            size="middle"
            bordered
            :rowKey="(record, index) => index + 1"
            :pagination="false"
            :columns="columns"
            :dataSource="dataSource"
          >
            <template slot="index" slot-scope="text, record, index">
              {{ index + 1 }}
            </template>
          </a-table>
        </div>
        <div class="right">
          <div class="item">一.存根联</div>
          <div class="item">二.客户联</div>
          <div class="item">三.记账联</div>
        </div>
      </div>
      <div class="info-line">
        <div class="left"></div>
        <div class="rigth">
          <div class="info-item">
            <div class="label">数量汇总：</div>
            <div class="value line">
              {{ model.numberCount }}
            </div>
          </div>
        </div>
      </div>
      <div class="info-line">
        <div class="left"></div>
        <div class="rigth">
          <div class="info-item">
            <div class="label">立方数汇总：</div>
            <div class="value line">
              {{ model.volumeCount }}
            </div>
          </div>
        </div>
      </div>
      <div class="info-line mt-40">
        <div class="left">
          <div class="info-item">
            <div class="label">巴恰费：</div>
            <div class="value line"></div>
          </div>
        </div>
        <div>
          <div class="middle">
            <div class="info-item">
              <div class="label">服务费：</div>
              <div class="value line"></div>
            </div>
          </div>
        </div>
        <div class="rigth">
          <div class="info-item">
            <div class="label">车费：</div>
            <div class="value line"></div>
          </div>
        </div>
      </div>
      <div class="info-line">
        <div class="left">
          <div class="info-item">
            <div class="label">送货人：</div>
            <div class="value line"></div>
          </div>
        </div>
        <div class="rigth">
          <div class="info-item">
            <div class="label">收货人：</div>
            <div class="value line"></div>
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
      width: "1000px",
      visible: false,
      modalStyle: "",
      model: {},
      loading: false,
      dataSource: [],
      columns: [
        {
          title: "序号",
          scopedSlots: { customRender: "index" },
        },
        {
          title: "商品款号",
          dataIndex: "model",
        },
        {
          title: "件数",
          dataIndex: "operNumber",
        },
        {
          title: "库房号",
          dataIndex: "depotName",
        },
        {
          title: "备注",
          dataIndex: "remark",
        },
        {
          title: "箱规",
          dataIndex: "standard",
        },
        {
          title: "体积",
          dataIndex: "volume",
        },
      ],
      url: {
        detailList: "/documentItem/head",
      },
    };
  },
  computed: {
    tableTitle() {
      return window.SYS_TITLE + "仓储服务中心";
    },
  },
  created() {},
  methods: {
    show(record, type) {
      //查询单条单据信息
      findBillDetailByNumber({ id: record.id, type }).then((res) => {
        if (res && res.code === 200) {
          let item = res.data;
          this.visible = true;
          this.modalStyle = "top:20px;height: 95%;";
          this.model = Object.assign({}, item);
          this.dataSource = item.documentItemPrintVOList;
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
#print {
  padding: 28px;
}
.mt-40 {
  margin-top: 40px !important;
}
.info-line {
  display: flex;
  justify-content: space-between;
  line-height: 24px;
  font-size: 16px;
  padding-right: 70px;

  &:first-child {
    padding-top: 20px;
    padding-bottom: 8px;
  }

  & + .info-line {
    margin-top: 12px;
  }

  & + .info-table {
    margin-top: 20px;
  }

  .left {
    min-width: 220px;
    text-align: left;
  }
  .right {
    min-width: 220px;
    text-align: right;
  }
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
    min-width: 140px;
    padding-bottom: 4px;
    &.line {
      border-bottom: 1px solid #000;
    }
  }
}

.info-table {
  display: flex;
  align-items: center;
  .left {
    width: 30px;
    .text-vertical {
      width: 20px;
      line-height: 20px;
    }
  }

  .table {
    flex: 1;
  }

  .right {
    width: 70px;
    padding-left: 10px;
    .item + .item {
      margin-top: 12px;
    }
  }

  & + .info-line {
    margin-top: 20px;
  }
}

@page {
  size: auto A4 landscape;
  margin: 3mm;
}
</style>
