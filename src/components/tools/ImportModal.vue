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
            <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol">
              <a-upload-dragger
                name="file"
                :showUploadList="false"
                :multiple="false"
                :headers="tokenHeader"
                :action="importExcelUrl"
                :data="data"
                @change="handleImportExcel"
              >
                <p class="ant-upload-drag-icon">
                  <a-icon type="inbox" />
                </p>
                <p class="ant-upload-text">点击或拖拽文件到此处进行上传</p>
                <p class="ant-upload-hint">
                  Click or drag file to this area to upload
                </p>
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
        xs: { span: 0 },
        sm: { span: 0 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 24 },
      },
      confirmLoading: false,
      disableMixinCreated: true,
      templateUrl: "",
      templateName: "",
      url: {
        importExcelUrl: "",
      },
    };
  },
  created() {},
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG["domianURL"]}${this.url.importExcelUrl}`;
    },
  },
  methods: {
    initModal(apiUrl, templateUrl, templateName) {
      this.url.importExcelUrl = apiUrl;
      this.templateUrl = templateUrl;
      this.templateName = templateName;
      this.visible = true;
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
