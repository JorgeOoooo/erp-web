import Vue from "vue";
import { getAction } from "@/api/manage";
import { FormTypes } from "@/utils/JEditableTableUtil";
import {
  findBySelectSup,
  findBySelectCus,
  findBySelectRetail,
  getUserList,
  getAccount,
  getCurrentSystemConfig,
} from "@/api/api";
import { getCheckFlag } from "@/utils/util";

export const BillListMixinSimple = {
  data() {
    return {
      /* 原始审核是否开启 */
      checkFlag: true,
      prefixNo: "",
      supList: [],
      cusList: [],
      retailList: [],
      userList: [],
      accountList: [],
      depotList: [],
    };
  },
  computed: {
    importExcelUrl: function () {
      return `${window._CONFIG["domianURL"]}/${this.url.importExcelUrl}`;
    },

    isBatchDelEnabled: function () {
      for (let i = 0; i < this.selectedRowKeys.length; i++) {
        if (!this.selectionRows[i].actionsEnabled.delete) {
          return false;
        }
      }
      return true;
    },
  },
  created() {},
  methods: {
    myHandleAdd() {
      this.$refs.modalForm.action = "add";
      if (this.btnEnableList.indexOf(2) === -1) {
        this.$refs.modalForm.isCanCheck = false;
      }
      this.handleAdd();
    },
    myHandleCopyAdd(record) {
      this.$refs.modalForm.action = "copyAdd";
      if (this.btnEnableList.indexOf(2) === -1) {
        this.$refs.modalForm.isCanCheck = false;
      }
      //复制单据的时候需要移除关联单据的相关信息
      record.linkNumber = "";
      record.billType = "";
      record.deposit = "";
      this.$refs.modalForm.edit(record);
      this.$refs.modalForm.title = "复制新增";
      this.$refs.modalForm.disableSubmit = false;
      //开启明细的编辑模式
      this.$refs.modalForm.rowCanEdit = true;
      this.$refs.modalForm.materialTable.columns[1].type = FormTypes.popupJsh;
    },
    myHandleEdit(record) {
      this.$refs.modalForm.action = "edit";
      if (this.btnEnableList.indexOf(2) === -1) {
        this.$refs.modalForm.isCanCheck = false;
      }
      let item = record;
      this.handleEdit(item);
    },
    myHandleDelete(record) {
      this.handleDelete(record.id);
    },
    myHandleDetail(record, type, prefixNo) {
      if (this.btnEnableList.indexOf(7) === -1) {
        this.$refs.modalDetail.isCanBackCheck = false;
      }
      this.handleDetail(record, type, prefixNo);
    },
    myHandleInfo(record) {
      this.$refs.billInfo.show(record);
    },
    handleApprove(record) {
      this.$refs.modalForm.action = "approve";
      this.$refs.modalForm.edit(record);
      this.$refs.modalForm.title = "审核";
    },
    searchReset() {
      this.queryParam = {
        type: this?.dType == "all" ? undefined : this.queryParam.type,
        subType: this.queryParam.subType,
        roleType: Vue.ls.get("roleType"),
      };
      this.loadData(1);
    },
    onDateChange: function (value, dateString) {
      this.queryParam.beginTime = dateString[0];
      this.queryParam.endTime = dateString[1];
    },
    onDateOk(value) {
      console.log(value);
    },
    initSystemConfig() {
      getCurrentSystemConfig().then((res) => {
        if (res.code === 200 && res.data) {
          let multiBillType = res.data.multiBillType;
          let multiLevelApprovalFlag = res.data.multiLevelApprovalFlag;
          this.checkFlag = getCheckFlag(
            multiBillType,
            multiLevelApprovalFlag,
            this.prefixNo
          );
        }
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
    initCustomer() {
      let that = this;
      findBySelectCus({}).then((res) => {
        if (res) {
          that.cusList = res;
        }
      });
    },
    initRetail() {
      let that = this;
      findBySelectRetail({}).then((res) => {
        if (res) {
          that.retailList = res;
        }
      });
    },
    getDepotData() {
      getAction("/depot/findDepotByCurrentUser").then((res) => {
        if (res.code === 200) {
          this.depotList = res.data;
        } else {
          this.$message.info(res.data);
        }
      });
    },
    initUser() {
      getUserList({}).then((res) => {
        if (res) {
          this.userList = res;
        }
      });
    },
    initAccount() {
      getAccount({}).then((res) => {
        if (res && res.code === 200) {
          let list = res.data.accountList;
          this.accountList = list;
        }
      });
    },
  },
};
