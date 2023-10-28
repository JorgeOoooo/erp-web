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
                    @change="searchQuery"
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
                  label="仓库"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-select
                    placeholder="请选择仓库"
                    showSearch
                    allowClear
                    optionFilterProp="children"
                    style="width: 100%"
                    :dropdownMatchSelectWidth="false"
                    v-model="queryParam.depotId"
                    @change="searchQuery"
                  >
                    <a-select-option
                      v-for="(depot, index) in depotList"
                      :value="depot.id"
                      :key="index"
                    >
                      {{ depot.depotName }}
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
        <section ref="print" id="reportPrint">
          <a-table
            bordered
            ref="table"
            size="middle"
            rowKey="id"
            :columns="columns"
            :dataSource="dataSource"
            :components="handleDrag(columns)"
            :pagination="ipagination"
            :loading="loading"
            @change="handleTableChange"
          >
            <!-- <span slot="action" slot-scope="text, record">
              <a @click="showMaterialInOutList(record)">{{
                record.id ? "流水" : ""
              }}</a>
            </span> -->
            <template slot="customRenderStock" slot-scope="text, record">
              <a-tooltip :title="record.bigUnitStock">
                {{ text }}
              </a-tooltip>
            </template>
          </a-table>
        </section>
      </a-card>
    </a-col>
  </a-row>
</template>
<script>
import MaterialInOutList from "./modules/MaterialInOutList";
import { JeecgListMixin } from "@/mixins/JeecgListMixin";
import { getAction, httpAction } from "@/api/manage";
import { queryMaterialCategoryTreeList } from "@/api/api";
import { getMpListShort, openDownloadDialog, sheet2blob } from "@/utils/util";
import { findBySelectSup } from "@/api/api";
import JEllipsis from "@/components/jeecg/JEllipsis";
import moment from "moment";
import Vue from "vue";
export default {
  name: "MaterialStock",
  mixins: [JeecgListMixin],
  components: {
    MaterialInOutList,
    JEllipsis,
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
      depotList: [],
      materialList: [],
      // 表头
      columns: [
        { title: "客户", dataIndex: "supplierName" },
        { title: "仓库", dataIndex: "depotName" },
        { title: "商品", dataIndex: "materialName" },
        { title: "库存", dataIndex: "currentNumber" },
      ],
      url: {
        list: "/material/getListWithStock",
      },
    };
  },
  created() {
    this.getDepotData();
    this.getSupplierData();
    this.getMaterialData();

    //初始化字典配置 在自己页面定义
    this.initDictConfig();
    //初始化按钮权限
    this.initActiveBtnStr();
  },
  mounted() {
    this.scroll.x = 1000;
  },
  methods: {
    moment,
    getQueryParams() {
      let param = Object.assign({}, this.queryParam, this.isorter);
      if (this.depotSelected && this.depotSelected.length > 0) {
        param.depotIds = this.depotSelected.join();
      }
      param.field = this.getQueryField();
      param.currentPage = this.ipagination.current;
      param.pageSize = this.ipagination.pageSize;
      return param;
    },
    getDepotData() {
      getAction("/depot/findDepotByCurrentUser").then((res) => {
        if (res.code === 200) {
          this.depotList = res.data;
        } else {
          this.$message.info(res.data);
        }
      });
    },
    getSupplierData() {
      let that = this;
      findBySelectSup({}).then((res) => {
        if (res) {
          that.supList = res;
        }
      });
    },
    getMaterialData() {
      httpAction("/material/model", {}, "get").then((res) => {
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
    searchQuery() {
      this.loadData(1);
    },
    loadData(arg) {
      //加载数据 若传入参数1则加载第一页的内容
      if (arg === 1) {
        this.ipagination.current = 1;
      }
      let params = this.getQueryParams(); //查询条件
      this.loading = true;
      getAction(this.url.list, params)
        .then((res) => {
          if (res.code === 200) {
            this.dataSource = res.data.records;
            this.ipagination.total = res.data.total;
            // this.tableAddTotalRow(this.columns, this.dataSource);
            // this.currentStock = res.data.currentStock.toFixed(2);
            // this.currentStockPrice = res.data.currentStockPrice.toFixed(2);
            // this.currentWeight = res.data.currentWeight.toFixed(2);
          } else {
            this.$message.warning(res.data);
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    showMaterialInOutList(record) {
      let depotIds = "";
      if (this.depotSelected && this.depotSelected.length > 0) {
        depotIds = this.depotSelected.join();
      }
      this.$refs.materialInOutList.show(record, depotIds);
      this.$refs.materialInOutList.title = "查看商品库存流水";
      this.$refs.materialInOutList.disableSubmit = false;
    },
  },
};
</script>
<style scoped>
@import "~@assets/less/common.less";
</style>
