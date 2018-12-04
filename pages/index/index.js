//index.js
var app = getApp()
var version = require('../../config/version.js')
Page({
  animationHalfTime: 500,
  data: {
    animationData: {},
    version: "",
    infoLoaded: false,
    retryTimes: 0,
    tipType: ""
  },
  // 生命周期函数
  onLoad: function() {
    this.setData({
      version: version.verNo
    })
  },
  onShow: function () {
    this.loadInfo()
    this.setAnimation()
  },
  onHide: function () {
    if (this.animationInterval) {
      clearInterval(this.animationInterval)
      this.animationInterval = undefined
    }
  },
  loadInfo: function() {
    var that = this
    app.getUserInfo(function(userInfo) {
      var tipType = ""
      if (that.data.tipType == "no-auth") {
        tipType = "auth-success"
        setTimeout(function () {
          that.setData({
            tipType: ""
          })
        }, 3000)
      } else if (that.data.tipType == "no-link") {
        tipType = "link-success"
        setTimeout(function () {
          that.setData({
            tipType: ""
          })
        }, 3000)
      }
      that.setData({
        infoLoaded: true,
        retryTimes: 0,
        tipType
      })
    }, function(failType, res) {
      switch(failType) {
        case 'wx.getUserInfo':
          that.setData({
            infoLoaded: false,
            tipType: "no-auth"
          })
          break

        case 'myLogin':
          that.setData({
            infoLoaded: false,
            retryTimes: that.data.retryTimes+1,
            tipType: "no-link"
          })
          setTimeout(function() {
            that.loadInfo()
          }, 3000)
          break
      }
    })
  },
  setAnimation: function() {
    if (!this.animationInterval) {
      var halfTime = this.animationHalfTime
      var that = this
      this.animationInterval = setInterval(function () {
        var animation = wx.createAnimation()
        animation.scale(1.2).step({
          duration: halfTime,
          timingFunction: "ease-in"
        })
        animation.scale(1).step({
          duration: halfTime,
          timingFunction: "ease-out"
        })
        that.setData({
          animationData: animation.export()
        })
      }, halfTime * 2.5)
    }
  },
  // 事件处理函数
  onTapNeedAuth: function() {
    var that = this
    wx.openSetting({
      success: (res) => {
        console.log(res)
        if (res.authSetting['scope.userInfo']) {
          that.loadInfo()
        }
      }
    })
  },
  onTapAvalon: function() {
    if (this.data.infoLoaded) {
      wx.navigateTo({
        url: '/pages/avalon/avalon'
      })
    }
  },
  onTapAvalonRules: function() {
    wx.navigateTo({
      url: '/pages/rules/rules?game=avalon'
    })
  },
  onTapFeedback: function () {
    if (this.data.infoLoaded) {
      wx.navigateTo({
        url: '/pages/feedback/feedback'
      })
    }
  },
  onTapLetter: function () {
    if (this.data.infoLoaded) {
      wx.navigateTo({
        url: '/pages/letter/letter'
      })
    }
  },
  onTapVersion: function () {
    wx.navigateTo({
      url: '/pages/version/version'
    })
  },
  onShareAppMessage: function() {
    return {
      title: '桌游游戏助手',
      path: '/pages/index/index'
    }
  },
})
