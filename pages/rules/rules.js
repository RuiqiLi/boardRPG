// pages/rules/rules.js
Page({
  data: {
    canIUseRichText: wx.canIUse('rich-text'),
    nodes: []
  },
  onLoad: function (options) {
    this.game = options.game
    switch (options.game) {
      case 'avalon':
      default:
        this.title = '阿瓦隆'
        this.setAvalonRules()
        break
    }
  },
  onShareAppMessage: function () {
    var title = this.title + '游戏规则'
    var game = this.game
    return {
      title,
      path: '/pages/rules/rules?game=' + game
    }
  },
  onTapExit: function () {
    wx.navigateBack()
  },
  setAvalonRules: function() {
    var nodes =
    `<div class="article">
      <div class="title">阿瓦隆游戏规则</div>
      <div class="content">
        <p class="p">两方对抗性桌游，适合5~10人游戏。故事背景来自“亚瑟王传说”。</p>

        <p class="h1">角色介绍</p>
        <p class="h2">1、好人方人物和能力</p>
        <p class="hline strong">梅林</p>
        <p>可以看见除 莫德雷德 外的所有坏人。</p>
        <p class="hline strong">派西维尔</p>
        <p>可以看见 梅林 和 莫甘娜。</p>
        <p class="hline strong">亚瑟的忠臣</p>
        <p>无特殊能力的好人。</p>
        <p class="h2">2、坏人方人物和能力</p>
        <p class="hline strong">莫德雷德</p>
        <p>梅林看不到他。</p>
        <p class="hline strong">莫甘娜</p>
        <p>假扮梅林，迷惑派西维尔。</p>
        <p class="hline strong">奥伯伦</p>
        <p>看不到其他坏人，其他坏人也看不到他（被孤立）。</p>
        <p class="hline strong">刺客</p>
        <p>如果任务成功3次，挑选一名可能是梅林的玩家刺杀，如选中梅林则坏人胜利。</p>
        <p class="hline strong">莫德雷德的爪牙</p>
        <p>无特殊能力的坏人。</p>

        <p class="h1">人数配置</p>
        <p class="hline">5人局</p>
        <p>梅林 派西维尔 忠臣*1 vs 莫甘娜 刺客</p>
        <p class="hline">6人局</p>
        <p>梅林 派西维尔 忠臣*2 vs 莫甘娜 刺客</p>
        <p class="hline">7人局</p>
        <p>梅林 派西维尔 忠臣*2 vs 莫甘娜 奥伯伦 刺客</p>
        <p class="hline">8人局</p>
        <p>梅林 派西维尔 忠臣*3 vs 莫甘娜 刺客 爪牙</p>
        <p class="hline">9人局</p>
        <p>梅林 派西维尔 忠臣*4 vs 莫德雷德 莫甘娜 刺客</p>
        <p class="hline">10人局</p>
        <p>梅林 派西维尔 忠臣*4 vs 莫德雷德 莫甘娜 奥伯伦 刺客</p>

        <p class="h1">游戏流程</p>
        <p class="p">一局游戏要做5轮任务。游戏开始随机选择一个玩家担任第一轮任务的队长。队长根据5轮任务规定的人数，选择相应数量的玩家“做任务”。</p>
        <p class="h2 strong">任务人数要求</p>
        <table class="table">
          <thead>
            <th class="thead tw7 tleft">轮数</th>
            <th class="thead tw7">1</th>
            <th class="thead tw7">2</th>
            <th class="thead tw7">3</th>
            <th class="thead tw7">4</th>
            <th class="thead tw7">5</th>
          </thead>
          <tbody>
            <tr>
              <td class="tleft">5人局</td>
              <td>2</td>
              <td>3</td>
              <td>2</td>
              <td>3</td>
              <td>3</td>
            </tr>
            <tr>
              <td class="tleft">6人局</td>
              <td>2</td>
              <td>3</td>
              <td>4</td>
              <td>3</td>
              <td>4</td>
            </tr>
            <tr>
              <td class="tleft">7人局</td>
              <td>2</td>
              <td>3</td>
              <td>3</td>
              <td>4*</td>
              <td>4</td>
            </tr>
            <tr>
              <td class="tleft">8人+</td>
              <td>3</td>
              <td>4</td>
              <td>4</td>
              <td>5*</td>
              <td>5</td>
            </tr>
          </tbody>
        </table>
        <p class="p">注：标*号的表示该轮任务为“双败”，即出现两张及以上“任务失败”，任务才判定为失败。
        <p class="p">全体玩家依次就当回合队长选择的玩家进行发言，表态是否赞成本轮做任务的人选。队长可选择第一个发言，或者最后一个发言。发言按顺序仅一轮，禁止插话、对话。</p>
        <p class="p">发言完毕后，所有玩家投票选择<span class="strong">同意</span>或者<span class="strong">反对</span>本次任务的执行，不可弃权。所有玩家同时亮出答案，如同意人数超过玩家总数的一半，则任务可以执行，同意人数等于或小于一半时，任务被延迟1次。</p>
        <p class="p">延迟，即本次选择的玩家不执行任务，由下一位队长重新选择本轮做任务的玩家。每一轮最多只能连续出现4次延迟任务，此后（第5人）队长无论如何选择队员，任务强制执行。</p>
        <p class="p">执行任务时，好人必须出“任务成功”，坏人可以选择出“任务成功”（伪装成好人）或“任务失败”。任务结束后将任务牌洗混一起公布，根据成功和失败的数量判断该轮游戏任务执行结果。一般情况下，出现一张及以上“任务失败”，则该轮任务失败（对于“双败”局，出现两张及以上“任务失败”，则该轮任务失败），反之任务成功。</p>
        <p class="p">游戏按5局3胜制。任务失败3次则坏人胜利。任务成功3次，则再由坏人刺客出场刺杀梅林。刺杀成功则坏人胜利，否则好人胜利。（即：坏人有2个胜利条件）
      </div>
    </div>`
    this.setData({nodes})
  }
})