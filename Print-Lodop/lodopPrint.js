import getCLodop from "@/utils/Print-Lodop/CLodopFuncs";
import {getTotalPages,getFileBase64} from "./pdfJs";

let LODOP = getCLodop();

/**
 * 根据pdf 地址打印 pdf文件，双面，带水印
 * waterMarkType:1 文本水印； waterMarkType:2 图片水印
 *  图片的路径两种形式1：<img src='https://img2.banglail.com/contract/image/logo.png'>；
 *  路径2：<img src='E:\yuanqu\wbyqvueadmin\src\utils\Print-Lodop\img\logo.png'>
 * @param pdfUrl
 */
function printPdfUrl(pdfUrl,waterMarkType=2,waterMark='万邦国际',waterMarkImg="https://img2.banglail.com/contract/image/logo.png") {
  LODOP.PRINT_INIT("PDF打印功能");
  LODOP.SET_PRINT_MODE("PRINT_DUPLEX", 2);
  setPrintStyle(waterMarkType,waterMark,waterMarkImg);
  getFileBase64(pdfUrl).then((res)=>{
    LODOP.ADD_PRINT_PDF(0, 0, '100%', '100%', res?.split('data:application/pdf;base64,')[1])
    getTotalPages(pdfUrl).then((totalPages)=>{
      if (totalPages > 1) {
        for (let i = 0; i < totalPages - 1; i++) {
          LODOP.NEWPAGE();
          setPrintStyle(waterMarkType,waterMark,waterMarkImg);
        }
      }
      LODOP.PREVIEW();
    })
  })
}

function setPrintStyle(waterMarkType,waterMark,waterMarkImg){
  if(waterMarkType===1){
    LODOP.ADD_PRINT_TEXT(33, 33, 298,126, waterMark);
    LODOP.SET_PRINT_STYLEA(0, "FontSize", 16);
    LODOP.SET_PRINT_STYLEA(0, "Alpha", 128); //透明度范围值0-255， 默认值是255，代表完全不透明，0 代表完全透明
  }else if(waterMarkType===2){
    LODOP.ADD_PRINT_IMAGE(33,33,"200","200","<img src='"+waterMarkImg+"'>");
    LODOP.SET_PRINT_STYLEA(0,"Stretch",2)
    LODOP.SET_PRINT_STYLEA(0, "Alpha", 60); //透明度范围值0-255
  }
  LODOP.SET_PRINT_STYLEA(0, "Angle", 45); // 旋转角度
  LODOP.SET_PRINT_STYLEA(0, "Repeat", true);// 默认是紧密平铺，只有设置的宽高大于内容宽高时，方有间隔，及空白填充
}

export { printPdfUrl };
