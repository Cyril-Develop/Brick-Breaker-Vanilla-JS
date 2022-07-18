//************** Initialisation Canvas **************
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
canvas.style.border = '2px solid white';

canvas.width = 1400;
canvas.height = 850;

//************** Score **************
let score = 0;
let level = 1;
MAX_LEVEL = 5;

function drawScore(){
    ctx.font = '48px serif';
    ctx.textAlign = 'center'
    ctx.fillStyle = 'black'
    ctx.shadowBlur = 0;
    ctx.fillText('Score : ' + score, 700, 40);
}
//************** Background game **************
let bgCanvas = new Image();
bgCanvas.src = 'ressources/img/BG.png';
function canvasBg(){
    ctx.drawImage(bgCanvas, 0, 50, canvas.width, canvas.height)
};

//************** Envoie de la musique de fond **************
function jouerMusic(){
    music1.play()
    document.getElementById('btnVolumeMute').addEventListener('click', () => {
        music1.volume = 0;
        paddleCollision.volume = 0;
        explosionBlock.volume = 0;
        ballCollision.volume = 0;
        gameOverSong.volume = 0;
        loseLife.volume = 0;
        levelUp.volume = 0;
        winGame.volume = 0;
        penaltyCollision.volume = 0;
        penaltyRemove.volume = 0;
    })
    document.getElementById('btnVolumeOn').addEventListener('click', () => {
        music1.volume = 0.6;
        paddleCollision.volume = 0.8;
        explosionBlock.volume = 1;
        ballCollision.volume = 0.8;
        gameOverSong.volume = 0.8;
        loseLife.volume = 0.8;
        levelUp.volume = 0.8;
        winGame.volume = 0.8;
        penaltyCollision.volume = 0.8;
        penaltyRemove.volume = 0.8;
    })
};
window.addEventListener('mousemove', jouerMusic); 

//************** Bouton rejouer **************
const btnRejouer = document.getElementById('btnRejouer')
btnRejouer.addEventListener('click', () => {
    location.reload()
});

//************** Variables **************
let rightPressed = false;
let leftPressed = false;
let spaceBar = false;
let gameOver = false;

//************** Nombre de vies **************
class heart {
    constructor(positionX){
        this.positionX = positionX
        this.image = new Image();
        this.image.src = 'ressources/img/life.png';
        this.width = 50;
        this.height = 50;
    }
    draw(ctx){
        ctx.shadowColor = 'black';
        ctx.shadowBlur = 5;
        ctx.drawImage(this.image, this.positionX, 0, this.width, this.height)
    }
};
let arrayLife = [];
arrayLife.push(new heart(0), new heart(50), new heart(100));

function showStats(){
    arrayLife.forEach((img) => {
        img.draw(ctx)
    });
}
    
//************** Gestionnaire de touches **************
document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function keyDownHandler(e) {
    if(e.key === 'ArrowRight') {
        rightPressed = true;
    }
    else if(e.key === 'ArrowLeft') {
        leftPressed = true;
    }
}
function keyUpHandler(e) {
    if(e.key === 'ArrowRight') {
        rightPressed = false;
    }
    else if(e.key === 'ArrowLeft') {
        leftPressed = false;
    }
    else if(e.key === ' ') {
        spaceBar = true;
    }
}

//************** PADDLE **************
let bgPaddle = new Image();
bgPaddle.src = 'ressources/img/paddleBG.png';
let PADDLE_WIDTH = 250;
let PADDLE_HEIGHT = 40;
let PADDLE_MARGIN_BOTTOM = 30;

let paddle = {
    positionX : (canvas.width - PADDLE_WIDTH) / 2,
    positionY : (canvas.height - PADDLE_HEIGHT) - PADDLE_MARGIN_BOTTOM,
    dx : 8
};
function drawPaddle(){
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 5;
    ctx.drawImage(bgPaddle, paddle.positionX, paddle.positionY, PADDLE_WIDTH, PADDLE_HEIGHT)
};
function movePaddle(){
    if(rightPressed && paddle.positionX < canvas.width - PADDLE_WIDTH){
        paddle.positionX += paddle.dx
    }
    if(leftPressed && paddle.positionX > 0){
        paddle.positionX -= paddle.dx
    }
};

//************** Ball **************
let ball = {
    radius : 10,
    positionX : paddle.positionX + PADDLE_WIDTH/2,
    positionY : paddle.positionY - 10,
    //déplacement aleatoire sur x au depart
    directionX : 5 * (Math.random() * 2 - 1),
    directionY : -5,
    velocity : 5 
};

function drawBall(){
    ctx.beginPath()
    ctx.arc(ball.positionX, ball.positionY, ball.radius, 0, 2 * Math.PI);
    ctx.fillStyle = 'crimson'
    ctx.fill()
};

function moveBall(){
    if(spaceBar) {
        ball.positionX += ball.directionX
        ball.positionY += ball.directionY
    } else {
        ball.positionX = paddle.positionX+PADDLE_WIDTH/2
    }
    
    //************** Collision avec mur **************
    if(ball.positionX + ball.directionX > canvas.width - ball.radius || ball.positionX + ball.directionX < ball.radius) {
        ballCollision.play()
        ball.directionX *= -1;
    }
    if(ball.positionY + ball.directionY < 50 + ball.radius) {
        ballCollision.play()
        ball.directionY *= -1;
    } 
    if(ball.positionY + ball.directionY > canvas.height - ball.radius) {
        arrayLife.pop()
        loseLife.play()
        if(arrayLife.length == 0) {
            loseLife.pause()
            music1.pause()
            music1.volume = 0;
            gameOverSong.play()
            gameOver = true
            btnRejouer.classList.add('active')
        }
        resetPaddle()
        resetBall() 
        spaceBar = false
    }
    //************** Collision avec paddle **************
    if(ball.positionX + ball.radius > paddle.positionX && 
    ball.positionX - ball.radius < paddle.positionX + PADDLE_WIDTH &&
    ball.positionY + ball.radius > paddle.positionY){

        paddleCollision.play()

        let collidePoint = ball.positionX - (paddle.positionX + PADDLE_WIDTH / 2);
        collidePoint = collidePoint / (PADDLE_WIDTH / 2);

        let angle = collidePoint * Math.PI / 3;

        ball.directionX = ball.velocity * Math.sin(angle);
        ball.directionY = -ball.velocity * Math.cos(angle);
    }
};

//************** Bricks **************
let bricksProp = {
    columns : 15,
    rows : 4,
    width : 75,
    height : 20,
    padding : 5,
    offsetTop : 70,
    offsetLeft : 100,
    fillColor : '#6568F3',
    visible : true
};
let bricks = [];
//************** Crée les bricks **************

function createBlueBricks(){
    for (let r = 0; r < bricksProp.rows; r++) {
        bricks[r] = [];
        for (let c = 0; c < bricksProp.columns; c++) {
            bricks[r][c] = {
                x: c * (bricksProp.width + bricksProp.padding) + bricksProp.offsetLeft,
                y: r * (bricksProp.height + bricksProp.padding) + bricksProp.offsetTop,
                status: true,
                //permet de récupérer toutes les propriétés de bricksProp pour chaque élément
                ...bricksProp
            }
        }
    }
};
createBlueBricks()

//************** Dessine les bricks **************
function drawBricks(){
    bricks.forEach(column => {
        column.forEach(brick => {
            if(brick.status){
                ctx.beginPath();
                ctx.rect(brick.x, brick.y, brick.width, brick.height)
                ctx.fillStyle = brick.fillColor;
                ctx.fill();
                ctx.closePath();
            }
        })
    })
};

//************** Collision Ball Bricks **************
function collisionBallBricks(){
    bricks.forEach(column => {
        column.forEach(brick => {
            if(brick.status){
               if(ball.positionX + ball.radius > brick.x &&
                ball.positionX - ball.radius < brick.x + brick.width &&
                ball.positionY + ball.radius > brick.y && 
                ball.positionY - ball.radius < brick.y + brick.height) {
                    
                    explosionBlock.play()
                    ball.directionY *= -1
                    brick.status = false
                    score +=10;

                }
            }
        })
    })
};


//************** Reset **************
function resetPaddle(){
    paddle = {
        positionX : (canvas.width - PADDLE_WIDTH) / 2,
        positionY : (canvas.height - PADDLE_HEIGHT) - PADDLE_MARGIN_BOTTOM,
        dx : 8
    }
};
function resetBall(){
    ball = {
        radius : 10,
        positionX : paddle.positionX + PADDLE_WIDTH/2,
        positionY : paddle.positionY - 10,
        //déplacement aleatoire sur x au depart
        directionX : 5 * (Math.random() * 2 - 1),
        directionY : -5,
        velocity : 5 
    }
};

//**************************** NIVEAU 2 ****************************

//************** Brick incassable du level2 **************

let greyBrickProp = {
    width : 1000,
    height : 20,
    y : 400,
    x : (canvas.width - 1000) / 2,
    fillColor : '#D3D4CE',
};

function drawGreyBrick(){
    if(level == 2) {
        ctx.beginPath();
        ctx.rect(greyBrickProp.x, greyBrickProp.y, greyBrickProp.width, greyBrickProp.height)
        ctx.fillStyle = greyBrickProp.fillColor;
        ctx.fill();
        ctx.closePath();
    }
};
//************** Collision Ball brick incassable **************
function collisionBallGreyBrick(){
    if(level == 2) {
        if(ball.positionX + ball.radius > greyBrickProp.x &&
        ball.positionX - ball.radius < greyBrickProp.x + greyBrickProp.width && 
        ball.positionY + ball.radius > greyBrickProp.y && 
            ball.positionY - ball.radius < greyBrickProp.y + greyBrickProp.height) {

            ball.directionY *= -1
   
        }
    } 
};        

function nextLevel(){
    
   let isLevelUp = true;

   for(let r = 0; r < bricksProp.rows; r++) {
       for(let c = 0; c < bricksProp.columns; c++) {
           isLevelUp = isLevelUp && !bricks[r][c].status;
       }
   };

    if(isLevelUp){
        level++
        levelUp.play()
        if (level >= MAX_LEVEL){
            
            winGame.play();
            music1.pause()
            music1.volume = 0;
            penaltyRemove.pause()
            gameOver = true
            btnRejouer.classList.add('active')
            return
        };
        bricksProp.rows ++
        createBlueBricks();
  
        // la vitesse de la balle augmente pas !
        ball.velocity += 2;
        resetBall();
        resetPaddle();
        
        if(level == 2) {
            bgCanvas.src = 'ressources/img/BG2.png';
            canvasBg();
            
        };   
        if(level == 3) {
            bgCanvas.src = 'ressources/img/BG3.png';
            canvasBg();
            bricksProp.fillColor = 'purple'
            createBlueBricks();
        };
        if(level == 4) {
            bgCanvas.src = 'ressources/img/BG4.png';
            canvasBg();
            bgPaddle.src = 'ressources/img/paddleBG2.png';
            drawPaddle();
        };
    }
};

//*********************** MALUS ********************************/
setInterval(() => {
    //genere un nombre entre 0 et 1 toute les 4s
     let randomNumber = Math.floor(Math.random() * 2)
    if(randomNumber == 0) {
        arrayMalus.push(new Malus())
    }
 }, 4000);

class Malus {
    constructor(){
        this.image = new Image()
        this.image.src = 'ressources/img/redMalus.png'
        this.width = 80;
        this.height = 80;
        this.x = Math.random() * (canvas.width - this.width);
        this.y = 100;
        this.speed = 3;
        this.markForDeletion = false
        this.contactPenalty = false
    }
    draw(){
        ctx.drawImage(this.image, this.x, this.y, this.width, this.height)
    }
    upadte(){
        this.y += this.speed;

        if(this.y + this.height > canvas.height) this.markForDeletion = true;

        if(this.x < paddle.positionX + PADDLE_WIDTH &&
            this.x + this.width > paddle.positionX &&
            this.y < paddle.positionY + PADDLE_HEIGHT &&
            this.height + this.y > paddle.positionY){ 

                this.contactPenalty = true; 
                if(ball.positionY < paddle.positionY - 10 && PADDLE_WIDTH == 250) {
                    penaltyCollision.play()
                    PADDLE_WIDTH = 125
                    setTimeout(() => {
                        penaltyRemove.play()
                        PADDLE_WIDTH = 250
                        this.contactPenalty = false;
                    }, 10000); 
                }
            }
    }
}
let arrayMalus = []

//*********************** Particules derriere la ball ********************************/
let angle = 0;

const arrayColor = ['#FA8072', '#B22222', '#CD5C5C', '#8B0000']

class Particle{
    constructor(){
        this.x = ball.positionX;
        this.y = ball.positionY;
        this.speedY = (Math.random() * 1 ) - 0.5;
        this.radius = Math.random() * 3 + 2;
        this.color = arrayColor[Math.floor(Math.random() * arrayColor.length)]
        
    }
    update(){
        //let curve = Math.sin(angle) * 2;
        this.y += this.speedY
    }
    draw(){
        ctx.fillStyle = 'crimson';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.closePath();
    }
};

const arrayParticles = [];

function generateParticles(){
    if(spaceBar){
        arrayParticles.unshift(new Particle())
    } else {
        arrayParticles.pop((new Particle()))
    }
    for(let i = 0; i < arrayParticles.length; i++) {
        arrayParticles[i].update();
        arrayParticles[i].draw();
    }
    if(arrayParticles.length > 50) {
        for(let i = 0; i < 10; i++){
            arrayParticles.pop(arrayParticles[i])
        }
    }
};


function generatePenalty(){
    arrayMalus.forEach(penalty => {
        penalty.draw()
        penalty.upadte()
    })
};
    
function draw(){
    canvasBg();
    drawPaddle();
    drawBall();
    drawBricks();
    drawGreyBrick();
    drawScore();
}

function update(){
    nextLevel();
    movePaddle();
    moveBall();
    collisionBallBricks();
    collisionBallGreyBrick();
}

function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    draw();
    update();
    showStats();
    generatePenalty();
    generateParticles();

    arrayMalus = arrayMalus.filter(element => !element.markForDeletion )
 
    angle+=5;

    if(!gameOver)requestAnimationFrame(animate);
};
animate()


