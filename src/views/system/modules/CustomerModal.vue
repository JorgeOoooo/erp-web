<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="900"
      :visible="visible"
      :confirmLoading="confirmLoading"
      :getContainer="() => $refs.container"
      :wrapClassName="wrapClassNameInfo()"
      :mask="isDesktop()"
      :maskClosable="false"
      @ok="handleOk"
      @cancel="handleCancel"
      cancelText="关闭"
      style="top: 10%; height: 80%"
    >
      <template slot="footer">
        <a-button key="back" v-if="isReadOnly" @click="handleCancel">
          关闭
        </a-button>
      </template>
      <a-spin :spinning="confirmLoading">
        <a-form :form="form" id="customerModal">
          <a-row class="form-row" :gutter="24">
            <a-col :span="24 / 2">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="名称"
              >
                <a-input
                  placeholder="请输入名称"
                  v-decorator.trim="['supplier', validatorRules.supplier]"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24 / 2">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="仓管模式"
              >
                <a-select
                  v-decorator="['packageType', validatorRules.packageType]"
                  placeholder="选择仓管模式"
                  :dropdownMatchSelectWidth="false"
                  showSearch
                  optionFilterProp="children"
                  @change="(e) => (showType = e == 1)"
                >
                  <a-select-option :value="1"> 全托 </a-select-option>
                  <a-select-option :value="2"> 半托 </a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="24 / 2" v-if="showType">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="全托类型"
              >
                <a-select
                  v-decorator="[
                    'fullyManagedType',
                    validatorRules.fullyManagedType,
                  ]"
                  placeholder="选择全托类型"
                  :dropdownMatchSelectWidth="false"
                  showSearch
                  optionFilterProp="children"
                >
                  <a-select-option :value="1">立方结算</a-select-option>
                  <a-select-option :value="2">立方+包结算</a-select-option>
                  <a-select-option :value="3">立方+长存结算</a-select-option>
                  <a-select-option :value="4">包+长存结算</a-select-option>
                  <a-select-option :value="5">包结算</a-select-option>
                </a-select>
              </a-form-item>
            </a-col>
            <a-col :span="24 / 2">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="联系人"
              >
                <a-input
                  placeholder="请输入联系人"
                  v-decorator.trim="['contacts']"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24 / 2">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="手机号码"
              >
                <a-input
                  placeholder="请输入手机号码"
                  v-decorator.trim="['telephone']"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24 / 2">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="地址"
              >
                <a-input
                  placeholder="请输入地址"
                  v-decorator.trim="['address']"
                />
              </a-form-item>
            </a-col>
            <a-col :span="24 / 2">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="排序"
              >
                <a-input placeholder="请输入排序" v-decorator.trim="['sort']" />
              </a-form-item>
            </a-col>
            <a-col :span="24 / 2">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="备注"
              >
                <a-textarea
                  :rows="2"
                  placeholder="请输入备注"
                  v-decorator.trim="['description']"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </a-spin>
    </a-modal>
  </div>
</template>
<script>
import pick from "lodash.pick";
import { addSupplier, editSupplier, checkSupplier } from "@/api/api";
import { autoJumpNextInput } from "@/utils/util";
import { mixinDevice } from "@/utils/mixin";
export default {
  name: "CustomerModal",
  mixins: [mixinDevice],
  data() {
    return {
      title: "操作",
      visible: false,
      model: {},
      isReadOnly: false,
      labelCol: {
        xs: { span: 24 },
        sm: { span: 6 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 18 },
      },
      confirmLoading: false,
      form: this.$form.createForm(this),
      validatorRules: {
        supplier: {
          rules: [
            { required: true, message: "请输入名称!" },
            {
              min: 2,
              max: 60,
              message: "长度在 2 到 60 个字符",
              trigger: "blur",
            },
            { validator: this.validateSupplierName },
          ],
        },
        packageType: {
          rules: [{ required: true, message: "请选择仓管模式!" }],
        },
        fullyManagedType: {
          rules: [{ required: true, message: "请选择全托类型!" }],
        },
      },
      showType: false,
    };
  },
  created() {},
  methods: {
    add() {
      this.edit({});
    },
    edit(record) {
      this.form.resetFields();
      this.model = Object.assign({}, record);
      this.visible = true;
      this.showType = this.model?.packageType == 1;
      this.$nextTick(() => {
        this.form.setFieldsValue(
          pick(
            this.model,
            "supplier",
            "contacts",
            "telephone",
            "email",
            "phoneNum",
            "fax",
            "beginNeedGet",
            "allNeedGet",
            "taxNum",
            "taxRate",
            "bankName",
            "accountNumber",
            "address",
            "sort",
            "description",
            "packageType",
            "fullyManagedType"
          )
        );
        autoJumpNextInput("customerModal");
      });
    },
    close() {
      this.$emit("close");
      this.visible = false;
    },
    handleOk() {
      const that = this;
      // 触发表单验证
      this.form.validateFields((err, values) => {
        if (!err) {
          that.confirmLoading = true;
          let formData = Object.assign(this.model, values);
          if (this.model.beginNeedGet && this.model.beginNeedPay) {
            that.$message.warn("期初应收和期初应付不能同时输入");
            that.confirmLoading = false;
            return;
          }
          formData.type = "客户";
          if (formData.packageType == 2) formData.fullyManagedType = "";
          let obj;
          if (!this.model.id) {
            obj = addSupplier(formData);
          } else {
            obj = editSupplier(formData);
          }
          obj
            .then((res) => {
              if (res.code === 200) {
                that.$emit("ok");
              } else {
                that.$message.warning(res.data.message);
              }
            })
            .finally(() => {
              that.confirmLoading = false;
              that.close();
            });
        }
      });
    },
    handleCancel() {
      this.close();
    },
    validateSupplierName(rule, value, callback) {
      let params = {
        name: value,
        type: "客户",
        id: this.model.id ? this.model.id : 0,
      };
      checkSupplier(params).then((res) => {
        if (res && res.code === 200) {
          if (!res.data.status) {
            callback();
          } else {
            callback("名称已经存在");
          }
        } else {
          callback(res.data);
        }
      });
    },
  },
};
</script>
<style scoped></style>
