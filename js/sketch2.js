const debug = true;

let snake = undefined;
let rotateMobileImg;
let rotateAngle = 0;
let soundtrack;
let gsm = new GameStateManager();

addEventListener("click", function() {
    if(!isFullscreen()) {
        enableFullscreen();
    }
});

function preload() {
    soundFormats('mp3', 'ogg');
    bite = loadSound('sounds/bite.mp3');
    rotateMobileImg = loadImage('images/rotate.png');
    soundtrack = loadSound('sounds/hp.mp3');
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    gsm.init();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || debug) {
        if(windowHeight <= windowWidth) {
            if(isFullscreen()) {
                if(mouseIsPressed) {
                    background(0);
                    if(snake === undefined) {
                        snake = new Snake();
                        soundtrack.play();
                    }
                    snake.draw();
                } else {
                    background(0);
                    textSize(32);
                    textAlign(CENTER);
                    fill(255);
                    text('PUT FINGER ON DISPLAY', windowWidth / 2, windowHeight / 2);
                    text('TO PLAY', windowWidth / 2, (windowHeight / 2) + 40);
                }
            } else {
                background(0);
                textSize(32);
                textAlign(CENTER);
                fill(255);
                text('PRESS TO ENABLE FULLSCREEN', windowWidth / 2, windowHeight / 2);
            }
        } else {
            background(0);
            push();
            translate(windowWidth / 2, windowHeight / 2);
            //rotate(radians(90));
            imageMode(CENTER);
            image(rotateMobileImg, 0, 0);
            pop();
        }
    } else {
        textSize(32);
        textAlign(CENTER);
        text('MOBILE DEVICE NOT DETECTED', windowWidth / 2, windowHeight / 2);
    }
}

// Snake class
function Snake() {
    this.x = [];
    this.y = [];
    this.segNum = 10;
    this.segLength = 18;

    for (let i = 0; i < this.segNum; i++) {
        this.x[i] = windowWidth / 2;
        this.y[i] = windowHeight / 2;
    }

    this.draw = function() {
        push();
        strokeWeight(9);
        stroke(255, 100);
        this.dragSegment(0, mouseX, mouseY);
        for(let i=0; i < this.x.length - 1; i++) {
            this.dragSegment(i + 1, this.x[i], this.y[i]);
        }
        pop();
    };

    this.dragSegment = function(i, xin, yin) {
        let dx = xin - this.x[i];
        let dy = yin - this.y[i];
        let angle = atan2(dy, dx);
        this.x[i] = xin - cos(angle) * this.segLength;
        this.y[i] = yin - sin(angle) * this.segLength;
        this.drawSegment(this.x[i], this.y[i], angle);
    };

    this.drawSegment = function(x, y, a) {
        push();
        translate(x, y);
        rotate(a);
        line(0, 0, this.segLength, 0);
        pop();
    };

    this.incSegNum = function(count = 1) {
        for(let i = 1; i <= count; i++) {
            this.x[this.segNum + i - 1] = this.x[this.segNum + i - 2];
            this.y[this.segNum + i - 1] = this.y[this.segNum + i - 2];
        }
        this.segNum += count;
    };

    this.incSegLength = function(length = 1) {
        this.segLength += length;
    };
}

function isFullscreen() {
    return document.fullscreenElement ||
        document.webkitFullscreenElement ||
        document.mozFullScreenElement ||
        document.msFullscreenElement;
}

function enableFullscreen() {
    let el = document.documentElement,
        rfs = el.requestFullscreen
            || el.webkitRequestFullScreen
            || el.mozRequestFullScreen
            || el.msRequestFullscreen
    ;
    rfs.call(el);
}

function GameStateManager() {
    let states = {};
    let activeState = 'menu';

    this.init = function() {
        states['menu'] = new MenuState();
        states['play'] = new PlayState();
    };

    this.draw = function() {
        states[activeState].draw();
    }

    this.changeState = function(state) {
        activeState = state;
    }
}

function MenuState() {
    this.draw = function() {

    }
}

function PlayState() {
    this.draw = function() {

    }
}