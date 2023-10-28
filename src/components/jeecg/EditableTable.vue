<template>
  <div class="JEditLineTable">
    <a-form-model ref="formRef" :model="form" :validateOnRuleChange="true">
      <a-table
        :columns="tableColumns"
        :data-source="form.dataSource"
        rowKey="id"
        :pagination="false"
        bordered
        :scroll="{ y: y }"
      >
        <div slot="depotNameTitle">
          库房号
          <a-popover title="库房件数总计">
            <template slot="content">
              <a-table
                :columns="countColumns"
                :data-source="countDataSource"
                :pagination="false"
                :scroll="{ y: 160, x: 240 }"
                :bordered="false"
                size="small"
              >
                <a slot="name" slot-scope="text">{{ text }}</a>
              </a-table>
            </template>
            <a-icon type="table" />
          </a-popover>
        </div>
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
                getLoading(col, record)
                  ? undefined
                  : '暂无数据，请修改查询条件或新增'
              "
              :getPopupContainer="getPopupContainer"
              :tabIndex="getTabIndex(col, index)"
              :open="getOpen(col, record)"
              :disabled="isView"
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
                v-if="getLoading(col, record)"
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
              v-else-if="col.type == FormTypes.forceSelect"
              v-model="record[col.dataIndex]"
              :filterOption="(i, o) => handleSelectFilterOption(i, o, col)"
              :dropdownMatchSelectWidth="false"
              :tabIndex="getTabIndex(col, index)"
              :open="getOpen(col, record)"
              :not-found-content="
                getLoading(col, record)
                  ? undefined
                  : '暂无数据，请修改查询条件或新增'
              "
              :getPopupContainer="getPopupContainer"
              :disabled="isView"
              showSearch
              allowClear
              style="width: 100%"
              placeholder="请选择"
              @change="(val) => handleChange(val, col, record)"
              @focus="focus(col, record)"
              @blur="blur(col, record)"
              @select="select(col, record, index)"
            >
              <a-spin
                v-if="getLoading(col, record)"
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
              :not-found-content="
                getLoading(col, record)
                  ? undefined
                  : '暂无数据，请修改查询条件或新增'
              "
              :getPopupContainer="getPopupContainer"
              :disabled="isView"
              showSearch
              allowClear
              style="width: 100%"
              placeholder="请选择"
              @change="(val) => handleChange(val, col, record)"
              @focus="focus(col, record)"
              @blur="blur(col, record)"
              @select="select(col, record, index)"
            >
              <a-spin
                v-if="getLoading(col, record)"
                slot="notFoundContent"
                size="small"
              />
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
              :disabled="isView"
              @change="(val) => handleChange(val, col, record)"
            />
            <div v-else-if="col.type == FormTypes.lazyInput">
              <a-input
                v-model="record[col.dataIndex]"
                allowClear
                style="width: calc(100% - 20px)"
                placeholder="请输入"
                :tabindex="getTabIndex(col, index)"
                :disabled="isView"
                @pressEnter="confirmInput(col, record)"
                @blur="confirmInput(col, record)"
                @change="(val) => handleChange(val, col, record)"
              />
              <span class="lazyInputStatus">
                <a-icon
                  v-if="record?.['SHOW_STATUS_' + col.dataIndex] == 'loading'"
                  type="loading"
                />
                <a-tooltip
                  v-else-if="
                    record?.['SHOW_STATUS_' + col.dataIndex] == 'success'
                  "
                  placement="top"
                >
                  <template slot="title">
                    <span>校验完成。已存在该条目。</span>
                  </template>
                  <a-icon type="check-circle" style="color: #52c41a" />
                </a-tooltip>
                <a-tooltip
                  v-else-if="
                    record?.['SHOW_STATUS_' + col.dataIndex] == 'warning'
                  "
                  placement="top"
                >
                  <template slot="title">
                    <span>校验完成。该条目不存在。提交时将会自动新增。</span>
                  </template>
                  <a-icon type="issues-close" style="color: #1890ff" />
                </a-tooltip>
                <a-tooltip v-else placement="top">
                  <template slot="title">
                    <span>未校验。</span>
                  </template>
                  <a-icon type="minus-circle" style="color: #7e8894" />
                </a-tooltip>
              </span>
            </div>
            <a-input-number
              v-else-if="col.type == FormTypes.inputNumber"
              v-model="record[col.dataIndex]"
              :min="col.min"
              :max="col.max"
              :precision="0"
              :tab-index="getTabIndex(col, index)"
              :disabled="isView"
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
          <a-tooltip v-if="index + 1 != form.dataSource.length" placement="top">
            <template slot="title">
              <span>在下方新增一行空行</span>
            </template>
            <a-button
              @click="handleAddEmptyLine(index)"
              type="link"
              size="small"
              :tabindex="-1"
            >
              新增
            </a-button>
          </a-tooltip>
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
    from: {
      type: String,
      default: "",
    },
    r_loadings: {
      type: Object,
      default: () => ({}),
    },
    r_options: {
      type: Object,
      default: () => ({}),
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
      countColumns: [
        {
          title: "库房号",
          dataIndex: "label",
        },
        {
          title: "总件数",
          dataIndex: "value",
        },
      ],
      isView: false,
    };
  },
  computed: {
    tableColumns() {
      return [
        ...this.columns,
        ...(this.isView
          ? []
          : [
              {
                title: "操作",
                dataIndex: "action",
                width: 110,
                scopedSlots: { customRender: "action" },
              },
            ]),
      ];
    },
    countDataSource() {
      if (this.from != "in") return [];
      let tempObj = {};
      this.form.dataSource
        .filter((item) => item.operNumber > 0 && !!item.depotName)
        .forEach((item) => {
          if (tempObj[item.depotName]) {
            tempObj[item.depotName] += item.operNumber;
          } else {
            tempObj[item.depotName] = item.operNumber;
          }
        });
      return Object.keys(tempObj).map((key) => {
        return {
          label: key,
          value: tempObj[key],
        };
      });
    },
  },
  mounted() {
    this.initScroll();
  },
  methods: {
    resetLazySelect() {
      this.loadings = {};
      this.options = {};
      this.timer = {};
    },
    validate(callback) {
      this.$refs.formRef.validate((valid) => {
        callback?.(valid);
      });
    },
    resetFidldsData(fields) {
      console.log(fields);
      fields.forEach((field) => {
        console.log(field);
        this.form.dataSource.forEach((item, index) => {
          console.log(item);
          if (this.form.dataSource[index]?.[field]) {
            this.form.dataSource[index][field] = undefined;
            this.form.dataSource[index]["SHOW_" + field] = undefined;
          }
        });
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
      data = data.filter((record) => {
        let requiredCols = this.tableColumns.filter((c) => c.required);
        let valid = requiredCols.every((c) => !!record?.[c.dataIndex]);
        return valid;
      });
      return data;
    },
    initScroll() {
      let offsetHeight =
        document.querySelector(".JEditLineTable")?.offsetHeight;
      let height = offsetHeight ? offsetHeight - 30 : 168;
      document.querySelector(
        ".JEditLineTable .ant-table-body"
      ).style.minHeight = height + "px";
      this.y = height;
    },
    initDataSource(data = [], isView = false) {
      this.form.dataSource = data;
      this.isView = isView;
      if (!this.isView) {
        this.addLine();
      }
    },
    addLine(o = {}) {
      let obj = {
        needAdd: true,
        id: Date.now(),
      };
      this.columns.forEach((col) => {
        if (col.dataIndex) {
          obj[col.dataIndex] = undefined;
        }
      });
      obj = {
        ...obj,
        ...o,
      };
      this.form.dataSource.push(obj);
    },
    handleAddEmptyLine(index) {
      let obj = {
        needAdd: false,
        id: Date.now(),
      };
      this.columns.forEach((col) => {
        if (col.dataIndex) {
          obj[col.dataIndex] = undefined;
        }
      });
      this.form.dataSource.splice(index + 1, 0, obj);
    },
    handleDelete(index) {
      this.form.dataSource.splice(index, 1);
    },
    handleChange(val, col, record) {
      if (record.needAdd) {
        if (
          this.from == "in" &&
          col.dataIndex != "depotName" &&
          record.depotName
        ) {
          this.addLine({
            depotName: record.depotName,
            SHOW_STATUS_depotName: record.SHOW_STATUS_depotName,
          });
        } else {
          this.addLine();
        }
        record.needAdd = false;
      }

      if (col.type == FormTypes.lazySelect) {
        let obj = this.options?.[col.dataIndex]?.find(
          (item) => item.value == val
        );
        this.$set(
          record,
          "SHOW_" + col.dataIndex,
          obj ? { ...obj } : undefined
        );
        if (col.dataIndex === "materialId") {
          let obj = this.options?.[col.dataIndex]?.find(
            (item) => item.value == val
          );
          this.$set(record, "standard", obj?.standard);
        }
      } else if (col.type == FormTypes.forceSelect) {
        let obj = record.options?.find((item) => item.value == val);
        this.$set(
          record,
          "SHOW_" + col.dataIndex,
          obj ? { ...obj } : undefined
        );
      } else if (col.type == FormTypes.lazyInput) {
        if (!record[col.dataIndex]) {
          this.$set(record, "SHOW_STATUS_" + col.dataIndex, "info");
        }
      }

      if (typeof col?.change == "function") {
        col?.change(val, col, record);
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
        let params = {};
        if (col.selectConfig.inputText) {
          params[col.selectConfig.inputText] = val;
        }
        if (typeof col?.getParams == "function") {
          params = {
            ...params,
            ...col.getParams(col),
          };
        }
        if (!params.supplierId) {
          that.$set(that.options, col.dataIndex, []);
          return;
        }
        that.$set(that.loadings, col.dataIndex, true);
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
      let options = [];
      if (col.type == FormTypes.forceSelect) {
        options = this.r_options?.[record.id + "_" + col.dataIndex] || [];
      } else {
        options = this.options[col.dataIndex] || [];
      }
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

        if (hasInput && !record.needAdd) {
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
    getLoading(col, record) {
      return (
        this.r_loadings?.[record.id + "_" + col.dataIndex] ||
        this.loadings[col.dataIndex] ||
        false
      );
    },
    focus(col, record) {
      this.$set(record, "SHOW_" + col.dataIndex + "_open", true);

      if (col.type == FormTypes.forceSelect) {
        if (
          !this.r_options?.[record.id + "_" + col.dataIndex]?.length &&
          typeof col?.getOptions == "function"
        ) {
          col.getOptions(col, record);
        }
      }
    },
    blur(col, record) {
      this.$set(record, "SHOW_" + col.dataIndex + "_open", false);
    },
    select(col, record, index) {
      this.$set(record, "SHOW_" + col.dataIndex + "_open", false);
    },
    getPopupContainer() {
      return document.querySelector(".JEditLineTable .ant-table-body");
    },
    confirmInput(col, record) {
      if (typeof col.confirm == "function") {
        col.confirm(col, record, this.form.dataSource);
      }
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
.lazyInputStatus {
  display: inline-block;
  width: 20px;
  height: 100%;
  padding: 0 3px;
}
</style>
