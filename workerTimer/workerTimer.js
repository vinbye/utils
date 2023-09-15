/**
 * 修复ios，息屏状态下，定时器频率变慢的问题
 * 使用方式和 window的setInterval一致：
 * 例如：this.time_1=workerTimer.setInterval(()=>{
 *           ...
 *       },1000)
 * */

import Worker from './web.worker'
let worker = new Worker();
let workerTimer = {
  id: 0,
  callbacks: {},
  setInterval: function (cb, interval, context) {
    this.id++;
    let id = this.id;
    this.callbacks[id] = { fn: cb, context: context };
    worker.postMessage({ command: 'interval:start', interval: interval, id: id });
    return id;
  },
  setTimeout: function (cb, timeout, context) {
    this.id++;
    let id = this.id;
    this.callbacks[id] = { fn: cb, context: context };
    worker.postMessage({ command: 'timeout:start', timeout: timeout, id: id });
    return id;
  },
  // 监听worker 里面的定时器发送的message 然后执行回调函数
  onMessage: function (e) {
    switch (e.data.message) {
      case 'interval:tick':
        var callback = this.callbacks[e.data.id];
        if (callback && callback.fn) callback.fn.apply(callback.context);
        break;
      case 'timeout:tick':
        var callback = this.callbacks[e.data.id];
        if (callback && callback.fn) callback.fn.apply(callback.context);
        break;
      case 'interval:cleared':
        delete this.callbacks[e.data.id];
        break;
      case 'timeout:cleared':
        delete this.callbacks[e.data.id];
        break;
    }
  },
  // 往worker里面发送销毁指令
  clearInterval: function (id) {
    worker.postMessage({ command: 'interval:clear', id: id });
  },
  clearTimeout: function (id) {
    worker.postMessage({ command: 'timeout:clear', id: id });
  }
};
worker.onmessage = workerTimer.onMessage.bind(workerTimer);
export default workerTimer
