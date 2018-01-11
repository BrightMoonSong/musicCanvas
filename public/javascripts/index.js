function $(s) {
  return document.querySelectorAll(s);
}

var lis = $("#list li");
lis.forEach(function(liClick) {
  liClick.onclick = function() {
    lis.forEach(function(item) {
      item.className = '';
    });
    this.className = 'selected';
    load("/media/" + this.title); // 获取音频数据
  };
});

var xhr = new XMLHttpRequest();
window.AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext;
var ac = new window.AudioContext();
var gainNode = ac[ac.createGain ? "createGain" : "createGainNode"]();
gainNode.connect(ac.destination);

var analyser = ac.createAnalyser();
var size = 128;
analyser.fftSize = size * 2;
analyser.connect(gainNode);

var source = null;
var count = 0;
var box = $(".box")[0]; // 装载音乐数据可视化的canvas的容器
var width, height;
var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");
box.appendChild(canvas);

function draw(arr) {
  ctx.clearRect(0, 0, width, height); //清除画布内容包含宽高，否则会持续叠加
  var w = width / size;
  for (var i = 0; i < size; i++) {
    var h = arr[i] / 256 * height;
    ctx.fillRect(w * i, height - h, w * 0.6, h)
  }
}

// 重置canvas属性
function resize() {
  width = box.clientWidth;
  height = box.clientHeight;
  canvas.width = width;
  canvas.height = height;
  var line = ctx.createLinearGradient(0, 0, 0, height);
  line.addColorStop(0, "red");
  line.addColorStop(0.5, "yellow");
  line.addColorStop(1, "green");
  ctx.fillStyle = line;
}
resize();
window.onresize = resize;

function load(url) {
  var n = ++count;
  /**
   * a() && b() :如果执行a()后返回true，则执行b()并返回b的值；如果执行a()后返回false，则整个表达式返回a()的值，b()不执行；
   * a() || b() :如果执行a()后返回true，则整个表达式返回a()的值，b()不执行；如果执行a()后返回false，则执行b()并返回b()的值；
   * && 优先级高于 ||
   */
  source && source[source.stop ? "stop" : "noteOff"]();
  xhr.abort(); //终止正在进行中的ajax请求
  xhr.open("GET", url);
  xhr.responseType = "arraybuffer"; //表示二进制数据的原始缓冲区，该缓冲区用于存储各种类型化数组的数据,服务器返回音频数据以二进制传输
  xhr.onload = function() {
    if (n != count) {
      return;
    }
    ac.decodeAudioData(xhr.response, function(buffer) {
      if (n != count) {
        return;
      }
      var bufferSource = ac.createBufferSource();
      bufferSource.buffer = buffer;
      // bufferSource.connect(ac.destination);
      bufferSource.connect(analyser); //分析对象
      // bufferSource.connect(gainNode); //音量
      // bufferSource.start(0);老浏览器支持noteOn
      bufferSource[bufferSource.start ? "start" : "noteOn"](0);
      source = bufferSource;
    }, function(error) {
      console.log(error);
    });
  };
  xhr.send();
}

function visualizer() {
  var arr = new Uint8Array(analyser.frequencyBinCount);
  window.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

  function v() {
    analyser.getByteFrequencyData(arr);
    // console.log(arr);
    draw(arr);
    window.requestAnimationFrame(v);
  }
  window.requestAnimationFrame(v);
}
visualizer();

function changeVolume(percent) {
  // 改变音量--2次方???
  gainNode.gain.value = percent * percent;
}
// 停止播放
$("#stop")[0].onclick = function() {
  lis.forEach(function(item) {
    item.className = '';
  });
  source && source[source.stop ? "stop" : "noteOff"]();
}
$("#volume")[0].onchange = function() {
  changeVolume(this.value / this.max);
}
$("#volume")[0].onchange();
