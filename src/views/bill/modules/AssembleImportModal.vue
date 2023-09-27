<template>
  <div ref="container">
    <a-modal
      :title="title"
      :width="500"
      :visible="visible"
      :confirm-loading="confirmLoading"
      :getContainer="() => $refs.container"
      :wrapClassName="wrapClassNameInfo()"
      :mask="isDesktop()"
      :maskClosable="false"
      @cancel="handleCancel"
      style="top: 20%; height: 55%"
    >
      <template slot="footer">
        <a-button key="back" @click="handleCancel">取消</a-button>
      </template>
      <a-spin :spinning="confirmLoading">
        <a-row class="form-row" :gutter="24">
          <a-col :md="24" :sm="24">
            <a-form-item
              label="第一步："
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <div>
                <a-select
                  placeholder="选择客户"
                  showSearch
                  v-model="supplierId"
                  @change="changeSupplierId"
                  style="width: 140px"
                >
                  <a-select-option
                    v-for="(item, index) in supList"
                    :key="index"
                    :value="item.id"
                  >
                    {{ item.supplier }}
                  </a-select-option>
                </a-select>
                <a-button
                  type="link"
                  :disabled="!supplierId"
                  @click="downloadTemplate"
                >
                  下载模板文件
                </a-button>
              </div>
              <div>选择客户并下载模板文件。</div>
            </a-form-item>
            <a-form-item
              label="第二步："
              :labelCol="labelCol"
              :wrapperCol="wrapperCol"
            >
              <a-upload-dragger
                name="file"
                :showUploadList="false"
                :multiple="false"
                :headers="tokenHeader"
                :action="importExcelUrl"
                :data="{ ...data, supplierId }"
                :disabled="!supplierId"
                @change="handleImportExcel"
              >
                <p class="ant-upload-drag-icon">
                  <a-icon type="inbox" />
                </p>
                <p class="ant-upload-text">点击或拖拽文件到此处进行上传</p>
                <p class="ant-upload-hint">导入相应客户数据</p>
              </a-upload-dragger>
            </a-form-item>
          </a-col>
        </a-row>
      </a-spin>
    </a-modal>
  </div>
</template>

<script>
import { JeecgListMixin } from "@/mixins/JeecgListMixin";
import { mixinDevice } from "@/utils/mixin";
import { findBySelectSup } from "@/api/api";
import { downFile } from "@/api/manage";
export default {
  name: "ImportFileModal",
  mixins: [JeecgListMixin, mixinDevice],
  props: {
    data: {
      type: Object,
      default: () => ({}),
    },
  },
  data() {
    return {
      title: "",
      visible: false,
      model: {},
      labelCol: {
        xs: { span: 4 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 20 },
        sm: { span: 20 },
      },
      confirmLoading: false,
      disableMixinCreated: true,
      url: {
        importExcelUrl: "",
      },
      supplierId: undefined,
      packageType: undefined,
      supList: [],
    };
  },
  created() {},
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG["domianURL"]}${this.url.importExcelUrl}`;
    },
  },
  methods: {
    initModal(apiUrl) {
      this.url.importExcelUrl = apiUrl;
      this.supplierId = undefined;
      this.packageType = undefined;
      this.initSupplier();
      this.visible = true;
    },
    initSupplier() {
      let that = this;
      findBySelectSup({}).then((res) => {
        if (res) {
          that.supList = res;
        }
      });
    },
    changeSupplierId(val) {
      const supplier = this.supList.find((item) => item.id == this.supplierId);
      this.packageType = supplier.packageTypeName == "半托" ? 2 : 1;
    },
    downloadTemplate() {
      downFile("/documentHead/exportTemplate", {
        packageType: this.packageType,
      }).then((data) => {
        if (!data) {
          this.$message.warning("文件下载失败");
          return;
        }
        if (typeof window.navigator.msSaveBlob !== "undefined") {
          window.navigator.msSaveBlob(
            new Blob([data], { type: data.type }),
            "模板文件.xls"
          );
        } else {
          let url = window.URL.createObjectURL(
            new Blob([data], { type: data.type })
          );
          let link = document.createElement("a");
          link.style.display = "none";
          link.href = url;
          link.setAttribute("download", "模板文件.xls");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link); //下载完成移除元素
          window.URL.revokeObjectURL(url); //释放掉blob对象
        }
      });
    },
    close() {
      this.$emit("close");
      this.visible = false;
    },
    handleCancel() {
      this.close();
    },
  },
};
</script>

<style scoped></style>
