var timeout = 10;


board = [
            [0, 0, 0, 2, 6, 0, 7, 0, 1],
            [6, 8, 0, 0, 7, 0, 0, 9, 0],
            [1, 9, 0, 0, 0, 4, 5, 0, 0],
            [8, 2, 0, 1, 0, 0, 0, 4, 0],
            [0, 0, 4, 6, 0, 2, 9, 0, 0],
            [0, 5, 0, 0, 0, 3, 0, 2, 8],
            [0, 0, 9, 3, 0, 0, 0, 7, 4],
            [0, 4, 0, 0, 5, 0, 0, 3, 6],
            [7, 0, 3, 0, 1, 8, 0, 0, 0]
        ]

main = document.querySelector(".board");
cells = [];
var activeCell = null;

for (let row = 0; row < 9; row++) {
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
        cells.push(colDiv);

    }
    main.appendChild(rowDiv);
}
    
// Adding the click event to all empty cells. 
// This will select a cell to be edited with numbers.
cells.forEach(element => {
    element.addEventListener("click", () => {
        if (element.classList.contains('prefill')){
            return;
        }
        if (activeCell == null) {
            activeCell = element;
            activeCell.classList.add('active');
        } else {
            activeCell.classList.remove('active');
            activeCell = element;
            activeCell.classList.add('active');
        }
    });


});


// // Adding keyboard press event
// // This event will allow users to write numbers to the selected cells
window.addEventListener("keyup", (e) => {
    // To ensure we only edit the active selected cell.
    if (activeCell == null) return;

    if (e.key >= 1 && e.key <= 9) {
        row = parseInt(activeCell.id[0]);
        col = parseInt(activeCell.id[1]);
        previous_value = board[row][col];

        
        // If there is a duplicat value in the col, row or square, we add an animation
        duplicate_positions = findDuplicates(row, col, e.key);
        if(duplicates.length != 0){
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
            activeCell.classList.add("error");
        } else{
            // The current cell is not an error. but if it was an error before, we need to remove that.
            activeCell.classList.remove("error")
        }

        // Set the new value in the board
        board[row][col] = e.key
        activeCell.innerHTML = e.key;

        // Removing Other Error Cells that were cause by the previous value of the current cell. 
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
});

// NOTE: This function expects, that the val has not yet been inserted into the board.
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


async function solve() {
    let row, col;
    [row, col] = findEmptyCell();

    if(row == -1){
        return true;
    }

    for (let val = 1; val < 10; val++){
        var activeCell = document.getElementById(`${row}${col}`);
        activeCell.classList.add('active-computer');
        activeCell.innerHTML = val;

        let possible_promise = new Promise((resolve)=>{
            setTimeout(()=>{
                resolve(isPossible(row, col, val));
            }, timeout);
        });

        let possible = await possible_promise;

        if (possible) {
            board[row][col] = val;
            activeCell.classList.remove('active-computer');
            activeCell.classList.add('complete-computer');
            let myWait = new Promise(function(resolve){
                setTimeout(function () { resolve(solve()) }, timeout);
            });

            var wait = await myWait;

            if(wait != true){
                board[row][col] = 0;
                activeCell.classList.remove('complete-computer');

            } else{
                return true;
            }
       }
    }

    var activeCell = document.getElementById(`${row}${col}`);
    activeCell.classList.remove('active-computer');
    activeCell.innerHTML = "";

    return false;

}


async function solver(){
    var solved = await solve();

    if(solved){
        prefilled = document.querySelectorAll(".prefill");

        for (let i = 0; i < prefilled.length; i++) {
            const element = prefilled[i];
            element.classList.remove("prefill");
        }
    }
}

// This function is similar to the isPossible function, but instead of returning true/false
// it returns an array of the value matching cells.

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
