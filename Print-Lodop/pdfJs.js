import pdfjsLib from 'pdfjs-dist'
import axios from "axios";

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cat.net/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.js`;
async function getTotalPages(pdfUrl){
  if(!pdfUrl){
    return ;
  }
  const loadingTask=pdfjsLib.getDocument(pdfUrl);
  try{
    const pdfDocument=await loadingTask.promise;
    const totalPages=pdfDocument.numPages;
    return  totalPages;
  }catch (err){
    console.error("无法获取pdf页数",err);
    return 0;
  }
}
const getFileBase64 = async pdfUrl => {
  let fileData = null
  try {
    fileData = await axios({
      method: 'get',
      url: pdfUrl, // 请求地址
      responseType: 'blob' // 指明服务器返回的数据类型
    })
  } catch {
    fileData = null
  }
  return new Promise((resolve, reject) => {
    if (fileData && fileData.data) {
      const file = new Blob([fileData.data], { type: 'application/pdf' })
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result)
      reader.onerror = error => reject(error)
    } else {
      reject('文件读取错误')
    }
  })
}

export {getTotalPages,getFileBase64}
