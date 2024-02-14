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
                <a-month-picker
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
              :scroll="{ x: 1500 }"
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
      const renderContent = (value, row) => {
        const obj = {
          children: value,
          attrs: {},
        };
        if (row.balance == "剩余") {
          obj.attrs.colSpan = 0;
        }
        return obj;
      };

      const renderContent2 = (value, row) => {
        const obj = {
          children: value,
          attrs: {},
        };
        if (row.balance == "剩余") {
          obj.attrs.colSpan = 2;
        }
        return obj;
      };

      if (!this.supplierId || !this.dateTime) return [];
      const supplier = this.supList.find((v) => v.id == this.supplierId);
      if (!supplier) return [];
      const { packageTypeName, fullyManagedType } = supplier;
      let col_left = [];
      let col_right = [];
      if (packageTypeName == "全托" && [1, 2, 3].includes(fullyManagedType)) {
        col_left.push({
          title: supplier?.cubeDeliverFee + "/配送",
          align: "center",
          dataIndex: "cubeDeliverFee",
          width: 80,
        });
        col_left.push({
          title: supplier?.cubeWarehouseFee + "/库房",
          align: "center",
          dataIndex: "cubeWarehouseFee",
          width: 80,
        });

        col_right.push({
          title: "入库数量",
          align: "center",
          dataIndex: "inCubeNumber",
          width: 80,
          customRender: renderContent2,
        });
        col_right.push({
          title: "出库数量",
          align: "center",
          dataIndex: "outCubeNumber",
          width: 80,
          customRender: renderContent,
        });

        col_right.push({
          title: "入库立方",
          align: "center",
          dataIndex: "inCube",
          width: 80,
          customRender: renderContent2,
        });
        col_right.push({
          title: "出库立方",
          align: "center",
          dataIndex: "outCube",
          width: 80,
          customRender: renderContent,
        });
      }
      if (
        packageTypeName == "半托" ||
        (packageTypeName == "全托" && [2, 4].includes(fullyManagedType))
      ) {
        col_left.push({
          title: supplier?.packageDeliverFee + "/配送",
          align: "center",
          dataIndex: "packageDeliverFee",
          width: 80,
        });
        col_left.push({
          title: supplier?.packageWarehouseFee + "/库房",
          align: "center",
          dataIndex: "packageWarehouseFee",
          width: 80,
        });

        col_right.push({
          title: "750/包结",
          children: [
            {
              title: "入库数量",
              align: "center",
              dataIndex: "inNumber",
              width: 80,
              customRender: renderContent2,
            },
            {
              title: "出库数量",
              align: "center",
              dataIndex: "outNumber",
              width: 80,
              customRender: renderContent,
            },
          ],
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
          title: "额外费用",
          align: "center",
          dataIndex: "extraFee",
          width: 80,
        },
        {
          title: "摘要",
          children: [
            ...col_left,
            {
              title: "费用合计",
              align: "center",
              dataIndex: "totalFee",
              width: 80,
            },
            {
              title: "天数",
              align: "center",
              dataIndex: "days",
              width: 60,
            },
          ],
        },
        {
          title: "余额",
          align: "center",
          dataIndex: "balance",
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
            let balance = 0;
            this.listTable =
              data?.financeReportUnits.map((v) => {
                balance -= Number(v.totalFee);
                return {
                  ...v,
                  extraFee: v.extraFee == 0 ? "" : v.extraFee,
                  cubeDeliverFee: v.cubeDeliverFee == 0 ? "" : v.cubeDeliverFee,
                  cubeWarehouseFee:
                    v.cubeWarehouseFee == 0 ? "" : v.cubeWarehouseFee,
                  packageDeliverFee:
                    v.packageDeliverFee == 0 ? "" : v.packageDeliverFee,
                  packageWarehouseFee:
                    v.packageWarehouseFee == 0 ? "" : v.packageWarehouseFee,
                  totalFee: v.totalFee == 0 ? "" : v.totalFee,
                  // days: v.days == 0 ? "" : v.days,

                  balance: balance == 0 ? "" : balance,

                  inCubeNumber: v.inCubeNumber == 0 ? "" : v.inCubeNumber,
                  outCubeNumber: v.outCubeNumber == 0 ? "" : v.outCubeNumber,
                  inCube: v.inCube == 0 ? "" : v.inCube,
                  outCube: v.outCube == 0 ? "" : v.outCube,
                  inNumber: v.inNumber == 0 ? "" : v.inNumber,
                  outNumber: v.outNumber == 0 ? "" : v.outNumber,
                };
              }) || [];

            let sum_1 = 0;
            let sum_2 = 0;
            let sum_3 = 0;
            let sum_4 = 0;
            let sum_5 = 0;
            let sum_6 = 0;

            const days = this.listTable?.[1].days + 1;

            this.listTable.forEach((v) => {
              sum_1 += Number(v.inCubeNumber);
              sum_2 += Number(v.outCubeNumber);
              sum_3 += Number(v.inCube);
              sum_4 += Number(v.outCube);
              sum_5 += Number(v.inNumber);
              sum_6 += Number(v.outNumber);
              // sum_7 +=
            });

            const supplier = this.supList.find((v) => v.id == this.supplierId);
            const { packageTypeName, fullyManagedType } = supplier;

            if (
              packageTypeName == "全托" &&
              [1, 2, 3].includes(fullyManagedType)
            ) {
              // 立方
              const totalFee =
                (Number(sum_3) + Number(sum_4)) * 60 * Number(days);
              balance -= Number(totalFee);
              this.listTable.push({
                endDate: this.listTable?.[this.listTable.length - 1]?.endDate,
                startDate:
                  moment(this.dateTime).add(2, "months").month() + 1 + "月",
                remark: "库房费（立方）",
                days: days,
                totalFee: totalFee,
                balance: balance,
              });
            }
            if (
              packageTypeName == "半托" ||
              (packageTypeName == "全托" && [2, 4].includes(fullyManagedType))
            ) {
              // 包
              const d =
                packageTypeName == "全托" && fullyManagedType == 2 ? "" : days;
              const totalFee = (Number(sum_5) + Number(sum_6)) * 750;
              balance -= Number(totalFee);
              this.listTable.push({
                endDate: this.listTable?.[this.listTable.length - 1]?.endDate,
                startDate:
                  moment(this.dateTime).add(2, "months").month() + 1 + "月",
                remark: "库房费（包结）",
                days: d,
                totalFee: totalFee,
                balance: balance,
              });
            }

            this.listTable.push({
              endDate: "合计",
              totalFee: -balance,
              inCubeNumber: sum_1,
              outCubeNumber: sum_2,
              inCube: sum_3,
              outCube: sum_4,
              inNumber: sum_5,
              outNumber: sum_6,
            });

            this.listTable.push({
              balance: "剩余",
              inCubeNumber: Number(sum_1) + Number(sum_2),
              inCube: Number(sum_3) + Number(sum_4),
              inNumber: Number(sum_5) + Number(sum_6),
            });
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
