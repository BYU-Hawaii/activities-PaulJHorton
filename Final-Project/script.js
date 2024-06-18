document.addEventListener('DOMContentLoaded', function () {
  const canvas = document.getElementById('gameCanvas')
  const ctx = canvas.getContext('2d')

  const CANVAS_WIDTH = (canvas.width = canvas.clientWidth)
  const CANVAS_HEIGHT = (canvas.height = canvas.clientHeight)

  const PLAYER_WIDTH = 50
  const PLAYER_HEIGHT = 50
  const PLAYER_COLOR = '#FF5733'
  const PLAYER_JUMP_FORCE = 15
  const GRAVITY = 0.7

  const PLATFORM_WIDTH = 80
  const PLATFORM_HEIGHT = 10
  const PLATFORM_GAP = 150
  const PLATFORM_COUNT = 5
  const PLATFORM_SPEED = 2

  let player = {
    x: CANVAS_WIDTH / 2 - PLAYER_WIDTH / 2,
    y: CANVAS_HEIGHT - PLAYER_HEIGHT * 2,
    dy: 0, // Vertical velocity
  }

  let platforms = []

  function drawPlayer() {
    ctx.fillStyle = PLAYER_COLOR
    ctx.fillRect(player.x, player.y, PLAYER_WIDTH, PLAYER_HEIGHT)
  }

  function drawPlatforms() {
    ctx.fillStyle = '#0095DD'
    platforms.forEach((platform) => {
      ctx.fillRect(platform.x, platform.y, PLATFORM_WIDTH, PLATFORM_HEIGHT)
    })
  }

  function movePlatforms() {
    platforms.forEach((platform) => {
      platform.y += PLATFORM_SPEED

      // Recycle platforms when they move off screen
      if (platform.y > CANVAS_HEIGHT) {
        platform.y = -PLATFORM_HEIGHT
        platform.x = Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH)
      }
    })
  }

  function movePlayer() {
    // Apply gravity
    player.dy += GRAVITY
    player.y += player.dy

    // Prevent player from falling through the floor
    if (player.y + PLAYER_HEIGHT > CANVAS_HEIGHT) {
      player.y = CANVAS_HEIGHT - PLAYER_HEIGHT
      player.dy = 0
    }
  }

  function jump() {
    // Only jump if the player is on a platform
    if (player.dy === 0) {
      player.dy = -PLAYER_JUMP_FORCE
    }
  }

  function checkCollisions() {
    platforms.forEach((platform) => {
      if (
        player.dy > 0 &&
        player.y + PLAYER_HEIGHT >= platform.y &&
        player.y + PLAYER_HEIGHT <= platform.y + PLATFORM_HEIGHT &&
        player.x >= platform.x - PLAYER_WIDTH &&
        player.x <= platform.x + PLATFORM_WIDTH
      ) {
        player.dy = -PLAYER_JUMP_FORCE
      }
    })
  }

  function animate() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

    movePlatforms()
    drawPlatforms()
    drawPlayer()
    movePlayer()
    checkCollisions()

    requestAnimationFrame(animate)
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'ArrowUp' || e.key === ' ') {
      jump()
    }
  })

  // Generate initial platforms
  for (let i = 0; i < PLATFORM_COUNT; i++) {
    platforms.push({
      x: Math.random() * (CANVAS_WIDTH - PLATFORM_WIDTH),
      y: i * PLATFORM_GAP,
    })
  }

  animate()
})
