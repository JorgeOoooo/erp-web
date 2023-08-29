<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    v-bind:prefixNo="prefixNo"
    switchHelp
    switchFullscreen
    @cancel="handleCancel"
    :id="prefixNo"
    :style="modalStyle"
  >
    <template slot="footer">
      <a-button key="back" @click="handleCancel">关闭</a-button>
      <a-button
        type="primary"
        v-if="showOkFlag"
        :loading="confirmLoading"
        @click="handleOk"
        >确定</a-button
      >
    </template>
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-row class="form-row" :gutter="24">
          <a-col :md="12" :sm="24">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="名称"
              data-step="1"
              data-title="名称"
              data-intro="名称必填，可以重复"
            >
              <a-input
                placeholder="请输入名称"
                v-decorator.trim="['name', validatorRules.name]"
              />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="箱规"
              data-step="2"
              data-title="箱规"
              data-intro="箱规必填，格式为：长*宽*高；支持小数点后两位小数。比如：1.50*1.25*10.0"
            >
              <a-input
                placeholder="长*宽*高；最多两位小数"
                v-decorator.trim="['standard', validatorRules.standard]"
              />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="款号"
              data-step="3"
              data-title="款号"
              data-intro="款号是比箱规更小的属性，比如：RX-01"
            >
              <a-input
                placeholder="请输入款号"
                v-decorator.trim="['model', validatorRules.model]"
              />
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="单位"
              data-step="4"
              data-title="单位"
              data-intro="选择单位"
            >
              <a-select
                :value="unitList"
                placeholder="选择单位"
                v-decorator="['unitId', validatorRules.unitId]"
                showSearch
                optionFilterProp="children"
                :dropdownMatchSelectWidth="false"
              >
                <div slot="dropdownRender" slot-scope="menu">
                  <v-nodes :vnodes="menu" />
                  <a-divider style="margin: 4px 0" />
                  <div
                    style="padding: 4px 8px; cursor: pointer"
                    @mousedown="(e) => e.preventDefault()"
                    @click="addUnit"
                  >
                    <a-icon type="plus" /> 新增计量单位
                  </div>
                </div>
                <a-select-option
                  v-for="(item, index) in unitList"
                  :key="index"
                  :value="item.id"
                >
                  {{ item.basicUnit }}
                </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="类别"
              data-step="8"
              data-title="类别"
              data-intro="类别需要在【商品类别】页面进行录入，录入之后在此处进行调用"
            >
              <a-tree-select
                style="width: 100%"
                :dropdownStyle="{ maxHeight: '200px', overflow: 'auto' }"
                allow-clear
                :treeData="categoryTree"
                v-decorator="['categoryId']"
                placeholder="请选择类别"
              >
              </a-tree-select>
            </a-form-item>
          </a-col>
          <a-col :md="12" :sm="24">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="备注"
            >
              <a-textarea
                :rows="1"
                placeholder="请输入备注"
                v-decorator="['remark']"
              />
            </a-form-item>
          </a-col>
        </a-row>
      </a-form>
    </a-spin>
    <unit-modal ref="unitModalForm" @ok="unitModalFormOk"></unit-modal>
  </a-modal>
</template>
<script>
import pick from "lodash.pick";
import BatchSetPriceModal from "./BatchSetPriceModal";
import BatchSetStockModal from "./BatchSetStockModal";
import UnitModal from "../../system/modules/UnitModal";
import JEditableTable from "@/components/jeecg/JEditableTable";
import {
  FormTypes,
  getRefPromise,
  VALIDATE_NO_PASSED,
  validateFormAndTables,
} from "@/utils/JEditableTableUtil";
import {
  checkMaterial,
  checkMaterialBarCode,
  getMaxBarCode,
  queryMaterialCategoryTreeList,
} from "@/api/api";
import { removeByVal, handleIntroJs } from "@/utils/util";
import { getAction, httpAction } from "@/api/manage";
import JImageUpload from "@/components/jeecg/JImageUpload";
import JDate from "@/components/jeecg/JDate";
import Vue from "vue";

export default {
  name: "MaterialModal",
  components: {
    BatchSetPriceModal,
    BatchSetStockModal,
    UnitModal,
    JImageUpload,
    JDate,
    JEditableTable,
    VNodes: {
      functional: true,
      render: (h, ctx) => ctx.props.vnodes,
    },
  },
  data() {
    return {
      title: "操作",
      width: "1300px",
      visible: false,
      modalStyle: "",
      categoryTree: [],
      unitList: [],
      depotList: [],
      fileList: [],
      unitStatus: false,
      unitChecked: false,
      manySkuStatus: false,
      switchDisabled: false, //开关的启用状态
      barCodeSwitch: false, //生成条码开关
      maxBarCodeInfo: "", //最大条码
      meDeleteIdList: [], //删除条码信息的id数组
      prefixNo: "material",
      skuOneTitle: "属性1",
      skuTwoTitle: "属性2",
      skuThreeTitle: "属性3",
      skuOneList: [],
      skuTwoList: [],
      skuThreeList: [],
      model: {},
      showOkFlag: true,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
      mpShort: {
        mfrs: {},
        otherField1: {},
        otherField2: {},
        otherField3: {},
      },
      confirmLoading: false,
      form: this.$form.createForm(this),
      validatorRules: {
        name: {
          rules: [
            { required: true, message: "请输入名称!" },
            { max: 100, message: "长度请小于100个字符", trigger: "blur" },
          ],
        },
        standard: {
          rules: [
            { required: true, message: "请输入箱规!" },
            { max: 100, message: "长度请小于100个字符", trigger: "blur" },
          ],
        },
        model: {
          rules: [
            { required: true, message: "请输入款号!" },
            { max: 100, message: "长度请小于100个字符", trigger: "blur" },
          ],
        },
        unitId: {
          rules: [{ required: true, message: "请输入单位!" }],
        },
      },
      url: {
        add: "/material/add",
        edit: "/material/update",
        materialsExtendList: "/materialsExtend/getDetailList",
        depotWithStock: "/depot/getAllListWithStock",
      },
    };
  },
  created() {
    // this.loadParseMaterialProperty();
  },
  methods: {
    add() {
      this.edit({});
      this.$nextTick(() => {
        handleIntroJs("material", 11);
      });
    },
    edit(record) {
      this.form.resetFields();
      this.model = Object.assign({}, record);
      this.activeKey = "1";
      this.barCodeSwitch = false;
      this.manySkuStatus = false;
      this.maxBarCodeInfo = "";
      this.visible = true;
      this.meDeleteIdList = [];
      this.modalStyle = "top:20px;height: 95%;";
      if (JSON.stringify(record) === "{}") {
        this.fileList = [];
      } else {
        setTimeout(() => {
          this.fileList = record.imgName;
        }, 5);
      }
      this.$nextTick(() => {
        this.form.setFieldsValue(
          pick(
            this.model,
            "name",
            "standard",
            "unit",
            "unitId",
            "model",
            "color",
            "categoryId",
            "enableSerialNumber",
            "enableBatchNumber",
            "position",
            "expiryNum",
            "weight",
            "remark",
            "mfrs",
            "otherField1",
            "otherField2",
            "otherField3"
          )
        );
      });
      this.loadTreeData();
      this.loadUnitListData();
    },
    close() {
      this.$emit("close");
      this.visible = false;
      this.modalStyle = "";
      this.unitStatus = false;
    },
    handleOk() {
      this.validateFields();
    },
    handleCancel() {
      this.close();
    },
    /** 触发表单验证 */
    validateFields() {
      validateFormAndTables(this.form, [])
        .then((allValues) => {
          let formData = this.classifyIntoFormData(allValues);
          // 发起请求
          return this.requestAddOrEdit(formData);
        })
        .catch((e) => {
          if (e.error === VALIDATE_NO_PASSED) {
            // 如果有未通过表单验证的子表，就自动跳转到它所在的tab
            this.activeKey =
              e.index == null ? this.activeKey : (e.index + 1).toString();
          } else {
            console.error(e);
          }
        });
    },
    /** 整理成formData */
    classifyIntoFormData(allValues) {
      let materialMain = Object.assign(this.model, allValues.formValue);
      return {
        ...materialMain, // 展开
      };
    },
    /** 发起新增或修改的请求 */
    requestAddOrEdit(formData) {
      //接口调用
      let url = this.url.add,
        method = "post";
      if (this.model.id) {
        url = this.url.edit;
        method = "put";
      }
      const that = this;
      this.confirmLoading = true;
      httpAction(url, formData, method)
        .then((res) => {
          if (res.code === 200) {
            that.$emit("ok");
            that.confirmLoading = false;
            that.close();
          } else {
            that.$message.warning(res.data.message);
            that.confirmLoading = false;
          }
        })
        .finally(() => {
          that.confirmLoading = false;
        });
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
    loadUnitListData() {
      let that = this;
      let params = {};
      params.currentPage = 1;
      params.pageSize = 100;
      getAction("/unit/getAllList", params).then((res) => {
        if (res) {
          that.unitList = res.data;
        }
      });
    },
    loadParseMaterialProperty() {
      let mpList = Vue.ls.get("materialPropertyList");
      for (let i = 0; i < mpList.length; i++) {
        if (mpList[i].nativeName === "制造商") {
          this.mpShort.mfrs.name = mpList[i].anotherName;
          this.mpShort.mfrs.enabled = mpList[i].enabled;
        }
        if (mpList[i].nativeName === "自定义1") {
          this.mpShort.otherField1.name = mpList[i].anotherName;
          this.mpShort.otherField1.enabled = mpList[i].enabled;
        }
        if (mpList[i].nativeName === "自定义2") {
          this.mpShort.otherField2.name = mpList[i].anotherName;
          this.mpShort.otherField2.enabled = mpList[i].enabled;
        }
        if (mpList[i].nativeName === "自定义3") {
          this.mpShort.otherField3.name = mpList[i].anotherName;
          this.mpShort.otherField3.enabled = mpList[i].enabled;
        }
      }
    },
    addUnit() {
      this.$refs.unitModalForm.add();
      this.$refs.unitModalForm.title = "新增计量单位";
      this.$refs.unitModalForm.disableSubmit = false;
    },
    unitModalFormOk() {
      this.loadUnitListData();
    },
  },
};
</script>
<style scoped>
.input-table {
  max-width: 100%;
  min-width: 1200px;
}
.tag-info {
  font-size: 14px;
  height: 32px;
  line-height: 32px;
  width: 100%;
  padding: 0px 11px;
  color: #bbb;
  background-color: #ffffff;
}
</style>
