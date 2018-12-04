// pages/letter/letter.js
var app = getApp()
var url = require('../../config/url.js')
Page({
  onLoad: function (options) {
    if (options.title) {
      this.setData({
        title: options.title,
        time: options.time
      })
      this.getLetterContent(options.letterID)
    } else {
      this.getLetterList()
    }
  },
  getLetterContent: function (letterID) {
    var that = this
    wx.request({
      url: url.messageGetLetterContentURL,
      data: {
        letterID
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
          var jsonData = JSON.parse(data.content.trim())
          setTimeout(function () {
            that.setData({
              content: jsonData.content
            })
          }, 1000)
        }
      }
    })
  },
  onTapImage: function() {
    wx.previewImage({
      urls: ["https://www.youkepupu.com/boardrpg/imgs/qrcode.jpg"]
    })
  },
  getLetterList: function () {
    var that = this
    wx.request({
      url: url.messageGetLetterListURL,
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
            letterList: data.letterList
          })
        }
      }
    })
  },
  onTapItem: function (e) {
    var letterID = e.currentTarget.dataset.letterId
    var title = e.currentTarget.dataset.title
    var time = e.currentTarget.dataset.time.split(' ')[0]
    wx.navigateTo({
      url: '/pages/letter/letter?letterID=' + letterID + '&time=' + time + '&title=' + title
    })
  }
})