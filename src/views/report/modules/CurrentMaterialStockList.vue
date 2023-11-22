<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="800"
      :visible="visible"
      :getContainer="() => $refs.container"
      :maskClosable="false"
      @cancel="handleCancel"
      cancelText="关闭"
      style="top: 20px; height: 95%"
    >
      <template slot="footer">
        <a-button key="back" @click="handleCancel">关闭</a-button>
      </template>
      <!-- table区域-begin -->
      <a-table
        bordered
        ref="table"
        size="middle"
        rowKey="id"
        :columns="columns"
        :dataSource="dataSource"
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange"
      >
        <span slot="type" slot-scope="text">
          {{ renderTypeText(text) }}
        </span>
      </a-table>
      <!-- table区域-end -->
    </a-modal>
  </div>
</template>
<script>
import { JeecgListMixin } from "@/mixins/JeecgListMixin";
import { getAction, httpAction } from "@/api/manage";
import { method } from "lodash";
export default {
  name: "CurrentMaterialStockList",
  mixins: [JeecgListMixin],
  data() {
    return {
      title: "实时款号查询 - 流水",
      disableMixinCreated: true,
      model: {},
      columns: [
        { title: "单据编号", dataIndex: "number", width: 120 },
        {
          title: "单据类型",
          dataIndex: "type",
          width: 80,
          scopedSlots: { customRender: "type" },
        },
        {
          title: "库房",
          dataIndex: "depotName",
          width: 120,
          ellipsis: true,
        },
        {
          title: "款号",
          dataIndex: "model",
          width: 120,
          ellipsis: true,
        },
        { title: "件数", dataIndex: "operNumber", width: 80, ellipsis: true },
        { title: "车牌号", dataIndex: "carNumber", width: 80, ellipsis: true },
      ],
      url: {
        list: "/depotItem/flow",
      },
      visible: false,
    };
  },
  methods: {
    show(model) {
      this.model = Object.assign({}, model);
      this.visible = true;
      this.queryParam = {};
      this.loadData(1);
    },
    loadData(arg) {
      //加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1;
      }
      this.loading = true;
      getAction(this.url.list, this.model)
        .then((res) => {
          if (res.code === 200) {
            this.dataSource = res.data?.records || [];
            this.ipagination.total = res.data?.total || 0;
          } else {
            this.$message.warning(res.data);
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleCancel() {
      this.visible = false;
    },
    renderTypeText(type) {
      const typeMap = {
        2: "入库单",
        1: "出库单",
        5: "调拨单",
        3: "库存盘点单",
        6: "报损单",
        7: "报溢单",
      };
      return typeMap?.[type];
    },
  },
};
</script>
