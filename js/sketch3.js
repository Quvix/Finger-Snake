const debug = true;

let rotateMobileImg;
let rotateAngle = 0;
let gsm = new GameStateManager();
let soundtrack;

addEventListener("click", function() {
    if(!isFullscreen()) {
        enableFullscreen();
        gsm.changeState('menu', true);
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
                gsm.draw();
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
    this.states = {};
    this.activeState = undefined;

    this.init = function() {
        this.states['menu'] = new MenuState();
        this.states['play'] = new PlayState();
    };

    this.draw = function() {
        console.log(this.activeState);
        if(this.activeState !== undefined) {
            this.states[this.activeState].draw();
        }
    };

    this.changeState = function(state, init = false) {
        this.activeState = state;
        if(init) {
            this.states[this.activeState].init();
        }
    }
}

function MenuState() {
    this.menu = new Menu();

    let btn1 = new MenuButton();
    btn1.text = "START GAME";
    this.menu.addButton(btn1);

    let btn2 = new MenuButton();
    btn2.text = "DAVID JE MOCKAAAAAAAA";
    this.menu.addButton(btn2);

    this.init = function() {

    };

    this.draw = function() {
        this.menu.draw();
        /*if(!mouseIsPressed) {
            background(0);
            textSize(32);
            textAlign(CENTER);
            fill(255);
            text('PUT FINGER ON DISPLAY', windowWidth / 2, windowHeight / 2);
            text('TO PLAY', windowWidth / 2, (windowHeight / 2) + 40);
        } else {
            gsm.changeState('play', true);
        }*/
    }
}

function PlayState() {
    this.snake;

    this.init = function() {
        this.snake = new Snake();
        //soundtrack.play();
    };

    this.draw = function() {
        if(mouseIsPressed) {
            background(0);
            this.snake.draw();
        } else {
            gsm.changeState('menu', true);
        }
    }
}

function Menu() {
    let buttons = [];
    let level = 1;

    this.draw = function() {
        for(let i = 0; i < buttons.length; i++) {
            buttons[i].draw();
        }
    };

    this.addButton = function(btn) {
        btn.level = level;
        buttons.push(btn);
        level++;
    }

}

function MenuButton() {
    const SPACE_HEIGHT = 50;
    const START_HEIGHT = 100;
    this.text = "UNDEFINED";
    this.level = -1;

    this.draw = function() {
        textAlign(CENTER);
        textSize(32);
        fill(128);
        text(this.text, this.getX(), this.getY());
    };

    this.getY = function() {
        return START_HEIGHT + this.level * SPACE_HEIGHT;
    };

    this.getX = function() {
        return windowWidth / 2;
    };
}
