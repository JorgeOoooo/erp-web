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
                <span class="label">月份：</span>
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
                <!-- <a-button @click="exportView" style="margin-left: 12px"
                  >导出预览</a-button
                > -->
              </div>
            </div>
          </div>
          <div class="table" v-if="columns?.length">
            <a-table
              size="small"
              bordered
              :columns="columns"
              :dataSource="dataSource"
              :pagination="false"
            >
              <!-- <template slot="index" slot-scope="text, record, index">
                {{ text ? text : index + 1 }}
              </template>
              <template slot="supplier">
                {{ "客户：" + (supplierName || "-") }}
              </template>
              <template slot="time">
                {{ "日期：" + moment(dateTime).format(dateFormat) }}
              </template> -->
            </a-table>
          </div>
        </a-card>
      </a-spin>
    </a-col>
  </a-row>
</template>
<script>
import moment from "moment";
import { httpAction, getAction } from "@/api/manage";
import { findBySelectSup } from "@/api/api";
export default {
  name: "ouputTable",
  components: {},
  data() {
    return {
      loading: false,
      supList: [],
      supplierId: undefined,

      dateFormat: "YYYY-MM",
      dateTime: [],

      listTable: [],
    };
  },
  computed: {
    dataSource() {
      return [...this.listTable];
    },
    columns() {
      if (!this.supplierId || !this.dateTime) return [];
      const supplier = this.supList.find((v) => v.id == this.supplierId);
      if (!supplier) return [];
      const { packageTypeName, fullyManagedType } = supplier;
      let col_left = [];
      let col_right = [];
      // todo: 根据不同类型展示
      if (
        packageTypeName == "半托" ||
        (packageTypeName == "全托" && [2, 4].includes(fullyManagedType))
      ) {
        col_left.push({
          title: supplier?.packageDeliverFee + "/配送",
          align: "center",
          dataIndex: "d1",
          width: 80,
        });
        col_left.push({
          title: supplier?.packageWarehouseFee + "/库房",
          align: "center",
          dataIndex: "d2",
          width: 80,
        });
        col_right.push({
          title: "入库数量",
          align: "center",
          dataIndex: "d2",
          width: 80,
        });
        col_right.push({
          title: "出库数量",
          align: "center",
          dataIndex: "d3",
          width: 80,
        });
      }
      if (packageTypeName == "全托" && [1, 2, 3].includes(fullyManagedType)) {
        col_left.push({
          title: supplier?.cubeDeliverFee + "/配送",
          align: "center",
          dataIndex: "d1",
          width: 80,
        });
        col_left.push({
          title: supplier?.cubeWarehouseFee + "/库房",
          align: "center",
          dataIndex: "d2",
          width: 80,
        });
        col_right.push({
          title: "入库立方",
          align: "center",
          dataIndex: "d2",
          width: 80,
        });
        col_right.push({
          title: "出库立方",
          align: "center",
          dataIndex: "d3",
          width: 80,
        });
      }
      return [
        {
          title: "日期",
          children: [
            {
              title: "结束时间",
              align: "center",
              dataIndex: "endDate",
              width: 100,
            },
            {
              title: "结开始时间",
              align: "center",
              dataIndex: "startDate",
              width: 100,
            },
          ],
        },
        {
          title: "备注",
          align: "center",
          dataIndex: "remark",
        },
        {
          title: "垫付费",
          align: "center",
          dataIndex: "d0",
          width: 80,
        },
        {
          title: "摘要",
          children: [
            ...col_left,
            {
              title: "费用合计",
              align: "center",
              dataIndex: "d5",
              width: 80,
            },
            {
              title: "天数",
              align: "center",
              dataIndex: "days",
              width: 80,
            },
          ],
        },
        {
          title: "余额",
          align: "center",
          dataIndex: "d7",
          width: 80,
        },
        ...col_right,
      ];
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
      getAction("/documentHead/report/finance/range/date", {
        supplierId: this.supplierId,
        startDate: moment(this.dateTime).format(this.dateFormat) + "-26",
        endDate:
          moment(this.dateTime).add(1, "months").format(this.dateFormat) +
          "-25",
      })
        .then(({ code, data }) => {
          if (code == 200) {
            this.listTable = data?.financeReportUnits || [];

            let sum_1 = 0;
            let sum_2 = 0;
            let sum_3 = 0;
            let sum_4 = 0;
            let sum_5 = 0;
            let sum_6 = 0;

            let sum_7 = 0;

            const days = this.listTable?.[1].days + 1;

            this.listTable.forEach((v) => {
              // sum_1 +=
              // sum_2 +=
              // sum_3 +=
              // sum_4 +=
              // sum_5 +=
              // sum_6 +=
              // sum_7 +=
            });

            const supplier = this.supList.find((v) => v.id == this.supplierId);
            const { packageTypeName, fullyManagedType } = supplier;

            if (
              packageTypeName == "全托" &&
              [1, 2, 3].includes(fullyManagedType)
            ) {
              // 立方
              this.listTable.push({
                endDate: this.listTable?.[this.listTable.length - 1]?.endDate,
                startDate:
                  moment(this.dateTime).add(2, "months").month() + 1 + "月",
                remark: "库房费（立方）",
                d5: (sum_3 + sum_4) * 60 * days,
              });
            }
            if (
              packageTypeName == "半托" ||
              (packageTypeName == "全托" && [2, 4].includes(fullyManagedType))
            ) {
              // 包
              this.listTable.push({
                endDate: this.listTable?.[this.listTable.length - 1]?.endDate,
                startDate:
                  moment(this.dateTime).add(2, "months").month() + 1 + "月",
                remark: "库房费（包结）",
                d5: (sum_5 + sum_6) * 750,
              });
            }
          }
        })
        .catch(() => {
          this.listTable = [];
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
