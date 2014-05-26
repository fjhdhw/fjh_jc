var count = 0;

function $(id) {
  return "string" == typeof(id) ? document.getElementById(id) : id;
}

getUrlParam = function(name) {
  var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)"); // 构造一个含有目标参数的正则表达式对象
  var r = window.location.search.substr(1).match(reg); // 匹配目标参数
  if (r != null)
    return unescape(r[2]);
  return null; // 返回参数值
}

//写入cookie
//两个参数，一个是cookie的名子，一个是值
setCookie = function(name, value) {
  var Days = 30; //此 cookie 将被保存 30 天
  var exp = new Date(); //new Date("December 31, 9998");
  exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
  document.cookie = name + "=" + escape(value) + ";expires=" + exp.toGMTString();
}

cookie = function(name) {
  var _cookieStr = document.cookie;

  var cookieArray = _cookieStr.split("; "); //得到分割的cookie名值对
  for (var i = 0; i < cookieArray.length; i++) {
    var arr = cookieArray[i].split("="); //将名和值分开   
    if (arr[0] == name) return decodeURIComponent(arr[1]); //如果是指定的cookie，则返回它的值   
  }
  return "";
}


function init() {

}

(function() {

  

  //ajax请求源码
  //封装XMLHTTP的Request类的代码 
  var Request = new Object();
  //定义一个XMLHTTP的数组
  Request.reqList = [];
  //创建一个XMLHTTP对象，兼容不同的浏览器
  function getAjax() {
    var ajax = false;
    try {
      ajax = new ActiveXObject("Msxml2.XMLHTTP");
    } catch (e) {
      try {
        ajax = new ActiveXObject("Microsoft.XMLHTTP");
      } catch (E) {
        ajax = false;
      }
    }
    if (!ajax && typeof XMLHttpRequest != 'undefined') {
      ajax = new XMLHttpRequest();
    }
    return ajax;
  }
  //封装XMLHTTP向服务器发送请求的操作
  //url:向服务器请求的路径；method：请求的方法，即是GET还是POST；callback：当服务器成功返回结果时，调用的函数
  //data：向服务器请求时附带的数据；urlencoded：url是否编码；callback2;当服务器返回错误时调用的函数
  Request.send = function(url, method, callback, data, urlencoded, callback2) {
    var req = getAjax(); //得到一个XMLHTTP的实例
    //当XMLHTTP的请求状态发生改变时调用
    req.onreadystatechange = function() {
      // 当请求已经加载
      if (req.readyState == 4) {
        // 当请求返回成功
        if (req.status < 400) {
          // 当定义了成功回调函数时，执行成功回调函数
          if (callback)
            callback(req, data);
        }
        // 当请求返回错误
        else {
          //alert("当加载数据时发生错误 :\n" + req.status + "/" + req.statusText);
          //当定义了失败回调函数时，执行失败回调函数
          if (callback2)
            callback2(req, data);
        }
        //服务器已经进行了处理，更改界面提示信息
        //删除XMLHTTP，释放资源
        try {
          delete req;
          req = null;
        } catch (e) {}
      }
    }
    //如果以POST方式回发服务器
    if (method == "POST") {
      req.open("POST", url, true);
      //请求需要编码
      if (urlencoded)
        req.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
      req.send(data);
      Request.reqList.push(req);
    }
    //以GET方式请求
    else {
      req.open("GET", url, true);
      req.send(null);
      Request.reqList.push(req);
    }
    //正在向服务器发送请求，页面显示正在加载的提示
    return req;
  }
  //全部清除XMLHTTP数组元素，释放资源
  Request.clearReqList = function() {
    var ln = Request.reqList.length;
    for (var i = 0; i < ln; i++) {
      var req = Request.reqList[i];
      if (req) {
        try {
          delete req;
        } catch (e) {}
      }
    }
    Request.reqList = [];
  }
  //进一步封装XMLHTTP以POST方式发送请求时的代码
  //clear：是否清除XMLHTTP数组的所有元素；其他参数的意义参见Request.send
  Request.sendPOST = function(url, data, callback, clear, callback2) {
    if (clear)
      Request.clearReqList();
    Request.send(url, "POST", callback, data, true, callback2);
  }
  //进一步封装XMLHTTP以GET方式发送请求时的代码
  Request.sendGET = function(url, callback, args, clear, callback2) {
    if (clear)
      Request.clearReqList();
    return Request.send(url, "GET", callback, args, false, callback2);
  }




  //监听触屏
  $('button').addEventListener('touchstart', function(e) {
    
  });

  $('button').addEventListener('touchend', function(e) {
   
  });


  //判斷用戶進來是否可以玩遊戲
  function initCheck(req, data) {
    //alert(req.responseText);
    var text = req.responseText;
    var data = JSON.parse(text);
    //alert(text)
    //alert(data.data.lv)
    if (data.data.check == "true" || data.data.check == true) {
      isPlay = true;
    } else {
      isPlay = false;
      //显示游戏不能玩
      //停止倒计时
      clearInterval(runTime);
      $("disPlayBg").style.display = "block";
      $("rulecon").style.display = "none";
      $("return").style.display = "none";
      return false;
    }
  }


  document.onreadystatechange = disShadowBg; //当页面加载状态改变的时候执行这个方法. 

  function disShadowBg() {
    //alert(cookie("lvsessionid"))
    if (document.readyState == "complete") {
      $("shadowBg").style.display = "none";
      isPlay = false;
      var localStorage = window.localStorage;
      if (localStorage.gameSite) {
        if (localStorage.getItem("gameSite") == "1") {
          $("rulecon").style.display = "none";
          $("return").style.display = "none";
        }
      } else {
        //alert("猛戳10次，即可中奖！");       
        $("return").style.display = "block";
      }

      Request.send("/activity/index.php?s=/ChouJiang519/checkAward&lvsessionid=" + cookie("lvsessionid"), "GET", initCheck, null, null);

    }
  }


  window.onload = function(argument) {
   
  }

})(window);