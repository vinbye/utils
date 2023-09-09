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
 *       1.  <ExportSingleSheetButton :method="()=>导出函数(函数入参)">导出按钮文本</ExportSingleSheetButton>
 *       导出函数数据返回格式说明：
 *       {
 *         data:{
 *           fileName:"文件名",
 *           list:[{列字段：列字段值},...],
 *           map:{
 *             列名：列字段,
 *             ...
 *           }
 *         }
 *       }
 * */
import { export_json_to_excel } from "@/enhance/tableExport/exportSingleSheet";
export default {
  name: "ExportSingleSheetButton",
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
          let map = res.data.map;
          let tHeader = [];
          let filterVal = [];
          for (let index in map) {
            tHeader.push(map[index]);
            filterVal.push(index);
          }
          const formatJson = (headValue, jsonData) => {
            return jsonData.map((v) => headValue.map((j) => v[j]));
          };
          let data = formatJson(filterVal, res.data.list);
          export_json_to_excel({
            header: tHeader,
            data,
            filename: res.data.fileName,
          });
          this.exportTableLoading = false;
        })
        .catch((err) => {
          console.log("导出异常信息：", err);
          this.exportTableLoading = false;
        });
    },
  },
};
</script>
