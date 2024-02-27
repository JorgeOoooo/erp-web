<!-- by 7527189 2 0 -->
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
                  label="客户"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-select
                    placeholder="请选择客户"
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
              <!-- <a-col :md="6" :sm="24">
                <a-form-item
                  label="类别"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-tree-select
                    style="width: 100%"
                    :dropdownStyle="{ maxHeight: '200px', overflow: 'auto' }"
                    allow-clear
                    :treeData="categoryTree"
                    v-model="queryParam.categoryId"
                    placeholder="请选择类别"
                  >
                  </a-tree-select>
                </a-form-item>
              </a-col> -->
              <a-col :md="6" :sm="24">
                <a-form-item
                  label="关键词"
                  :labelCol="labelCol"
                  :wrapperCol="wrapperCol"
                >
                  <a-input
                    placeholder="请输入名称、款号查询"
                    v-model="queryParam.materialParam"
                  ></a-input>
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
            @click="handleAdd"
            type="primary"
            icon="plus"
            >新增</a-button
          >
          <a-button
            v-if="btnEnableList.indexOf(1) > -1"
            @click="handleImportXls()"
            type="primary"
            icon="import"
            >导入</a-button
          >
          <!-- <a-button
            type="primary"
            icon="download"
            @click="handleExportXls('商品信息')"
            >导出</a-button
          > -->
          <a-dropdown>
            <a-menu slot="overlay">
              <a-menu-item
                key="1"
                v-if="btnEnableList.indexOf(1) > -1"
                @click="batchDel"
                ><a-icon type="delete" />删除</a-menu-item
              >
              <!-- <a-menu-item
                key="2"
                v-if="btnEnableList.indexOf(1) > -1"
                @click="batchSetStatus(true)"
                ><a-icon type="check-square" />启用</a-menu-item
              >
              <a-menu-item
                key="3"
                v-if="btnEnableList.indexOf(1) > -1"
                @click="batchSetStatus(false)"
                ><a-icon type="close-square" />禁用</a-menu-item
              >
              <a-menu-item
                key="4"
                v-if="btnEnableList.indexOf(1) > -1"
                @click="batchEdit()"
                ><a-icon type="edit" />批量编辑</a-menu-item
              >
              <a-menu-item
                key="5"
                v-if="btnEnableList.indexOf(1) > -1"
                @click="batchSetMaterialCurrentStock()"
                ><a-icon type="stock" />修正库存</a-menu-item
              > -->
            </a-menu>
            <a-button> 批量操作 <a-icon type="down" /> </a-button>
          </a-dropdown>
          <a-popover trigger="click" placement="right">
            <template slot="content">
              <a-checkbox-group
                @change="onColChange"
                v-model="settingColumns"
                :defaultValue="settingColumns"
              >
                <a-row style="width: 500px">
                  <template v-for="(item, index) in defColumns">
                    <template>
                      <a-col :span="8" :key="index">
                        <a-checkbox :value="item.dataIndex">
                          <j-ellipsis
                            :value="item.title"
                            :length="10"
                          ></j-ellipsis>
                        </a-checkbox>
                      </a-col>
                    </template>
                  </template>
                </a-row>
              </a-checkbox-group>
            </template>
            <a-button icon="setting">列设置</a-button>
          </a-popover>
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
              columnWidth: '40px',
            }"
            @change="handleTableChange"
          >
            <span slot="action" slot-scope="text, record">
              <a @click="handleEdit(record)">编辑</a>
              <a-divider v-if="btnEnableList.indexOf(1) > -1" type="vertical" />
              <a-popconfirm
                v-if="btnEnableList.indexOf(1) > -1"
                title="确定删除吗?"
                @confirm="() => handleDelete(record.id)"
              >
                <a>删除</a>
              </a-popconfirm>
            </span>
            <template slot="customPic" slot-scope="text, record">
              <a-popover placement="right" trigger="click">
                <template slot="content">
                  <img :src="getImgUrl(record.imgName, '')" width="500px" />
                </template>
                <div style="width: 52px; height: 52px" v-if="record.imgName">
                  <img
                    v-if="record.imgName"
                    :src="getImgUrl(record.imgName, 'mini')"
                    class="item-img"
                    title="查看大图"
                  />
                </div>
              </a-popover>
            </template>
            <template slot="customBarCode" slot-scope="text, record">
              {{ record.mBarCode }}
            </template>
            <template slot="customName" slot-scope="text, record">
              {{ record.name }}
              <a-tag v-if="record.enableSerialNumber == 1" color="orange"
                >序</a-tag
              >
              <a-tag v-if="record.enableBatchNumber == 1" color="orange"
                >批</a-tag
              >
            </template>
            <template slot="customRenderStock" slot-scope="text, record">
              <a-tooltip :title="record.bigUnitStock">
                {{ text }}
              </a-tooltip>
            </template>
            <template slot="customRenderEnabled" slot-scope="enabled">
              <a-tag v-if="enabled" color="green">启用</a-tag>
              <a-tag v-if="!enabled" color="orange">禁用</a-tag>
            </template>
            <template slot="pricingType" slot-scope="text">
              {{
                text == 1
                  ? "包"
                  : text == 2
                  ? "立方"
                  : text == 3
                  ? "长存-包"
                  : text == 4
                  ? "长存-立方"
                  : ""
              }}
            </template>
          </a-table>
        </div>
        <!-- table区域-end -->
        <!-- 表单区域 -->
        <material-modal ref="modalForm" @ok="modalFormOk"></material-modal>
        <import-modal ref="modalImportForm" @ok="modalFormOk"></import-modal>
        <batch-set-info-modal
          ref="batchSetInfoModalForm"
          @ok="modalFormOk"
        ></batch-set-info-modal>
      </a-card>
    </a-col>
  </a-row>
</template>
<script>
import MaterialModal from "./modules/MaterialModal";
import ImportModal from "@/components/tools/ImportModal";
import BatchSetInfoModal from "./modules/BatchSetInfoModal";
import { queryMaterialCategoryTreeList } from "@/api/api";
import { postAction, getFileAccessHttpUrl } from "@/api/manage";
import { getMpListShort } from "@/utils/util";
import { JeecgListMixin } from "@/mixins/JeecgListMixin";
import JEllipsis from "@/components/jeecg/JEllipsis";
import JDate from "@/components/jeecg/JDate";
import { BillListMixinSimple } from "../bill/mixins/BillListMixinSimple";
import Vue from "vue";

export default {
  name: "MaterialList",
  mixins: [JeecgListMixin, BillListMixinSimple],
  components: {
    MaterialModal,
    ImportModal,
    BatchSetInfoModal,
    JEllipsis,
    JDate,
  },
  data() {
    return {
      categoryTree: [],
      mPropertyListShort: "",
      model: {},
      labelCol: {
        span: 5,
      },
      wrapperCol: {
        span: 18,
        offset: 1,
      },
      // 查询条件
      queryParam: {
        supplierId: undefined,
        categoryId: "",
        materialParam: "",
        // color: "",
        // materialOther: "",
        // weight: "",
        // expiryNum: "",
        // enabled: "",
        // enableSerialNumber: "",
        // enableBatchNumber: "",
        // position: "",
        // remark: "",
        // mpList: getMpListShort(Vue.ls.get("materialPropertyList")), //扩展属性
      },
      ipagination: {
        pageSizeOptions: ["10", "20", "30", "50", "100", "200"],
      },
      // 实际表头
      columns: [],
      // 初始化设置的表头
      settingColumns: [
        "mBarCode",
        "name",
        "standard",
        "model",
        "color",
        "categoryName",
        "materialOther",
        "stock",
        "purchaseDecimal",
        "commodityDecimal",
        "wholesaleDecimal",
        "lowDecimal",
        "enabled",
        "enableSerialNumber",
        "enableBatchNumber",
        "action",
        "supplier",
        "pricingType",
      ],
      // 默认的列
      defColumns: [
        {
          title: "操作",
          dataIndex: "action",
          align: "center",
          width: 100,
          scopedSlots: { customRender: "action" },
        },
        { title: "款号", dataIndex: "model", width: 120 },
        { title: "所属客户", dataIndex: "supplier", width: 120 },
        {
          title: "计价类型",
          dataIndex: "pricingType",
          width: 120,
          scopedSlots: { customRender: "pricingType" },
        },
        { title: "箱规", dataIndex: "standard", width: 120 },
        {
          title: "类别",
          dataIndex: "categoryName",
          width: 100,
          ellipsis: true,
        },
      ],
      url: {
        list: "/material/list",
        delete: "/material/delete",
        deleteBatch: "/material/deleteBatch",
        importExcelUrl: "/material/import",
        exportXlsUrl: "/material/exportExcel",
        batchSetStatusUrl: "/material/batchSetStatus",
        batchSetMaterialCurrentStockUrl:
          "/material/batchSetMaterialCurrentStock",
      },
    };
  },
  created() {
    this.model = Object.assign({}, {});
    this.initColumnsSetting();
    this.loadTreeData();
    this.initSupplier();
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG["domianURL"]}${this.url.importExcelUrl}`;
    },
  },
  methods: {
    //加载初始化列
    initColumnsSetting() {
      let columnsStr = Vue.ls.get("materialColumns");
      if (columnsStr && columnsStr.indexOf(",") > -1) {
        this.settingColumns = columnsStr.split(",");
      }
      this.columns = this.defColumns.filter((item) => {
        if (this.settingColumns.includes(item.dataIndex)) {
          return true;
        }
        return false;
      });
    },
    //列设置更改事件
    onColChange(checkedValues) {
      this.columns = this.defColumns.filter((item) => {
        if (checkedValues.includes(item.dataIndex)) {
          return true;
        }
        return false;
      });
      let columnsStr = checkedValues.join();
      Vue.ls.set("materialColumns", columnsStr);
    },
    loadTreeData() {
      let that = this;
      let params = {};
      params.id = "";
      queryMaterialCategoryTreeList(params).then((res) => {
        if (res) {
          that.categoryTree = [];
          for (let i = 0; i < res.length; i++) {
            let temp = res[i];
            that.categoryTree.push(temp);
          }
        }
      });
    },
    batchSetMaterialCurrentStock() {
      if (this.selectedRowKeys.length <= 0) {
        this.$message.warning("请选择一条记录！");
      } else {
        let ids = "";
        for (let a = 0; a < this.selectedRowKeys.length; a++) {
          ids += this.selectedRowKeys[a] + ",";
        }
        let that = this;
        this.$confirm({
          title: "确认操作",
          content: "是否操作选中数据?",
          onOk: function () {
            that.loading = true;
            postAction(that.url.batchSetMaterialCurrentStockUrl, { ids: ids })
              .then((res) => {
                if (res.code === 200) {
                  that.$message.info("修正库存成功！");
                  that.loadData();
                  that.onClearSelected();
                } else {
                  that.$message.warning(res.data.message);
                }
              })
              .finally(() => {
                that.loading = false;
              });
          },
        });
      }
    },
    batchEdit() {
      if (this.selectedRowKeys.length <= 0) {
        this.$message.warning("请选择一条记录！");
      } else {
        let ids = "";
        for (let a = 0; a < this.selectedRowKeys.length; a++) {
          if (a === this.selectedRowKeys.length - 1) {
            ids += this.selectedRowKeys[a];
          } else {
            ids += this.selectedRowKeys[a] + ",";
          }
        }
        this.$refs.batchSetInfoModalForm.edit(ids);
        this.$refs.batchSetInfoModalForm.title = "批量编辑";
      }
    },
    handleEdit: function (record) {
      this.$refs.modalForm.edit(record);
      this.$refs.modalForm.title = "编辑";
      this.$refs.modalForm.disableSubmit = false;
      if (this.btnEnableList.indexOf(1) === -1) {
        this.$refs.modalForm.showOkFlag = false;
      }
    },
    getImgUrl(imgName, type) {
      if (imgName && imgName.split(",")) {
        type = type ? type + "/" : "";
        return getFileAccessHttpUrl(
          "systemConfig/static/" + type + imgName.split(",")[0]
        );
      } else {
        return "";
      }
    },
    handleImportXls() {
      let importExcelUrl = this.url.importExcelUrl;
      let templateUrl = "/doc/goods_template.xls";
      let templateName = "商品Excel模板[下载]";
      this.$refs.modalImportForm.initModal(
        importExcelUrl,
        templateUrl,
        templateName
      );
      this.$refs.modalImportForm.title = "商品导入";
    },
    searchReset() {
      this.queryParam = {
        mpList: getMpListShort(Vue.ls.get("materialPropertyList")), //扩展属性
      };
      this.loadData(1);
    },
  },
};
</script>
<style scoped>
@import "~@assets/less/common.less";
</style>
<style>
.item-img {
  cursor: pointer;
  position: static;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
