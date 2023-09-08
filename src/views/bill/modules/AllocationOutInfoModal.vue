<template>
  <a-modal
    :title="title"
    :width="1000"
    :visible="visible"
    :keyboard="false"
    :destroyOnClose="true"
    switchFullscreen
    @cancel="handleCancel"
    style="top: 20px; height: 95%"
  >
    <template slot="footer">
      <a-button @click="handleCancel">取消</a-button>
    </template>
    <div>
      <div class="bill-info">
        <div class="item">
          <span>单据编号：</span>
          <span>
            {{ model.number }}
          </span>
        </div>
      </div>
      <j-edit-line-table
        :columns="columns"
        :dataSource="dataSource"
        :dataFormat="dataFormat"
        :url="url"
        :form-data="{ headId: this.model.id }"
        @ok="getInInfo"
      >
        <template #volume="{ isEdit }">
          {{ isEdit }}
        </template>
      </j-edit-line-table>
    </div>
  </a-modal>
</template>
<script>
import JEditLineTable from "@/components/jeecg/JEditLineTable";
import JDate from "@/components/jeecg/JDate";
import { FormTypes } from "@/utils/JEditableTableUtil";
import { httpAction, getAction } from "@/api/manage";
export default {
  name: "AllocationOutInfoModal",
  components: {
    JEditLineTable,
    JDate,
    VNodes: {
      functional: true,
      render: (h, ctx) => ctx.props.vnodes,
    },
  },
  data() {
    const that = this;
    return {
      title: "详情",
      visible: false,
      model: {},
      url: {
        list: "/documentItem/head",
        add: "/documentItem/add",
        edit: "/documentItem/update",
        delete: "/documentItem/delete/",
      },
      columns: [
        {
          title: "商品款号",
          key: "materialId",
          dataIndex: "model",
          width: 200,
          type: FormTypes.select,
          options: [],
          allowSearch: true,
          validateRules: [
            { required: true, message: "必填", trigger: "change" },
          ],
          scopedSlots: { customRender: "model" },
          ellipsis: true,
        },
        {
          title: "件数",
          key: "operNumber",
          dataIndex: "operNumber",
          width: 120,
          type: FormTypes.inputNumber,
          min: 1,
          validateRules: [
            { required: true, message: "必填", trigger: "change" },
          ],
          scopedSlots: { customRender: "operNumber" },
        },
        {
          title: "调出仓库",
          key: "depotId",
          dataIndex: "depotName",
          width: 140,
          type: FormTypes.select,
          options: [],
          allowSearch: true,
          validateRules: [
            { required: true, message: "必填", trigger: "change" },
          ],
          scopedSlots: { customRender: "depotName" },
        },
        {
          title: "调入仓库",
          key: "anotherDepotId",
          dataIndex: "anotherDepotName",
          width: 140,
          type: FormTypes.select,
          options: [],
          allowSearch: true,
          validateRules: [
            { required: true, message: "必填", trigger: "change" },
          ],
          scopedSlots: { customRender: "anotherDepotName" },
        },
        {
          title: "备注",
          key: "remark",
          dataIndex: "remark",
          type: FormTypes.input,
          scopedSlots: { customRender: "remark" },
        },
        {
          title: "操作",
          key: "action",
          dataIndex: "action",
          width: 140,
          scopedSlots: { customRender: "action" },
        },
      ],
      dataSource: [],
      dataFormat: {
        operNumber: 1,
      },
    };
  },
  created() {},
  methods: {
    show(record) {
      this.model = record;
      this.getInInfo();
      this.getDepotData();
      this.getMaterialData();
      this.visible = true;
    },
    // 查询入库单详情
    getInInfo() {
      getAction(this.url.list, { headId: this.model.id }).then((res) => {
        if (res.code === 200) {
          this.dataSource = res.data || [];
        }
      });
    },
    // 查询可选商品列表
    getMaterialData() {
      httpAction("/material/model", {}, "get").then((res) => {
        if (res.code === 200) {
          this.columns[0].options =
            res.data?.map((item) => {
              return {
                ...item,
                value: item.id,
                label: item.name + (item.model ? `(${item.model})` : ""),
              };
            }) || [];
        } else {
          this.$message.info(res.data);
        }
      });
    },
    // 查询可选仓库列表
    getDepotData() {
      getAction("/depot/findDepotByCurrentUser").then((res) => {
        if (res.code === 200) {
          this.columns[2].options =
            res.data?.map((item) => {
              return {
                ...item,
                value: item.id,
                label: item.depotName,
              };
            }) || [];
          this.columns[3].options = this.columns[2].options;
        } else {
          this.$message.info(res.data);
        }
      });
    },
    /** 关闭弹窗 */
    close() {
      this.visible = false;
      this.$emit("close");
    },
    /** 关闭按钮点击事件 */
    handleCancel() {
      this.close();
    },
  },
};
</script>
<style scoped lang="less">
.bill-info {
  display: flex;
  margin-bottom: 8px;
  .item + .item {
    margin-left: 40px;
  }
}
</style>
