<template>
  <div class="JEditLineTable">
    <a-form-model ref="formRef" :model="form">
      <a-table
        :columns="tableColumns"
        :data-source="form.dataSource"
        rowKey="id"
        :pagination="false"
        bordered
        :scroll="{ y: y }"
      >
        <template
          v-for="col in columns.filter(
            (item) => item.dataIndex != 'action' && item.dataIndex != ''
          )"
          :slot="col.dataIndex"
          slot-scope="text, record, index"
        >
          <a-form-model-item
            v-if="col.type != '' && col.type != undefined && col.type != null"
            :key="col.dataIndex"
            :prop="'dataSource.' + index + '.' + col.dataIndex"
            :rules="getRules(col, record, index)"
          >
            <a-select
              v-if="col.type == FormTypes.lazySelect"
              v-model="record[col.dataIndex]"
              :dropdownMatchSelectWidth="false"
              :default-active-first-option="false"
              :show-arrow="false"
              :filter-option="false"
              :not-found-content="
                loadings[col.dataIndex] || false ? undefined : null
              "
              :tabIndex="getTabIndex(col, index)"
              :open="getOpen(col, record)"
              showSearch
              allowClear
              style="width: 100%"
              placeholder="请输入内容后选择"
              @search="(val) => handleSearch(val, col)"
              @change="(val) => handleChange(val, col, record)"
              @focus="focus(col, record)"
              @blur="blur(col, record)"
              @select="select(col, record, index)"
            >
              <a-spin
                v-if="loadings[col.dataIndex] || false"
                slot="notFoundContent"
                size="small"
              />
              <a-select-option
                v-for="option in getOptions(col, record)"
                :key="option.value"
                :value="option.value"
              >
                {{ option.label }}
              </a-select-option>
            </a-select>
            <a-select
              v-else-if="col.type == FormTypes.select"
              v-model="record[col.dataIndex]"
              :filterOption="(i, o) => handleSelectFilterOption(i, o, col)"
              :dropdownMatchSelectWidth="false"
              :tabIndex="getTabIndex(col, index)"
              :open="getOpen(col, record)"
              showSearch
              allowClear
              style="width: 100%"
              placeholder="请选择"
              @change="(val) => handleChange(val, col, record)"
              @focus="focus(col, record)"
              @blur="blur(col, record)"
              @select="select(col, record, index)"
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
              v-model="record[col.dataIndex]"
              allowClear
              style="width: 100%"
              placeholder="请输入"
              :tabindex="getTabIndex(col, index)"
              @change="(val) => handleChange(val, col, record)"
            />
            <a-input-number
              v-else-if="col.type == FormTypes.inputNumber"
              v-model="record[col.dataIndex]"
              :min="col.min"
              :max="col.max"
              :precision="0"
              :tab-index="getTabIndex(col, index)"
              style="width: 100%"
              placeholder="请输入"
              @change="(val) => handleChange(val, col, record)"
            />
          </a-form-model-item>
          <span v-else :key="col.dataIndex">
            {{ renderText(col, record, text) }}
          </span>
        </template>
        <template slot="action" slot-scope="text, record, index">
          <a-button
            v-if="index + 1 != form.dataSource.length"
            @click="handleDelete(index)"
            type="link"
            size="small"
            :tabindex="-1"
          >
            删除
          </a-button>
        </template>
      </a-table>
    </a-form-model>
  </div>
</template>
<script>
import { FormTypes } from "@/utils/JEditableTableUtil";
import { getAction } from "@/api/manage";
import _ from "lodash";
export default {
  name: "EditableTable",
  props: {
    // 列信息
    columns: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      y: 168,
      FormTypes,
      form: {
        dataSource: [],
      },

      loadings: {},
      options: {},
      timer: {},
      currentValue: {},
    };
  },
  computed: {
    tableColumns() {
      return [
        ...this.columns,
        {
          title: "操作",
          dataIndex: "action",
          width: 90,
          scopedSlots: { customRender: "action" },
        },
      ];
    },
  },
  mounted() {
    this.initScroll();
  },
  methods: {
    validate(callback) {
      this.$refs.formRef.validate((valid) => {
        callback?.(valid);
      });
    },
    getDataSource() {
      let data = _.cloneDeep(this.form.dataSource);
      data.forEach((col) => {
        Object.keys(col).forEach((key) => {
          if (key.includes("SHOW_")) {
            delete col[key];
          }
        });
      });
      return _.dropRight(data, 1);
    },
    initScroll() {
      let offsetHeight =
        document.querySelector(".JEditLineTable")?.offsetHeight;
      let height = offsetHeight ? offsetHeight - 30 : 168;
      this.y = height;
    },
    initDataSource(data = []) {
      this.form.dataSource = data;
      this.addLine();
    },
    addLine() {
      let obj = {
        needAdd: true,
        id: Date.now(),
      };
      this.columns.forEach((col) => {
        if (col.dataIndex) {
          obj[col.dataIndex] = undefined;
        }
      });
      this.form.dataSource.push(obj);
    },
    handleDelete(index) {
      this.form.dataSource.splice(index, 1);
    },
    handleChange(val, col, record) {
      if (record.needAdd) {
        this.addLine();
        record.needAdd = false;
      }

      if (col.type == FormTypes.lazySelect) {
        let obj = this.options?.[col.dataIndex]?.find((item) => item.id == val);
        this.$set(
          record,
          "SHOW_" + col.dataIndex,
          obj ? { ...obj } : undefined
        );
        if (col.dataIndex === "materialId") {
          let obj = this.options?.[col.dataIndex]?.find(
            (item) => item.id == val
          );
          this.$set(record, "standard", obj?.standard);
        }
      }
    },
    handleSearch(val, col) {
      console.log("handleSearch", val, col);
      if (!val) {
        return;
      }
      let that = this;
      if (this.timer?.[col.dataIndex]) {
        clearTimeout(this.timer[col.dataIndex]);
        this.timer[col.dataIndex] = null;
      }
      this.$set(this.currentValue, col.dataIndex, val);
      function selectOptions() {
        that.$set(that.loadings, col.dataIndex, true);
        let params = {};
        if (col.selectConfig.inputText) {
          params[col.selectConfig.inputText] = val;
        }
        getAction(col.selectConfig.url, params)
          .then((res) => {
            if (res.code === 200) {
              if (that.currentValue?.[col.dataIndex] == val) {
                that.$set(
                  that.options,
                  col.dataIndex,
                  res.data?.map((item) => {
                    return {
                      ...item,
                      value: item?.[col.selectConfig.valueKey || "value"],
                      label: item?.[col.selectConfig.labelKey || "label"],
                    };
                  }) || []
                );
              }
            } else {
              that.$message.info(res.data);
            }
          })
          .finally(() => {
            that.$set(that.loadings, col.dataIndex, false);
          });
      }
      this.$set(this.timer, col.dataIndex, setTimeout(selectOptions, 300));
    },
    /** 用于搜索下拉框中的内容 */
    handleSelectFilterOption(input, option, col) {
      if (col.allowSearch === true) {
        return (
          option?.componentOptions?.children[0].text
            .toLowerCase()
            .indexOf(input.toLowerCase()) >= 0
        );
      }
      return true;
    },
    getTabIndex(col, index) {
      return col.tabIndex != -1 ? 0 : -1;
    },
    getOptions(col, record) {
      let options = this.options[col.dataIndex] || [];
      let selectedOption = record?.["SHOW_" + col.dataIndex];
      if (selectedOption) {
        let index = options.findIndex(
          (option) => option.value == selectedOption.value
        );
        if (index == -1) options = [{ ...selectedOption }, ...options];
      }
      return options;
    },
    getRules(col, record, index) {
      let rules = [];
      if (col.validateRules) {
        rules = [...col.validateRules];
      }

      if (col.required) {
        let requiredCols = this.tableColumns.filter((c) => c.required);
        let hasInput = requiredCols.some((c) => !!record?.[c.dataIndex]);

        if (hasInput) {
          rules.push({
            required: true,
            message: "必填",
            trigger: ["change", "blur"],
          });
        }
      }
      return rules;
    },
    renderText(col, record, text) {
      if (col.type == FormTypes.select) {
        return (
          col?.options?.find((item) => item.value == record[col.dataIndex])
            ?.label || text
        );
      } else if (typeof col?.renderText == "function") {
        return col.renderText(record);
      } else {
        return text;
      }
    },
    getOpen(col, record) {
      return record?.["SHOW_" + col.dataIndex + "_open"] || false;
    },
    focus(col, record) {
      this.$set(record, "SHOW_" + col.dataIndex + "_open", true);
    },
    blur(col, record) {
      this.$set(record, "SHOW_" + col.dataIndex + "_open", false);
    },
    select(col, record, index) {
      this.$set(record, "SHOW_" + col.dataIndex + "_open", false);
    },
  },
};
</script>
<style lang="less" scoped>
.JEditLineTable {
  min-height: 198px;
}
.JEditLineTable {
  /deep/ .ant-form-item {
    margin-bottom: 0;

    .ant-form-explain {
      display: none;
    }
  }

  /deep/ .ant-table-thead > tr > th,
  /deep/ .ant-table-tbody > tr > td {
    padding: 4px 8px;
  }
}
</style>
