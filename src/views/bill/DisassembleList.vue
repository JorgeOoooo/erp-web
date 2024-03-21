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
                    @change="changeSupplierId"
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
                  label="商品"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-select
                    placeholder="请选择商品"
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    style="width: 100%"
                    :dropdownMatchSelectWidth="false"
                    v-model="queryParam.model"
                    @change="searchQuery"
                  >
                    <a-select-option
                      v-for="(item, index) in materialList"
                      :key="index"
                      :value="item.value"
                    >
                      {{ item.label }}
                    </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item
                  label="单据类型"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-select
                    placeholder="请选择单据类型"
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    style="width: 100%"
                    :dropdownMatchSelectWidth="false"
                    v-model="queryParam.type"
                    @change="searchQuery"
                  >
                    <a-select-option value="2"> 入库单 </a-select-option>
                    <a-select-option value="1"> 出库单 </a-select-option>
                    <a-select-option value="5"> 调拨单 </a-select-option>
                    <a-select-option value="3"> 库存盘点单 </a-select-option>
                    <a-select-option value="6"> 报损单 </a-select-option>
                    <a-select-option value="7"> 报溢单 </a-select-option>
                  </a-select>
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="24">
                <a-form-item
                  label="单据日期"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-date-picker
                    :format="dateFormat"
                    @change="changeDateTime"
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
            :pagination="false"
            :loading="loading"
            :rowSelection="{
              selectedRowKeys: selectedRowKeys,
              onChange: onSelectChange,
            }"
          >
            <span slot="action" slot-scope="text, record, index">
              <a
                v-if="index != dataSource?.length - 1"
                @click="handleView(record)"
                >详情</a
              >
              <span v-else>{{ record.name }}</span>
            </span>
            <span slot="type" slot-scope="text">
              {{ renderTypeText(text) }}
            </span>
          </a-table>
          <a-pagination
            style="float: right; margin: 16px 0"
            @change="
              (current, pageSize) =>
                handleTableChange(
                  { ...ipagination, current, pageSize },
                  null,
                  {}
                )
            "
            @showSizeChange="
              (current, pageSize) =>
                handleTableChange(
                  { ...ipagination, current, pageSize },
                  null,
                  {}
                )
            "
            size="small"
            show-size-changer
            :showQuickJumper="true"
            :current="ipagination.current"
            :page-size="ipagination.pageSize"
            :page-size-options="ipagination.pageSizeOptions"
            :total="ipagination.total"
            :show-total="
              (total, range) => `${range[0]}-${range[1]} 共${total}条`
            "
          >
            <template slot="buildOptionText" slot-scope="props">
              <span>{{ props.value }}条/页</span>
            </template>
          </a-pagination>
        </div>
        <!-- table区域-end -->
        <!-- 表单区域 -->
        <other-in-modal
          ref="otherInModal"
          :billType="2"
          @close="handleCloseView"
        ></other-in-modal>
        <other-out-modal
          ref="otherOutModal"
          :billType="billType"
          @close="handleCloseView"
        ></other-out-modal>
        <allocation-out-modal
          ref="allocationOutModal"
          @ok="modalFormOk"
          @close="modalFormClose"
        ></allocation-out-modal>
        <assemble-modal
          ref="assembleModal"
          @close="handleCloseView"
        ></assemble-modal>
      </a-card>
    </a-col>
  </a-row>
</template>
<script>
import moment from "moment";
import OtherInModal from "./modules/OtherInModal";
import OtherOutModal from "./modules/OtherOutModal";
import AllocationOutModal from "./modules/AllocationOutModal";
import AssembleModal from "./modules/AssembleModal";
import { getAction, httpAction } from "@/api/manage";
import { JeecgListMixin } from "@/mixins/JeecgListMixin";
import { BillListMixinSimple } from "./mixins/BillListMixinSimple";
import JDate from "@/components/jeecg/JDate";
import Vue from "vue";
export default {
  name: "OtherInList",
  mixins: [JeecgListMixin, BillListMixinSimple],
  components: {
    OtherInModal,
    OtherOutModal,
    AllocationOutModal,
    AssembleModal,
    JDate,
  },
  data() {
    return {
      dType: "all",
      // 查询条件
      queryParam: {
        number: "",
        supplierId: undefined,
        subType: "其它",
        model: undefined,
        type: undefined,
        roleType: Vue.ls.get("roleType"),
        createTime: undefined,
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
          width: 60,
          scopedSlots: { customRender: "action" },
        },
        { title: "单据日期", dataIndex: "createTime", width: 80 },
        { title: "单据编号", dataIndex: "number", width: 120 },
        {
          title: "单据类型",
          dataIndex: "type",
          width: 80,
          scopedSlots: { customRender: "type" },
        },
        {
          title: "客户",
          dataIndex: "supplierName",
          width: 120,
          ellipsis: true,
        },
        { title: "车牌号", dataIndex: "carNumber", width: 80, ellipsis: true },
        { title: "件数", dataIndex: "countNumber", width: 80, ellipsis: true },
      ],
      url: {
        list: "/documentHead/list",
        delete: "/documentHead/delete",
        deleteBatch: "/documentHead/deleteBatch",
        batchSetStatusUrl: "/documentHead/batchSetStatus",
      },
      materialList: [],
      dateFormat: "YYYY-MM-DD",
      billType: "1",
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
    loadData(arg) {
      if (!this.url.list) {
        this.$message.error("请设置url.list属性!");
        return;
      }
      //加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1;
      }
      var params = this.getQueryParams(); //查询条件
      this.loading = true;
      Promise.all([
        getAction(this.url.list, params),
        getAction("/documentHead/sum", this.queryParam),
      ]).then(([res, sum]) => {
        if (res.code === 200) {
          let data = res.data?.records || [];
          this.ipagination.total = res.data?.total || 0;
          if (data?.length) {
            data.push({
              name: "总计",
              countNumber: sum.data,
              id: Date.now() + "",
            });
          }
          this.dataSource = data;
          console.log(data);
        }
        if (res.code === 510) {
          this.$message.warning(res.data);
        }
        this.loading = false;
      });
    },
    changeDateTime(val) {
      this.queryParam.createTime = val
        ? moment(val).format(this.dateFormat)
        : undefined;
      this.searchQuery();
    },
    changeSupplierId() {
      this.queryParam.materialId = undefined;
      this.getMaterialData(this.queryParam.supplierId);
      this.searchQuery();
    },
    getMaterialData(supplierId) {
      if (!supplierId) {
        this.materialList = [];
        return;
      }
      getAction("/material/model", { supplierId }).then((res) => {
        if (res.code === 200) {
          this.materialList = res.data?.map((item) => {
            return {
              ...item,
              value: item.id,
              label: item.model,
            };
          });
        } else {
          this.$message.info(res.data);
        }
      });
    },
    handleView(record) {
      switch (record?.type) {
        case 2:
          this.$refs.otherInModal.openView(record);
          break;
        case 1:
        case 6:
        case 7:
          this.billType = record.type;
          this.$refs.otherOutModal.openView(record);
          break;
        case 5:
          this.$refs.allocationOutModal.openView(record);
          break;
        case 3:
          this.$refs.assembleModal.openView(record);
          break;
        default:
          break;
      }
    },
    handleCloseView() {},
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
<style scoped>
@import "~@assets/less/common.less";
</style>
