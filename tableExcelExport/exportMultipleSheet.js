/**
 * 安装xlsx ,file-saver ,script-loader
 * */
/* eslint-disable */
require("script-loader!file-saver");
import XLSX from "xlsx";


function datenum(v, date1904) {
  if (date1904) v += 1462;
  var epoch = Date.parse(v);
  return (epoch - new Date(Date.UTC(1899, 11, 30))) / (24 * 60 * 60 * 1000);
}

function sheet_from_array_of_arrays(data, opts) {
  var ws = {};
  var range = {
    s: {
      c: 10000000,
      r: 10000000,
    },
    e: {
      c: 0,
      r: 0,
    },
  };
  for (var R = 0; R != data.length; ++R) {
    for (var C = 0; C != data[R].length; ++C) {
      if (range.s.r > R) range.s.r = R;
      if (range.s.c > C) range.s.c = C;
      if (range.e.r < R) range.e.r = R;
      if (range.e.c < C) range.e.c = C;
      var cell = {
        v: data[R][C],
      };
      if (cell.v == null) continue;
      var cell_ref = XLSX.utils.encode_cell({
        c: C,
        r: R,
      });

      if (typeof cell.v === "number") cell.t = "n";
      else if (typeof cell.v === "boolean") cell.t = "b";
      else if (cell.v instanceof Date) {
        cell.t = "n";
        cell.z = XLSX.SSF._table[14];
        cell.v = datenum(cell.v);
      } else cell.t = "s";

      ws[cell_ref] = cell;
    }
  }
  if (range.s.c < 10000000) ws["!ref"] = XLSX.utils.encode_range(range);
  return ws;
}

function Workbook() {
  if (!(this instanceof Workbook)) return new Workbook();
  this.SheetNames = [];
  this.Sheets = {};
}

function s2ab(s) {
  var buf = new ArrayBuffer(s.length);
  var view = new Uint8Array(buf);
  for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xff;
  return buf;
}



export function export_json_to_excel({
  multiHeader = [],
  header,
  data,
  sheetname,
  filename,
  merges = [],
  autoWidth = true,
  bookType = "xlsx",
} = {}) {
  /* original data */
  filename = filename || "excel-list";
  data = [...data];

  for (var i = 0; i < header.length; i++) {
    data[i].unshift(header[i]);
  }

  // data.unshift(header)

  for (let i = multiHeader.length - 1; i > -1; i--) {
    data.unshift(multiHeader[i]);
  }

  var ws_name = sheetname;
  var wb = new Workbook(),
    ws = [];
  for (var j = 0; j < header.length; j++) {
    ws.push(sheet_from_array_of_arrays(data[j]));
  }

  if (merges.length > 0) {
    if (!ws["!merges"]) ws["!merges"] = [];
    merges.forEach((item) => {
      ws["!merges"].push(XLSX.utils.decode_range(item));
    });
  }
  // console.log("width", autoWidth)
  if (autoWidth) {
    /*设置worksheet每列的最大宽度*/
    var colWidth = [];
    for (var k = 0; k < header.length; k++) {
      colWidth.push(
        data[k].map((row) =>
          row.map((val) => {
            /*先判断是否为null/undefined*/
            if (val == null) {
              return {
                wch: 10,
              };
            } else if (val.toString().charCodeAt(0) > 255) {
              /*再判断是否为中文*/
              return {
                wch: val.toString().length * 2,
              };
            } else {
              return {
                wch: val.toString().length,
              };
            }
          })
        )
      );
    }

    /*以第一行为初始值*/
    let result = [];
    for (var k = 0; k < colWidth.length; k++) {
      result[k] = colWidth[k][0];
      for (let i = 1; i < colWidth[k].length; i++) {
        for (let j = 0; j < colWidth[k][i].length; j++) {
          if (result[k][j]["wch"] < colWidth[k][i][j]["wch"]) {
            result[k][j]["wch"] = colWidth[k][i][j]["wch"];
          }
        }
      }
    }
    // 分别给sheet表设置宽度
    for (var l = 0; l < result.length; l++) {
      ws[l]["!cols"] = result[l];
    }
  }

  /* add worksheet to workbook */
  for (var k = 0; k < header.length; k++) {
    wb.SheetNames.push(ws_name[k]);
    wb.Sheets[ws_name[k]] = ws[k];
  }

  var wbout = XLSX.write(wb, {
    bookType: bookType,
    bookSST: false,
    type: "binary",
  });
  saveAs(
    new Blob([s2ab(wbout)], {
      type: "application/octet-stream",
    }),
    `${filename}.${bookType}`
  );
}
