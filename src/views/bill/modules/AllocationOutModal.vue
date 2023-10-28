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
              <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
                <span slot="label">
                  客户&nbsp;
                  <a-tooltip title="注意：修改客户将会影响商品及库存信息">
                    <a-icon type="question-circle-o" />
                  </a-tooltip>
                </span>
                <a-select
                  placeholder="选择客户"
                  v-decorator="['supplierId', validatorRules.supplierId]"
                  :dropdownMatchSelectWidth="false"
                  showSearch
                  allowClear
                  :disabled="!!model.id"
                  optionFilterProp="children"
                  @change="changeSupplierId"
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
                  dateFormat="YYYY-MM-DD"
                  style="width: 100%"
                  :disabled="isView"
                />
              </a-form-item>
            </a-col>
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
          <editable-table
            ref="editTableRef"
            :columns="columns"
            :r_loadings="loadings"
            :r_options="options"
            style="height: calc(100% - 64px); margin: 12px 0"
          >
          </editable-table>
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
import EditableTable from "@/components/jeecg/EditableTable";
import { httpAction, getAction } from "@/api/manage";
import { FormTypes } from "@/utils/JEditableTableUtil";
import moment from "dayjs";
export default {
  name: "AllocationOutModal",
  mixins: [BillModalMixin],
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
      },
      columns: [
        {
          title: "商品款号",
          dataIndex: "materialId",
          type: FormTypes.lazySelect,
          selectConfig: {
            url: "/material/model",
            inputText: "model",
            labelKey: "model",
            valueKey: "id",
          },
          allowSearch: true,
          required: true,
          scopedSlots: { customRender: "materialId" },
          ellipsis: true,
          change: this.changeMeterialId,
          getParams: this.getSupplierId,
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
          title: "调出仓库",
          dataIndex: "depotId",
          type: FormTypes.forceSelect,
          allowSearch: true,
          required: true,
          scopedSlots: { customRender: "depotId" },
          getOptions: this.getDepotData,
        },
        {
          title: "调入仓库",
          dataIndex: "anotherDepotId",
          type: FormTypes.select,
          options: [],
          allowSearch: true,
          required: true,
          scopedSlots: { customRender: "anotherDepotId" },
        },
        {
          title: "备注",
          dataIndex: "remark",
          type: FormTypes.input,
          tabIndex: -1,
          scopedSlots: { customRender: "remark" },
        },
      ],
      loadings: {},
      options: {},
      isView: false,
    };
  },
  created() {},
  methods: {
    initList() {
      this.confirmLoading = true;
      getAction(this.url.list, { headId: this.model.id })
        .then((res) => {
          if (res.code === 200) {
            let data = res.data?.map((item) => {
              return {
                ...item,
                SHOW_materialId: {
                  label: item.model,
                  value: item.materialId,
                  standard: item.standard,
                },
                SHOW_depotId: {
                  label: item.depotName,
                  value: item.depotId,
                },
                id: Date.now() + "." + index,
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
    initSupplier() {
      let that = this;
      findBySelectSup({}).then((res) => {
        if (res) {
          that.supList = res;
        }
      });
    },
    /** 当点击详情按钮时调用此方法 */
    openView(record) {
      this.edit(record, true);
    },
    /** 当点击新增按钮时调用此方法 */
    add() {
      this.edit({ createTime: moment(new Date()).format("YYYY-MM-DD") });
    },
    /** 当点击了编辑（修改）按钮时调用此方法 */
    edit(record, isView = false) {
      this.isView = isView;
      this.visible = true;
      this.form.resetFields();
      this.model = Object.assign({}, record);
      this.$nextTick(() => {
        this.form.setFieldsValue(
          pick(
            this.model,
            // "packageType",
            "supplierId",
            "carNumber",
            "createTime",
            "remark",
            "handlingFee",
            "serverFee",
            "carFee",
            "sender",
            "receiver"
          )
        );
      });
      this.initSupplier();
      this.getDepotList();

      if (this.model.id) {
        this.title = this.isView
          ? `调拨单（${this.model.number}）-详情`
          : `调拨单（${this.model.number}）-编辑`;
        this.initList();
      } else {
        this.title = "调拨单-新增";
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
                type: 5,
                status,
                supplierId: values?.supplierId,
                carNumber: values?.carNumber,
                createTime: values?.createTime,
                remark: values?.remark,
                handlingFee: values?.handlingFee,
                serverFee: values?.serverFee,
                carFee: values?.carFee,
                sender: values?.sender,
                receiver: values?.receiver,
                documentItemAddUnitDtos:
                  this.$refs.editTableRef.getDataSource() || [],
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
    // 查询可选仓库列表
    getDepotList() {
      getAction("/depot/findDepotByCurrentUser").then((res) => {
        if (res.code === 200) {
          this.columns[3].options =
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
    getDepotData(col, record) {
      let supplierId = this.form.getFieldValue("supplierId");
      let materialId = record.materialId;
      if (!materialId || !supplierId) {
        this.$set(this.options, record.id + "_" + col.dataIndex, []);
        return;
      }
      this.$set(this.loadings, record.id + "_" + col.dataIndex, true);
      getAction("/depot/user/material", {
        userId: supplierId,
        materialId: materialId,
      })
        .then((res) => {
          if (res.code === 200) {
            const options = res.data.map((item) => {
              return {
                ...item,
                value: item.id,
                label: item.name,
              };
            });
            this.$set(this.options, record.id + "_" + col.dataIndex, options);
          }
        })
        .finally(() => {
          this.$set(this.loadings, record.id + "_" + col.dataIndex, false);
        });
    },
    changeSupplierId() {
      this.options = {};
      this.$refs.editTableRef.initDataSource();
    },
    changeMeterialId(val, col, record) {
      this.$set(record, "depotId", undefined);
      this.$set(record, "SHOW_depotId", undefined);
      this.$set(this.options, record.id + "_depotId", []);
    },
    getSupplierId() {
      return {
        supplierId: this.form.getFieldValue("supplierId"),
      };
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
</style>
