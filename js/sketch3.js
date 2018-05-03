const debug = true;
const GET_HIGHSCORE_URL = 'http://highscore.quvix.eu/api/gethighscores';
const ADD_HIGHSCORE_URL = 'http://highscore.quvix.eu/api/addhighscore';
const HASH_KEY = 'rF1eNtMvadnpPUXT64OiVlyqDzEfBoH0';

let config = {
    username: 'UNKNOWN',
    color: {
        R: 255,
        G: 255,
        B: 255
    }
};

let rotateMobileImg;
let gsm = new GameStateManager();
let soundtrack_cowboy;
let soundtrack_cowboy_underwater;

addEventListener("click", function() {
    if(!isFullscreen()) {
        enableFullscreen();
    }
});

function saveConfig() {
    localStorage['config'] = JSON.stringify(config);
}

function loadConfig() {
    data = JSON.parse(localStorage.getItem('config'));
    if(data !== null) {
        config = data;
    }
}

function preload() {
    soundFormats('mp3', 'ogg');
    bite = loadSound('sounds/bite.mp3');
    rotateMobileImg = loadImage('images/rotate.png');
    soundtrack_cowboy = loadSound('sounds/cowboy.mp3');
    soundtrack_cowboy_underwater = loadSound('sounds/cowboy-underwater.mp3');
    loadConfig();
}

function setup() {
    createCanvas(windowWidth, windowHeight);
    gsm.init();
    gsm.changeState('menu', true);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    clear();
    if(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || debug) {
        if(windowHeight <= windowWidth) {
            if(isFullscreen()) {
                gsm.draw();
            } else {
                background(0);
                textSize(32);
                textAlign(CENTER);
                fill(255);
                textSize(32);
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
    let segNum = 5;
    let segLength = 10;
    let thickness = 10;
    let x = [];
    let y = [];

    for (let i = 0; i < segNum; i++) {
        x[i] = windowWidth / 2;
        y[i] = windowHeight / 2;
    }

    this.draw = function() {
        push();
        strokeWeight(thickness);
        stroke(config.color.R, config.color.G, config.color.B, 100);
        this.dragSegment(0, mouseX, mouseY);
        for(let i=0; i < x.length - 1; i++) {
            this.dragSegment(i + 1, x[i], y[i]);
        }
        pop();
    };

    this.dragSegment = function(i, xin, yin) {
        let dx = xin - x[i];
        let dy = yin - y[i];
        let angle = atan2(dy, dx);
        x[i] = xin - cos(angle) * segLength;
        y[i] = yin - sin(angle) * segLength;
        this.drawSegment(x[i], y[i], angle);
    };

    this.drawSegment = function(x, y, a) {
        push();
        translate(x, y);
        rotate(a);
        line(0, 0, segLength, 0);
        pop();
    };

    this.incSegNum = function(count = 1) {
        for(let i = 1; i <= count; i++) {
            x[segNum + i - 1] = x[segNum + i - 2];
            y[segNum + i - 1] = y[segNum + i - 2];
        }
        segNum += count;
    };

    /*this.incSegLength = function(length = 1) {
        segLength += length;
    };*/
}

function Enemy(x, y, velX, velY) {
    this.size = 10;
    this.x = x;
    this.y = y;
    this.velX = velX;
    this.velY = velY;

    this.draw = function() {
        this.x += this.velX;
        this.y += this.velY;

        ellipse(this.x, this.y, this.size, this.size);

        if(this.x > windowWidth || this.x < 0 || this.y < 0 || this.y > windowHeight) {
            this.randomPos();
        }
    };

    this.randomPos = function() {

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
        this.states['play'] = new PlayState();
        this.states['menu'] = new MenuState();
        this.states['menuSettings'] = new MenuSettingsState();
        this.states['deathState'] = new DeathState();
    };

    this.draw = function() {
        //console.log(this.activeState);
        if(this.activeState !== undefined) {
            this.states[this.activeState].draw();
        }
    };

    this.changeState = function(state, init = false, params = {}) {
        this.activeState = state;
        if(init) {
            this.states[this.activeState].init(params);
        }
    }
}

function MenuState() {
    this.init = function(params) {
        this.menu = new Menu();

        this.menu.addButton(
            new MenuButton("START GAME", function() {
                gsm.changeState('play', true);
            })
        );

        /*this.menu.addButton(
            new MenuButton("HIGHSCORES", function() {
                gsm.changeState('play', true);
            })
        );*/

        this.menu.addButton(
            new MenuButton("SETTINGS", function() {
                gsm.changeState('menuSettings', true);
            })
        );
    };

    this.draw = function() {
        this.menu.draw();
    }
}

function MenuSettingsState() {
    this.init = function(params) {
        this.menu = new Menu();

        this.menu.addButton(
            new MenuButton('USERNAME', function() {
                let input = prompt("Please enter your name:", config.username);
                if (input != null && input !== "") {
                    config.username = input;
                }
            })
        );
        this.menu.addButton(
            new Slider(255, config.color.R)
        );
        this.menu.addButton(
            new MenuButton("BACK", function() {
                saveConfig();
                gsm.changeState('menu', true);
            })
        );
    };

    this.draw = function() {
        this.menu.draw();
    }
}

function Food(x, y) {
    this.SIZE = 30;
    this.x = x;
    this.y = y;

    this.draw = function() {
        push();
        noStroke();
        fill(255, 0, 0);
        ellipse(this.x, this.y, this.SIZE, this.SIZE);
        pop();
    }
}

function PlayState() {
    let snake;
    let started;
    let fingerReleased;
    let score;
    let startTime;
    let food;

    this.spawnFood = function() {
      let x = Math.floor((Math.random() * windowWidth) + 1);
      let y = Math.floor((Math.random() * windowHeight) + 1);
      food = new Food(x, y);
    };

    this.init = function(params) {
        score = 0;
        snake = new Snake();
        started = false;
        fingerReleased = false;
        this.spawnFood();
    };

    this.draw = function() {
        if(started) {
            if(!mouseIsPressed) {
                soundtrack_cowboy.stop();
                gsm.changeState('deathState', true, {'score': score, 'duration': performance.now() - startTime});
            }

            background(0);
            food.draw();
            snake.draw();
            textAlign(CENTER);
            textSize(32);
            text(score, windowWidth / 2, 50);
            if(collidePointCircle(mouseX, mouseY, food.x, food.y, 50)) {
                score++;
                this.spawnFood();
                bite.play();
                bite.setVolume(1);
                snake.incSegNum();
            }
        } else {
            if(mouseIsPressed) {
                if(fingerReleased) {
                    if(collidePointCircle(mouseX, mouseY, windowWidth / 2, windowHeight / 2, 50)) {
                        started = true;
                        soundtrack_cowboy.play();
                        soundtrack_cowboy.setVolume(0.35);
                        startTime = performance.now();
                    }
                }
            } else {
                if(!fingerReleased) {
                    fingerReleased = true;
                }
            }
            this.drawInstructionsBeforeGame();
        }
    };

    this.drawInstructionsBeforeGame = function() {
        background(0);
        fill(255);
        ellipse(windowWidth / 2, windowHeight / 2, 50, 50);
        textAlign(CENTER);
        textSize(32);
        text("TO START PUT FINGER HERE", windowWidth / 2, windowHeight / 2 + 100);
    };
}

function DeathState() {
    const TIME_PER_SCORE = 3500;
    const TIME_DEPENDENCY_MULT = 30;
    const HIGHSCORE_PRINT_LIMIT = 7;
    const SCOREBOARD_OFFSET = 50;
    let score;
    let duration;
    let finalScore;
    let rank;
    let released;
    let isHighscoreSceneActive;
    let highscores;
    let last;
    let self = this;

    this.init = function(params) {
        released = false;
        rank = 'LOADING';
        finalScore = 'LOADING';
        highscores = 'LOADING';
        isHighscoreSceneActive = false;
        soundtrack_cowboy_underwater.play();
        soundtrack_cowboy_underwater.setVolume(1);
        score = params.score;
        duration = params.duration;
        if(score !== 0) {
            finalScore = Math.round(((score * 100) + ((TIME_PER_SCORE / (duration / score)  * TIME_DEPENDENCY_MULT))) * 100) / 100;

            let jqxhr = $.ajax({
                url: ADD_HIGHSCORE_URL,
                type: "GET",
                data: {
                    hash_key: HASH_KEY,
                    name: config.username,
                    score: finalScore
                }
                /*success: function(data) {
                }*/
            })
                .done( function(data) {
                    console.log(data);
                    rank = data.rank;
                    last = data.last;
                })
                .then( function(data) {
                    self.loadHighscores();
                });

        } else {
            finalScore = 0;
            rank = -1;
            self.loadHighscores();
        }
    };

    this.draw = function() {
        if(!mouseIsPressed) {
            released = true;
        }

        if(!isHighscoreSceneActive) {
            background(0);
            textAlign(CENTER);
            textSize(96);
            fill(255);
            text(finalScore, windowWidth / 2, 200);
            textSize(32);
            text('RANK: ' + (rank === -1 ? 'OUT OF RANGE :(' : rank), windowWidth / 2, 350);

            if(this.isClicked()) {
                isHighscoreSceneActive = true;
            }
        } else {
            if(this.isClicked()) {
                soundtrack_cowboy_underwater.stop();
                gsm.changeState('menu', true);
            }

            background(0);
            if(highscores !== 'LOADING') {
                console.log(Math.min(HIGHSCORE_PRINT_LIMIT, last));
                for(let i = 0; i < highscores.length; i++) {
                    if(rank === this.getOffset() + i + 1 && rank !== -1) {
                        fill(255, 0, 0);
                    } else {
                        fill(255);
                    }

                    textAlign(CENTER);
                    textSize(40);
                    text('SCOREBOARD',windowWidth / 2, 40 );

                    textAlign(LEFT);
                    textSize(32);
                    text((this.getOffset() + i + 1) + '.', 20, (i + 1) * 40 + SCOREBOARD_OFFSET);
                    text(highscores[i].name, 100, (i + 1) * 40 + SCOREBOARD_OFFSET);
                    text(parseFloat(Math.round(highscores[i].score * 100) / 100).toFixed(2), windowWidth - 150, (i + 1) * 40 + SCOREBOARD_OFFSET);
                }
            }
        }
    };

    this.isClicked = function() {
        if(mouseIsPressed) {
            if(released) {
                released = false;
                return true;
            }
        }
        return false;
    };

    this.loadHighscores = function() {
        let jqxhr = $.ajax({
            url: GET_HIGHSCORE_URL,
            type: "GET",
            data: {
                hash_key: HASH_KEY,
                limit: HIGHSCORE_PRINT_LIMIT,
                offset: this.getOffset(),
                ts: $.now()
            },
            success: function(data) {
                console.log(data);
                highscores = data;
            }
        })
    };

    this.getOffset = function() {
        let offset = 0;
        if(rank !== -1) {
            offset = rank - ((HIGHSCORE_PRINT_LIMIT - 1) / 2) - 1;
        }
        return Math.max(Math.min(offset, Math.max(last - HIGHSCORE_PRINT_LIMIT, 0)), 0);
    }
}

function Menu() {
    let buttons = [];
    let level = 1;
    let released = false;

    this.draw = function() {
        if(!mouseIsPressed) {
            released = true;
        }
        for(let i = 0; i < buttons.length; i++) {
            buttons[i].draw(this.isClicked());
        }
    };

    this.addButton = function(btn) {
        btn.level = level;
        buttons.push(btn);
        level++;
    };

    this.isClicked = function() {
        if(mouseIsPressed) {
            if(released) {
                return true;
            }
        }
        return false;
    };

}

function MenuButton(desc, action) {
    const WIDTH = windowWidth * 0.9;
    const HEIGHT = 50;
    const SPACE_HEIGHT = 100;
    const START_HEIGHT = 0;
    const FONT_SIZE = 32;
    this.text = desc;
    this.level = -1;
    this.action = action;

    this.draw = function(clicked) {
        let r = this.getRect();
        if(clicked && collidePointRect(mouseX, mouseY, r.x, r.y, r.width, r.height)) {
            console.log("???");
            this.action();
        } else {
            fill(0);
            rect(r.x, r.y, r.width, r.height);
            textAlign(CENTER);
            textSize(FONT_SIZE);
            fill(255);
            text(this.text, this.getX(), this.getY());
        }
    };

    this.getY = function() {
        return START_HEIGHT + this.level * SPACE_HEIGHT;
    };

    this.getX = function() {
        return windowWidth / 2;
    };

    this.getRect = function() {
        return {
            x: windowWidth / 2 - WIDTH / 2,
            y: this.getY() - FONT_SIZE / 3 - HEIGHT / 2,
            width: WIDTH,
            height: HEIGHT
        };
    };
}

function Slider(max, defaultValue) {
    const WIDTH = windowWidth * 0.9;
    const SLIDER_HEIGHT = 50;
    const SLIDER_WIDTH = 5;
    const SPACE_HEIGHT = 100;
    const START_HEIGHT = 0;
    const HOLD_WIDTH = 20;
    let maxValue = max;
    this.level = -1;
    this.value = defaultValue;
    let holding = false;

    this.draw = function(clicked) {
        push();
        if(this.value === 255) {
            config.color.R = 255;
            config.color.G = 255;
            config.color.B = 255;
            stroke(0);
            fill(0);
        } else {
            config.color.R = this.value;
            config.color.G = 100;
            config.color.B = 100;
            stroke(config.color.R, config.color.G, config.color.B);
            fill(config.color.R, config.color.G, config.color.B);
        }
        strokeWeight(5);
        line(windowWidth / 2 - WIDTH / 2, this.getY() , windowWidth / 2 + WIDTH / 2, this.getY());
        let slider = this.getSlider();
        rect(slider.x, slider.y, slider.width, slider.height);
        if(clicked && collidePointRect(mouseX, mouseY, slider.x, slider.y, slider.width, slider.height)) {
            holding = true;
        }
        pop();

        if(holding) {
            this.value = ((mouseX - (this.getX() - WIDTH / 2)) / WIDTH) * maxValue;
            if(this.value < 0) {
                this.value = 0;
            } else if(this.value > maxValue) {
                this.value = maxValue;
            }
        }
        console.log(this.value);

        if(!mouseIsPressed) {
            holding = false;
        }
    };

    this.getY = function() {
        return START_HEIGHT + this.level * SPACE_HEIGHT - SLIDER_HEIGHT / 3;
    };

    this.getX = function() {
        return windowWidth / 2;
    };

    this.getSlider = function() {
        return {
            x: windowWidth / 2 - WIDTH / 2 + WIDTH * (this.value / maxValue),
            y: this.getY() - SLIDER_HEIGHT / 2,
            width: SLIDER_WIDTH + HOLD_WIDTH,
            height: SLIDER_HEIGHT
        };
    };
}

String.prototype.trunc = String.prototype.trunc ||
    function(n){
        return (this.length > n) ? this.substr(0, n-1) + '&hellip;' : this;
    };
