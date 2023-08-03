
// 1. Global Variables

// Maintains the speed of the solver in ms. Defualt to 100ms.
var SOLVER_SPEED = 1;
var IS_SOLVING = false;

// The Game Board. The users interact with this
var board = [
                [0, 0, 0, 2, 6, 0, 7, 0, 1],
                [6, 8, 0, 0, 7, 0, 0, 9, 0],
                [1, 9, 0, 0, 0, 4, 5, 0, 0],
                [8, 2, 0, 1, 0, 0, 0, 4, 0],
                [0, 0, 4, 6, 0, 2, 9, 0, 0],
                [0, 5, 0, 0, 0, 3, 0, 2, 8],
                [0, 0, 9, 3, 0, 0, 0, 7, 4],
                [0, 4, 0, 0, 5, 0, 0, 3, 6],
                [7, 0, 3, 0, 1, 8, 0, 0, 0]
            ];

// This is used to reset the board to it's original state.
var original_board = [
                        [0, 0, 0, 2, 6, 0, 7, 0, 1],
                        [6, 8, 0, 0, 7, 0, 0, 9, 0],
                        [1, 9, 0, 0, 0, 4, 5, 0, 0],
                        [8, 2, 0, 1, 0, 0, 0, 4, 0],
                        [0, 0, 4, 6, 0, 2, 9, 0, 0],
                        [0, 5, 0, 0, 0, 3, 0, 2, 8],
                        [0, 0, 9, 3, 0, 0, 0, 7, 4],
                        [0, 4, 0, 0, 5, 0, 0, 3, 6],
                        [7, 0, 3, 0, 1, 8, 0, 0, 0]
                    ];

// The Solution of the Board.
var solution = [];



/*
An array of arrays that holds the cell DOM elements. 
If we want to make changes to the cells  in the DOM, 
this is a quick way to do so.
*/
var cells = [];

// The cell that is selected by the user or the computer when solving.
var activeCell = null;


var controller = new AbortController();


// FUNCTIONS
// Utility Functions

/*
    Function: isPossible
    Parameters: 
        row, col -> row and column number of the cell
        val -> The val that needs to be checked.

    Return Value:
        true -> if val is possible to insert at row, col without conflict
        false -> not possible

    Function Description:
        This function checks whether a value is possible to insert at baord[row][col] without
        a conflict of values of cells in the respective column, row and square. Returns true or 
        false based on the result.

    NOTE: This function expects, that the val has not yet been inserted into the board.
          Meaning board[row][col] = val has NOT yet been performed.
				
*/
function isPossible(row, col, val){
    // Checking Row 
    for (let i = 0; i < 9.; i++) {
        if (board[row][i] == val) return false;
    }

    // Checking Column
    for (let i = 0; i < 9.; i++) {
        if (board[i][col] == val) return false;
    }

    // Checking the Squares
    // To do this, I thought of each square as one big cell. 
    // and numbered them in the following fashion:
    
    /*
         _ _ _   _ _ _   _ _ _  
        |      |       |       |
        |  00  |  01   |  02   |
        |      |       |       | 
         _ _ _   _ _ _   _ _ _
        |      |       |       |
        |  10  |  11   |  12   |
        |      |       |       |
         _ _ _   _ _ _   _ _ _
        |      |       |       |
        |  20  |  21   |  22   |
        |      |       |       |
         _ _ _   _ _ _   _ _ _  

    */

    sq_row = Math.floor(row/3);
    sq_col = Math.floor(col/3);

    for (let i = sq_row*3; i < (sq_row*3)+3; i++) {
        for (let j = sq_col*3; j < (sq_col*3)+3; j++) {
            if(board[i][j] == val) return false;
        }
        
    }

    return true;
    
}

/*
    Function: findDuplicates
    Parameters: 
        row, col -> row and column number of the cell
        val -> The val that needs to be checked.

    Return Value:
        Array [Array [int row, int col]] -> Array of matching value cell's 
                                            position in the form of [row, col]

    Function Description:
        This function is similar to the isPossible function, but instead of returning true/false
        it returns an array of the value matching cells position.

    NOTE: This function expects, that the val has not yet been inserted into the board.
          Meaning board[row][col] = val has NOT yet been performed.
				
*/
function findDuplicates(row, col, val){
    duplicates = [];

    // Checking Row 
    for (let i = 0; i < 9.; i++) {
        if (board[row][i] == val) {
            duplicates.push([row, i]);
        }
    }

    // Checking Column
    for (let i = 0; i < 9.; i++) {
        if (board[i][col] == val) {
            duplicates.push([i, col]);
        }
    }


    sq_row = Math.floor(row/3);
    sq_col = Math.floor(col/3);

    for (let i = sq_row*3; i < (sq_row*3)+3; i++) {
        for (let j = sq_col*3; j < (sq_col*3)+3; j++) {
            if(board[i][j] == val) {
                duplicates.push([i, j]);
            }
        }
        
    }

    return duplicates;
}

/*
    Function: findEmptyCell
    Parameters: N/A

    Return Value: 
        Array [int, int] -> 
            An array of the row, col number of the next empty cell.
            If no empty cell is avaialbe returns [-1, -1]


    Function Description:
        This function finds the next empty cell in the board, 
        and returns its position as an array of two items [row, col].
*/
function findEmptyCell(){
    for (let i = 0; i < 9; i++) {
        for(let j=0; j<9; j++){
            if(board[i][j] == 0){
                return [i, j];
            }
        }
    }

    // where there is no more empty cells.
    return [-1, -1]
}

/*
    Function: markErrorCells
    
    Function Description:
        for a value at position row, col, this function finds the duplicate values in the 
        column, row, and square, and marks them with the error animation by adding the
        .error class to the cell. It adds .prefill-error instead of .error to the 
        prefilled cells.

    Parameters: 
        row, col -> row and column number of the cell
        val -> The val that needs to be checked.

    Return Value: 
        true -> At least one cell was marked error
        false -> otherwise.


*/

function markErrorCells(row, col, val) {
    // If there is a duplicat value in the col, row or square, we add an animation
    duplicate_positions = findDuplicates(row, col, val);

    if (duplicate_positions.length != 0) {
        duplicate_positions.forEach(pos => {
            duplicateCell = document.getElementById(`${pos[0]}${pos[1]}`);
            if(duplicateCell.classList.contains("prefill")){
                duplicateCell.classList.add("prefill-error");
            } else{
                duplicateCell.classList.add("error");
            }
            
            // The following code retriggers the animation for the cells that was already
            // animated once before.
            duplicateCell.style.animation = 'none';
            duplicateCell.offsetHeight;
            duplicateCell.style.animation = null;
        });

        
        return true;
    } else {
        return false;
    }


}

/*
    Function: removeErrorCells
    
    Function Description:
        If a value at position row, col is changed, this function finds the duplicate values of previous
        value in the column, row, and square, and removes the error mark by removing the 
        .error and .prefill-error class

    Parameters: 
        row, col -> row and column number of the cell
        val -> The previous value, NOT the new onw.

    Return Value: 
        N/A


*/

function removeErrorCells(row, col, val){
    duplicate_positions = findDuplicates(row, col, val);
        duplicate_positions.forEach(pos=>{

            // We are setting the value of the target cell to 0,
            // because we will be calling the isPossible function which expects the value to NOT
            // be inserted in the targetted cell. 
            // We have changed the cell's value back to it's original value later on.
            board[pos[0]][pos[1]] = 0;

            if(isPossible(pos[0], pos[1], val)){
                error_cell = document.getElementById(`${pos[0]}${pos[1]}`);

                error_cell.classList.remove("error");
                error_cell.classList.remove("prefill-error");
            }

            // Changing the cells value to its original value.
            board[pos[0]][pos[1]] = val;
        });


}

/*
    Function: resetBoard
    
    Function Description:
        This function resets the board to its original state.

    Parameters: N/A
    Return Value: N/A


*/
function resetBoard() {
    // Deep Copying the original board to the board 
    board = JSON.parse(JSON.stringify(original_board));

    // Changing the DOM board
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[1].length; col++) {
            var cell = cells[row][col];

            // Removing all sorts of external classes
            cell.classList.remove("prefill");

            cell.classList.remove("active");
            cell.classList.remove("complete-computer");

            cell.classList.remove("error");
            cell.classList.remove("prefill-error");


            

            // Set Unfilled Cells to nothing
            if(board[row][col] == 0){
                cell.innerHTML = ""
            } else {
                cell.innerHTML = board[row][col];
                cell.classList.add("prefill")
            }
        }
        
    }

}

function copySolutionToMainBoard(){
    board = JSON.parse(JSON.stringify(solution));
}

function removeBoardEventListeners(){
    window.removeEventListener('keyup', event_keyPress);

    for (let row = 0; row < cells.length; row++) {
        for (let col = 0; col < cells[0].length; col++) {
            var cell = cells[row][col];
            cell.removeEventListener('click', event_clickCells);
        }
        
    }
}

function addEventListener_keyPress(){
    // // Adding keyboard press event
    // // This event will allow users to write numbers to the selected cells
    window.addEventListener("keyup", event_keyPress);
}


function event_keyPress(e) {
    // To ensure we only edit the active selected cell.
    if (activeCell == null) return;

    if (e.key >= 1 && e.key <= 9) {
        row = parseInt(activeCell.id[0]);
        col = parseInt(activeCell.id[1]);
        previous_value = board[row][col];


        /*  
            After editing a value of the cell
            if there is a duplicat value in the col, row or square, 
            we add the error animation 
        */

        var any_cell_marked = markErrorCells(row, col, parseInt(e.key));

        if(any_cell_marked){
            // If any cell was marked, then current cell is also an error
            activeCell.classList.add("error");
        } else{
            // If the current cell was error for the previous value, 
            // but then for the current value it is no longer an error, 
            //then we need to remove the .error class
            activeCell.classList.remove("error")
        }

        // Set the new value in the board
        board[row][col] = parseInt(e.key);
        activeCell.innerHTML = e.key;


        /*
        Removing Other Error Cells that were cause by the previous 
        value (before the current edit) of the current cell. 
        */
        removeErrorCells(row, col, previous_value);

    } else if(e.key == 'Backspace' || e.key == 0){
        row = parseInt(activeCell.id[0]);
        col = parseInt(activeCell.id[1]);
        
        previous_value = board[row][col];
        board[row][col] = 0
        activeCell.innerHTML = "";

        // Removing the error mark of the active cell
        activeCell.classList.remove("error");

        // We also have to remove other error cells that was getting error as a result of the value of the current cell
        removeErrorCells(row, col, previous_value);
    }
}

function addEventListener_clickCells(){
    // Adding the click event to all empty cells. 
    // This will select a cell to be edited with numbers.
    for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
            var cell = cells[i][j];
            cell.addEventListener("click", event_clickCells);
        }
    }
    
}

function event_clickCells(e){
    if (e.target.classList.contains('prefill')){
        return;
    }

    if (activeCell != null) {
        // If any other cell was already active,  
        // we need to remove the .active class from it
        activeCell.classList.remove('active');
    }

    activeCell = e.target;
    activeCell.classList.add('active');
}



// Main Functions

/*
    Function: getNewBoard
    
    Function Description:
        Gets a new sudoku board by calling an api. It updates both the board variable
        and the sudoku variable.

    Parameters: 
        N/A

    Return Value: 
        N/A


*/
async function getNewBoard(){
    const api_call = await fetch("https://sudoku-api.vercel.app/api/dosuku");
    var api_board = await api_call.json();
    if(api_board.newboard.message != "All Ok"){
        alert("Something Went Wrong!");
    } else{
        original_board = api_board.newboard.grids[0].value;
        board = JSON.parse(JSON.stringify(original_board));
        solution = api_board.newboard.grids[0].solution;
    }
}

/*
    Function: Events Initialize
    Parameters: N/A
    Return Value: N/A

    Function Description:
        This functions adds event listeners to game. 
        Like: 
            Click events to all the cells.
            Window events for Key presses, and so on.

    NOTE: Please call this function only after cells array has been populated.
    Because it requires the baord DOM to be ready to add the events.
				
*/

function eventsInitialize(){
    // Adding the click event to all empty cells. 
    addEventListener_clickCells();


    // Adding keyboard press event
    addEventListener_keyPress();

    // Button Events
    // Button - New Game

    document.querySelector(".btn-new-game").addEventListener('click', async e=>{
        IS_SOLVING = false;
        await getNewBoard();

        // Changing the DOM board
        resetBoard();

        // Reassign events
        addEventListener_clickCells();
        addEventListener_keyPress();

    });
    
    // Button - Solve
    document.querySelector(".btn-solve").addEventListener('click', solver);

}

/* 
    Function: Game Initializer
    Parameter: N/A
    Return Value: N/A

    Function Description:
        Initializes the game by making the board. Adding Event Listeners to the cells.
        And so on.

*/
function gameInitialize(){

    // Creating the board in the DOM
    main = document.querySelector(".board");

    for (let row = 0; row < 9; row++) {
        var rows = [];
        
        rowDiv = document.createElement('div');
        rowDiv.classList.add("row");

        for (let col = 0; col < 9; col++) {
            colDiv = document.createElement('div');
            colDiv.classList.add('cell');
            colDiv.id = `${row}${col}`;
            
            if (board[row][col] != 0) {
                colDiv.innerHTML = board[row][col];
                colDiv.classList.add('prefill');
            }

            rowDiv.appendChild(colDiv);
            rows.push(colDiv);

        }

        cells.push(rows);
        main.appendChild(rowDiv);
        
    }

    // Adding the initialize events
    eventsInitialize();
}    


/* 
    Function: solve
    Parameter: N/A
    Return Value: true/false -> if the board was solved or not.

    Function Description:
        A recursive function that solves the board.

*/
async function solve() {
    if(!IS_SOLVING) return false;

    let row, col;
    [row, col] = findEmptyCell();

    if(row == -1){
        return true;
    }

    for (let val = 1; val < 10; val++){
        var activeCell = document.getElementById(`${row}${col}`);

        // Give it some time while we check if the current value has any conflict.
        // The reason we are using Promises becuase, checking for a boolean value doesn't take much 
        // time for the computer, but we want to show it the user.
        // So, this way we set a timer for timeout ms before moving to the next line of code.
        let possible_promise = new Promise((resolve)=>{
            setTimeout(()=>{
                p = isPossible(row, col, val);

                // 
                removeErrorCells(row, col, val-1);
                
                if(!p){
                    markErrorCells(row, col, val);
                }


                resolve(p);
            }, SOLVER_SPEED);
        });

        let possible = await possible_promise;

        if (possible) {
            board[row][col] = val;
            activeCell.classList.remove('active-computer');
            activeCell.classList.add('complete-computer');
            activeCell.innerHTML = val;

            let myWait = new Promise(function(resolve){
                setTimeout(function () { resolve(solve()) }, SOLVER_SPEED);
            });

            var wait = await myWait;

            if(wait != true){
                board[row][col] = 0;
                activeCell.classList.remove('complete-computer');
                activeCell.classList.add('active-computer');

            } else{
                return true;
            }
        } else {
            activeCell.classList.add('active-computer');
            // Showing the new value in the page
            activeCell.innerHTML = val;
        }
    }

    var activeCell = document.getElementById(`${row}${col}`);
    activeCell.classList.remove('active-computer');
    activeCell.innerHTML = "";
    removeErrorCells(row, col, 9)

    return false;

}

/* 
    Function: solver
    Parameter: N/A
    Return Value: N/A

    Function Description:
        This function handels all the pre and post works of solving a board, and call solve() 
        to solve the board. 

*/
async function solver(){
    // Reset the baord to it's original state
    resetBoard();

    IS_SOLVING = true;
    var new_game_btn = document.querySelector(".btn-new-game")
    new_game_btn.disabled = true;
    new_game_btn.classList.add("btn-disabled");

    // Disable the KeyPress and Click Cell event listeners
    removeBoardEventListeners();

    var solved = await solve();

    if(solved){
        prefilled = document.querySelectorAll(".prefill");

        for (let i = 0; i < prefilled.length; i++) {
            const prefille_element = prefilled[i];
            prefille_element.classList.remove("prefill");
        }

        // Showing the toast message
        $.toast({
            text : "Board Solved!",
            showHideTransition: 'plain',
            allowToastClose: true,
            hideAfter: 1500,
            loader: false,
            position: 'top-center',
            bgColor: '#5cb85c',
            textColor: "#fff",
            textAlign: "center",
          });
    }

    IS_SOLVING = false;
    new_game_btn.disabled = false;
    new_game_btn.classList.remove("btn-disabled");

    
}


// Initializing the game
gameInitialize();
