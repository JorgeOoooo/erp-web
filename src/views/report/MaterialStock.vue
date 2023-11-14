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
                      v-for="(item, index) in depotList"
                      :key="index"
                      :value="item.id"
                    >
                      {{ item.name }}
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
          :columns="getColumns()"
          :dataSource="dataSource"
          :pagination="false"
          :loading="loading"
        >
          <template slot="name" slot-scope="text, record, index">
            <a
              v-if="index != dataSource?.length - 1"
              @click="showMaterialInOutList(record)"
              >{{ record.name }}</a
            >
            <span v-else>{{ record.name }}</span>
          </template>
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
    <MaterialInOutList ref="materialInOutList" :supList="supList" />
  </a-row>
</template>
<script>
import MaterialInOutList from "./modules/MaterialInOutList";
import { JeecgListMixin } from "@/mixins/JeecgListMixin";
import { getAction, httpAction } from "@/api/manage";
import { findBySelectSup } from "@/api/api";
import moment from "moment";
export default {
  name: "MaterialStock",
  mixins: [JeecgListMixin],
  components: {
    MaterialInOutList,
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
      // 表头
      columns: [
        {
          title: "库房",
          dataIndex: "name",
          align: "center",
          scopedSlots: { customRender: "name" },
        },
        { title: "件数", dataIndex: "depotCountNumber", align: "center" },
        { title: "立方", dataIndex: "volumn", align: "center" },
      ],
      url: {
        list: "/depot/supplier",
      },
      totalCountNumber: undefined,
      countTotablVol: undefined,
      countVol: undefined,
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
    getColumns() {
      const supplierId = this.getQueryParams()?.supplierId;
      if (!supplierId)
        return [
          ...this.columns,
          // { title: "使用立方", dataIndex: "usedVolumn", align: "center" },
        ];
      const supplier = this.supList.find((item) => item.id == supplierId);

      if (supplier?.packageTypeName == "半托") {
        return [...this.columns];
      } else {
        return [
          ...this.columns,
          { title: "使用立方", dataIndex: "usedVolumn", align: "center" },
        ];
      }
    },
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
    getDepotData(supplierId) {
      if (!supplierId) {
        this.depotList = [];
        return;
      }
      getAction("/depot/supplier/base", { supplierId }).then((res) => {
        if (res.code === 200) {
          this.depotList = res.data?.map((item) => {
            return {
              ...item,
              value: item.id,
              label: item.name,
            };
          });
        } else {
          this.$message.info(res.data);
        }
      });
    },
    changeSupplierId() {
      this.queryParam.depotId = undefined;
      this.getDepotData(this.getQueryParams()?.supplierId);
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
      getAction(this.url.list, params)
        .then((res) => {
          if (res.code === 200) {
            this.dataSource =
              res.data?.depotCurMaterialNodeVOPage?.records?.map((v, i) => ({
                ...v,
                id: Date.now() + "." + i,
              })) || [];
            this.ipagination.total =
              res.data?.depotCurMaterialNodeVOPage?.total || 0;
            this.totalCountNumber = res.data?.totalCountNumber;
            if (this.dataSource?.length) {
              this.dataSource.push({
                name: "总计",
                depotCountNumber: this.totalCountNumber,
                volumn: this.countTotablVol,
                usedVolumn: this.countVol,
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
    showMaterialInOutList(record) {
      console.log(record);
      const params = this.getQueryParams();
      const supplier = this.supList.find(
        (item) => item.id == params.supplierId
      );
      this.$refs.materialInOutList?.show({
        depotId: record.depotId,
        depotName: record?.name,
        ...(params.supplierId
          ? { supplierId: params.supplierId, supplier: supplier?.supplier }
          : {}),
      });
    },
  },
};
</script>
<style scoped>
@import "~@assets/less/common.less";
</style>
