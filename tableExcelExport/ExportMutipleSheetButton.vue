<template>
  <el-button
    type="primary"
    size="small"
    icon="el-icon-download"
    @click.native="exportTableData"
    :loading="exportTableLoading"
  >
    <slot></slot>
  </el-button>
</template>

<script>
/**
 * 组件使用方式，举个例子：
 *       1.  <ExportMutipleSheetButton :method="()=>导出函数(函数入参)">导出按钮文本</ExportMutipleSheetButton>
 *       导出函数数据返回格式说明：
 *       {
 *         data:{
 *           fileName:"文件名",
 *           sheets:[
 *             [
 *               {
 *               filterVal:["",...],   //导出列表的列val字段
 *               sheetName:'sheet名称',
 *               tHeader:["",...],// 列表的列名称
 *               tableDatas:[{...},{}...],// 数据
 *               }
 *             ]
 *           ],
 *         }
 *       }
 * */
import { export_json_to_excel } from "@/enhance/tableExport/exportMultipleSheet";
export default {
  name: "ExportMutipleSheetButton",
  props: {
    method: {
      type: Function,
    },
  },
  data() {
    return {
      exportTableLoading: false,
    };
  },
  methods: {
    exportTableData() {
      this.exportTableLoading = true;
      this.method()
        .then((res) => {
          console.log(res);
          this.exportTableLoading = false;
          let { fileName, sheets } = res;
          let tHeader = [];
          let dataArr = [];
          let sheetNames = [];
          const formatJson = (headValue, jsonData) => {
            return jsonData.map((v) => headValue.map((j) => v[j]));
          };
          for (let i in sheets) {
            tHeader.push(sheets[i].tHeader);
            dataArr.push(formatJson(sheets[i].filterVal, sheets[i].tableDatas));
            sheetNames.push(sheets[i].sheetName);
          }
          export_json_to_excel({
            header: tHeader,
            data: dataArr,
            sheetname: sheetNames,
            filename: fileName,
          });
        })
        .catch((err) => {
          console.log("导出异常信息：", err);
          this.exportTableLoading = false;
        });
    },
  },
};
</script>
