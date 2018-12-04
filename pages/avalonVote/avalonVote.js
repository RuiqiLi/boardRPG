//avalonVote.js
var app = getApp()
var url = require('../../config/url.js')
Page({
  data: {
    voteStatus: [],
    captainCanVote: false,
    youVote: false,
    allVote: false,
    voteYes: 0,
    voteNo: 0
  },
  // 生命周期函数
  onLoad: function(options) {
    this.roomNo = options.roomNo
    this.playerNo = options.playerNo
    this.playerNum = options.playerNum
    var captainCanVote = (options.captainCanVote == 1 ? true : false)
    this.setData({
      captainCanVote
    })
    this.checkVoteStatus()
    if (!this.checkVoteStatusInterval) {
      var that = this
      this.checkVoteStatusInterval = setInterval(function() {
        that.checkVoteStatus()
      }, 1500)
    }
  },
  onUnload: function() {
    if (this.checkVoteStatusInterval) {
      clearInterval(this.checkVoteStatusInterval)
      this.checkVoteStatusInterval = undefined
    }
  },
  // 自定义函数
  updateVoteStatus: function (voteStatus, captainCanVote) {
    var youVote = false
    var voteYes = 0
    var voteNo = 0
    for (var i = 0; i < voteStatus.length; i++) {
      if (voteStatus[i].playerNo == this.playerNo) {
        youVote = true
      }
      if (voteStatus[i].type == 1) {
        voteYes++
      } else if (voteStatus[i].type == -1) {
        voteNo++
      } else if (voteStatus[i].type == 0) {
        if (captainCanVote) {
          if (voteStatus[i].captainType == 2) {
            voteYes++
          } else if (voteStatus[i].captainType == -2) {
            voteNo++
          }
        }
      }
    }
    var allVote = (voteStatus.length == this.playerNum)
    this.setData({
      voteStatus,
      youVote,
      allVote,
      voteYes,
      voteNo,
      captainCanVote: (captainCanVote == 1 ? true : false)
    })
  },
  checkVoteStatus: function(cb) {
    var that = this
    wx.request({
      url: url.avalonVoteStatusURL,
      data: {
        roomNo: that.roomNo
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
          var captainCanVote = data.captainCanVote
          that.updateVoteStatus(JSON.parse(data.voteStatus), captainCanVote)
        }
        typeof cb == "function" && cb()
      },
      fail: function(res) {
        console.error(res)
        that.setData({
          netError: true,
          errMsg: 'myVoteStatus'
        })
      }
    })
  },
  doVote: function(voteType) {
    var that = this
    wx.request({
      url: url.avalonVoteURL,
      data: {
        roomNo: that.roomNo,
        type: voteType
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
          var captainCanVote = data.statusInfo.captainCanVote
          that.updateVoteStatus(JSON.parse(data.statusInfo.voteStatus), captainCanVote)
          wx.showToast({
            title: (voteType == 0 || voteType == 2 || voteType == -2) ? '投票开始' : '投票成功',
            icon: 'success',
            duration: 1000
          })
        }
      },
      fail: function(res) {
        console.error(res)
        that.setData({
          netError: true,
          errMsg: 'myVote'
        })
      }
    })
  },
  // 事件处理函数
  onPullDownRefresh: function() {
    this.checkVoteStatus(function() {
      wx.stopPullDownRefresh()
    })
  },
  onTapVote: function(e) {
    var that = this
    var voteType = e.target.dataset.type
    var title = (voteType == 0 ? '确认发起投票' : '确认投票')
    var content = (voteType == 0 ? '应该由队长发起投票，旧的投票记录将不会保留' : voteType == 1 ? '投赞成票' : '投反对票')
    var confirmText = (voteType == 0 ? '发起投票' : '确定')
    var confirmColor = '#3CC51F'
    wx.showModal({
      title,
      content,
      confirmText,
      confirmColor,
      success: function(res) {
        if (res.confirm) {
          if (that.data.captainCanVote && voteType == 0) {
            that.doCaptainVote()
          } else {
            that.doVote(voteType)
          }
        }
      }
    })
  },
  onTapReVote: function () {
    var that = this
    var title = '重新发起投票'
    var content = '如果你才是队长，而其他玩家错点了发起投票，你可以重新发起投票'
    var confirmText = '重新发起'
    var confirmColor = '#E64340'
    wx.showModal({
      title,
      content,
      confirmText,
      confirmColor,
      success: function (res) {
        if (res.confirm) {
          if (that.data.captainCanVote) {
            that.doCaptainVote()
          } else {
            that.doVote(0)
          }
        }
      }
    })
  },
  doCaptainVote: function() {
    var that = this
    wx.showActionSheet({
      itemList: [
        '投赞成票',
        '投反对票'
      ],
      success: function (res) {
        if (res.tapIndex == 0) {
          that.doVote(2)
        } else if (res.tapIndex == 1) {
          that.doVote(-2)
        }
      }
    })
  },
  onTapExit: function() {
    wx.navigateBack()
  }
})
