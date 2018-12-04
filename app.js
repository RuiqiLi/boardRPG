//app.js
var url = require('config/url.js')
App({
  calPxByRpx: function(rpx, cb) {
    wx.getSystemInfo({
      success: function (res) {
        console.log('screenWidth: '+res.screenWidth+' (used)')
        console.log('windowWidth: '+res.windowWidth)
        var px = rpx * res.screenWidth / 750
        typeof cb == "function" && cb(px)
      }
    })
  },
  getSessionId: function() {
    if (this.globalData.sessionid) {
      console.log('getSessionId: '+this.globalData.sessionid)
      return this.globalData.sessionid
    } else {
      this.globalData.sessionid = wx.getStorageSync('sessionid')
      console.log('getSessionId from storage: '+sessionid)
      return this.globalData.sessionid
    }
  },
  getUserInfo: function(cb, cbFail) {
    var that = this
    if (this.globalData.userInfo && this.globalData.sessionid) {
      typeof cb == "function" && cb(this.globalData.userInfo)
    } else {
      wx.login({
        success: function(r) {
          if (r.code) {
            wx.getUserInfo({
              withCredentials: true,
              success: function(res) {
                console.log(res)
                that.globalData.sessionid = wx.getStorageSync('sessionid')
                that.login({
                  code: r.code,
                  iv: res.iv,
                  encryptedData: res.encryptedData,
                  sessionid: that.globalData.sessionid
                }, res.userInfo, cb, cbFail)
              },
              fail: function(res) {
                console.error('getUserInfo接口fail。' + res.errMsg)
                typeof cbFail == "function" && cbFail('wx.getUserInfo', res)
              }
            })
          } else {
            console.log('获取用户登录态失败！' + r.errMsg)
          }
        },
        fail: function(r) {
          console.error('login接口fail。' + r.errMsg)
          typeof cbFail == "function" && cbFail('wx.login', r)
        }
      })
    }
  },
  login: function(param, userInfo, cb, cbFail) {
    var that = this
    wx.request({
      url: url.loginURL,
      data: param,
      header: {
        'content-type': "application/json",
      },
      success: function(res) {
        console.log(res)
        var data = res.data
        typeof data == "string" && (data = JSON.parse(data.trim()))
        if (data.errCode == 0) {
          userInfo.realName = data.realName
          userInfo.isAdmin = data.isAdmin
          if (that.globalData.sessionid != data.sessionid) {
            wx.setStorageSync('sessionid', data.sessionid)
            that.globalData.sessionid = data.sessionid
          }
        }
        that.globalData.userInfo = userInfo
        typeof cb == "function" && cb(that.globalData.userInfo)
      },
      fail: function(res) {
        console.error(res)
        typeof cbFail == "function" && cbFail('myLogin', res)
      }
    })
  },
  globalData: {
    userInfo:null,
    sessionid:"",
    realNameChanged:false
  }
})