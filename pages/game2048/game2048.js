// pages/game2048/game2048.js
var app = getApp()
var url = require('../../config/url.js')
Page({
  slideTime: 20,
  direction: '',
  moveDist: 0,
  duration: 100,
  startTouch: {},
  data: {
    score: 0,
    bestScore: 0,
    table: [
      2, 4, 8, 0,
      0, 0, 0, 16,
      1024, 0, 0, 32,
      512, 256, 128, 64
    ],
    animations: [
      {}, {}, {}, {},
      {}, {}, {}, {},
      {}, {}, {}, {},
      {}, {}, {}, {}
    ],
    authFailed: false,
    gameover: false,
    keepGoing: false,
    userInfo: {}
  },
  // 生命周期函数
  onLoad: function() {
    var that = this
    app.calPxByRpx(146, function(px) {
      that.moveDist = px
    })
    app.getUserInfo(function(userInfo) {
      that.setData({
        userInfo
      })
      wx.request({
        url: url.game2048GetBestScoreURL,
        header: {
          'content-type': "application/json",
          'sessionid': app.getSessionId()
        },
        success: function (res) {
          console.log(res)
          var data = res.data
          typeof data == "string" && (data = JSON.parse(data.trim()))
          if (data.ok) {
            if (data.bestScore > that.data.bestScore)
            that.setData({
              bestScore: data.bestScore
            })
          }
        },
        fail: function (res) {
          console.error(res)
        }
      })
    }, function(failType, res) {
      switch (failType) {
        case 'wx.getUserInfo':
          that.setData({
            authFailed: true
          })
          break
      }
    })
    try {
      var data = this.get2048Data()
      console.log(data)
      if (data == '') {
        this.restart()
        this.save2048Data()
        // this.reset2048Time()
      } else {
        this.setData(JSON.parse(data))
      }
    } catch(e) {
      console.error(e)
    }
  },
  // 事件处理函数
  onTouchStart: function(e) {
    if (this.data.gameover) {
      return
    }
    this.direction = ''
    // 只取第一个touch
    var touch = e.touches[0]
    this.startTouch = {
      x: touch.pageX,
      y: touch.pageY,
      time: new Date()
    }
  },
  onTouchMove: function(e) {
    if (this.data.gameover || e.touches.length > 1 || e.scale && e.scale !== 1) {
      return
    }
    var diffTime = new Date() - this.startTouch.time
    if (diffTime >= this.slideTime) {
      var touch = e.touches[0]
      var diffX = touch.pageX - this.startTouch.x
      var diffY = touch.pageY - this.startTouch.y
      if (Math.abs(diffX) > Math.abs(diffY)) {
        this.direction = (diffX > 0 ? 'right' : 'left')
      } else {
        this.direction = (diffY > 0 ? 'down' : 'up')
      }
    }
  },
  onTouchEnd: function() {
    if (this.data.gameover || this.direction == '') {
      return
    }
    var pos1, pos2, pos3, pos4
    if (this.direction == "left") {
      pos1 = [3, 2, 1, 0]
      pos2 = [7, 6, 5, 4]
      pos3 = [11, 10, 9, 8]
      pos4 = [15, 14, 13, 12]
    } else if (this.direction == "right") {
      pos1 = [0, 1, 2, 3]
      pos2 = [4, 5, 6, 7]
      pos3 = [8, 9, 10, 11]
      pos4 = [12, 13, 14, 15]
    } else if (this.direction == "down") {
      pos1 = [0, 4, 8, 12]
      pos2 = [1, 5, 9, 13]
      pos3 = [2, 6, 10, 14]
      pos4 = [3, 7, 11, 15]
    } else if (this.direction == "up") {
      pos1 = [12, 8, 4, 0]
      pos2 = [13, 9, 5, 1]
      pos3 = [14, 10, 6, 2]
      pos4 = [15, 11, 7, 3]
    }
    this.mergeMove(pos1, pos2, pos3, pos4, function(moved, addScore) {
      if (moved) {
        var score = this.data.score + addScore
        var bestScore = (score > this.data.bestScore ? score : this.data.bestScore)
        if (addScore > 0) {
          this.setData({
            score,
            bestScore
          })
        }
        this.randNum()
        this.judge()
        this.save2048Data()
      }
    }.bind(this))
  },
  onTapRestart: function() {
    if (this.data.gameover) {
      this.restart()
    } else {
      var that = this
      wx.showModal({
        title: '重新开始',
        content: '开始新的一局游戏',
        success: function(res) {
          if (res.confirm) {
            that.restart()
          }
        }
      })
    }
  },
  onTapRank: function() {
    wx.showToast({
      title: '正在开发',
      icon: 'loading'
    })
    // TODO new page
    var that = this
    wx.request({
      url: url.game2048GetRankURL,
      header: {
        'content-type': "application/json",
        'sessionid': app.getSessionId()
      },
      success: function (res) {
        console.log(res)
        var data = res.data
        typeof data == "string" && (data = JSON.parse(data.trim()))
        if (data.ok) {
          // TODO
        }
      },
      fail: function (res) {
        console.error(res)
      }
    })
  },
  // 自定义函数
  save2048Data: function() {
    var score = this.data.score
    var bestScore = this.data.bestScore
    var gameover = this.data.gameover
    var keepGoing = this.data.keepGoing
    var table = this.data.table
    wx.setStorage({
      key: '2048',
      data: JSON.stringify({
        score,
        bestScore,
        gameover,
        keepGoing,
        table
      })
    })
  },
  get2048Data: function() {
    return wx.getStorageSync('2048')
  },
  reset2048Time: function() {
    wx.setStorage({
      key: '2048Time',
      data: new Date()
    })
  },
  get2048Time: function () {
    return wx.getStorageSync('2048Time')
  },
  restart: function () {
    var table = new Array(16)
    table.fill(0)
    this.setData({
      score: 0,
      gameover: false,
      keepGoing: false,
      table
    })
    this.randNum()
    this.randNum()
    this.save2048Data()
    this.reset2048Time()
  },
  randNum: function() {
    var emptyPos = []
    this.data.table.map(function(item, i) {
      if (item == 0) {
        emptyPos.push(i)
      }
    })
    var randNum = Math.random() > 0.9 ? 4 : 2
    var randIndex = Math.floor(Math.random() * emptyPos.length)
    var randPos = emptyPos[randIndex]
    this.setTableData(randPos, randNum)
  },
  setTableData: function(index, num) {
    this.setData({
      ['table[' + index + ']']: num
    })
  },
  mergeMove: function(pos1, pos2, pos3, pos4, cb) {
    var allPos = [pos1, pos2, pos3, pos4]
    var duration = this.duration
    var moveDist = this.moveDist
    var moved = false
    var addScore = 0
    var animations = [
      {}, {}, {}, {},
      {}, {}, {}, {},
      {}, {}, {}, {},
      {}, {}, {}, {}
    ]
    var table = this.data.table
    var animationRem = []
    allPos.map(function(pos, i) {
      for (var i = pos.length - 1, emptyPos = 0, lastNum = 0; i >= 0; i--) {
        var num = table[pos[i]]
        if (num == 0) {
          emptyPos++
        } else {
          if (num == lastNum) {
            emptyPos++
          }
          if (emptyPos > 0) {
            moved = true
            var animation = wx.createAnimation({
              duration,
              timingFunction: "ease-in"
            })
            switch (this.direction) {
              case 'left':
                animation.translateX(-moveDist * emptyPos).step()
                break
              case 'right':
                animation.translateX(moveDist * emptyPos).step()
                break
              case 'down':
                animation.translateY(moveDist * emptyPos).step()
                break
              case 'up':
                animation.translateY(-moveDist * emptyPos).step()
                break
            }
            animations[pos[i]] = animation.export()
            if (num == lastNum) {
              table[pos[i + emptyPos]] = num * 2
              addScore += num * 2
            } else {
              table[pos[i + emptyPos]] = num
            }
            table[pos[i]] = 0
            animationRem.push(pos[i])
          }
          if (num == lastNum) {
            lastNum = 0
          } else {
            lastNum = num
          }
        }
      }
    }.bind(this))
    this.setData({
      animations
    })
    animationRem.map(function(pos, i) {
      var animation = wx.createAnimation({
        duration: 0,
        timingFunction: "step-start"
      })
      switch (this.direction) {
        case 'left':
        case 'right':
          animation.translateX(0).step()
          break
        case 'down':
        case 'up':
          animation.translateY(0).step()
          break
      }
      animations[pos] = animation.export()
    }.bind(this))
    setTimeout(function() {
      this.setData({
        table,
        animations
      })
    }.bind(this), duration)
    typeof cb == "function" && cb(moved, addScore)
  },
  judge: function() {
    var full = true
    var max = 0
    this.data.table.map(function(item, i) {
      if (item == 0) {
        full = false
      }
      if (item > max) {
        max = item
      }
    })
    if (full) {
      var gameover = true
      for (var i = 0; i < this.data.table.length; i++) {
        var up = i - 4
        var down = i + 4
        var left = i - 1
        var right = i + 1
        if (up >= 0 && up < this.data.table.length && this.data.table[up] == this.data.table[i]) {
          gameover = false
          break
        }
        if (down >= 0 && down < this.data.table.length && this.data.table[down] == this.data.table[i]) {
          gameover = false
          break
        }
        if (i % 4 != 0 && left >= 0 && left < this.data.table.length && this.data.table[left] == this.data.table[i]) {
          gameover = false
          break
        }
        if (i % 4 != 3 && right >= 0 && right < this.data.table.length && this.data.table[right] == this.data.table[i]) {
          gameover = false
          break
        }
      }
      if (gameover) {
        this.setData({
          gameover
        })
        if (max >= 2048) {
          var score = this.data.score
          wx.request({
            url: url.game2048RecordScoreURL,
            data: {
              score,
              max
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
                console.log('Record Score OK')
              }
            },
            fail: function (res) {
              console.error(res)
            }
          })
        }
        return
      }
    }
    if (max == 2048 && !this.data.keepGoing) {
      var startTime = this.get2048Time()
      var useTime = new Date() - startTime
      var seconds = Math.floor(useTime / 1000)
      var minutes = Math.floor(seconds / 60)
      seconds -= minutes * 60
      wx.showModal({
        title: '成功合成2048',
        content: '恭喜你成功合成2048，总耗时：' + minutes + ' 分 ' + seconds + ' 秒。你可以继续挑战，突破极限。'
      })
      this.setData({
        keepGoing: true
      })
    }
  },
  onShareAppMessage: function () {
    var myName = app.globalData.userInfo.realName ? app.globalData.userInfo.realName : app.globalData.userInfo.nickName
    return {
      title: myName + '邀请你一起挑战2048',
      path: '/pages/game2048/game2048'
    }
  },
})