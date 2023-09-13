<template>
  <a-row :gutter="24">
    <a-col :md="24">
      <a-card :style="cardStyle" :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
          <!-- 搜索区域 -->
          <a-form layout="inline" @keyup.enter.native="searchQuery">
            <a-row :gutter="24">
              <a-col :md="6" :sm="24">
                <a-form-item
                  label="单据编号"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-input
                    allowClear
                    placeholder="请输入单据编号"
                    v-model="queryParam.number"
                  ></a-input>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item
                  label="客户"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-select
                    placeholder="选择客户"
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    v-model="queryParam.supplierId"
                  >
                    <a-select-option
                      v-for="(item, index) in supList"
                      :key="index"
                      :value="item.id"
                    >
                      {{ item.supplier }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item
                  label="单据日期"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-range-picker
                    style="width: 100%"
                    v-model="queryParam.createTimeRange"
                    format="YYYY-MM-DD"
                    :placeholder="['开始时间', '结束时间']"
                    allowClear
                    @change="onDateChange"
                    @ok="onDateOk"
                  />
                </a-form-item>
              </a-col>
              <span
                style="float: left; overflow: hidden"
                class="table-page-search-submitButtons"
              >
                <a-col :md="6" :sm="24">
                  <a-button type="primary" @click="searchQuery">查询</a-button>
                  <a-button style="margin-left: 8px" @click="searchReset"
                    >重置</a-button
                  >
                  <a-button
                    style="margin-left: 8px"
                    type="dashed"
                    shape="circle"
                    icon="redo"
                    @click="searchQuery"
                  />
                </a-col>
              </span>
            </a-row>
          </a-form>
        </div>
        <!-- 操作按钮区域 -->
        <div class="table-operator" style="margin-top: 5px">
          <a-button
            v-if="btnEnableList.indexOf(1) > -1"
            @click="myHandleAdd"
            type="primary"
            icon="plus"
            >新增</a-button
          >
          <a-dropdown>
            <a-menu slot="overlay">
              <a-menu-item
                key="1"
                v-if="btnEnableList.indexOf(1) > -1"
                @click="batchDel"
                ><a-icon type="delete" />删除</a-menu-item
              >
            </a-menu>
            <a-button> 批量操作 <a-icon type="down" /> </a-button>
          </a-dropdown>
          <a-tooltip
            placement="left"
            title="全托需要箱柜和体积；半托全部按包计算，不需要箱柜和体积。"
            slot="action"
          >
            <a-icon
              v-if="btnEnableList.indexOf(1) > -1"
              type="question-circle"
              style="font-size: 20px; float: right"
            />
          </a-tooltip>
        </div>
        <!-- table区域-begin -->
        <div>
          <a-table
            ref="table"
            size="middle"
            bordered
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :components="handleDrag(columns)"
            :pagination="ipagination"
            :scroll="scroll"
            :loading="loading"
            :rowSelection="{
              selectedRowKeys: selectedRowKeys,
              onChange: onSelectChange,
            }"
            @change="handleTableChange"
          >
            <span slot="action" slot-scope="text, record">
              <!-- <a @click="myHandleDetail(record, 2, prefixNo)">打印</a>
              <a-divider type="vertical" /> -->
              <!-- <a @click="myHandleInfo(record)">详情</a>
              <a-divider v-if="btnEnableList.indexOf(1) > -1" type="vertical" /> -->
              <a
                v-if="btnEnableList.indexOf(1) > -1"
                @click="myHandleEdit(record)"
                >编辑</a
              >
              <a-divider v-if="btnEnableList.indexOf(1) > -1" type="vertical" />
              <!-- <a
                v-if="btnEnableList.indexOf(1) > -1"
                @click="myHandleCopyAdd(record)"
                >复制</a
              >
              <a-divider v-if="btnEnableList.indexOf(1) > -1" type="vertical" /> -->
              <a-popconfirm
                v-if="btnEnableList.indexOf(1) > -1"
                title="确定删除吗?"
                @confirm="() => myHandleDelete(record)"
              >
                <a>删除</a>
              </a-popconfirm>
            </span>
            <template slot="customRenderType" slot-scope="packageType">
              <span v-if="packageType == '1'">全托</span>
              <span v-if="packageType == '2'">半托</span>
            </template>
            <template slot="customRenderStatus" slot-scope="status">
              <a-tag v-if="status == '0'" color="red">未审核</a-tag>
              <a-tag v-if="status == '1'" color="green">已审核</a-tag>
              <a-tag v-if="status == '9'" color="orange">审核中</a-tag>
            </template>
          </a-table>
        </div>
        <!-- table区域-end -->
        <!-- 表单区域 -->
        <other-in-modal
          ref="modalForm"
          @ok="modalFormOk"
          @close="modalFormClose"
        ></other-in-modal>
        <!-- <bill-detail
          ref="modalDetail"
          @ok="modalFormOk"
          @close="modalFormClose"
        ></bill-detail> -->
        <!-- <bill-info-modal
          ref="billInfo"
          @ok="modalFormOk"
          @close="modalFormClose"
        ></bill-info-modal> -->
      </a-card>
    </a-col>
  </a-row>
</template>
<!--power by ji shenghua-->
<script>
import OtherInModal from "./modules/OtherInModal";
// import BillDetail from "./dialog/BillDetailSimple";
// import BillInfoModal from "./modules/BillInfoModal";
import { JeecgListMixin } from "@/mixins/JeecgListMixin";
import { BillListMixinSimple } from "./mixins/BillListMixinSimple";
import JDate from "@/components/jeecg/JDate";
import Vue from "vue";
export default {
  name: "OtherInList",
  mixins: [JeecgListMixin, BillListMixinSimple],
  components: {
    OtherInModal,
    // BillInfoModal,
    // BillDetail,
    JDate,
  },
  data() {
    return {
      // 查询条件
      queryParam: {
        number: "",
        supplierId: undefined,
        type: "2",
        subType: "其它",
        roleType: Vue.ls.get("roleType"),
      },
      prefixNo: "QTRK",
      labelCol: {
        span: 5,
      },
      wrapperCol: {
        span: 18,
        offset: 1,
      },
      // 表头
      columns: [
        {
          title: "操作",
          dataIndex: "action",
          align: "center",
          width: 100,
          scopedSlots: { customRender: "action" },
        },
        { title: "单据编号", dataIndex: "number", width: 120 },
        {
          title: "客户",
          dataIndex: "supplierName",
          width: 120,
          ellipsis: true,
        },
        { title: "单据日期", dataIndex: "createTime", width: 80 },
        {
          title: "仓管模式",
          dataIndex: "packageType",
          width: 80,
          scopedSlots: { customRender: "customRenderType" },
        },
        { title: "车牌号", dataIndex: "carNumber", width: 80, ellipsis: true },
        { title: "操作员", dataIndex: "creator", width: 80, ellipsis: true },
      ],
      url: {
        list: "/documentHead/list",
        delete: "/documentHead/delete",
        deleteBatch: "/documentHead/deleteBatch",
        batchSetStatusUrl: "/documentHead/batchSetStatus",
      },
    };
  },
  computed: {},
  created() {
    this.initSystemConfig();
    this.initSupplier();
    this.getDepotData();
    this.initUser();
  },
  methods: {
    onDateChange: function (value, dateString) {
      this.queryParam.beginTime = dateString[0];
      this.queryParam.endTime = dateString[1];
    },
  },
};
</script>
<style scoped>
@import "~@assets/less/common.less";
</style>
