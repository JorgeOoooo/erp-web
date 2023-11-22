<!-- from 7 5 2 7 1 8 9 2 0 -->
<template>
  <a-row :gutter="24">
    <a-col :md="24">
      <a-card :style="cardStyle" :bordered="false">
        <!-- 查询区域 -->
        <div class="table-page-search-wrapper">
          <a-form layout="inline" @keyup.enter.native="searchQuery">
            <a-row :gutter="24">
              <a-col :md="6" :sm="24">
                <a-form-item
                  label="客户"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-select
                    placeholder="请选择客户"
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    style="width: 100%"
                    :dropdownMatchSelectWidth="false"
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
                  label="款号"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-select
                    placeholder="请选择款号"
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    style="width: 100%"
                    :dropdownMatchSelectWidth="false"
                    v-model="queryParam.materialId"
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
                <span
                  style="float: left; overflow: hidden"
                  class="table-page-search-submitButtons"
                >
                  <a-button type="primary" @click="searchQuery">查询</a-button
                  ><a-button
                    style="margin-left: 8px"
                    type="dashed"
                    shape="circle"
                    icon="redo"
                    @click="searchQuery"
                  />
                </span>
              </a-col>
            </a-row>
          </a-form>
        </div>
        <!-- table区域-begin -->
        <a-table
          bordered
          ref="table"
          size="middle"
          rowKey="id"
          :columns="columns"
          :dataSource="dataSource"
          :pagination="false"
          :loading="loading"
        >
          <span slot="action" slot-scope="text, record, index">
            <a
              v-if="index != dataSource?.length - 1"
              @click="handleView(record)"
              >流水</a
            >
            <span v-else>{{ record.name }}</span>
          </span>
        </a-table>
        <a-pagination
          style="float: right; margin: 16px 0"
          @change="
            (current, pageSize) =>
              handleTableChange({ ...ipagination, current, pageSize }, null, {})
          "
          @showSizeChange="
            (current, pageSize) =>
              handleTableChange({ ...ipagination, current, pageSize }, null, {})
          "
          size="small"
          show-size-changer
          :showQuickJumper="true"
          :current="ipagination.current"
          :page-size="ipagination.pageSize"
          :page-size-options="ipagination.pageSizeOptions"
          :total="ipagination.total"
          :show-total="(total, range) => `${range[0]}-${range[1]} 共${total}条`"
        >
          <template slot="buildOptionText" slot-scope="props">
            <span>{{ props.value }}条/页</span>
          </template>
        </a-pagination>
      </a-card>
    </a-col>
    <CurrentMaterialStockList
      ref="CurrentMaterialStockList"
      :supList="supList"
    />
  </a-row>
</template>
<script>
import CurrentMaterialStockList from "./modules/CurrentMaterialStockList";
import { JeecgListMixin } from "@/mixins/JeecgListMixin";
import { getAction, httpAction } from "@/api/manage";
import { findBySelectSup } from "@/api/api";
import moment from "moment";
export default {
  name: "CurrentMaterialStock",
  mixins: [JeecgListMixin],
  components: {
    CurrentMaterialStockList,
  },
  data() {
    return {
      disableMixinCreated: true,
      labelCol: {
        span: 5,
      },
      wrapperCol: {
        span: 18,
        offset: 1,
      },
      // 查询条件
      queryParam: {},
      supList: [],
      // 表头
      columns: [
        {
          title: "操作",
          dataIndex: "action",
          align: "center",
          width: 80,
          scopedSlots: { customRender: "action" },
        },
        {
          title: "库房",
          dataIndex: "depotName",
          align: "center",
        },
        { title: "款号", dataIndex: "model", align: "center" },
        { title: "件数", dataIndex: "currentNumber", align: "center" },
      ],
      url: {
        list: "/material/getListWithStock",
      },
      materialList: [],
    };
  },
  created() {
    this.getSupplierData();
    this.searchQuery();

    // 初始化按钮权限
    this.initActiveBtnStr();
  },
  methods: {
    moment,
    getQueryParams() {
      let param = Object.assign({}, this.queryParam);
      param.current = this.ipagination.current;
      param.size = this.ipagination.pageSize;
      return param;
    },
    getSupplierData() {
      let that = this;
      findBySelectSup({}).then((res) => {
        if (res) {
          that.supList = res;
        }
      });
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
    changeSupplierId() {
      this.queryParam.materialId = undefined;
      this.getMaterialData(this.getQueryParams()?.supplierId);
      this.searchQuery();
    },
    searchQuery() {
      this.loadData(1);
    },
    loadData(arg) {
      //加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1;
      }
      let params = this.getQueryParams(); //查询条件

      // if (!params?.supplierId) {
      //   this.dataSource = [];
      //   this.ipagination.total = 0;
      //   return;
      // }

      this.loading = true;
      Promise.all([
        getAction(this.url.list, params),
        getAction("/material/sum/supplier/material", params),
      ])
        .then(([res, sum]) => {
          if (res.code === 200) {
            this.dataSource =
              res.data?.records?.map((v, i) => ({
                ...v,
                id: Date.now() + "." + i,
              })) || [];
            this.ipagination.total = res.data?.total || 0;
            if (this.dataSource?.length) {
              this.dataSource.push({
                name: "总计",
                currentNumber: sum.data,
                id: Date.now() + "",
              });
            }
          } else {
            this.$message.warning(res.data);
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleView(record) {
      this.$refs.CurrentMaterialStockList?.show({
        materialId: record.materialId,
      });
    },
  },
};
</script>
<style scoped>
@import "~@assets/less/common.less";
</style>
