var SCALING_TIME = 3000
var CANVAS_WIDTH = 960
var CANVAS_HEIGHT = 720
var BALL_RADIUS = 50
var FPS = 60
var INTERVAL_SEC = 0.4
var INTERVAL_COUNT = FPS * INTERVAL_SEC
// ドレミファソラシド
var SYLLABLES = [
  {
    id: 0,
    color: 'white'
  },
  {
    id: 1,
    color: 'red',
    soundId: 'pianoC' // ド
  },
  {
    id: 2,
    color: 'yellow',
    soundId: 'pianoD' // レ
  },
  {
    id: 3,
    color: 'green',
    soundId: 'pianoE' // ミ
  },
  {
    id: 4,
    color: 'brown',
    soundId: 'pianoF' // ファ
  },
  {
    id: 5,
    color: 'cyan',
    soundId: 'pianoG' // ソ
  },
  {
    id: 6,
    color: 'purple',
    soundId: 'pianoA' // ラ
  },
  {
    id: 7,
    color: 'gray',
    soundId: 'pianoB' // シ
  },
  {
    id: 8,
    color: 'DarkRed',
    soundId: 'pianoC2' // ド
  }
]

var SONG = [
  0, 0, 0, 0,
  1, 0, 0, 2, 3, 0, 0, 1, 3, 0, 1, 0, 3, 0, 0, 0,
  2, 0, 0, 3, 4, 4, 3, 2, 4, 0, 0, 0, 0, 0, 0, 0,
  3, 0, 0, 4, 5, 0, 0, 3, 5, 0, 3, 0, 5, 0, 0, 0,
  4, 0, 0, 5, 6, 6, 5, 4, 6, 0, 0, 0, 0, 0, 0, 0,
  5, 0, 0, 1, 2, 3, 4, 5, 6, 0, 0, 0, 0, 0, 0, 0,
  6, 0, 0, 2, 3, 4, 5, 6, 7, 0, 0, 0, 0, 0, 0, 0,
  7, 0, 0, 3, 4, 5, 6, 7, 8, 0, 0, 0, 0, 0, 8, 7,
  6, 0, 4, 0, 7, 0, 5, 0, 8, 0, 0, 0
]

var CLICKABLE_SONG_LENGTH = SONG.filter(e => !!e).length

var BASE_POINT = 100

var count = 0
var songCount = 0
var score = 0
var scoreText = null
var stage = null
var balls = []

function TouchBall (syllable) {
  var APPEAR_SEC = INTERVAL_SEC * 6
  var APPEAR_COUNT = FPS * APPEAR_SEC
  var MAX_DISSAPEAR_SCALE = 1.5

  // カウントの初期化
  this.count = APPEAR_COUNT
  this.dissapearCount = APPEAR_COUNT

  // Shapeの設定
  // 円を作成
  this.ball = new createjs.Shape()

  // 色を指定
  this.ball.graphics.beginFill(syllable.color)

  // 円の描画
  this.ball.graphics.drawCircle(0, 0, BALL_RADIUS)

  // パラメータの初期化
  this.ball.x = getRandomX()
  this.ball.y = getRandomY()
  this.ball.alpha = 0

  // クリックしたかどうか
  this.isClicked = false

  this.start = function () {
    // ランダムに位置を変える
    this.ball.x = getRandomX()
    this.ball.y = getRandomY()
    this.ball.alpha = 1
    this.ball.scaleX = 0
    this.ball.scaleY = 0
    this.count = 0
    this.isClicked = false
    this.dissapearCount = 0
    // playSound(syllable.soundId)
  }

  this.update = function () {
    // アニメーション（この間だけでアニメーションする）
    if (this.isValid()) {
      var animationCount = this.count * 2
      var alpha = animationCount / APPEAR_COUNT
      var dissapearScale = 1
      if (this.isClicked) {
        var a = (MAX_DISSAPEAR_SCALE - 1) / (APPEAR_COUNT / 2)
        var b = 1 - a
        dissapearScale = a * this.dissapearCount + b
        this.dissapearCount = this.dissapearCount + 1
      }
      var scale = Math.min(animationCount / APPEAR_COUNT, 1.0) * dissapearScale

      // スケールの設定
      this.ball.scaleX = scale
      this.ball.scaleY = scale
      // アルファ値の設定
      this.ball.alpha = alpha > 1 ? 2 - alpha : alpha
      // カウントの更新
      this.count = this.count + 1
    }
  }

  this.handleBallClick = function (event) {
    if (this.isValid() && !this.isClicked) {
      playSound(syllable.soundId)
      score += Math.round(this.ball.alpha * BASE_POINT)
      this.isClicked = true
    }
  }

  this.handleBallClick = this.handleBallClick.bind(this)

  this.isValid = function () {
    return this.count <= APPEAR_COUNT && syllable.id !== 0
  }

  // クリックイベントを登録
  this.ball.addEventListener('click', this.handleBallClick)
}

function init () {
  setUpStage()
  setUpSounds()
  for (var i = 0; i < SONG.length; ++i) {
    var syllable = SYLLABLES[SONG[i]]
    balls[i] = new TouchBall(syllable)
    stage.addChild(balls[i].ball)
  }
  scoreText = new createjs.Text('', '24px sans-serif', 'DarkRed')
  stage.addChild(scoreText)
  setUpTicker()
}

function setUpTicker () {
  createjs.Ticker.timingMode = createjs.Ticker.RAF
  createjs.Ticker.addEventListener('tick', handleTick)
  function handleTick () {
    update()
    stage.update()
  }
}

function setUpStage () {
  stage = new createjs.Stage('demoCanvas')
  // タッチ操作をサポートしているブラウザーならば
  if (createjs.Touch.isSupported() == true) {
    // タッチ操作を有効にします。
    createjs.Touch.enable(stage)
  }
}

function setUpSounds () {
  // 使用するサウンドは事前に登録します。
  // 音声ファイルのパス、任意のIDを指定します。

  // ド
  createjs.Sound.registerSound('sounds/pianoC.mp3', 'pianoC')
  // レ
  createjs.Sound.registerSound('sounds/pianoD.mp3', 'pianoD')
  // ミ
  createjs.Sound.registerSound('sounds/pianoE.mp3', 'pianoE')
  // ファ
  createjs.Sound.registerSound('sounds/pianoF.mp3', 'pianoF')
  // ソ
  createjs.Sound.registerSound('sounds/pianoG.mp3', 'pianoG')
  // ラ
  createjs.Sound.registerSound('sounds/pianoA.mp3', 'pianoA')
  // シ
  createjs.Sound.registerSound('sounds/pianoB.mp3', 'pianoB')
  // ド
  createjs.Sound.registerSound('sounds/pianoC2.mp3', 'pianoC2')
}

function update () {
  if (songCount === 0) {
    score = 0
  }
  if (count === 0) {
    balls[songCount].start()
    songCount = (songCount + 1) % SONG.length
  }
  for (var i = 0; i < balls.length; ++i) {
    balls[i].update()
  }
  scoreText.text = 'score: ' + score + ' pt / ' + (CLICKABLE_SONG_LENGTH * BASE_POINT) + ' pt'
  count = (count + 1) % INTERVAL_COUNT
}

function createRandFloat (arg) {
  const from = arg.from
  const to = arg.to

  if (typeof from === 'undefined') {
    // create random real number from 0 to 'to'
    return Math.random() * to
  } else {
    // create random real number from 'from' to 'to'
    return Math.random() * (to - from) + from
  }
}

function createRandInt (arg) {
  if (typeof arg.from === 'undefined') {
    arg.from = 0
  }
  arg.from = parseInt(arg.from, 10)
  arg.to = parseInt(arg.to, 10)

  return Math.round(createRandFloat(arg))
}

function getRandomX () {
  // 初期位置をランダムに生成
  return createRandInt({
    to: CANVAS_WIDTH - BALL_RADIUS,
    from: BALL_RADIUS
  })
}

function getRandomY () {
  return createRandInt({
    to: CANVAS_HEIGHT - BALL_RADIUS,
    from: BALL_RADIUS
  })
}

function playSound (soundId) {
  if (soundId) {
    createjs.Sound.play(soundId)
  }
}
