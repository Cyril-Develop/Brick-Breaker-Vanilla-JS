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
    ctx.drawImage(bgCanvaslvl1, 0, 50, canvas.width, canvas.height)
};

//************** PADDLE **************
let PADDLE_WIDTH = 250;
let PADDLE_HEIGHT = 40;
let PADDLE_MARGIN_BOTTOM = 30;

let paddle = {
    positionX : (canvas.width - PADDLE_WIDTH) / 2,
    positionY : (canvas.height - PADDLE_HEIGHT) - PADDLE_MARGIN_BOTTOM,
    velocity : 5
};
function drawPaddle(){
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 5;
    ctx.drawImage(bgPaddlelvl1, paddle.positionX, paddle.positionY, PADDLE_WIDTH, PADDLE_HEIGHT)
};
function movePaddle(){
    inputHandler()
    if(rightPressed && paddle.positionX < canvas.width - PADDLE_WIDTH){
        paddle.positionX += paddle.velocity
    }
    if(leftPressed && paddle.positionX > 0){
        paddle.positionX -= paddle.velocity
    }
};

//************** Ball **************
let ball = {
    radius : 10,
    positionX : paddle.positionX + PADDLE_WIDTH/2,
    positionY : paddle.positionY - 10,
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
        if(rightPressed && paddle.positionX < canvas.width - PADDLE_WIDTH && !leftPressed){
            ball.positionX += ball.velocity 
        } 
        if(leftPressed && paddle.positionX > 0 && !rightPressed) {
            ball.positionX -= ball.velocity
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
    ball.positionX - ball.radius < paddle.positionX + PADDLE_WIDTH &&
    ball.positionY + ball.radius > paddle.positionY){
        paddleCollision.play()
        ball.dx = ball.velocity
        ball.directionY = -ball.velocity
    }
};

//************** Blocks **************
let blocks = {
    blocksBlue : {
        numberOfColumns : 15,
        numberOfRows : 5,
        width : 75,
        height : 20,
        padding : 5,
        offsetTop : 70,
        offsetLeft : 100,
    },  
    blocksGrey : {
        numberOfColumns : 15,
        numberOfRows : 1,
        width : 75,
        height : 20,
        padding : 5,
        offsetTop : 70,
        offsetLeft : 100,
    }  
};
let arrayBlocksBlue = [];
let arrayBlocksGrey = [];

for(let j = 0; j < blocks.blocksBlue.numberOfColumns; j++){
    arrayBlocksBlue[j] = [];
    for(let y = 0; y < blocks.blocksBlue.numberOfRows; y++){
        arrayBlocksBlue[j][y] = { x:0, y:0, status: 1 }
    }
};
for(let j = 0; j < blocks.blocksGrey.numberOfColumns; j++){
    arrayBlocksGrey[j] = [];
    for(let y = 0; y < blocks.blocksGrey.numberOfRows; y++){
        arrayBlocksGrey[j][y] = { x:0, y:0}
    }
};
//************** Dessine les blocks **************
function drawBlueBlocks(){
   for(let j = 0; j < blocks.blocksBlue.numberOfColumns; j++) {
        for(let y = 0; y < blocks.blocksBlue.numberOfRows; y++) {
            if(arrayBlocksBlue[j][y].status == 1){
                let blockBlueX = (j * (blocks.blocksBlue.width + blocks.blocksBlue.padding)) + blocks.blocksBlue.offsetLeft;
                let blockBlueY = (y * (blocks.blocksBlue.height + blocks.blocksBlue.padding)) + blocks.blocksBlue.offsetTop;
                arrayBlocksBlue[j][y].x = blockBlueX ;
                arrayBlocksBlue[j][y].y = blockBlueY;
                ctx.beginPath();
                ctx.shadowColor = 'black';
                ctx.shadowBlur = 5;
                ctx.rect(blockBlueX, blockBlueY, blocks.blocksBlue.width, blocks.blocksBlue.height);
                ctx.fillStyle = "#0095DD";
                ctx.fill();
                ctx.closePath(); 
            }
        }
    }
};
function drawGreyBlocks(){
    for(let j = 0; j < blocks.blocksGrey.numberOfColumns; j++) {
        for(let y = 0; y < blocks.blocksGrey.numberOfRows; y++) {
            let blockGreyX = (j * (blocks.blocksGrey.width + blocks.blocksGrey.padding)) + blocks.blocksGrey.offsetLeft;
            let blockGreyY = (5 * (blocks.blocksGrey.height + blocks.blocksGrey.padding)) + blocks.blocksGrey.offsetTop;
            arrayBlocksGrey[j][y].x = blockGreyX ;
            arrayBlocksGrey[j][y].y = blockGreyY;
            ctx.beginPath();
            ctx.shadowColor = 'black';
            ctx.shadowBlur = 5;
            ctx.rect(blockGreyX, blockGreyY, blocks.blocksGrey.width, blocks.blocksGrey.height);
            ctx.fillStyle = "lightgrey";
            ctx.fill();
            ctx.closePath(); 
            
        }
    }
}
//************** Collision avec les blocks **************
function collisionBlocks() {
    for(let j = 0; j < blocks.blocksBlue.numberOfColumns; j++) {
        for(let y = 0; y < blocks.blocksBlue.numberOfRows; y++) {
            let b = arrayBlocksBlue[j][y];
            if(b.status == 1 && ball.positionX + ball.radius > b.x &&
            ball.positionX - ball.radius < b.x + blocks.blocksBlue.width &&
            ball.positionY + ball.radius > b.y &&
            ball.positionY - ball.radius < b.y + blocks.blocksBlue.height) {
                explosionBlock.play()
                ball.directionY *= -1
                b.status = 0;
                score += 20;
            }         
        }
    };
    for(let j = 0; j < blocks.blocksGrey.numberOfColumns; j++) {
        for(let y = 0; y < blocks.blocksGrey.numberOfRows; y++) {
            let b = arrayBlocksGrey[j][y];
            if(ball.positionX + ball.radius > b.x &&
            ball.positionX + ball.radius < b.x + blocks.blocksGrey.width &&
            ball.positionY + ball.radius > b.y &&
            ball.positionY - ball.radius < b.y + blocks.blocksGrey.height) {
                ball.directionY *= -1
            }         
        }
    }
};

//************** Reset **************
function resetPaddle(){
    paddle = {
        positionX : (canvas.width - PADDLE_WIDTH) / 2,
        positionY : (canvas.height - PADDLE_HEIGHT) - PADDLE_MARGIN_BOTTOM,
        velocity : 5
    }
};
function resetBall(){
    ball = {
        radius : 10,
        positionX : paddle.positionX + PADDLE_WIDTH/2,
        positionY : paddle.positionY - 10,
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
    drawBlueBlocks();
    drawGreyBlocks();
    collisionBlocks();
    drawScore()

    arrayLife.forEach((img) => {
        img.draw(ctx)
    });

    

    if(!gameOver)requestAnimationFrame(animate);
}
animate()


