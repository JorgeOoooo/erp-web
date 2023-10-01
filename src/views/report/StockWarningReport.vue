<template>
  <a-row :gutter="24">
    <a-col :md="24">
      <a-spin :spinning="loading">
        <a-card :bordered="false">
          <div class="select">
            <div class="input">
              <div class="input-item">
                <span class="label">客户：</span>
                <a-select
                  placeholder="选择客户"
                  showSearch
                  v-model="supplierId"
                  @change="changeValue"
                  style="width: 140px"
                >
                  <a-select-option
                    v-for="(item, index) in supList"
                    :key="index"
                    :value="item.id"
                  >
                    {{ item.supplier }}
                  </a-select-option>
                </a-select>
              </div>
              <div class="input-item">
                <span class="label">日期：</span>
                <a-date-picker
                  v-if="dateTime"
                  :default-value="dateTime"
                  :format="dateFormat"
                  :allowClear="false"
                  @change="changeDateTime"
                  style="width: 140px"
                />
              </div>
              <div class="input-item">
                <a-button type="primary" @click="changeValue">查询</a-button>
                <a-button @click="exportView" style="margin-left: 12px"
                  >导出预览</a-button
                >
              </div>
            </div>
          </div>
          <div class="table">
            <a-table
              size="middle"
              bordered
              :columns="columns"
              :dataSource="dataSource"
              :pagination="false"
            >
              <template slot="index" slot-scope="text, record, index">
                {{ text ? text : index + 1 }}
              </template>
              <template slot="supplier">
                {{ "客户：" + (supplierName || "-") }}
              </template>
              <template slot="time">
                {{ "日期：" + moment(dateTime).format(dateFormat) }}
              </template>
            </a-table>
          </div>
        </a-card>
      </a-spin>
    </a-col>
    <b-export-modal
      ref="exportRef"
      :columns="columns"
      :dataSource="dataSource"
      :supplierName="supplierName"
      :time="moment(dateTime).format(dateFormat)"
    />
  </a-row>
</template>
<script>
import moment from "moment";
import { httpAction, getAction } from "@/api/manage";
import { findBySelectSup } from "@/api/api";
import BExportModal from "../modal/BExportModal.vue";
export default {
  name: "ouputTable",
  components: {
    BExportModal,
  },
  data() {
    return {
      loading: false,
      supList: [],
      supplierId: undefined,

      supplierName: undefined,

      dateFormat: "YYYY-MM-DD",
      dateTime: [],

      columns: [
        {
          title: "萨达沃仓储服务中心",
          children: [
            {
              dataIndex: "supplier",
              slots: { title: "supplier" },
              children: [
                {
                  dataIndex: "time",
                  slots: { title: "time" },
                  children: [
                    {
                      title: "序号",
                      width: 60,
                      dataIndex: "index",
                      align: "center",
                      scopedSlots: { customRender: "index" },
                    },
                    {
                      title: "款号",
                      align: "center",
                      dataIndex: "model",
                    },
                    {
                      title: "件数",
                      align: "center",
                      dataIndex: "currentNumber",
                    },
                  ],
                },
              ],
            },
            {
              title: "（结余明细）",
              children: [
                {
                  title: "",
                  children: [
                    {
                      title: "规格",
                      align: "center",
                      dataIndex: "volumn",
                    },
                    {
                      title: "体积",
                      align: "center",
                      dataIndex: "totalVolumn",
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
      listTable: [],
    };
  },
  computed: {
    dataSource() {
      return [...this.listTable];
    },
  },
  methods: {
    moment,
    initSupplier() {
      let that = this;
      findBySelectSup({}).then((res) => {
        if (res) {
          that.supList = res;
        }
      });
    },
    changeDateTime(val) {
      this.dateTime = val;
      this.changeValue();
    },
    changeValue() {
      if (!this.supplierId || !this.dateTime) return;
      this.loading = true;
      getAction("/material/report/supplier/date", {
        supplierId: this.supplierId,
        date: moment(this.dateTime).format(this.dateFormat),
        currentPage: 1,
        size: 9999,
      })
        .then(({ code, data }) => {
          if (code == 200) {
            this.listTable = data?.materialStockReportUnitList || [];
            this.supplierName = data?.supplier;
          }
        })
        .catch(() => {
          this.listTable = [];
          this.supplierName = undefined;
        })
        .finally(() => {
          this.loading = false;
        });
    },
    exportView() {
      if (!this.supplierId || !this.dateTime) {
        this.$message.warning("请选择客户和时间！");
        return;
      }
      this.$refs.exportRef.show();
    },
  },
  created() {
    this.dateTime = moment(moment().format(this.dateFormat), this.dateFormat);
    this.initSupplier();
  },
};
</script>
<style lang="less" scoped>
.title {
  font-size: 18px;
  margin-bottom: 12px;
  text-align: center;
}
.select {
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .input-item {
    display: inline-block;
  }
  .input-item + .input-item {
    margin-left: 20px;
  }
  .label {
    display: inline-block;
    width: 80px;
  }
}
.table {
  margin-bottom: 12px;
}
.total-table {
  width: 425px;
}
</style>
