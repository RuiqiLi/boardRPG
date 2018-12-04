//settings.js
var app = getApp()
var url = require('../../config/url.js')
Page({
  // 生命周期函数
  onLoad: function(options) {
    this.setData({
      realName: options.realName
    })
  },
  // 事件处理函数
  onInputRealName: function(e) {
    this.setData({
      realName: e.detail.value
    })
  },
  onTapSubmit: function() {
    var that = this
    wx.request({
      url: url.avalonSetRealNameURL,
      data: {
        realName: that.data.realName
      },
      header: {
        'content-type': "application/json",
        'sessionid': app.getSessionId()
      },
      success: function(res) {
        console.log(res)
        var data = res.data
        typeof data == "string" && (data = JSON.parse(data.trim()))
        if (data.ok) {
          app.globalData.userInfo.realName = data.realName
          app.globalData.realNameChanged = true
          wx.navigateBack()
        }
      },
      fail: function(res) {
        console.error(res)
        that.setData({
          netError: true,
          errMsg: 'mySetRealName'
        })
      }
    })
  }
})
