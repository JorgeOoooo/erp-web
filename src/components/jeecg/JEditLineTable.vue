<template>
  <a-spin :spinning="loading">
    <div class="JEditLineTable">
      <a-row type="flex" class="actions">
        <a-col>
          <a-button type="primary" icon="plus" @click="handleClickAdd"
            >插入行</a-button
          >
        </a-col>
      </a-row>

      <div ref="editLineTableRef" class="input-table">
        <a-form-model ref="formRef" :model="form">
          <a-table
            :columns="columns"
            :data-source="data"
            rowKey="id"
            :pagination="false"
          >
            <template
              v-for="col in columns.filter(
                (item) => item.dataIndex != 'action' && item.dataIndex != ''
              )"
              :slot="col.dataIndex"
              slot-scope="text, record"
            >
              <div :key="col.dataIndex" v-if="col.dataIndex == 'volume'">
                {{
                  !notShowText.includes("volume")
                    ? getVolume(
                        record.id === editableLineId,
                        record.standard,
                        record.operNumber
                      )
                    : ""
                }}
              </div>
              <div
                :key="col.dataIndex"
                v-else-if="record.id === editableLineId"
              >
                <a-form-model-item :prop="col.key" :rules="col.validateRules">
                  <a-select
                    v-if="col.type == FormTypes.select"
                    v-model="form[col.key]"
                    :filterOption="
                      (i, o) => handleSelectFilterOption(i, o, col)
                    "
                    :dropdownMatchSelectWidth="false"
                    :showSearch="true"
                    allowClear
                    style="width: 100%"
                    placeholder="请选择"
                    @change="(val) => changeValue(val, col)"
                  >
                    <a-select-option
                      v-for="option in col.options"
                      :key="option.value"
                      :value="option.value"
                    >
                      {{ option.label }}
                    </a-select-option>
                  </a-select>
                  <a-input
                    v-else-if="col.type == FormTypes.input"
                    v-model="form[col.key]"
                    allowClear
                    style="width: 100%"
                    placeholder="请输入"
                  />
                  <a-input-number
                    v-else-if="col.type == FormTypes.inputNumber"
                    v-model="form[col.key]"
                    :min="col.min"
                    :max="col.max"
                    :precision="0"
                    style="width: 100%"
                    placeholder="请输入"
                    @change="(val) => changeValue(val, col)"
                  />
                  <span v-else-if="!notShowText.includes(col.dataIndex)">{{
                    text
                  }}</span>
                </a-form-model-item>
              </div>
              <template v-else-if="!notShowText.includes(col.dataIndex)">
                {{ text }}
              </template>
            </template>
            <template slot="action" slot-scope="text, record">
              <div key="action" class="table-actions">
                <template v-if="record.id === editableLineId">
                  <a-button
                    type="link"
                    @click="() => handleSaveLine(record)"
                    size="small"
                  >
                    保存
                  </a-button>
                  <a-popconfirm
                    title="确认要取消编辑该行数据?"
                    @confirm="() => handleCancelLine()"
                  >
                    <a-button type="link" size="small"> 取消 </a-button>
                  </a-popconfirm>
                </template>
                <template v-else>
                  <a-button
                    type="link"
                    @click="() => handleEditLine(record)"
                    size="small"
                  >
                    编辑
                  </a-button>
                  <a-popconfirm
                    title="确认要删除该行数据?"
                    @confirm="() => handleDeleteLine(record)"
                  >
                    <a-button type="link" size="small"> 删除 </a-button>
                  </a-popconfirm>
                </template>
              </div>
            </template>
          </a-table>
        </a-form-model>
      </div>
    </div>
  </a-spin>
</template>
<script>
import { FormTypes } from "@/utils/JEditableTableUtil";
import { httpAction } from "@/api/manage";
export default {
  name: "JEditLineTable",
  components: {},
  props: {
    // 列信息
    columns: {
      type: Array,
      required: true,
    },
    // 数据源
    dataSource: {
      type: Array,
      required: true,
      default: () => [],
    },
    dataFormat: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    url: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    formData: {
      type: Object,
      required: true,
      default: () => ({}),
    },
    notShowText: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      FormTypes,
      loading: false,
      // 当前可编辑行。值为undefined时没有可编辑行；值为0时为正在新增的行；值为其他时为正在编辑的行
      editableLineId: undefined,
      form: {},
    };
  },
  computed: {
    data() {
      return [
        ...this.dataSource,
        ...(this.editableLineId === 0 ? [this.form] : []),
      ];
    },
  },
  methods: {
    handleClickAdd() {
      if (this.editableLineId !== undefined) {
        this.$message.warning("存在正在新增或编辑的行，请保存或取消后再添加！");
        return;
      }
      this.editableLineId = 0;
      this.$set(this, "form", { ...this.dataFormat, id: 0 });
      // this.$refs.ruleForm.clearValidate();
    },
    handleSaveLine(record) {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.loading = true;
          let formData = {
            ...record,
            ...this.form,
            ...this.formData,
          };
          let url = this.url.add;
          if (formData.id != 0) {
            url = this.url.edit;
          } else {
            delete formData.id;
          }
          httpAction(url, formData, "post")
            .then((res) => {
              if (res.code === 200) {
                this.editableLineId = undefined;
                this.$emit("ok");
              } else {
                this.$message.warning(res.data?.message || res.data);
              }
            })
            .finally(() => {
              this.loading = false;
            });
        }
      });
    },
    handleDeleteLine(record) {
      if (this.editableLineId !== undefined) {
        this.$message.warning("存在正在新增或编辑的行，请保存或取消后再删除！");
        return;
      }
      this.loading = true;
      httpAction(this.url.delete + record.id, {}, "post")
        .then((res) => {
          if (res.code === 200) {
            this.$emit("ok");
          } else {
            this.$message.warning(res.data.message);
          }
        })
        .finally(() => {
          this.loading = false;
        });
    },
    handleCancelLine() {
      this.editableLineId = undefined;
    },
    handleEditLine(record) {
      if (this.editableLineId !== undefined) {
        this.$message.warning("存在正在新增或编辑的行，请保存或取消后再编辑！");
        return;
      }
      this.editableLineId = record.id;
      this.$set(this, "form", { ...record });
      this.$refs.ruleForm.clearValidate();
    },
    /** 用于搜索下拉框中的内容 */
    handleSelectFilterOption(input, option, column) {
      if (column.allowSearch === true || column.allowInput === true) {
        return (
          option?.componentOptions?.children[0].text
            .toLowerCase()
            .indexOf(input.toLowerCase()) >= 0
        );
      }
      return true;
    },
    changeValue(val, col) {
      if (col.key === "materialId") {
        let obj = col.options.find((item) => item.id == val);
        this.$set(this.form, "standard", obj.standard);
      }
    },
    getVolume(isEditLine, standard, operNumber) {
      if (isEditLine) {
        standard = this.form?.standard || "";
        operNumber = this.form?.operNumber || "";
        if (standard == null || standard == "" || operNumber == "") return "";
        let arr = standard.split("*");
        let volume = arr.reduce((prev, cur) => {
          return prev * cur;
        }, 1.0);
        return parseFloat((volume * operNumber).toFixed(4));
      } else {
        if (standard == null || standard == "" || operNumber == "") return "";
        let arr = standard.split("*");
        let volume = arr.reduce((prev, cur) => {
          return prev * cur;
        }, 1.0);
        return parseFloat((volume * operNumber).toFixed(4));
      }
    },
  },
};
</script>
<style lang="less" scoped>
.input-table {
  /deep/ .ant-form-item {
    margin-bottom: 0;

    .ant-form-explain {
      display: none;
    }
  }
}
.actions {
  margin-bottom: 8px;
}
.table-actions {
  /deep/ .ant-btn-link {
    padding: 0;

    & + .ant-btn-link {
      margin-left: 8px;
    }
  }
}
</style>
