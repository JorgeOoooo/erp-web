<!-- by 7527_18_920 -->
<template>
  <a-row :gutter="10">
    <a-col :span="24">
      <a-spin :spinning="loading">
        <a-card :bordered="false">
          <div class="title">萨达沃仓储服务中心</div>
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
                <span class="label">时间范围：</span>
                <a-range-picker
                  v-if="dateRange?.length"
                  :default-value="dateRange"
                  :format="dateFormat"
                  :allowClear="false"
                  @change="changeDateRange"
                  style="width: 240px"
                />
              </div>
              <div class="input-item">
                <a-button type="primary" @click="changeValue">查询</a-button>
                <a-button @click="exportView" style="margin-left: 12px"
                  >导出预览</a-button
                >
              </div>
            </div>
            <div>
              {{ packageTypeName || "-" }}
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
            </a-table>
          </div>
          <div class="total-table">
            <a-table
              align="center"
              size="middle"
              bordered
              :columns="columns3"
              :dataSource="totalTable"
              :pagination="false"
              :scroll="{
                x: false,
                y: false,
              }"
            >
              <template slot="index" slot-scope="text, record, index">
                {{ text ? text : index + 1 }}
              </template>
            </a-table>
          </div>
        </a-card>
      </a-spin>
    </a-col>
    <a-export-modal
      ref="exportRef"
      :columns="columns"
      :dataSource="dataSource"
      :columns2="columns3"
      :dataSource2="totalTable"
      :supplierName="supplierName"
      :packageTypeName="packageTypeName"
    />
  </a-row>
</template>
<script>
import moment from "moment";
import { httpAction, getAction } from "@/api/manage";
import { findBySelectSup } from "@/api/api";
import AExportModal from "../modal/AExportModal.vue";
export default {
  name: "outputTable",
  components: {
    AExportModal,
  },
  data() {
    return {
      loading: false,
      supList: [],
      supplierId: undefined,
      packageTypeName: undefined,

      supplierName: undefined,

      dateFormat: "YYYY-MM-DD",
      dateRange: [],

      listTable: [],
      totalTable: [],
      columns1: [
        {
          title: "序号",
          width: 60,
          dataIndex: "index",
          align: "center",
          scopedSlots: { customRender: "index" },
        },
        {
          title: "日期",
          align: "center",
          dataIndex: "date",
        },
        {
          title: "款号",
          align: "center",
          dataIndex: "model",
        },
        {
          title: "入货件数",
          align: "center",
          dataIndex: "inValue",
        },
        {
          title: "立方数",
          align: "center",
          dataIndex: "totalVolumn",
        },
        {
          title: "总立方数/天",
          align: "center",
          dataIndex: "volumnDays",
        },
        {
          title: "备注",
          align: "center",
          dataIndex: "desc",
        },
      ],
      columns2: [
        {
          title: "序号",
          width: 60,
          dataIndex: "index",
          align: "center",
          scopedSlots: { customRender: "index" },
        },
        {
          title: "日期",
          align: "center",
          dataIndex: "date",
        },
        {
          title: "款号",
          align: "center",
          dataIndex: "model",
        },
        {
          title: "入货件数",
          align: "center",
          dataIndex: "inValue",
        },
        {
          title: "出货件数",
          align: "center",
          dataIndex: "outValue",
        },
        {
          title: "备注",
          align: "center",
          dataIndex: "desc",
        },
      ],
      columns3: [
        {
          title: "序号",
          dataIndex: "index",
          width: 60,
          align: "center",
          scopedSlots: { customRender: "index" },
        },
        {
          title: "出库月份",
          width: 160,
          align: "center",
          dataIndex: "name",
        },
        {
          title: "结余",
          width: 100,
          align: "center",
          dataIndex: "value",
        },
        {
          title: "备注",
          align: "center",
          dataIndex: "desc",
        },
      ],
    };
  },
  computed: {
    dataSource() {
      if (this.listTable?.length) {
        if (this.packageTypeName == "全托") {
          const totalIn = this.listTable.reduce((pre, item) => {
            return pre + (item?.inValue || 0);
          }, 0);
          return [
            ...this.listTable,
            {
              index: "合计：",
              inValue: totalIn,
            },
          ];
        } else {
          const totalIn = this.listTable.reduce((pre, item) => {
            return pre + (item?.inValue || 0);
          }, 0);
          const totalOut = this.listTable.reduce((pre, item) => {
            return pre + (item?.outValue || 0);
          }, 0);
          return [
            ...this.listTable,
            {
              index: "合计：",
              inValue: totalIn,
              outValue: totalOut,
            },
          ];
        }
      }
      return [];
    },
    columns() {
      if (this.packageTypeName == "全托") {
        return this.columns1;
      } else {
        return this.columns2;
      }
    },
  },
  methods: {
    initSupplier() {
      let that = this;
      findBySelectSup({}).then((res) => {
        if (res) {
          that.supList = res;
        }
      });
    },
    changeDateRange(val) {
      this.dateRange = val;
      this.changeValue();
    },
    changeValue() {
      if (!this.supplierId || !this.dateRange?.length) return;
      this.loading = true;
      getAction("/material/report/supplier/range/date", {
        supplierId: this.supplierId,
        startDate: moment(this.dateRange[0]).format(this.dateFormat),
        endDate: moment(this.dateRange[1]).format(this.dateFormat),
      })
        .then(({ code, data }) => {
          if (code == 200) {
            this.data = data;
            this.listTable = data?.documentReportUnitList || [];
            this.packageTypeName = data?.packageName;
            this.supplierName = data?.supplier;
            this.totalTable = [
              {
                name:
                  this.packageTypeName == "全托"
                    ? "上月结余立方数"
                    : "上月结余包数",
                value: data?.documentReportBalance?.lastTotal,
              },
              {
                name:
                  this.packageTypeName == "全托" ? "入货立方数" : "入货包数",
                value: data?.documentReportBalance?.inTotalValue,
              },
              {
                name:
                  this.packageTypeName == "全托" ? "出货立方数" : "出货包数",
                value: data?.documentReportBalance?.outTotalValue,
              },
              {
                name: "本月结余",
                value: data?.documentReportBalance?.curTotal,
              },
            ];
          }
        })
        .catch(() => {
          this.data = {};
          this.listTable = [];
          this.packageTypeName = undefined;
          this.supplierName = undefined;
          this.totalTable = [];
        })
        .finally(() => {
          this.loading = false;
        });
    },
    exportView() {
      if (!this.supplierId || !this.dateRange?.length) {
        this.$message.warning("请选择客户和时间范围！");
        return;
      }
      this.$refs.exportRef.show();
    },
  },
  created() {
    this.dateRange = [
      moment(
        moment().subtract(30, "days").format(this.dateFormat),
        this.dateFormat
      ),
      moment(moment().format(this.dateFormat), this.dateFormat),
    ];
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
    width: 100px;
  }
}
.table {
  margin-bottom: 12px;
}
.total-table {
  width: 425px;
}
</style>
