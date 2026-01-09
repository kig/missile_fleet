if (!window['$A']) {
  /**
    Creates a new array from an object with #length.
    */
  window.$A = function(obj) {
    var a = new Array(obj.length)
    for (var i=0; i<obj.length; i++)
      a[i] = obj[i]
    return a
  }
}

if (!window['$']) {
  window.$ = function(id) {
    return document.getElementById(id)
  }
}
