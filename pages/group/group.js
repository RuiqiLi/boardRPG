//group.js
var app = getApp()
Page({
  data: {
    infoLoaded: false,
    authFailed: false,
    netError: false,
    userInfo: {}
  },
  // 生命周期函数
  // onLoad: function() {
  //   this.loadInfo()
  // },
  onShow: function () {
    this.loadInfo()
    if (app.globalData.realNameChanged) {
      app.globalData.realNameChanged = false
      wx.showToast({
        title: '修改成功',
        icon: 'success',
        duration: 1000
      })
    }
  },
  loadInfo: function() {
    var that = this
    app.getUserInfo(function(userInfo) {
      that.setData({
        infoLoaded: true,
        authFailed: false,
        netError: false,
        userInfo
      })
    }, function(failType, res) {
      switch(failType) {
        case 'wx.getUserInfo':
          that.setData({
            infoLoaded: false,
            authFailed: true,
            netError: false
          })
          break

        case 'myLogin':
          that.setData({
            infoLoaded: false,
            authFailed: false,
            netError: true
          })
          setTimeout(function() {
            that.loadInfo()
          }, 1000)
          break
      }
    })
  },
  // 事件处理函数
  onTapUserInfo: function () {
    if (this.data.infoLoaded) {
      var realName = this.data.userInfo.realName
      wx.navigateTo({
        url: '/pages/settings/settings?realName=' + realName
      })
    }
  },
})
