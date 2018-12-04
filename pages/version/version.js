// pages/version/version.js
var updateHistory = require('../../config/version.js').updateHistory
Page({
  data: {
    verNo: "",
    updateHistory: [],
    changes: []
  },
  onLoad: function (options) {
    if (options.verNo) {
      wx.setNavigationBarTitle({
        title: 'v' + options.verNo + '主要更新'
      })
      var changes
      for (var i in updateHistory) {
        if (updateHistory[i].ver == options.verNo) {
          changes = updateHistory[i].changes
          break
        }
      }
      this.setData({
        verNo: options.verNo,
        changes
      })
    } else {
      this.setData({
        updateHistory
      })
    }
  },
  onTapItem: function (e) {
    var verNo = e.currentTarget.dataset.verNo
    wx.navigateTo({
      url: '/pages/version/version?verNo=' + verNo
    })
  }
})