var testURL = 'http://localhost'
var prodURL = 'https://localhost'
var baseURL = testURL

var loginURL = baseURL + '/login.php'

var avalonURL = baseURL + '/avalon.php'
var avalonStatusURL = avalonURL + '?op=status'
var avalonCreateRoomURL = avalonURL + '?op=createRoom'
var avalonDismissRoomURL = avalonURL + '?op=dismissRoom'
var avalonResetRoomURL = avalonURL + '?op=resetRoom'
var avalonChangeDelayURL = avalonURL + '?op=changeDelay'
var avalonChangeBadKnowOthersURL = avalonURL + '?op=changeBadKnowOthers'
var avalonChangeCaptainCanVoteURL = avalonURL + '?op=changeCaptainCanVote'
var avalonEnterRoomURL = avalonURL + '?op=enterRoom'
var avalonGameStartURL = avalonURL + '?op=gameStart'
var avalonDoMissionURL = avalonURL + '?op=doMission'
var avalonkillPlayerURL = avalonURL + '?op=killPlayer'
var avalonSetRealNameURL = avalonURL + '?op=setRealName'
var avalonVoteURL = avalonURL + '?op=vote'
var avalonExitVoteURL = avalonURL + '?op=exitVote'
var avalonVoteStatusURL = avalonURL + '?op=voteStatus'
var avalonheartBeatURL = avalonURL + '?op=heartBeat'

var messageURL = baseURL + '/message.php'
var messageAllAdminURL = messageURL + '?op=adminAll'
var messageNewURL = messageURL + '?op=new'
var messageGetLetterListURL = messageURL + '?op=getLetterList'
var messageGetLetterContentURL = messageURL + '?op=getLetterContent'

var game2048URL = baseURL + '/game2048.php'
var game2048RecordScoreURL = game2048URL + '?op=recordScore'
var game2048GetRankURL = game2048URL + '?op=getRank'
var game2048GetBestScoreURL = game2048URL + '?op=getBestScore'

module.exports = {
  loginURL,
  avalonStatusURL,
  avalonCreateRoomURL,
  avalonDismissRoomURL,
  avalonResetRoomURL,
  // avalonChangeDelayURL,
  avalonChangeBadKnowOthersURL,
  avalonChangeCaptainCanVoteURL,
  avalonEnterRoomURL,
  avalonGameStartURL,
  avalonDoMissionURL,
  avalonkillPlayerURL,
  avalonSetRealNameURL,
  avalonVoteURL,
  // avalonExitVoteURL,
  avalonVoteStatusURL,
  avalonheartBeatURL,
  messageAllAdminURL,
  messageNewURL,
  messageGetLetterListURL,
  messageGetLetterContentURL,
  game2048RecordScoreURL,
  game2048GetRankURL,
  game2048GetBestScoreURL
}