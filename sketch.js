// globals
const DIM = 20;

const tiles = [];
const tileImages = [];

const CDIM = 400;

let grid = [];

const BLANK = 0;
const UP = 1;
const RIGHT = 2;
const DOWN = 3;
const LEFT = 4;


function preload() {
    for(let i = 0; i < 13; i++){
        tileImages[i] = loadImage(`${i}.png`);
    }

}

function mouseClicked() {
    startOver();
}

function setup() {
    createCanvas(CDIM,CDIM);
    // A is black
    // B is yellow
    // C is red
    // D is blue
    // E is white
    tiles[0] = new Tile(tileImages[0], ["AAA","AAA","AAA","AAA"]);
    tiles[1] = new Tile(tileImages[1], ["BBB","BBB","BBB","BBB"]);
    tiles[2] = new Tile(tileImages[2], ["ABB","BBB","BBA","AAA"]);
    tiles[3] = new Tile(tileImages[3], ["AAA","ABB","BBA","AAA"]);
    tiles[4] = new Tile(tileImages[4], ["CCC","CCC","CCC","CCC"]);
    tiles[5] = new Tile(tileImages[5], ["ACC","CCC","CCA","AAA"]);
    tiles[6] = new Tile(tileImages[6], ["AAA","ACC","CCA","AAA"]);
    tiles[7] = new Tile(tileImages[7], ["DDD","DDD","DDD","DDD"]);
    tiles[8] = new Tile(tileImages[8], ["ADD","DDD","DDA","AAA"]);
    tiles[9] = new Tile(tileImages[9], ["AAA","ADD","DDA","AAA"]);
    tiles[10] = new Tile(tileImages[10], ["EEE","EEE","EEE","EEE"]);
    tiles[11] = new Tile(tileImages[11], ["AEE","EEE","EEA","AAA"]);
    tiles[12] = new Tile(tileImages[12], ["AAA","AEE","EEA","AAA"]);


    // rotate all tiles
    for (let i = 2; i < 14; i++) {
        for (let j = 1; j < 4; j++) {
          tiles.push(tiles[i].rotate(j));
        }
      }

    for (let i = 0; i < tiles.length ; i++) {
        const tile = tiles[i];
        tile.analyze(tiles);
    }
    startOver();
}

function startOver() {
    // Create cell for each spot on the grid
    for (let i = 0; i < DIM * DIM; i++) {
        grid[i] = new Cell(tiles.length);
  }
}

function checkValid(arr, valid) {
    // valid = [blank, right]
    // arr: [b,u,r,d,l]
    // result in removing u,d,l from arr
    for (let i = arr.length - 1; i >= 0; i--) {
        let element = arr[i];
        if (!valid.includes(element)){
            arr.splice(i,1);
        }
    }
}

function draw() {
    noSmooth();
    background(0);

    const w = width / DIM;
    const h = height / DIM;
    for(let j = 0; j < DIM; j++) {
        for (let i = 0; i < DIM; i++) {
            let cell = grid[i+j*DIM];
            if (cell.collapsed) {
                let index = cell.options[0];
                image(tiles[index].img, i*w,j*h, w, h)
            }
            else {
                fill(0);
                stroke(100);
                rect(i*w,j*w, w,h)
            }
        }
    }

    // pick cell with least entropy
    let gridCopy = grid.slice();
    gridCopy = gridCopy.filter((a) => !a.collapsed);

    if (grid.length == 0) {
        return;
    }

    gridCopy.sort((a,b) => {
        return a.options.length - b.options.length;
    });
    
    let len = gridCopy[0].options.length;
    let stopIndex = 0;
    for (let i = 1; i < gridCopy.length; i++) {
        if (gridCopy[i].options.length > len) {
            stopIndex = i;
            break;
        }
    }
    if (stopIndex > 0) gridCopy.splice(stopIndex);

    const cell = random(gridCopy);
    cell.collapsed = true;
    const pick = random(cell.options);
    if (pick === undefined) {
        startOver(); 
        return;
    }
    cell.options = [pick];


    // evaluating new entropy

    const nextGrid = []
    for (let j = 0; j < DIM; j++) {
        for (let i = 0; i < DIM; i++) {
            let index = i + j*DIM;
            if (grid[index].collapsed) {
                nextGrid[index] = grid[index];
            }
            else {
                let options = new Array(tiles.length).fill(0).map((x,i) => i);
                // look up
                if (j > 0) {
                    let up = grid[i + (j-1)*DIM];
                    let validOptions = [];
                    for (let option of up.options) {
                        let valid = tiles[option].down;
                        validOptions = validOptions.concat(valid);
                     }
                    checkValid(options, validOptions);
                    }
                    
                // look right
                if (i < DIM - 1) {
                    let right = grid[i + 1 + (j)*DIM];
                    let validOptions = [];
                    for (let option of right.options) {
                        let valid = tiles[option].left;
                        validOptions = validOptions.concat(valid);
                     }
                    checkValid(options, validOptions);
                    }
                // look down
                if (j < DIM - 1) {
                    let down = grid[i + (j+1)*DIM];
                    let validOptions = [];
                    for (let option of down.options) {
                        let valid = tiles[option].up;
                        validOptions = validOptions.concat(valid);
                     }
                    checkValid(options, validOptions);
                    }
               // look left
               if (i > 0) {
                let left = grid[i - 1 + (j)*DIM];
                let validOptions = [];
                for (let option of left.options) {
                    let valid = tiles[option].right;
                    validOptions = validOptions.concat(valid);
                 }
                checkValid(options, validOptions);
                }
            nextGrid[index] = new Cell(options);
            }
        }
    }
    grid = nextGrid;
}

