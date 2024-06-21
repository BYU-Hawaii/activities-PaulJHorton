const canvas = document.getElementById('gameCanvas')
const ctx = canvas.getContext('2d')
canvas.width = 400
canvas.height = 600

let gameInterval
let platforms = []
let player
let gameOverScreen = document.getElementById('gameOver')
let restartButton = document.getElementById('restartButton')
let gameStarted = false // Track if the game has started
let keys = {
  left: false,
  right: false,
}

let score = 0
const scoreText = document.getElementById('scoreText')

let obstructions = []
let obstructionSpawnInterval = 2000 // Interval in milliseconds to spawn obstructions
let lastObstructionSpawn = 0
let obstructionSpawned = false // Flag to track if obstructions have started spawning

class Player {
  constructor() {
    this.width = 40
    this.height = 40
    this.x = canvas.width / 2 - this.width / 2
    this.y = canvas.height - 150 // Initial position above the initial platform
    this.dy = -7 // Initial jump power
    this.jumpPower = -7 // Jump power
    this.gravity = 0.2
    this.speed = 5 // Horizontal speed of the player
  }

  draw() {
    ctx.fillStyle = '#FF6347'
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }

  update() {
    if (gameStarted) {
      this.dy += this.gravity
      this.y += this.dy

      if (keys.left && this.x > 0) {
        this.x -= this.speed
      }
      if (keys.right && this.x + this.width < canvas.width) {
        this.x += this.speed
      }

      // Check if player falls below the canvas
      if (this.y + this.height > canvas.height) {
        endGame()
      }
    }
  }

  jump() {
    this.dy = this.jumpPower
  }
}

class Platform {
  constructor(x, y) {
    this.width = 80
    this.height = 10
    this.x = x
    this.y = y
  }

  draw() {
    ctx.fillStyle = '#32CD32'
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }
}

class Obstruction {
  constructor(x, y, speed) {
    this.width = 20
    this.height = 20
    this.x = x
    this.y = y
    this.speed = speed
  }

  draw() {
    ctx.fillStyle = '#8B0000' // Dark red color for obstructions
    ctx.fillRect(this.x, this.y, this.width, this.height)
  }

  update() {
    this.y += this.speed
    this.draw()
  }
}

function createPlatforms() {
  platforms = []
  for (let i = 0; i < 6; i++) {
    let x = Math.random() * (canvas.width - 80)
    let y = canvas.height - i * 100
    platforms.push(new Platform(x, y))
  }
  platforms[platforms.length - 1].y = canvas.height - 100
  platforms[platforms.length - 1].x =
    player.x - platforms[platforms.length - 1].width / 2 + player.width / 2
}

function drawPlatforms() {
  platforms.forEach((platform) => {
    platform.draw()
    // Check if player lands on the platform
    if (
      player.y + player.height > platform.y &&
      player.y + player.height < platform.y + platform.height &&
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.width &&
      player.dy > 0
    ) {
      player.jump()
      increaseScore() // Increase score when player lands on platform
    }
  })
}

function checkCollision() {
  platforms.forEach((platform) => {
    if (
      player.y + player.height > platform.y &&
      player.y + player.height < platform.y + platform.height &&
      player.x + player.width > platform.x &&
      player.x < platform.x + platform.width &&
      player.dy > 0
    ) {
      player.jump()
    }
  })

  obstructions.forEach((obstruction, index) => {
    if (
      player.x < obstruction.x + obstruction.width &&
      player.x + player.width > obstruction.x &&
      player.y < obstruction.y + obstruction.height &&
      player.y + player.height > obstruction.y
    ) {
      endGame() // End game if player collides with obstruction
    }
  })
}

function movePlatforms() {
  if (gameStarted) {
    platforms.forEach((platform) => {
      if (player.dy < 0) {
        platform.y -= player.dy
      }
      if (platform.y > canvas.height) {
        platform.y = 0
        platform.x = Math.random() * (canvas.width - platform.width)
      }
    })
  }
}

function updateObstructions() {
  obstructions.forEach((obstruction, index) => {
    obstruction.update()
    // Remove obstructions that move out of the canvas
    if (obstruction.y > canvas.height) {
      obstructions.splice(index, 1)
    }
  })

  let currentTime = Date.now()
  if (!obstructionSpawned && score >= 200) {
    obstructionSpawned = true // Set flag to true once obstructions start spawning
  }

  if (
    obstructionSpawned &&
    currentTime - lastObstructionSpawn > obstructionSpawnInterval
  ) {
    let x = Math.random() * (canvas.width - 20) // Random x position
    let y = -20 // Start above the canvas
    let speed = 2 + Math.random() * 3 // Random speed
    obstructions.push(new Obstruction(x, y, speed))
    lastObstructionSpawn = currentTime
  }
}

function increaseScore() {
  score += 10 // Increase score by 10 for each successful platform landing
  scoreText.textContent = 'Score: ' + score
}

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  player.update()
  player.draw()
  drawPlatforms()
  checkCollision()
  movePlatforms()
  updateObstructions() // Update obstructions
}

function startGame() {
  player = new Player()
  createPlatforms()
  gameOverScreen.style.display = 'none'
  gameStarted = true
  clearInterval(gameInterval)
  gameInterval = setInterval(update, 1000 / 60) // Update game every 1/60th of a second
  obstructions = [] // Clear obstructions array when starting a new game
  obstructionSpawned = false // Reset obstruction spawn flag
  setInterval(updateObstructions, 1000) // Start updating obstructions
}

function endGame() {
  clearInterval(gameInterval)
  gameOverScreen.style.display = 'block'
  score = 0 // Reset score
  scoreText.textContent = 'Score: ' + score
  obstructions = [] // Clear obstructions array on game over
}

restartButton.addEventListener('click', startGame)

document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowLeft') {
    keys.left = true
  }
  if (e.key === 'ArrowRight') {
    keys.right = true
  }
  if (e.key === ' ' && !gameStarted) {
    // Space bar starts the game if not started
    startGame()
  }
})

document.addEventListener('keyup', (e) => {
  if (e.key === 'ArrowLeft') {
    keys.left = false
  }
  if (e.key === 'ArrowRight') {
    keys.right = false
  }
})

startGame() // Start the game when the script is loaded
