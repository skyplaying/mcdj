

//转化时间戳
function formatTimestamp(nS) {
  return formatTime(new Date(parseInt(nS)));
}

//格式化时间
function formatTime(date) {
  var year = date.getFullYear()
  var month = date.getMonth() + 1
  var day = date.getDate()

  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()


  return [year, month, day].map(formatNumber).join('-') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

function formatNumber(n) {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// 随机获取颜色
function getRandomColor() {
  let rgb = []
  for (let i = 0; i < 3; ++i) {
    let color = Math.floor(Math.random() * 256).toString(16)
    color = color.length == 1 ? '0' + color : color
    rgb.push(color)
  }
  return '#' + rgb.join('')
}

//转化一个数组中包含的某些元素的某个参数为字符串
function formatStringByParameters(array, indexs, parameter) {
  var arr = new Array
  for (var i in indexs) {
    var eValue = array[indexs[i]][parameter]
    arr = arr.concat(eValue)
  }
  var str = arr.join(',')
  return str
}

//格式化为可以给request里面的uploadFile方法用的数组格式
function formatFilePath(name, paths, formData) {
  var arr = new Array
  for (var i in paths) {
    arr.push({ name: name, url: paths[i], formData })
  }
  return arr
}

module.exports = {
  formatTimestamp: formatTimestamp,
  formatTime: formatTime,
  formatStringByParameters: formatStringByParameters,
  formatFilePath: formatFilePath,
}
