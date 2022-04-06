//************** Audio **************
const music1 = new Audio();
music1.src = 'ressources/music1.mp3';
const paddleCollision = new Audio();
paddleCollision.src = 'ressources/paddleSong.ogg';
const ballCollision = new Audio();
ballCollision.src = 'ressources/ballSong.ogg';
const gameOverSong = new Audio();
gameOverSong.src = 'ressources/gameOver.wav';
const loseLife = new Audio();
loseLife.src = 'ressources/loseLife.wav';

//************** Envoie de la musique de fond **************
function jouerMusic(){
    music1.play()
    document.getElementById('btnVolumeMute').addEventListener('click', () => {
        music1.volume = 0;
    })
    document.getElementById('btnVolumeOn').addEventListener('click', () => {
        music1.volume = 1;
    })
};
window.addEventListener('mousemove', jouerMusic); 



//************** Bouton rejouer **************
const btnRejouer = document.getElementById('btnRejouer')
btnRejouer.addEventListener('click', () => {
    location.reload()
});

document.getElementById('btnRules').addEventListener('click', () => {
    document.getElementById('rules').classList.toggle('active')  
    document.getElementById('containerRules').classList.toggle('active')  
});



const canvas = document.getElementById('canvas');
const ctx = canvas.getContext("2d");
canvas.width = 1123;
canvas.height = 1024;




//************** Image **************
let bgPaddle = new Image();
bgPaddle.src = 'ressources/paddleBG.jpg';
let bgCanvas = new Image();
bgCanvas.src = 'ressources/BG.jpg';
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
        ctx.drawImage(this.image, this.positionX, 0, this.width, this.height)
    }
};
let arrayLife = [];
arrayLife.push(new heart(0), new heart(50), new heart(100));
    
//************** Gestionnaire de touches **************
function inputHandler(){
    window.addEventListener('keydown', (e) => {
        if(e.key === 'ArrowRight') {
            rightPressed = true;
        }
        if(e.key === 'ArrowLeft') {
            leftPressed = true;
        }
    })
    window.addEventListener('keyup', (e) => {
        if(e.key === 'ArrowRight') {
            rightPressed = false;
        }
        if(e.key === 'ArrowLeft') {
            leftPressed = false;
        }
        if(e.key === ' ') {
            spaceBar = true;
        }
    })
};

function canvasBg(){
    ctx.drawImage(bgCanvas, 0, 50, canvas.width, canvas.height)
};

//************** PADDLE **************
let paddle = {
    width : 300,
    height : 50,
    positionX : (canvas.width - 300) / 2,
    positionY : canvas.height - 70,
    velocity : 5
};
function drawPaddle(){
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 5;
    ctx.drawImage(bgPaddle, paddle.positionX, paddle.positionY, paddle.width, paddle.height)
};
function movePaddle(){
    inputHandler()
    if(rightPressed && paddle.positionX < canvas.width - paddle.width){
        paddle.positionX += paddle.velocity
    }
    if(leftPressed && paddle.positionX > 0){
        paddle.positionX -= paddle.velocity
    }
};

//************** Ball **************
let ball = {
    radius : 15,
    positionX : paddle.positionX + paddle.width/2,
    positionY : paddle.positionY - 15,
    //déplacement aleatoire sur x au depart
    directionX : 3 * (Math.random() * 2 - 1),
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
        if(rightPressed && paddle.positionX < canvas.width - paddle.width){
            ball.positionX += paddle.velocity 
        } 
        if(leftPressed && paddle.positionX > 0) {
            ball.positionX -= paddle.velocity
        } 
    } else {
        ball.positionX += ball.directionX
        ball.positionY += ball.directionY
    }
    
    //************** Collision avec mur **************
    if(ball.positionX + ball.radius > canvas.width || ball.positionX < 0 + ball.radius) {
        ballCollision.play()
        ball.directionX *= -1
    }
    if(ball.positionY < 50 + ball.radius) {
        ballCollision.play()
        ball.directionY *= -1
    } 
    if(ball.positionY + ball.radius > canvas.height) {
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
    ball.positionX - ball.radius < paddle.positionX + paddle.width &&
    ball.positionY + ball.radius > paddle.positionY){
        paddleCollision.play()
        ball.dx = ball.velocity
        ball.directionY = -ball.velocity
    }
};

//************** Blocks **************
let blocks = {
    numberOfColumns : 9,
    numberOfRows : 5,
    width : 100,
    height : 40,
    padding : 10,
    offsetTop : 70,
    offsetLeft : 70
};
let arrayBlocks = [];

for(let j = 0; j < blocks.numberOfColumns; j++){
    arrayBlocks[j] = [];
    for(let y = 0; y < blocks.numberOfRows; y++){
        arrayBlocks[j][y] = { x:0, y:0 }
    }
};

//************** Dessine les blocks **************
function drawBlocks(){
   for(let j = 0; j < blocks.numberOfColumns; j++) {
        for(let y = 0; y < blocks.numberOfRows; y++) {
            let blockX = j * (blocks.width + blocks.padding) + blocks.offsetLeft;
            let blockY = y * (blocks.height + blocks.padding) + blocks.offsetTop;
            arrayBlocks[j][y].x = blockX ;
            arrayBlocks[j][y].y = blockY;
            ctx.beginPath();
            ctx.rect(blockX, blockY, blocks.width, blocks.height);
            ctx.fillStyle = "gold";
            ctx.fill();
            ctx.closePath();
        }
    }
};
//************** Reset **************
function resetPaddle(){
    paddle = {
        width : 300,
        height : 50,
        positionX : (canvas.width - 300) / 2,
        positionY : canvas.height - 70,
        velocity : 5
    }
};
function resetBall(){
    ball = {
        radius : 15,
        positionX : paddle.positionX + paddle.width/2,
        positionY : paddle.positionY - 15,
        directionX : 3 * (Math.random() * 2 - 1),
        directionY : -5,
        velocity : 5
    }
};


function animate(){
    ctx.clearRect(0,0,canvas.width,canvas.height);

    canvasBg();
    drawPaddle();
    movePaddle();
    drawBall();
    moveBall();
    drawBlocks();

    arrayLife.forEach((img) => {
        img.draw(ctx)
    });

    if(!gameOver)requestAnimationFrame(animate);
}
animate()


