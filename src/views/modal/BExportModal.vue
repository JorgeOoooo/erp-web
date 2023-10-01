<template>
  <a-modal
    title="导出"
    :width="860"
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
        <!-- <div class="page">
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
        </div> -->
        <div class="table">
          <table>
            <thead>
              <tr>
                <th :colspan="5" style="text-align: center">
                  萨达沃仓储服务中心
                </th>
              </tr>
              <tr>
                <th :colspan="3" style="text-align: center">
                  {{ "客户：" + (supplierName || "-") }}
                </th>
                <th :colspan="2" style="text-align: center">（结余明细）</th>
              </tr>
              <tr>
                <th :colspan="3" style="text-align: center">
                  {{ "日期：" + time }}
                </th>
                <th :colspan="2"></th>
              </tr>
              <tr>
                <th
                  v-for="col in columns"
                  :key="col.dataIndex"
                  style="text-align: center"
                >
                  {{ col.title }}
                </th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(data, index) in dataSource" :key="index">
                <td
                  v-for="(col, i) in columns"
                  :key="i"
                  style="text-align: center"
                >
                  {{
                    col.dataIndex == "index"
                      ? data?.index
                        ? data?.index
                        : index + 1
                      : data?.[col.dataIndex]
                  }}
                </td>
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
  props: ["dataSource", "supplierName", "time"],
  data() {
    return {
      visible: false,
      columns: [
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
