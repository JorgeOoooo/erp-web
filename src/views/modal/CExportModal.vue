<template>
  <a-modal
    title="导出"
    width="90%"
    :visible="visible"
    :maskClosable="false"
    :keyboard="false"
    style="top: 10px"
    @cancel="handleCancel"
    wrapClassName="my-a-modal"
  >
    <template slot="footer">
      <a-button v-print="'#print'">普通打印</a-button>
      <a-button key="back" @click="handleCancel">取消</a-button>
    </template>
    <div id="export-scroll">
      <div id="print">
        <div class="table">
          <table>
            <thead>
              <tr>
                <th
                  :colspan="
                    7 +
                    col_left?.length +
                    col_right_1.length +
                    (col_right_2.length ? 2 : 1)
                  "
                  style="text-align: center"
                >
                  {{ exportTitle }}
                </th>
              </tr>
              <tr>
                <th :colspan="2" style="text-align: center">日期</th>
                <th :rowspan="2" style="text-align: center">备注</th>
                <th :rowspan="2" style="text-align: center">额外费用</th>
                <th :colspan="col_left.length" style="text-align: center">
                  摘要
                </th>
                <th :rowspan="2" style="text-align: center">余额</th>
                <th
                  v-for="col in col_right_1"
                  :key="col.dataIndex + col.title"
                  :rowspan="2"
                  :colspan="1"
                  style="text-align: center"
                >
                  {{ col.title }}
                </th>
                <th
                  v-for="col in col_right_2"
                  :key="col.dataIndex + col.title"
                  :rowspan="1"
                  :colspan="2"
                  style="text-align: center"
                >
                  {{ col.title }}
                </th>
              </tr>
              <tr>
                <th style="text-align: center">结束时间</th>
                <th style="text-align: center">结开始时间</th>
                <th
                  v-for="col in col_left"
                  :key="col.dataIndex + col.title"
                  style="text-align: center"
                >
                  {{ col.title }}
                </th>
                <!-- <th
                  v-for="col in col_right_1"
                  :key="col.dataIndex + col.title"
                  style="text-align: center"
                >
                  {{ col.title }}
                </th> -->
                <template v-if="col_right_2?.length">
                  <th
                    v-for="col in col_right_2?.[0].children"
                    :key="col.dataIndex + col.title"
                    style="text-align: center"
                  >
                    {{ col.title }}
                  </th>
                </template>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(data, index) in dataSource" :key="index">
                <td style="text-align: center">
                  {{ data?.endDate }}
                </td>
                <td style="text-align: center">
                  {{ data?.startDate }}
                </td>
                <td style="text-align: center">
                  {{ data?.remark }}
                </td>
                <td style="text-align: center">
                  {{ data?.extraFee }}
                </td>
                <td
                  v-for="col in col_left"
                  :key="col.dataIndex + col.title"
                  style="text-align: center"
                >
                  {{ data?.[col.dataIndex] }}
                </td>
                <td style="text-align: center">
                  {{ data?.balance }}
                </td>
                <td
                  v-for="col in col_right_1"
                  :key="col.dataIndex + col.title"
                  style="text-align: center"
                >
                  {{ data?.[col.dataIndex] }}
                </td>
                <template v-if="col_right_2?.length">
                  <td
                    v-for="col in col_right_2?.[0].children"
                    :key="col.dataIndex + col.title"
                    style="text-align: center"
                  >
                    {{ data?.[col.dataIndex] }}
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </a-modal>
</template>
<script>
export default {
  props: [
    "columns",
    "dataSource",
    "exportTitle",
    "time",
    "col_right_1",
    "col_right_2",
    "col_left",
  ],
  data() {
    return {
      visible: false,
    };
  },
  methods: {
    show() {
      this.visible = true;
    },
    handleCancel() {
      this.close();
    },
    close() {
      this.$emit("close");
      this.visible = false;
    },
  },
};
</script>
<style>
.my-a-modal .ant-modal-body {
  height: 80vh;
  padding: 0 !important;
}
</style>
<style scoped>
table {
  /*为页面中所有的table标签添加样式*/
  width: 100%;
  margin: auto; /*让表格居中显示*/
  border: black 1px solid; /*添加边框*/
  border-spacing: 0px; /*标签及其子标签边框之间的白色空隙*/
  border-collapse: collapse; /*去掉重合线*/
}

th {
  /*为页面中所有的th标签添加样式*/
  border: black 1px solid; /*添加边框*/
}
td {
  /*为页面中所有的td标签添加样式*/
  border: black 1px solid; /*添加边框*/
}
</style>
<style lang="less" scoped>
#export-scroll {
  height: 100%;
  overflow-y: auto;
  #print {
    padding: 28px;
  }
}

.title {
  font-size: 18px;
  margin-bottom: 12px;
  text-align: center;
}
.key-value {
  margin-bottom: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.table + .table {
  margin-top: 24px;
}

@page {
  size: auto A4 landscape;
  margin: 3mm;
}
</style>
