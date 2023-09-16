<template>
  <div class="uploadBox">
    <div
      class="previewImgBox"
      v-for="(item, index) in fileUrlList"
      :key="index"
    >
      <el-image class="previewImg" :src="item" :preview-src-list="[item]">
      </el-image>
      <div class="previewImgOp">
        <i class="el-icon-delete" @click="rmImage(index)" />
      </div>
    </div>
    <el-upload
      v-show="fileUrlList.length < limitCount"
      class="img-uploader"
      action="#"
      :before-upload="beforeUpload"
      :http-request="imgFileUpload"
      :disabled="disabled"
      :show-file-list="false"
      accept=".jpg, .png, .jpeg"
    >
      <div class="uploadBtnBox">
        <i class="el-icon-upload img-uploader-icon"></i>
        <span class="img-uploader-txt">上传图片</span>
      </div>
    </el-upload>
  </div>
</template>

<script>
import { upload, uploadWithoutLogo } from "@/api/multipleImge";
import imageCompression from 'browser-image-compression'
import { Loading } from 'element-ui';
/**
 * 压缩图片
 * @return Promise<File>
 * @param file<File>
 * @param options
 */
 function compression(file, options = {
  maxSizeMB: 1, // (default: Number.POSITIVE_INFINITY)
  maxWidthOrHeight: 1920, // compressedFile will scale down by ratio to a point that width or height is smaller than maxWidthOrHeight (default: undefined)
  // but, automatically reduce the size to smaller than the maximum Canvas size supported by each browser.
  // Please check the Caveat part for details.
  onProgress: Function, // optional, a function takes one progress argument (percentage from 0 to 100)
  useWebWorker: false, // optional, use multi-thread web worker, fallback to run in main-thread (default: true)
  libURL: 'https://cdn.jsdelivr.net/npm/browser-image-compression/dist/browser-image-compression.js', // optional, the libURL of this library for importing script in Web Worker (default: https://cdn.jsdelivr.net/npm/browser-image-compression/dist/browser-image-compression.js)
  preserveExif: false, // optional, use preserve Exif metadata for JPEG image e.g., Camera model, Focal length, etc (default: false)
  signal: AbortSignal, // optional, to abort / cancel the compression
  // following options are for advanced users
  maxIteration: 10, // optional, max number of iteration to compress the image (default: 10)
  exifOrientation: 1, // optional, see https://stackoverflow.com/a/32490603/10395024
  fileType: file.type, // optional, fileType override e.g., 'image/jpeg', 'image/png' (default: file.type)
  initialQuality: 1 // optional, initial quality value between 0 and 1 (default: 1)
}) {
  return new Promise(resolve => {
    // 压缩图片
    imageCompression(file, options).then(res => {
      // 压缩后返回的结果，方法中显示的是File类型，但是实际返回的是Blob类型，需要转换
      let newFile = new File([res], res.name, {
        type: res.type
      })
      resolve(newFile)
    }).catch(e => {
      console.error('图片压缩失败：', e)
      // 如果压缩失败，使用原图上传，不影响业务进行
      resolve(file)
    })
  })
}
/**
 * 下载，导出文件格式
 *  图片上传组件
 *
 *  <uploadImgBtn imgUrls.sync="图片的数组"/>
 * */
export default {
  name: "uploadImgBtn",
  props: {
    // multiple: {
    //   type: Boolean,
    //   default: false,
    // },
    disabled: {
      type: Boolean,
      default: false,
    },
    limitSize: {
      // 上传文件限制文件大小(M)
      type: Number,
      default: 10,
    },
    limitCount: {
      type: Number,
      default: 4,
    },
    withLogo: {
      type: Boolean,
      default: true,
    },
    imgUrls: {
      type: Array,
    },
  },
  computed: {
    fileUrlList: {
      get() {
        return this.imgUrls;
      },
      set(val) {
        this.$emit("update:imgUrls", val);
      },
    },
  },
  data() {
    return {
    };
  },
  methods: {
    beforeUpload(file) {
      let isLt2M = file.size / 1024 / 1024 < this.limitSize;
      if (!isLt2M) {
        this.$message.error(`上传图片大小不能超过 ${this.limitSize} MB!`);
      } else {
        if (file.type !== "image/jpeg" && file.type !== "image/png") {
          this.$message.error(`上传文件不是图片!`);
          isLt2M = false;
        }
      }
      return isLt2M;
    },

    imgFileUpload(file) {
     let uploadLoading= Loading.service({
        target:".uploadBtnBox"
      });
      compression(file.file).then((file) => {
        let postParam = new FormData();
        postParam.append("file", file);
        postParam.append("suffixPath", "image");
        let method = this.withLogo ? upload : uploadWithoutLogo;
        method(postParam)
          .then((res) => {
            uploadLoading.close();
            let uploadImgUrls = res.data.url;
            this.fileUrlList.push(uploadImgUrls);
          })
          .catch((errors) => {
            uploadLoading.close();
          });
      }).catch((err)=>{
        console.log(err)
        this.uploadLoading.close();
      });
    },
    rmImage(index) {
      this.fileUrlList.splice(index, 1);
    },
  },
};
</script>

<style lang="scss" scoped>
.img-uploader {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  display: inline-block;
  width: 120px;
  height: 120px;
}
.img-uploader ::v-deep {
  .el-upload {
    width: 100%;
    height: 100%;
  }
  .uploadBtnBox {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
  .el-upload:hover {
    border-color: #409eff;
  }
  .img-uploader-icon {
    font-size: 35px;
    color: #ccc;
  }
  .img-uploader-txt {
    color: #ccc;
  }
}

.uploadBox {
  display: flex;
  flex-wrap: wrap;
}
.previewImgBox {
  position: relative;
  margin-right: 10px;
  margin-bottom: 10px;
  .previewImg {
    width: 120px;
    height: 120px;
    vertical-align: top;
  }
  .previewImgOp {
    position: absolute;
    width: 100%;
    height: 22px;
    line-height: 22px;
    text-align: center;
    left: 0;
    bottom: 0;
    color: #fff;
    background-color: rgba(0, 0, 0, 0.5);
    cursor: pointer;
    opacity: 0;
    transition: opacity 0.3s;
    .el-icon-delete {
      font-size: 16px;
    }
  }
  &:hover {
    .previewImgOp {
      opacity: 1;
    }
  }
}
</style>
