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
      <!-- 查询区域 -->
      <div class="table-page-search-wrapper">
        <!-- 搜索区域 -->
        <a-form layout="inline" @keyup.enter.native="searchQuery">
          <a-row :gutter="24">
            <template v-if="!model?.supplierId">
              <a-col :md="6" :sm="24">
                <a-form-item
                  label="当前仓库"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  {{ model.depotName }}
                </a-form-item>
              </a-col>
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
            </template>
            <template v-else>
              <a-col :md="6" :sm="12">
                <a-form-item
                  label="当前仓库"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  {{ model.depotName }}
                </a-form-item>
              </a-col>
              <a-col :md="6" :sm="12">
                <a-form-item
                  label="当前客户"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  {{ model.supplier }}
                </a-form-item>
              </a-col>
            </template>
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
              <a-button type="primary" @click="searchQuery">查询</a-button>
              <a-button style="margin-left: 8px" @click="searchReset"
                >重置</a-button
              >
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
        :pagination="ipagination"
        :loading="loading"
        @change="handleTableChange"
      >
      </a-table>
      <!-- table区域-end -->
    </a-modal>
  </div>
</template>
<script>
import { JeecgListMixin } from "@/mixins/JeecgListMixin";
import { getAction, httpAction } from "@/api/manage";
import { findBySelectSup } from "@/api/api";
import moment from "moment";

export default {
  name: "MaterialInOutList",
  mixins: [JeecgListMixin],
  components: {},
  props: ["supList"],
  data() {
    return {
      title: "实时库存 - 仓库明细",
      disableMixinCreated: true,
      labelCol: {
        span: 5,
      },
      wrapperCol: {
        span: 18,
        offset: 1,
      },
      model: {},
      // 查询条件
      queryParam: {},
      // 表头
      columns: [
        { title: "款号", dataIndex: "model", align: "center" },
        { title: "件数", dataIndex: "countNumber", align: "center" },
      ],
      url: {
        list: "/depot/supplier/depot",
      },
      visible: false,
      materialList: [],
    };
  },
  created() {},
  methods: {
    getColumns() {
      if (this.model?.supplierId) {
        return [...this.columns];
      } else {
        return [
          {
            title: "客户",
            dataIndex: "name",
            align: "center",
          },
          ...this.columns,
        ];
      }
    },
    show(model) {
      this.model = Object.assign({}, model);
      this.visible = true;
      this.queryParam = {};
      this.loadData(1);
      this.materialList = [];
      if (this.model?.supplierId) {
        this.getMaterialData(this.model.supplierId);
      }
    },
    getQueryParams() {
      let param = Object.assign({}, this.queryParam, this.model);
      param.current = this.ipagination.current;
      param.size = this.ipagination.pageSize;
      return param;
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
    changeSupplierId() {
      this.queryParam.materialId = undefined;
      this.getMaterialData(this.getQueryParams()?.supplierId);
      this.searchQuery();
    },
    getMaterialData(supplierId) {
      if (!supplierId) {
        this.materialList = [];
        return;
      }
      getAction("/material/model", {
        supplierId,
        depotId: this.model?.depotId,
      }).then((res) => {
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
  },
};
</script>
<style scoped>
@import "~@assets/less/common.less";
</style>
