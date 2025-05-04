
class InnerGame {
    #board;
    #name;
    #winningSymbol = "";
    #gameOver = false;
    // #nextGame = 0;
    // #currentGame = 0;

    constructor(name) {
        this.#name = name;
        this.#board = [];
        for (let rij = 0; rij < 3; rij++) {
          this.#board[rij] = [];
          for (let kol = 0; kol < 3; kol++) {
            this.#board[rij][kol] = '';
          }
        }
    }

    get gameOver() {
        return this.#gameOver;
    }

    get board() {
        return this.#board;
    }

    get name() {
        return this.#name;
    }

    get winningSymbol() {
        return this.#winningSymbol;
    }

    putSymbool(symbol, row, col) {
        this.#board[row][col] = symbol;
        if(this.hasThreeInARow()){
            this.#winningSymbol = symbol;
            this.#gameOver = true;
        }
        if(this.completed() && this.#winningSymbol === ""){
            this.#winningSymbol = "/";
            this.#gameOver = true;
        }
        // test
        console.log(`${this.#name} winner : ${this.#winningSymbol}`);
        // end test
        if(OuterGame.symbol === "O"){
            OuterGame.symbol = "X";
        }else{
            OuterGame.symbol = "O";
        }
    }
    
    fetchSymbol(row, col) {
        return this.#board[row][col];
    }
    
    isFree(row, col) {
        return !this.#board[row][col];
    }

    toHtml() {
        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 3; col++) {
                const symbol = this.fetchSymbol(row, col);
                const id = '_' + this.#name.substring(4) + [row + 1, col + 1].join("");
                document.getElementById(id).src = `./images/${
                    symbol ? symbol : "blank"
                }.png`;
                if(this.#gameOver){
                    // set opacity of element
                    document.getElementById(id).style.opacity = "25%";

                    // show the overlay image with a little time-out
                    let gameNumber = this.#name.substring(this.#name.length-1);
                    const imageElement = document.getElementById(`_${gameNumber}00`);
                    
                    setTimeout(() => {
                        imageElement.src = this.#winningSymbol === "/" ?
                        `./images/draw_transparant02.png`: this.#winningSymbol === "O" ?
                        `./images/o_transparant.png` : `./images/x_transparant.png`;
                        imageElement.style.display = "unset";
                    }, 2500);
                }
            }
        }
    }

    hasThreeInARow(){
        let rowCheck = false;
        for (let row = 0; row < 3; row++) {
            if(this.equalCheck(this.#board[row])) rowCheck = true;
        }
        let colCheck = false;
        if (this.equalCheck([this.#board[0][0], this.#board[1][0], this.#board[2][0]]) || this.equalCheck([this.#board[0][1], this.#board[1][1], this.#board[2][1]])|| this.equalCheck([this.#board[0][2], this.#board[1][2], this.#board[2][2]])){
            colCheck = true;
        }
        let diagCheck = false;
        if (this.equalCheck([this.#board[0][0], this.#board[1][1], this.#board[2][2]]) || this.equalCheck([this.#board[0][2], this.#board[1][1], this.#board[2][0]])){
            diagCheck = true;
        }
        return (colCheck || rowCheck || diagCheck);
    }

    equalCheck(charArray){
        let tokens = ["O", "X"];
        let [a, b, c] = charArray;
        if(!tokens.includes(a)){
            return false;
        }else{
            return (a === b && b === c);
        }
    }

    completed() {
        return this.#board.every((row) => {
          return row[0] && row[1] && row[2];
        });
    }
}

class OuterGame {
    #completed = false;
    #gameOver = false;
    #winningSymbol = "";
    #innerGames;
    #outerGameSymbols = [];
    //next & current game are numbers 1-9, (firstmove needed for classlist-modification?) see this.#toHtml
    #nextGame;
    #currentGame;
    // #firstMove = true;
    static xCount = 0;
    static oCount = 0;
    static symbol = "O";

    constructor() {
        this.#innerGames = new Map([
            ['game1', new InnerGame('game1')],
            ['game2', new InnerGame('game2')],
            ['game3', new InnerGame('game3')],
            ['game4', new InnerGame('game4')],
            ['game5', new InnerGame('game5')],
            ['game6', new InnerGame('game6')],
            ['game7', new InnerGame('game7')],
            ['game8', new InnerGame('game8')],
            ['game9', new InnerGame('game9')],
        ]);
        const imgElementen = document.getElementsByTagName("img");
        for (const img of imgElementen) {
            if(img.id.indexOf("0") === -1){
                img.onclick = () => {
                const [gameNumber, row, col] = img.id.substring(1);
                const game = this.#innerGames.get(`game${gameNumber}`);
                if(!this.#gameOver && !game.gameOver && game.isFree(row-1, col-1)){
                    game.putSymbool(OuterGame.symbol, row - 1, col - 1);
                    this.#setNextGame(parseInt(gameNumber), row - 1, col - 1);
                }
                this.#checkScore();
                this.#toHtml();
                };
            }
        }
    }

    #checkScore(){
        let completedGames = 0;
        let oWins = 0;
        let xWins = 0;
        for (const value of this.#innerGames.values()) {
            // completed != gameOver
            if(value.completed() || value.gameOver){
                completedGames += 1;
            }
            if(value.gameOver){
                switch (value.winningSymbol) {
                    case "O": oWins += 1;
                        break;
                    case "X": xWins += 1;
                        break;
                }
                // outer Game - adding x-o-x 3x3 array
                let index = parseInt(value.name.substring(4)); // examples: game1; game2 ... game9 (1-based)
                this.#outerGameSymbols[index-1] = value.winningSymbol;
                //TEST
                // console.log(this.#outerGameSymbols);
            }
        }
        OuterGame.oCount = oWins;
        OuterGame.xCount = xWins;

        if(completedGames === 9) this.#completed = true;
        this.#outerThreeInARow();
        
    }

    //moved from innergame class to outergame class
    #setNextGame(gameNumber, row, col){
        //["00", "01", "02"] -> game#[1, 2, 3]
        //["10", "11", "12"]         [4, 5, 6]
        //["20", "21", "22"]         [7, 8, 9]
        let locArr = ["00", "01", "02", "10", "11", "12", "20", "21", "22"];
        let location = String(row).concat(col);
        this.#currentGame = gameNumber;
        this.#nextGame = locArr.indexOf(location) + 1; // index -> game number
    }

    //todo -> add conditions to give the right feedback for outer-3in a row
    #toHtml() {

        document.getElementById("feedback").innerText = `Speler ${OuterGame.symbol} is aan de beurt.`
        for (const value of this.#innerGames.values()) {
            value.toHtml();
        }

        // feedback next game setbackground style:
        if(!this.#gameOver && !this.#completed){
            let currentGame = document.getElementById(`game${this.#currentGame}`);
            let nextGame = document.getElementById(`game${this.#nextGame}`);
            // assumption: error can happen if removing a nonexistant class from classlist, I'll move forward on the assumption it doesn't cause an error
            // only in 1st move you need to remove "gray" from classlist
            // if(this.#firstMove){
            //     nextGame.classList.add("gray");
            //     this.#firstMove = false;
            // }else{
            // }

            // remove all -> reason: if player chooses to play in the wrong minigame, only hint
            // at the next game they should play in <currentGame.classList.remove("gray");> -> will not work
            // if player chose to play in the wrong game, currentgame would'nt be the gray game
            [...document.getElementsByClassName("gray")].forEach((element) => {
                element.classList.remove("gray");
            });
            nextGame.classList.add("gray");
        }
        // remove style on final move
        if(this.#completed || this.#gameOver){
            [...document.getElementsByClassName("gray")].forEach((element) => {
                element.classList.remove("gray");
            });
        }
        // end feedback next game

        //winner message
        if(this.#gameOver){
            //TODO
            if(OuterGame.symbol === "X"){
                document.getElementById("feedback").innerText = `Speler O is gewonnen !!`;
            }else{
                document.getElementById("feedback").innerText = `Speler X is gewonnen !!`;
            }
        }

        // tie-breaker winner message (winner is whoever has most won minigames)
        if(!this.#gameOver && this.#completed){
            let winner = OuterGame.oCount > OuterGame.xCount ? "O" : OuterGame.oCount < OuterGame.xCount ?
            "X" : "/";
            //de switch-case werkt niet, maar de if-else wel...
            // switch (winner) {
            //     case "O", "X": document.getElementById("feedback").innerText = `Speler ${winner} is gewonnen !!`;
            //         break;
            //     case "/": document.getElementById("feedback").innerText = `Het spel is geëindigd op een gelijkstand !!`;
            //         break;
            // }
            if(winner === "/"){
                document.getElementById("feedback").innerText = `Het spel is geëindigd op een gelijkstand !!`;
            }else{
                document.getElementById("feedback").innerText = `Speler ${winner} is gewonnen !!`;
            }
        }

    }
    // set this.gameOver = true if 3-in a row
    #outerThreeInARow(){
        let threeInARow = false;
        const [a, b, c, d, e, f, g, h, i] = this.#outerGameSymbols;
        //[0 1 2    (1-dimensional)
        // 3 4 5
        // 6 7 8]

        // variables: array destructuring (numbers can't be variables)
        //[a b c
        // d e f
        // g h i]
        // discriminate on 1st token must != "/" AND not undefined: Boolean(a=undefined) -> false
        // 0=1=2 or 3=4=5 or 6=7=8 (rows)
        // a=b=c or d=e=f or g=h=i
        // (a!="/" && a===b && b===c) || (d!="/" && d===e && e===f) || (g!="/" && g===h && h===i)
        if((a && a!="/" && a===b && b===c) || (d && d!="/" && d===e && e===f) || (g && g!="/" && g===h && h===i)) threeInARow=true;
        // 0=3=6 or 1=4=7 or 2=5=8 (columns)
        // a=d=g or b=e=h or c=f=i
        // (a!="/" && a===d && d===g) || (b!="/" && b===e && e===h) || (c!="/" && c===f && f===i)
        if((a && a!="/" && a===d && d===g) || (b && b!="/" && b===e && e===h) || (c && c!="/" && c===f && f===i)) threeInARow=true;
        // 0=4=8 or 2=4=6 (diagonal)
        // a=e=i or c=e=g
        // (a!="/" && a===e && e===i) || (c!="/" && c===e && e===g)
        if((a && a!="/" && a===e && e===i) || (c && c!="/" && c===e && e===g)) threeInARow=true;

        if(threeInARow){
            this.#gameOver = true;
            console.log("GAME OVER");
        } 
    }
}

class SuperTTTComponent {
    #outerGame;

    constructor() {
        this.#outerGame = new OuterGame();
    }

}

function init() {
    const component = new SuperTTTComponent();
}
  
window.onload = init;