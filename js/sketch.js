var x = [],
    y = [],
    segNum = 10,
    segLength = 18;

for (var i = 0; i < segNum; i++) {
    x[i] = 0;
    y[i] = 0;
}

var cnt = 0;
var bite;
var foodX = 500;
var foodY = 500;
var fullscreen = false;

function setup() {
    createCanvas(windowWidth, windowHeight);
    soundFormats('mp3', 'ogg');
    bite = loadSound('sounds/bite.mp3');
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function spawnFood() {
    foodX = random(windowWidth);
    foodY = random(windowHeight);
}

function draw() {
    cnt++;
    background(0);
    if(cnt > 20) {
        cnt = 0;
        //incSegNum();
    }
    strokeWeight(9);
    stroke(255, 100);
    dragSegment(0, mouseX, mouseY);
    for( var i=0; i<x.length-1; i++) {
        dragSegment(i+1, x[i], y[i]);
    }
    strokeWeight(0);
    noStroke();
    ellipse(foodX, foodY, 50, 50);

    if(collidePointCircle(mouseX,mouseY,foodX, foodY, 50)) {
        incSegNum();
        bite.play();
        spawnFood();
    }
}

function incSegNum(count = 1) {
    for(var i = 1; i <= count; i++) {
        x[segNum + i - 1] = x[segNum + i - 2];
        y[segNum + i - 1] = y[segNum + i - 2];
    }
    segNum += count;
}

function incSegLength(length = 1) {
    segLength += length;
}

function dragSegment(i, xin, yin) {
    var dx = xin - x[i];
    var dy = yin - y[i];
    var angle = atan2(dy, dx);
    x[i] = xin - cos(angle) * segLength;
    y[i] = yin - sin(angle) * segLength;
    segment(x[i], y[i], angle);
}

function segment(x, y, a) {
    push();
    translate(x, y);
    rotate(a);
    line(0, 0, segLength, 0);
    pop();
}

addEventListener("click", function() {
    var el = document.documentElement,
        rfs = el.requestFullscreen
            || el.webkitRequestFullScreen
            || el.mozRequestFullScreen
            || el.msRequestFullscreen
    ;

    rfs.call(el);

    spawnFood();
});