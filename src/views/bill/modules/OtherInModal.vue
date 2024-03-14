<template>
  <a-modal
    :title="
      (h) => {
        return h('div', { attrs: { style: 'text-align: center' } }, title);
      }
    "
    width="96%"
    :visible="visible"
    :confirmLoading="confirmLoading"
    :keyboard="false"
    :maskClosable="false"
    switchFullscreen
    @cancel="handleCancel"
    destroyOnClose
    style="top: 20px; height: 90%"
  >
    <template slot="footer">
      <a-button @click="handleCancel">取消</a-button>
      <a-button
        v-if="(!model.id || model.status == '2') && !isView"
        type="primary"
        :loading="confirmLoading"
        @click="handleSaveAsDraft"
        >草稿</a-button
      >
      <a-button
        v-if="!isView"
        type="primary"
        :loading="confirmLoading"
        @click="(e) => handleOk()"
        >保存</a-button
      >
    </template>
    <a-spin :spinning="confirmLoading">
      <div class="my-modal">
        <a-form
          :form="form"
          class="my-form"
          labelAlign="left"
          style="height: 100%"
        >
          <a-row class="form-row" :gutter="24">
            <a-col :lg="6" :md="6" :sm="12">
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
                  allowClear
                  :disabled="!!model.id"
                  @change="changeSupplier"
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
            <a-col :lg="6" :md="6" :sm="12">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="单据日期"
              >
                <j-date
                  v-decorator="['createTime', validatorRules.createTime]"
                  :show-time="false"
                  :disabled="isView"
                  dateFormat="YYYY-MM-DD"
                  style="width: 100%"
                />
              </a-form-item>
            </a-col>
            <a-col :lg="6" :md="6" :sm="12">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="车牌号"
              >
                <a-input
                  placeholder="请输入车牌号"
                  v-decorator="['carNumber']"
                  allowClear
                  :disabled="isView"
                />
              </a-form-item>
            </a-col>
          </a-row>

          <editable-table
            ref="editTableRef"
            from="in"
            :columns="columns"
            :supplierId="supplierId"
            @updateFlag="updateFlag"
            :style="`height: calc(100% - 144px); margin: 12px 0`"
          >
          </editable-table>

          <a-row class="form-row" :gutter="24">
            <a-col :lg="6" :md="6" :sm="12">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="配送费"
              >
                <a-input-number
                  :min="0"
                  placeholder="请输入配送费"
                  v-model="deliverFeeComputed"
                  allowClear
                  style="width: 100%"
                  :disabled="isView || !correctFlag"
                />
              </a-form-item>
            </a-col>
            <!-- <a-col :lg="6" :md="6" :sm="12">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="是否矫正"
              >
                <a-radio-group v-model="correctFlag" :disabled="isView">
                  <a-radio :value="true">是</a-radio>
                  <a-radio :value="false">否</a-radio>
                </a-radio-group>
              </a-form-item>
            </a-col> -->
            <a-col :lg="6" :md="6" :sm="12">
              <a-form-item
                :labelCol="labelCol"
                :wrapperCol="wrapperCol"
                label="备注"
              >
                <a-textarea
                  :rows="1"
                  placeholder="请输入备注"
                  v-decorator="['remark']"
                  :disabled="isView"
                />
              </a-form-item>
            </a-col>
          </a-row>
          <a-row class="form-row" :gutter="24">
            <a-col :lg="6" :md="6" :sm="12">
              <div class="extraFees_title">
                额外费用
                <a-dropdown>
                  <a-icon
                    @click="(e) => e.preventDefault()"
                    class="extraFees_title_action"
                    type="plus"
                    style="margin-left: 16px"
                  />
                  <a-menu slot="overlay" @click="handleAddExtraFee">
                    <a-menu-item
                      v-for="item in extraFeeList"
                      :key="item.value"
                      :disabled="
                        extraFeeFormList.findIndex(
                          (v) => v.type == item.value
                        ) != -1
                      "
                    >
                      {{ item.name }}
                    </a-menu-item>
                  </a-menu>
                </a-dropdown>
              </div>
            </a-col>
            <a-col
              v-for="(item, index) in extraFeeFormList"
              :key="item.type"
              :lg="6"
              :md="6"
              :sm="12"
            >
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                <template #label>
                  <span class="extraFeeLable"
                    >{{
                      extraFeeList?.find((v) => v.value == item.type)?.name
                    }}
                    <a-icon
                      @click="handleDeleteExtraFee(index)"
                      class="extraFeeDelete"
                      type="close-circle"
                      theme="filled"
                  /></span>
                </template>
                <a-input-number
                  :min="0"
                  :placeholder="`请输入${
                    extraFeeList?.find((v) => v.value == item.type)?.name
                  }`"
                  v-model="item.fee"
                  allowClear
                  style="width: 100%"
                  :disabled="isView"
                />
              </a-form-item>
            </a-col>
          </a-row>
        </a-form>
      </div>
    </a-spin>
  </a-modal>
</template>
<script>
import pick from "lodash.pick";
import { findBySelectSup } from "@/api/api";
import { BillModalMixin } from "../mixins/BillModalMixin";
import JDate from "@/components/jeecg/JDate";
import EditableTable from "./components/InEditableTable";
import { httpAction, getAction, postAction } from "@/api/manage";
import { FormTypes } from "@/utils/JEditableTableUtil";
import moment from "dayjs";
export default {
  name: "OtherInModal",
  mixins: [BillModalMixin],
  props: ["billType"],
  components: {
    EditableTable,
    JDate,
    VNodes: {
      functional: true,
      render: (h, ctx) => ctx.props.vnodes,
    },
  },
  data() {
    return {
      action: "",
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
        list: "/documentItem/head",
        extraFeeList: "/dictionarys",
      },
      columns: [
        {
          title: "商品款号",
          dataIndex: "model",
          type: FormTypes.lazyInput,
          required: true,
          scopedSlots: { customRender: "model" },
          confirm: this.confirm,
        },
        {
          title: "件数",
          dataIndex: "operNumber",
          width: 120,
          type: FormTypes.inputNumber,
          min: 1,
          required: true,
          scopedSlots: { customRender: "operNumber" },
        },
        {
          dataIndex: "depotName",
          type: FormTypes.lazyInput,
          required: true,
          slots: { title: "depotNameTitle" },
          scopedSlots: { customRender: "depotName" },
          confirm: this.confirm,
        },
        {
          title: "箱规",
          dataIndex: "standard",
          type: 1,
          scopedSlots: { customRender: "standard" },
          renderText: this.renderStandard,
        },
        {
          dataIndex: "pricingType",
          type: 1,
          required: true,
          slots: { title: "pricingTypeTitle" },
          scopedSlots: { customRender: "pricingType" },
          renderText: this.renderPricingType,
        },
        {
          title: "体积",
          dataIndex: "volume",
          scopedSlots: { customRender: "volume" },
          renderText: this.renderVolume,
        },
        {
          title: "备注",
          dataIndex: "remark",
          type: FormTypes.input,
          tabIndex: -1,
          scopedSlots: { customRender: "remark" },
        },
      ],
      showText: true,
      isView: false,
      typeEnum: {
        1: "出库单",
        2: "入库单",
        3: "库存盘点单",
        4: "退货入库",
        5: "库存调拨",
        6: "报损单",
        7: "报溢单",
      },
      correctFlag: false,
      deliverFee: 0,
      supplierId: null,
      updateFlagValue: "",
      extraFeeList: [], // 所有可选的额外费用
      extraFeeFormList: [], // 已选的额外费用
    };
  },
  computed: {
    deliverFeeComputed: {
      get() {
        if (this.correctFlag) {
          return this.deliverFee;
        } else if (this.supplierId) {
          const data = this.$refs?.editTableRef?.form?.dataSource || [];
          const supplier = this.supList.find(
            (item) => item.id == this.supplierId
          );
          console.log(data, supplier);
          let sum = 0;
          if (data && data.length > 0) {
            data
              .filter(
                (v) =>
                  ([1, 3].includes(v.pricingType) && v.operNumber) ||
                  ([2, 4].includes(v.pricingType) && this.renderVolume(v))
              )
              .forEach((v) => {
                if ([1, 3].includes(v.pricingType)) {
                  // 包结算
                  sum +=
                    (v.operNumber || 0) * (supplier.packageDeliverFee || 0);
                } else if ([2, 4].includes(v.pricingType)) {
                  // 立方结算
                  sum +=
                    (this.renderVolume(v) || 0) *
                    (supplier.cubeDeliverFee || 0);
                }
              });
          }
          sum = sum.toFixed(6);
          this.deliverFee = sum;
          return sum;
        }
      },
      set(value) {
        this.deliverFee = value || 0;
      },
    },
  },
  created() {
    this.getExtraFeeList();
  },
  methods: {
    getExtraFeeList() {
      getAction(this.url.extraFeeList + `?code=extra_fee`).then((res) => {
        if (res.code === 200) {
          this.extraFeeList = res.data;
        }
      });
      // this.extraFeeList = [
      //   {
      //     value: 1,
      //     name: "二次分拣费",
      //   },
      //   {
      //     value: 2,
      //     name: "垫付",
      //   },
      //   {
      //     value: 3,
      //     name: "其他",
      //   },
      // ];
    },
    handleAddExtraFee({ key }) {
      this.extraFeeFormList.push({
        type: key,
        fee: undefined,
      });
    },
    handleDeleteExtraFee(index) {
      this.extraFeeFormList.splice(index, 1);
    },

    updateFlag(val) {
      this.updateFlagValue = val;
    },
    initList() {
      this.confirmLoading = true;
      getAction(this.url.list, { headId: this.model.id })
        .then((res) => {
          if (res.code === 200) {
            let data = res.data?.map((item) => {
              return {
                ...item,
                SHOW_STATUS_model: "success",
                SHOW_STATUS_depotName: "success",
                SHOW_model: {
                  label: item.model,
                  value: item.materialId,
                  standard: item.standard,
                  pricingType: item.pricingType,
                },
              };
            });
            this.$nextTick(() => {
              this.$refs.editTableRef.initDataSource(data || [], this.isView);
            });
          }
        })
        .finally(() => {
          this.$nextTick(() => {
            this.confirmLoading = false;
          });
        });
    },
    initSupplier(supplierId) {
      let that = this;
      findBySelectSup({}).then((res) => {
        if (res) {
          that.supList = res;
          if (supplierId) {
            const supplier = that.supList.find((item) => item.id == supplierId);
            this.changePackageType(supplier?.packageTypeName == "半托" ? 2 : 1);
          }
        }
      });
    },
    /** 当点击详情按钮时调用此方法 */
    openView(record) {
      this.edit(record, true);
    },
    /** 当点击新增按钮时调用此方法 */
    add() {
      this.edit({
        createTime: moment(new Date()).format("YYYY-MM-DD"),
        correctFlag: false,
        deliverFee: 0,
      });
    },
    /** 当点击了编辑（修改）按钮时调用此方法 */
    edit(record, isView = false) {
      this.isView = isView;
      this.visible = true;
      this.form.resetFields();
      this.model = Object.assign({}, record);
      this.correctFlag = this.model.correctFlag || false;
      this.deliverFee = this.model.deliverFee;

      this.extraFeeFormList = this.model?.extraFeeList || [];

      this.$nextTick(() => {
        this.form.setFieldsValue(
          pick(
            this.model,
            "supplierId",
            "carNumber",
            "createTime",

            "deliverFee",
            "remark"
          )
        );
      });
      this.initSupplier(this.model.supplierId);
      // this.getDepotData();

      if (this.model.id) {
        this.title = this.isView
          ? `${this.typeEnum[this.billType]}（${this.model.number}）-详情`
          : `${this.typeEnum[this.billType]}（${this.model.number}）-编辑`;
        this.initList();
      } else {
        this.title = `${this.typeEnum[this.billType]}-新增`;
        this.$nextTick(() => {
          this.$refs.editTableRef.initDataSource();
        });
      }
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
    handleOk(status = 1) {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$refs.editTableRef.validate((valid) => {
            if (valid) {
              let formData = {
                type: this.billType,
                status,
                supplierId: values?.supplierId,
                carNumber: values?.carNumber,
                createTime: values?.createTime,

                documentItemAddUnitDtos:
                  this.$refs.editTableRef.getDataSource() || [],

                deliverFee: this.deliverFeeComputed,
                correctFlag: this.correctFlag,
                remark: values?.remark,

                extraFees: this.extraFeeFormList || [],
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
            } else {
              this.$message.warning("存在编辑的行，请编辑完成后再提交！");
            }
          });
        }
      });
    },
    changePackageType(value) {
      this.showText = value == 1;
    },
    changeSupplier(value) {
      this.supplierId = value;
      const supplier = this.supList.find((item) => item.id == value);
      if (supplier) {
        this.changePackageType(supplier.packageTypeName == "半托" ? 2 : 1);
      }
      this.$refs.editTableRef.initDataSource();
    },
    // 查询可选仓库列表
    getDepotData() {
      getAction("/depot/findDepotByCurrentUser").then((res) => {
        if (res.code === 200) {
          this.columns[2].options =
            res.data?.map((item) => {
              return {
                ...item,
                value: item.id,
                label: item.depotName,
              };
            }) || [];
        } else {
          this.$message.info(res.data);
        }
      });
    },
    renderStandard(record) {
      if (!this.showText) return "";
      let standard = record?.SHOW_model?.standard || "";
      return standard;
    },
    renderPricingType(record) {
      const text = record?.SHOW_model?.pricingType;
      const map = {
        1: "包",
        2: "立方",
        3: "长存-包",
        4: "长存-立方",
      };
      return map?.[text] || "-";
    },
    renderVolume(record) {
      if (!this.showText) return "";
      if (record?.SHOW_STATUS_model == "success") {
        let standard = record?.SHOW_model?.standard || "";
        let operNumber = record?.operNumber || "";
        return this.computeVolume(standard, operNumber);
      } else {
        let standard = record?.standard || "";
        let operNumber = record?.operNumber || "";
        let arr = standard.split("*");
        if (
          arr.length == 3 &&
          arr.every((v) => v != "" && typeof Number(v) == "number")
        ) {
          return this.computeVolume(standard, operNumber);
        }
        return "";
      }
    },
    computeVolume(standard, operNumber) {
      if (standard == null || standard == "" || operNumber == "") return "";
      let arr = standard.split("*");
      let volume = arr.reduce((prev, cur) => {
        return prev * Number(cur);
      }, 1.0);
      return parseFloat((volume * operNumber).toFixed(6));
    },
    confirm(col, record, dataSource) {
      const supplierId = this.form.getFieldValue("supplierId");
      const value = record?.[col.dataIndex];
      if (!supplierId || !value) {
        this.$set(record, "SHOW_STATUS_" + col.dataIndex, "info");
      } else {
        this.$set(record, "SHOW_STATUS_" + col.dataIndex, "loading");
        (col.dataIndex == "depotName"
          ? postAction(
              "/depot/name",
              {},
              {
                name: value,
              }
            )
          : getAction("/material/check/user/model", {
              model: value,
              supplierId,
            })
        )
          .then((res) => {
            if (res.code == 200) {
              let lastObj = dataSource[dataSource.length - 1];
              col.dataIndex == "depotName" &&
                this.$set(lastObj, "depotName", value);
              if (res.data) {
                this.$set(record, "SHOW_STATUS_" + col.dataIndex, "success");
                col.dataIndex == "depotName" &&
                  this.$set(lastObj, "SHOW_STATUS_" + col.dataIndex, "success");
                if (col.dataIndex == "model") {
                  this.$set(record, "SHOW_" + col.dataIndex, {
                    standard: res.data?.standard,
                    pricingType: res.data?.pricingType,
                  });
                  this.$set(record, "standard", res.data?.standard);
                  this.$set(record, "pricingType", res.data?.pricingType);
                }
              } else {
                this.$set(record, "SHOW_STATUS_" + col.dataIndex, "warning");
                col.dataIndex == "depotName" &&
                  this.$set(lastObj, "SHOW_STATUS_" + col.dataIndex, "warning");
              }
            } else {
              this.$set(record, "SHOW_STATUS_" + col.dataIndex, "info");
            }
          })
          .catch(() => {
            this.$set(record, "SHOW_STATUS_" + col.dataIndex, "info");
          });
      }
    },
    handleSaveAsDraft() {
      this.handleOk(2);
    },
  },
};
</script>
<style scoped lang="less">
.my-modal {
  height: calc(100vh - 200px);
  overflow-y: auto;
  overflow-x: hidden;
}
.my-form {
  /deep/ .ant-form-item {
    margin-bottom: 0;

    .ant-form-explain {
      display: none;
    }
  }
}
.extraFees_title {
  height: 40px;
  line-height: 40px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;

  .extraFees_title_action {
    cursor: pointer;
  }

  &::before {
    content: "";
    display: inline-block;
    width: 4px;
    height: 16px;
    background: #226ee7;
    margin-right: 16px;
  }
}
.extraFeeLable {
  .extraFeeDelete {
    display: none;
  }
  &:hover {
    .extraFeeDelete {
      display: inline-block;
      position: absolute;
      top: -7px;
      right: 8px;
      font-size: 12px;
      color: #f5222d;
      cursor: pointer;
    }
  }
}
</style>
