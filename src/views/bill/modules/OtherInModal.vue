<template>
  <a-modal
    :title="title"
    :width="800"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :keyboard="false"
    switchFullscreen
    @cancel="handleCancel"
    style="top: 20px; height: 95%"
  >
    <template slot="footer">
      <a-button @click="handleCancel">取消</a-button>
      <a-button type="primary" :loading="confirmLoading" @click="handleOk"
        >保存</a-button
      >
    </template>
    <a-spin :spinning="confirmLoading">
      <a-form :form="form">
        <a-row class="form-row" :gutter="24">
          <a-col :lg="12" :md="12" :sm="24">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="客户"
            >
              <a-select
                placeholder="选择客户"
                v-decorator="['supplierId', validatorRules.supplierId]"
                :dropdownMatchSelectWidth="false"
                showSearch
                optionFilterProp="children"
              >
                <div slot="dropdownRender" slot-scope="menu">
                  <v-nodes :vnodes="menu" />
                  <template v-if="isTenant">
                    <a-divider style="margin: 4px 0" />
                    <div
                      style="padding: 4px 8px; cursor: pointer"
                      @mousedown="(e) => e.preventDefault()"
                      @click="addSupplier"
                    >
                      <a-icon type="plus" /> 新增客户
                    </div>
                  </template>
                </div>
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
          <a-col :lg="12" :md="12" :sm="24">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="单据日期"
            >
              <j-date
                v-decorator="['createTime', validatorRules.createTime]"
                :show-time="false"
                dateFormat="YYYY-MM-DD"
                style="width: 100%"
              />
            </a-form-item>
          </a-col>
          <a-col :lg="12" :md="12" :sm="24">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="仓管模式"
            >
              <a-select
                v-decorator="['packageType']"
                placeholder="选择托管类型"
                :dropdownMatchSelectWidth="false"
                showSearch
                optionFilterProp="children"
              >
                <a-select-option :value="1"> 全托 </a-select-option>
                <a-select-option :value="2"> 半托 </a-select-option>
              </a-select>
            </a-form-item>
          </a-col>
          <a-col :lg="12" :md="12" :sm="24">
            <a-form-item
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
              label="车牌号"
            >
              <a-input placeholder="请输入车牌号" v-decorator="['carNumber']" />
            </a-form-item>
          </a-col>
          <a-col :lg="12" :md="12" :sm="24">
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
  </a-modal>
</template>
<script>
// import JEditLineTable from "@/components/jeecg/JEditLineTable";
import pick from "lodash.pick";
import { findBySelectSup } from "@/api/api";
import { BillModalMixin } from "../mixins/BillModalMixin";
import JDate from "@/components/jeecg/JDate";
import { httpAction } from "@/api/manage";
import moment from "dayjs";
export default {
  name: "OtherInModal",
  mixins: [BillModalMixin],
  components: {
    // JEditLineTable,
    JDate,
    VNodes: {
      functional: true,
      render: (h, ctx) => ctx.props.vnodes,
    },
  },
  data() {
    return {
      title: "操作",
      visible: false,
      prefixNo: "QTRK",
      model: {},
      labelCol: {
        xs: { span: 24 },
        sm: { span: 8 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 },
      },
      confirmLoading: false,
      form: this.$form.createForm(this),
      supList: [],
      validatorRules: {
        supplierId: {
          rules: [{ required: true, message: "请选择客户!" }],
        },
        createTime: {
          rules: [{ required: true, message: "请输入单据日期!" }],
        },
        type: {
          rules: [{ required: true, message: "请选择类型!" }],
        },
      },
      url: {
        add: "/documentHead/add",
        edit: "/documentHead/update",
        detailList: "/documentHead/getDetailList",
      },
    };
  },
  created() {},
  methods: {
    initSupplier() {
      let that = this;
      findBySelectSup({}).then((res) => {
        if (res) {
          that.supList = res;
        }
      });
    },
    /** 当点击新增按钮时调用此方法 */
    add() {
      this.edit({ createTime: moment(new Date()).format("YYYY-MM-DD") });
    },
    /** 当点击了编辑（修改）按钮时调用此方法 */
    edit(record) {
      this.visible = true;
      this.form.resetFields();
      this.model = Object.assign({}, record);
      this.$nextTick(() => {
        this.form.setFieldsValue(
          pick(
            this.model,
            "packageType",
            "supplierId",
            "carNumber",
            "createTime",
            "remark"
          )
        );
      });
      this.initSupplier();
    },
    /** 关闭弹窗 */
    close() {
      this.visible = false;
      this.$emit("close");
    },
    /** 关闭按钮点击事件 */
    handleCancel() {
      this.close();
    },
    /** 确认提交 */
    handleOk() {
      this.form.validateFields((err, values) => {
        if (!err) {
          let formData = {
            type: 2,
            packageType: values?.packageType,
            supplierId: values?.supplierId,
            carNumber: values?.carNumber,
            createTime: values?.createTime,
            remark: values?.remark,
          };
          formData = Object.assign(this.model, formData);

          let url = this.url.add,
            method = "post";
          if (this.model.id) {
            url = this.url.edit;
            method = "post";
          }
          this.confirmLoading = true;
          httpAction(url, formData, method)
            .then((res) => {
              if (res.code === 200) {
                this.$emit("ok");
                this.confirmLoading = false;
                this.close();
              } else {
                this.$message.warning(res.message || res.data.message);
                this.confirmLoading = false;
              }
            })
            .finally(() => {});
        }
      });
    },
  },
};
</script>
<style scoped></style>
