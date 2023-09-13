import getCLodop from "@/utils/Print-Lodop/CLodopFuncs";
import {getTotalPages,getFileBase64} from "./pdfJs";

let LODOP = getCLodop();

/**
 * 根据pdf 地址打印 pdf文件，双面，带水印
 * @param pdfUrl
 */
function printPdfUrl(pdfUrl,waterMark='万邦国际') {
  LODOP.PRINT_INIT("PDF打印功能");
  LODOP.SET_PRINT_MODE("PRINT_DUPLEX", 2);
  LODOP.ADD_PRINT_TEXT(33, 73, 298, 126, waterMark);
  LODOP.SET_PRINT_STYLEA(0, "FontSize", 16);
  LODOP.SET_PRINT_STYLEA(0, "Angle", 45); // 旋转角度
  LODOP.SET_PRINT_STYLEA(0, "Alpha", 128); //透明度范围值0-255
  LODOP.SET_PRINT_STYLEA(0, "Repeat", true);
  getFileBase64(pdfUrl).then((res)=>{
    LODOP.ADD_PRINT_PDF(0, 0, '100%', '100%', res?.split('data:application/pdf;base64,')[1])
    getTotalPages(pdfUrl).then((totalPages)=>{
      if (totalPages > 1) {
        for (let i = 0; i < totalPages - 1; i++) {
          LODOP.NEWPAGE();
          LODOP.ADD_PRINT_TEXT(33, 73, 298, 126, "万邦国际");
          LODOP.SET_PRINT_STYLEA(0, "FontSize", 16);
          LODOP.SET_PRINT_STYLEA(0, "Angle", 45); // 旋转角度
          LODOP.SET_PRINT_STYLEA(0, "Alpha", 128); //透明度范围值0-255
          LODOP.SET_PRINT_STYLEA(0, "Repeat", true);
        }
      }
      LODOP.PREVIEW();
    })
  })
}

export { printPdfUrl };
