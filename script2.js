// API Call
/*
api_board.newboard.message -> "All Ok"
api_board.newboard.grids[0].difficulty -> "..."
api_board.newboard.grids[0].value -> Board Array
api_board.newboard.grids[0].solution -> Board Solution

*/


async function hello(){
    const api_call = await fetch("https://sudoku-api.vercel.app/api/dosuku");
    var api_board = await api_call.json();
    console.log("Done");
    console.log(api_board.newboard.grids[0].value);
    console.log(api_board.newboard.grids[0].solution);

}

