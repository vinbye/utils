/**
 * @author liwei
 * @date 2023/9/14
 */
let spanArrList = []; // 设定一个数组spanArr来存放要合并的格数
let positionArr = []; // 索引值数组，同时还要设定一个变量pos来记录
/**
 * dataList 要合并的数据
 * mergePropArr 根据哪些字段名称进行合并,根据字段的顺序进行合并
 * */
function getCellMergeArr(dataList, mergePropArr) {
  positionArr = new Array(mergePropArr.length).fill(0);
  spanArrList = new Array(mergePropArr.length).fill([]).map((item) => []); // !!!注意：当给fill()方法传递对象值时，将引用该对象本身而不是创建一个新的对象副本。这意味着当你更改对象的属性时，所有引用该对象的数组元素都将被更改。
  for (let i = 0; i < dataList.length; i++) {
    if (i === 0) {
      positionArr.fill(0);
      spanArrList.map((item) => {
        item.push(1);
      });
    } else {
      // let j = 0;
      // if (dataList[i][mergePropArr[j]] === dataList[i - 1][mergePropArr[j]]) {
      //   spanArrList[j][positionArr[j]] += 1;
      //   spanArrList[j].push(0);
      //   if (
      //     dataList[i][mergePropArr[j + 1]] ===
      //     dataList[i - 1][mergePropArr[j + 1]]
      //   ) {
      //     spanArrList[j + 1][positionArr[j + 1]] += 1;
      //     spanArrList[j + 1].push(0);
      //   } else {
      //     spanArrList[j + 1].push(1);
      //     positionArr[j + 1] = i;
      //   }
      // } else {
      //   spanArrList[j].push(1);
      //   positionArr[j] = i;
      //   spanArrList[j + 1].push(1);
      //   positionArr[j + 1] = i;
      // }

      let j = 0;
      do {
        if (
          dataList[i][mergePropArr[j - 1]] ===
            dataList[i - 1][mergePropArr[j - 1]] &&
          dataList[i][mergePropArr[j]] === dataList[i - 1][mergePropArr[j]]
        ) {
          spanArrList[j][positionArr[j]] += 1;
          spanArrList[j].push(0);
        } else {
          spanArrList[j].push(1);
          positionArr[j] = i;
        }
        j++;
      } while (mergePropArr[j]);
    }
  }
}

// 此处为行合并，列合并相同处理
/**
 * columnArr 哪些列的数据需要进行行合并，列下标数据
 * rowIndex 当前行下标
 * columnIndex 当前列下标
 *  结合elementui 的table的  :span-method="function"一起使用  在函数中调用
 * 案例：在span-method函数中 return  cellMergeMethod(list数据,["合并属性1","..."],columnArr,rowIndex,columnIndex)
 *       let columnArr=[[0, 1, 2, 3, 4, 5, 15],[6,7]];
 *      return  cellMergeMethod(this.tableData,["sonGoleId","userId"],columnArr,rowIndex,columnIndex)
 * */
function cellMergeMethod(
  dataList,
  mergePropArr,
  columnArr,
  rowIndex,
  columnIndex
) {
  getCellMergeArr(dataList, mergePropArr);
  console.log(spanArrList);
  for (let i = 0; i < columnArr.length; i++) {
    if (columnArr[i].includes(columnIndex)) {
      const _row = spanArrList[i][rowIndex];
      const _col = _row > 0 ? 1 : 0;
      return {
        rowspan: _row,
        colspan: _col,
      };
    }
  }
}
export { cellMergeMethod };
