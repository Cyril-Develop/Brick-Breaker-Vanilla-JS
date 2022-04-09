//************** Initialisation Canvas **************
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
canvas.style.border = '2px solid white';

canvas.width = 1400;
canvas.height = 850;

//************** Score **************
let score = 0;

function drawScore(){
    ctx.font = '48px serif';
    ctx.textAlign = 'center'
    ctx.fillStyle = 'black'
    ctx.shadowBlur = 0;
    ctx.fillText('Score : ' + score, 700, 40);
}

//************** Image **************
const bgPaddlelvl1 = new Image();
bgPaddlelvl1.src = 'ressources/paddleBG.jpg';
const bgCanvaslvl1 = new Image();
bgCanvaslvl1.src = 'ressources/BG.jpg';

//************** Envoie de la musique de fond **************
function jouerMusic(){
    music1.play()
    document.getElementById('btnVolumeMute').addEventListener('click', () => {
        music1.volume = 0;
    })
    document.getElementById('btnVolumeOn').addEventListener('click', () => {
        music1.volume = 0.4;
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
        this.image.src = 'ressources/life.png';
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

function canvasBg(){
    ctx.drawImage(bgCanvaslvl1, 0, 50, canvas.width, canvas.height)
};

//************** PADDLE **************
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
    ctx.drawImage(bgPaddlelvl1, paddle.positionX, paddle.positionY, PADDLE_WIDTH, PADDLE_HEIGHT)
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
    if(!spaceBar){
        if(rightPressed && paddle.positionX < canvas.width - PADDLE_WIDTH && !leftPressed){
            ball.positionX += paddle.dx 
        } 
        if(leftPressed && paddle.positionX > 0 && !rightPressed) {
            ball.positionX -= paddle.dx
        } 
    } else {
        ball.positionX += ball.directionX
        ball.positionY += ball.directionY
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
            music1.pause()
            loseLife.pause()
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
    rows : 5,
    width : 75,
    height : 20,
    padding : 5,
    offsetTop : 70,
    offsetLeft : 100,
    fillColor : '#6568F3',
    visible : true
};

let bricks = [];
let bricksCount = bricksProp.columns * bricksProp.rows;
//************** Crée les bricks **************

function createBricks(){
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
createBricks()

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
                    if(bricksCount = 75) {
                        //envoie level suivant
                        nextLevel.play()
                    }
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


function startLevelTwo(){}
    


function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    canvasBg();
    drawPaddle();
    movePaddle();
    drawBall();
    moveBall();
    drawBricks()
    collisionBallBricks()
    drawScore()

    arrayLife.forEach((img) => {
        img.draw(ctx)
    });

    

    if(!gameOver)requestAnimationFrame(animate);
}
animate()


