const canvas = document.querySelector('canvas')
const c = canvas.getContext('2d')
let scoreEl = document.querySelector('#scoreEl')
let startGameBtn = document.querySelector('#startGameBtn')
let modalEl = document.querySelector('#modalEl')
let bigScore = document.querySelector('#bigScore')
let levelEl = document.querySelector('#levelEl')
let expEl = document.querySelector('#expEl')
let expNeedEl = document.querySelector('#expNeedEl')

canvas.width = innerWidth
canvas.height = innerHeight

class Player {
    constructor(x, y, radius, color, level, xp, xpNeed) {
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.level = level
        this.xp = xp
        this.xpNeed = xpNeed
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    levelUp() {
        if (this.xp >= this.xpNeed) {
            this.xp = this.xp - this.xpNeed
            this.level++
            this.xpNeed = Math.floor(this.xpNeed * 1.2)
            expEl.innerHTML = this.xp
            levelEl.innerHTML = this.level
            expNeedEl.innerHTML = this.xpNeed
        }
    }
}

class Projectile {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

class Enemy {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
    }

    draw() {
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update() {
        this.draw()
        this.x += this.velocity.x
        this.y += this.velocity.y
    }
}

class Particle {
    constructor(x, y, radius, color, velocity) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocity = velocity;
        this.alpha = 1
    }

    draw() {
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update() {
        this.draw()
        this.velocity.x *= .99
        this.velocity.y *= .99
        this.x += this.velocity.x
        this.y += this.velocity.y
        this.alpha -= .01
    }
}

let player = new Player(canvas.width / 2, canvas.height / 2, 30, 'gray', 1, 0, 200)
let projectiles = []
let enemies = []
let particles = []

function init() {
    player = new Player(canvas.width / 2, canvas.height / 2, 30, 'gray', 1, 0, 200)
    projectiles = []
    enemies = []
    particles = []
    score = 0
    scoreEl.innerHTML = 0
}

player.draw()

let animationId
let score = 0

function animate() {
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0,0,0,.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    particles.forEach((particle, index) => {
        if (particle.alpha <= 0) {
            particles.splice(index, 1)
        } else {
            particle.update()
        }
    })
    projectiles.forEach((projectile, index) => {
        projectile.update()
        if (projectile.x + projectile.radius < 0 || projectile.x - projectile.radius > canvas.width || projectile.y + projectile.radius < 0 || projectile.y - projectile.radius > canvas.height) {
            setTimeout(() => {
                projectiles.splice(index, 1)
            }, 0)
        }
    })
    enemies.forEach((enemy, index) => {
        enemy.update()
        const dist = Math.hypot(player.x - enemy.x, player.y - enemy.y)
        if (dist - player.radius - enemy.radius < 1) {
            setTimeout(() => {
                cancelAnimationFrame(animationId)
                modalEl.style.display = 'flex'
                bigScore.innerHTML = score
                levelEl.innerHTML = 1
                expEl.innerHTML = 0
                expNeedEl.innerHTML = 200
            }, 0)
        }

        projectiles.forEach((projectile, projectileIndex) => {
            const dist = Math.hypot(projectile.x - enemy.x, projectile.y - enemy.y)
            if (dist - projectile.radius - enemy.radius < 1) {

                for (let i = 0; i < enemy.radius * 2; i++) {
                    particles.push(new Particle(projectile.x, projectile.y, Math.random() * 2, enemy.color, {
                        x: (Math.random() - .5) * Math.random() * 5,
                        y: (Math.random() - .5) * Math.random() * 5
                    }))
                }

                if (enemy.radius - 10 > 10) {
                    score += 100
                    scoreEl.innerHTML = score
                    gsap.to(enemy, {
                        duration: .2,
                        radius: enemy.radius - 10
                    })
                    setTimeout(() => {
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                } else {
                    score += 250
                    player.xp += 100
                    scoreEl.innerHTML = score
                    expEl.innerHTML = player.xp
                    player.levelUp()
                    setTimeout(() => {
                        enemies.splice(index, 1)
                        projectiles.splice(projectileIndex, 1)
                    }, 0)
                }
            }
        })
    })
    player.draw()
}

function spawnEnemies() {
    setInterval(() => {
        const radius = Math.random() * 30 + 15
        let x, y
        if (Math.random() < .5) {
            x = Math.random() < .5 ? 0 - radius : canvas.width + radius
            y = Math.random() * canvas.height
        } else {
            x = Math.random() * canvas.width
            y = Math.random() < .5 ? 0 - radius : canvas.height + radius
        }
        const color = `hsl( ${Math.random() * 360}, 50%, 50%)`
        const angle = Math.atan2(canvas.height / 2 - y, canvas.width / 2 - x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemies.push(new Enemy(x, y, radius, color, velocity))
    }, 300)
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function autoShoot() {
    setInterval(() => {
        const enemyIndex = getRandomInt(enemies.length)
        if (enemies.length != 0) {
            const angle = Math.atan2(enemies[enemyIndex].y - canvas.height / 2, enemies[enemyIndex].x - canvas.width / 2)
            const velocity = {
                x: Math.cos(angle) * 4,
                y: Math.sin(angle) * 4
            }
            projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity))
        }
    }, 200)
}

function randomShoot() {
    setInterval(() => {
        for (let i = 0; i < 20; i++) {
            const angle = Math.atan2((Math.random() * 2 - 1), (Math.random() * 2 - 1))
            const velocity = {
                x: Math.cos(angle) * 4,
                y: Math.sin(angle) * 4
            }
            projectiles.push(new Projectile(canvas.width / 2, canvas.height / 2, 5, 'white', velocity))
        }
    }, 800)
}

let hold = false;

addEventListener('mousedown', (event) => {
    hold = true;

})

addEventListener('mouseup', (event) => {
    hold = false;
    enemies.forEach((enemy) => {
        const angle = Math.atan2(canvas.height / 2 - enemy.y, canvas.width / 2 - enemy.x)
        const velocity = {
            x: Math.cos(angle),
            y: Math.sin(angle)
        }
        enemy.velocity = velocity
    })
})

addEventListener('mousemove', (event) => {
    if (hold) {
        const angle = Math.atan2(event.clientY - canvas.height / 2, event.clientX - canvas.width / 2)
        const velocity = {
            x: Math.cos(angle) * 1.2,
            y: Math.sin(angle) * 1.2
        }
        enemies.forEach((enemy) => {
            const angle2 = Math.atan2(canvas.height / 2 - enemy.y, canvas.width / 2 - enemy.x)
            const velocity2 = {
                x: Math.cos(angle2),
                y: Math.sin(angle2)
            }
            enemy.velocity.x = velocity2.x - velocity.x
            enemy.velocity.y = velocity2.y - velocity.y
        })
    }
})

startGameBtn.addEventListener('click', () => {
    init()
    modalEl.style.display = 'none'
    animate()
    spawnEnemies()
    autoShoot()
    randomShoot()
})
