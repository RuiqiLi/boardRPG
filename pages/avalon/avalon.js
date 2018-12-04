//avalon.js
var app = getApp()
var url = require('../../config/url.js')
Page({
  data: {
    netError: false,
    time: 0,
    roomNo: -1,
    hideRole: false,
    players: [],
    playerNumArray: [5, 6, 7, 8, 9, 10],
    roleArray: [
      '梅林、派西维尔、忠臣*1 vs 莫甘娜、刺客',
      '梅林、派西维尔、忠臣*2 vs 莫甘娜、刺客',
      '梅林、派西维尔、忠臣*2 vs 莫甘娜、奥伯伦、刺客',
      '梅林、派西维尔、忠臣*3 vs 莫甘娜、刺客、爪牙',
      '梅林、派西维尔、忠臣*4 vs 莫德雷德、莫甘娜、刺客',
      '梅林、派西维尔、忠臣*4 vs 莫德雷德、莫甘娜、奥伯伦、刺客'
    ],
    roleName: {
      'ml': '梅林',
      'pxwe': '派西维尔',
      'zc': '忠臣',
      'mgn': '莫甘娜',
      'ck': '刺客',
      'abl': '奥伯伦',
      'zy': '爪牙',
      'mdld': '莫德雷德'
    },
    missionRequire: {
      '5': [2, 3, 2, 3, 3],
      '6': [2, 3, 4, 3, 4],
      '7': [2, 3, 3, 4, 4],
      '8': [3, 4, 4, 5, 5],
      '9': [3, 4, 4, 5, 5],
      '10':[3, 4, 4, 5, 5],
    }
  },
  // 生命周期函数
  onLoad: function(options) {
    this.remOptions = options
    this.firstLoad(options)
  },
  onShow: function() {
    if (this.openAgain) {
      this.checkStatus()
    } else {
      this.openAgain = true
    }
    if (app.globalData.realNameChanged) {
      app.globalData.realNameChanged = false
      wx.showToast({
        title: '修改成功',
        icon: 'success',
        duration: 1000
      })
    }
  },
  onHide: function() {
    if (this.heartBeatInterval) {
      clearInterval(this.heartBeatInterval)
      this.heartBeatInterval = undefined
    }
  },
  onUnload: function () {
    if (this.heartBeatInterval) {
      clearInterval(this.heartBeatInterval)
      this.heartBeatInterval = undefined
    }
  },
  // 自定义函数
  heartBeat: function(callback) {
    var roomNo = this.data.roomNo
    if (roomNo == -1) {
      return
    }
    var that = this
    wx.request({
      url: url.avalonheartBeatURL,
      data: {
        roomNo,
        time: that.data.time
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
          console.log('Heart Beat OK')
          if (data.statusInfo) {
            console.log('Heart Beat UPDATE')
            var statusInfo = data.statusInfo
            if (statusInfo.roomNo == -1) {
              that.resetData()
            } else {
              that.updateStatusInfo(statusInfo)
            }
          }
          typeof callback == "function" && callback()
        }
      },
      fail: function(res) {
        console.error(res)
        that.setData({
          netError: true,
          errMsg: 'myHeartBeat'
        })
      }
    })
  },
  firstLoad: function(options, cb) {
    var that = this
    app.getUserInfo(function(userInfo) {
      typeof cb == "function" && cb()
      that.checkStatus(function() {
        if (options.roomNo && options.roomNo != -1) {
          if (that.data.roomNo == -1) {
            that.enterRoom(options.roomNo)
          } else if (that.data.roomNo != options.roomNo) {
            // NOT SURE if needs to be adjusted?
            that.enterRoom(options.roomNo)
          }
        }
      })
    }, function(failType, res) {
      that.setData({
        netError: true,
        errMsg: failType
      })
      typeof cb == "function" && cb()
    })
  },
  enterRoom: function(roomNo) {
    var that = this
    wx.request({
      url: url.avalonEnterRoomURL,
      data: {
        roomNo
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
          that.updateStatusInfo(data.statusInfo)
          wx.showToast({
            title: '进入房间',
            icon: 'success',
            duration: 1000
          })
        } else if (data.errType == 'enterRoomFailed') {
          wx.showToast({
            title: '该房间已满',
            icon: 'loading',
            duration: 1000
          })
        }
      },
      fail: function(res) {
        console.error(res)
        that.setData({
          netError: true,
          errMsg: 'myEnterRoom'
        })
      }
    })
  },
  checkStatus(callback) {
    var that = this
    wx.request({
      url: url.avalonStatusURL,
      header: {
        'content-type': "application/json",
        'sessionid': app.getSessionId()
      },
      success: function(res) {
        console.log(res)
        that.setData({
          netError: false
        })
        var data = res.data
        typeof data == "string" && (data = JSON.parse(data.trim()))
        if (data.ok) {
          var statusInfo = data.statusInfo
          if (statusInfo.roomNo == -1) {
            that.resetData()
          } else {
            that.updateStatusInfo(statusInfo)
          }
        }
        typeof callback == "function" && callback()
      },
      fail: function(res) {
        console.error(res)
        that.setData({
          netError: true,
          errMsg: 'myStatus'
        })
      }
    })
  },
  resetData: function() {
    this.setData({
      time: 0,
      roomNo: -1,
      playerNo: -1,
      userRole: "",
      playerNum: -1,
      captainNo: 0,
      captainName: "",
      delayMax: 4,
      badKnowOthers: true,
      captainCanVote: false,
      turn: 0,
      missionStatus: [],
      voteStatus: [],
      killPlayer: 0,
      killPlayerName: "",
      players:[app.globalData.userInfo],
      mlNo: 0
    })
  },
  updateStatusInfo: function(statusInfo) {
    var captainName = ""
    var killPlayerName = ""
    var mlNo = 0
    var players = statusInfo.players
    for (var i = 0; i < players.length; i++) {
      if (players[i].playerNo == statusInfo.captainNo) {
        captainName = players[i].realName ? players[i].realName : players[i].nickName
      }
      if (players[i].playerNo == statusInfo.killPlayer) {
        killPlayerName = players[i].realName ? players[i].realName : players[i].nickName
      }
      if (players[i].userRole == 'ml') {
        mlNo = players[i].playerNo
      }
    }
    var voteStatus = JSON.parse(statusInfo.voteStatus)
    this.setData({
      time: statusInfo.time,
      roomNo: statusInfo.roomNo,
      playerNo: statusInfo.playerNo,
      userRole: statusInfo.userRole,
      playerNum: statusInfo.playerNum,
      captainNo: statusInfo.captainNo,
      captainName,
      delayMax: statusInfo.delayMax,
      badKnowOthers: statusInfo.badKnowOthers,
      captainCanVote: statusInfo.captainCanVote,
      turn: statusInfo.turn,
      missionStatus: JSON.parse(statusInfo.missionStatus),
      voteStatus,
      killPlayer: statusInfo.killPlayer,
      killPlayerName,
      players,
      mlNo
    })
    if (!this.heartBeatInterval) {
      var that = this
      this.heartBeatInterval = setInterval(function() {
        if (!app.globalData.userInfo) {
          that.firstLoad(that.remOptions)
        } else if (that.data.netError) {
          that.checkStatus()
        } else {
          var turn = that.data.turn
          that.heartBeat(function() {
            if (turn != 1 && that.data.turn == 1) {
              wx.showToast({
                title: '游戏开始',
                icon: 'success',
                duration: 1000
              })
            }
          })
        }
      }, 1500)
    }
    // if (voteStatus.length != 0) {
    //   var notVote = true
    //   for (var i = 0; i < voteStatus.length; i++) {
    //     if (voteStatus[i].playerNo == statusInfo.playerNo) {
    //       notVote = false
    //       break
    //     }
    //   }
    //   if (notVote) {
    //     // TODO
    //     this.enterVotePage(statusInfo.roomNo, statusInfo.playerNo, statusInfo.playerNum)
    //   }
    // }
  },
  enterVotePage: function (roomNo, playerNo, playerNum, captainCanVote) {
    wx.navigateTo({
      url: '/pages/avalonVote/avalonVote?roomNo=' + roomNo + '&playerNo=' + playerNo + '&playerNum=' + playerNum + '&captainCanVote=' + (captainCanVote ? 1 : 0)
    })
  },
  // 事件处理函数
  onPullDownRefresh: function() {
    if (!app.globalData.userInfo) {
      this.firstLoad(this.remOptions, function() {
        wx.stopPullDownRefresh()
      })
    } else if (this.data.netError) {
      this.checkStatus(function() {
        wx.stopPullDownRefresh()
      })
    } else {
      var turn = this.data.turn
      var that = this
      this.checkStatus(function() {
        wx.stopPullDownRefresh()
        if (turn == 0 && that.data.turn == 1) {
          wx.showToast({
            title: '游戏开始',
            icon: 'success',
            duration: 1000
          })
        }
      })
    }
  },
  onShareAppMessage: function() {
    var myName = app.globalData.userInfo.realName ? app.globalData.userInfo.realName : app.globalData.userInfo.nickName
    var roomNo = this.data.roomNo
    return {
      title: myName+'邀请你和ta一起玩阿瓦隆',
      path: '/pages/avalon/avalon?roomNo='+roomNo
    }
  },
  onTapPlayers: function() {
    var hideRole = !this.data.hideRole
    this.setData({
      hideRole
    })
  },
  onChangeNumPicker: function(e) {
    var playerNum = this.data.playerNumArray[e.detail.value]
    var that = this
    wx.showModal({
      title: '创建一个'+playerNum+'人房',
      content: '角色配置为：'+that.data.roleArray[e.detail.value],
      success: function(res) {
        if (res.confirm) {
          wx.request({
            url: url.avalonCreateRoomURL,
            data: {
              playerNum
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
                that.setData({
                  roomNo: data.roomNo,
                  playerNo: 1,
                  playerNum,
                  delayMax: 4,
                  badKnowOthers: true
                })
                wx.showToast({
                  title: '创建房间成功',
                  icon: 'success',
                  duration: 1000
                })
              }
            },
            fail: function(res) {
              console.error(res)
              that.setData({
                netError: true,
                errMsg: 'myCreateRoom'
              })
            }
          })
        }
      }
    })
  },
  onTapRoomBtn: function() {
    var that = this
    wx.showActionSheet({
      itemList:[
        '重新开始',
        '游戏规则',
        '坏人互通身份：'+(that.data.badKnowOthers?'是':'否'),
        '队长参与投票：'+(that.data.captainCanVote?'是':'否'),
        '设置我的游戏名称',
        '解散房间'
      ],
      success: function(res) {
        if (res.tapIndex == 0) {
          wx.showModal({
            title: '重新开始',
            content: '将重新分配玩家身份，开始新的一局游戏',
            confirmText: '重新开始',
            success: function(res) {
              if (res.confirm) {
                wx.request({
                  url: url.avalonResetRoomURL,
                  data: {
                    roomNo: that.data.roomNo,
                    playerNum: that.data.playerNum
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
                      that.updateStatusInfo(data.statusInfo)
                      wx.showToast({
                        title: '重新开始',
                        icon: 'success',
                        duration: 1000
                      })
                    }
                  },
                  fail: function(res) {
                    console.error(res)
                    that.setData({
                      netError: true,
                      errMsg: 'myResetRoom'
                    })
                  }
                })
              }
            }
          })
        } else if (res.tapIndex == 1) {
          wx.navigateTo({
            url: '/pages/rules/rules?game=avalon'
          })
        } else if (res.tapIndex == 2) {
          var badKnowOthers = that.data.badKnowOthers
          wx.showModal({
            title: '坏人互通身份',
            content: '默认情况下，坏人知道其他坏人的身份角色。如果关闭，那么坏人就只知道同伙是谁，而不知道他们具体是哪个角色了。可以关闭以增加坏人的游戏难度。当前设置为：'+(badKnowOthers?'坏人互相知道身份':'坏人互相不知道身份'),
            confirmText: badKnowOthers?'关闭':'打开',
            confirmColor: '#576B95',
            success: function(res) {
              if (res.confirm) {
                wx.request({
                  url: url.avalonChangeBadKnowOthersURL,
                  data: {
                    roomNo: that.data.roomNo,
                    badKnowOthers: badKnowOthers?0:1
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
                      that.setData({
                        badKnowOthers: !badKnowOthers
                      })
                      wx.showToast({
                        title: '修改成功',
                        icon: 'success',
                        duration: 1000
                      })
                    }
                  },
                  fail: function(res) {
                    console.error(res)
                    that.setData({
                      netError: true,
                      errMsg: 'myChangeBadKnowOthers'
                    })
                  }
                })
              }
            }
          })
        } else if (res.tapIndex == 3) {
          var captainCanVote = that.data.captainCanVote
          wx.showModal({
            title: '队长参与投票',
            content: '可以根据需要修改本设置。当前设置为：' + (captainCanVote ? '队长参与投票' : '队长不参与投票'),
            confirmText: '修改',
            confirmColor: '#576B95',
            success: function (res) {
              if (res.confirm) {
                wx.request({
                  url: url.avalonChangeCaptainCanVoteURL,
                  data: {
                    roomNo: that.data.roomNo,
                    captainCanVote: captainCanVote ? 0 : 1
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
                      that.setData({
                        captainCanVote: !captainCanVote
                      })
                      wx.showToast({
                        title: '修改成功',
                        icon: 'success',
                        duration: 1000
                      })
                    }
                  },
                  fail: function (res) {
                    console.error(res)
                    that.setData({
                      netError: true,
                      errMsg: 'myChangeCaptainCanVote'
                    })
                  }
                })
              }
            }
          })
        } else if (res.tapIndex == 4) {
          var realName = app.globalData.userInfo.realName
          wx.navigateTo({
            url: '/pages/settings/settings?realName='+realName
          })
        } else if (res.tapIndex == 5) {
          wx.showModal({
            title: '解散房间',
            content: '所有成员都将退出房间，解散后你可以重新创建房间，邀请好友加入',
            confirmText: '解散房间',
            confirmColor: '#E64340',
            success: function(res) {
              if (res.confirm) {
                wx.request({
                  url: url.avalonDismissRoomURL,
                  data: {
                    roomNo: that.data.roomNo
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
                      that.resetData()
                      wx.showToast({
                        title: '房间已解散',
                        icon: 'success',
                        duration: 1000
                      })
                    }
                  },
                  fail: function(res) {
                    console.error(res)
                    that.setData({
                      netError: true,
                      errMsg: 'myDismissRoom'
                    })
                  }
                })
              }
            }
          })
        }
      }
    })
  },
  onTapStart: function() {
    var that = this
    wx.request({
      url: url.avalonGameStartURL,
      data: {
        roomNo: that.data.roomNo
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
          that.updateStatusInfo(data.statusInfo)
          wx.showToast({
            title: '游戏开始',
            icon: 'success',
            duration: 1000
          })
        }
      },
      fail: function(res) {
        console.error(res)
        that.setData({
          netError: true,
          errMsg: 'myGameStart'
        })
      }
    })
  },
  onTapDoMission: function() {
    var that = this
    wx.showActionSheet({
      itemList: ['投成功票', '投失败票'],
      success: function(res) {
        if (res.tapIndex == 0) {
          that.doMission(1)
        } else if (res.tapIndex == 1) {
          that.doMission(0)
        }
      }
    })
  },
  doMission: function(voteType) {
    var that = this
    var userRole = that.data.userRole
    wx.showModal({
      title: voteType==1?'投成功票':'投失败票',
      content: '好人只能投成功票，坏人可以投成功票或失败票。你选择的是：'+(voteType==1?'投成功票':'投失败票'),
      confirmText: voteType==1?'投成功票':'投失败票',
      confirmColor: voteType==1?'#3CC51F':'#E64340',
      success: function(res) {
        if (res.confirm) {
          if (voteType == 0 && (userRole == 'ml' || userRole == 'pxwe' || userRole == 'zc')) {
            wx.showToast({
              title: '你是个好人',
              icon: 'loading',
              duration: 1000
            })
          } else {
            wx.request({
              url: url.avalonDoMissionURL,
              data: {
                roomNo: that.data.roomNo,
                turn: that.data.turn,
                voteType
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
                  that.updateStatusInfo(data.statusInfo)
                  wx.showToast({
                    title: '投票成功',
                    icon: 'success',
                    duration: 1000
                  })
                } else if (data.statusInfo) {
                  that.updateStatusInfo(data.statusInfo)
                  if (data.why == 'wrongTurn') {
                    wx.showToast({
                      title: '咦？',
                      icon: 'loading',
                      duration: 1000
                    })
                  } else if (data.why == 'goodGuy') {
                    wx.showToast({
                      title: '你是个好人',
                      icon: 'loading',
                      duration: 1000
                    })
                  } else if (data.why == 'repeat') {
                    wx.showToast({
                      title: '投过票了',
                      icon: 'loading',
                      duration: 1000
                    })
                  }
                }
              },
              fail: function(res) {
                console.error(res)
                that.setData({
                  netError: true,
                  errMsg: 'myDoMission'
                })
              }
            })
          }
        }
      }
    })
  },
  onTapVotePage: function() {
    var roomNo = this.data.roomNo
    var playerNo = this.data.playerNo
    var playerNum = this.data.playerNum
    var captainCanVote = this.data.captainCanVote
    this.enterVotePage(roomNo, playerNo, playerNum, captainCanVote)
  },
  onTapKill: function() {
    var that = this
    var killList = [], itemList = []
    for (var i = 0, players = this.data.players; i < players.length; i++) {
      if (players[i].userRole == 'zc' || players[i].userRole == 'pxwe' || players[i].userRole == 'ml') {
        killList.push(players[i].playerNo)
        itemList.push(players[i].realName?players[i].realName:players[i].nickName)
      }
    }
    wx.showActionSheet({
      itemList,
      success: function(res) {
        if (res.tapIndex >= 0 && res.tapIndex < killList.length) {
          var killPlayer = killList[res.tapIndex]
          wx.showModal({
            title: '刺杀梅林',
            content: '你当前指认 '+itemList[res.tapIndex]+' 是梅林',
            success: function(res) {
              if (res.confirm) {
                wx.request({
                  url: url.avalonkillPlayerURL,
                  data: {
                    roomNo: that.data.roomNo,
                    killPlayer
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
                      that.updateStatusInfo(data.statusInfo)
                    }
                  },
                  fail: function(res) {
                    console.error(res)
                    that.setData({
                      netError: true,
                      errMsg: 'myKillPlayer'
                    })
                  }
                })
              }
            }
          })
        }
      }
    })
  },
  onTapLetter: function () {
    wx.navigateTo({
      url: '/pages/letter/letter'
    })
  }
})