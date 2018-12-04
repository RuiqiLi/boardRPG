// pages/feedback/feedback.js
var app = getApp()
var url = require('../../config/url.js')
Page({
  data: {
    message: "",
    isAdmin: false
  },
  // 生命周期函数
  onLoad: function(options) {
    var that = this
    app.getUserInfo(function (userInfo) {
      if (userInfo.isAdmin) {
        that.setData({
          isAdmin: true
        })
        that.getAdminMessages()
      }
    })
  },
  // 自定义函数
  getAdminMessages: function () {
    var that = this
    wx.request({
      url: url.messageAllAdminURL,
      header: {
        'content-type': "application/json",
        'sessionid': app.getSessionId()
      },
      success: function (res) {
        console.log(res)
        var data = res.data
        typeof data == "string" && (data = JSON.parse(data.trim()))
        if (data.ok) {
          that.setData({
            adminAllMessages: data.adminAllMessages
          })
        }
      },
      fail: function (res) {
        console.error(res)
        that.setData({
          netError: true,
          errMsg: 'myAdminMessageAll'
        })
      }
    })
  },
  // 事件函数
  onInputMessage: function(e) {
    this.setData({
      message: e.detail.value
    })
  },
  onTapSubmit: function() {
    var that = this
    wx.request({
      url: url.messageNewURL,
      data: {
        message: that.data.message
      },
      header: {
        'content-type': "application/json",
        'sessionid': app.getSessionId()
      },
      success: function (res) {
        console.log(res)
        var data = res.data
        typeof data == "string" && (data = JSON.parse(data.trim()))
        if (data.ok) {
          wx.showToast({
            title: '留言成功',
            icon: 'success',
            duration: 1000
          })
          that.setData({
            message: ""
          })
          app.getUserInfo(function (userInfo) {
            if (userInfo.isAdmin) {
              that.getAdminMessages()
            }
          })
        }
      },
      fail: function (res) {
        console.error(res)
        that.setData({
          netError: true,
          errMsg: 'myMessageNew'
        })
      }
    })
  }
})