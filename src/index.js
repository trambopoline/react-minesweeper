import React from 'react';
import ReactDOM from 'react-dom';
import 'normalize.css';
import './index.css';

const MINE_VALUE = "💣";
const FLAGGED = "flagged";
const BLANK = "blank";
const UNSURE = "unsure";

class App extends React.Component
{


  constructor()
  {
      super();

      const DEFAULT_SETTINGS =
          {
            numMines: 15,
            numRows: 10,
            numColumns: 10,
            numGames: 1,
          };

      this.state =
      {
        numFlags: 0,
        numGames: DEFAULT_SETTINGS.numGames,
        numMines: DEFAULT_SETTINGS.numMines,
        numRows: DEFAULT_SETTINGS.numRows,
        numColumns: DEFAULT_SETTINGS.numColumns,
        currentBoard: this.generateNewGame( DEFAULT_SETTINGS.numRows, DEFAULT_SETTINGS.numColumns, DEFAULT_SETTINGS.numMines, DEFAULT_SETTINGS.numGames),
      };

  }

  incrementNumFlags()
  {
    this.setState(
    {
      numFlags: this.state.numFlags+1,
    });
  }

  decrementNumFlags()
  {
    this.setState(
    {
      numFlags: this.state.numFlags-1,
    });
  }

  generateNewGame( newNumRows, newNumColumns, newNumMines, newNumGames )
  {

    const newBoard = (<Board
                    incrementNumFlags = { () => this.incrementNumFlags() }
                    decrementNumFlags = { () => this.decrementNumFlags() }
                    numRows = { parseInt(newNumRows, 10) }
                    numColumns = { parseInt(newNumColumns, 10) }
                    numMines = { parseInt(newNumMines, 10) }
                    key = { newNumGames }
                  />);

    return newBoard;
  }

  startNewGame( newNumRows, newNumColumns, newNumMines, newNumGames )
  {
    if( newNumMines > ( newNumRows * newNumColumns ) - 1 )
    {
      newNumMines = ( newNumRows * newNumColumns ) - 1;
      console.log( newNumMines );
    }

    this.setState({
      numRows: newNumRows,
      numColumns: newNumColumns,
      numMines: newNumMines,
      numGames: newNumGames,
      currentBoard: this.generateNewGame( newNumRows, newNumColumns, newNumMines, newNumGames ),
      numFlags: 0,
    });
  }

  render()
  {
      return (
          <div className="game">
                  <GameSettings
                    defaultNumMines = { this.state.numMines }
                    defaultNumRows = { this.state.numRows }
                    defaultNumColumns = { this.state.numColumns }
                    newGame = { ( rows, columns, mines ) => this.startNewGame( rows, columns, mines, ++this.state.numGames )}
                  />
            <div className="game-main">
                  <div className="game-info">
                  <p>
                    Flags: {this.state.numMines - this.state.numFlags}
                  </p>
                  </div>
                  {this.state.currentBoard}
            </div>
          </div>
      );
  }
}

class GameSettings extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state = 
    {
      numRows_settings: this.props.defaultNumRows,
      numColumns_settings: this.props.defaultNumColumns,
      numMines_settings: this.props.defaultNumMines,
    }
  }

  updateNumRows( event )
  {
    let newNumRows = event.target.value;
    const minNumberRows = 1;

    if( newNumRows <= minNumberRows )
    {
      event.target.value = minNumberRows;
      newNumRows = minNumberRows;
    }

    this.setState(
    {
      numRows_settings: newNumRows,
    });
  }

  updateNumColumns( event )
  {
    let newNumColumns = event.target.value;
    const minNumberColumns = 1;

    if( newNumColumns <= minNumberColumns )
    {
      event.target.value = minNumberColumns;
      newNumColumns = minNumberColumns;
    }

    this.setState(
    {
      numColumns_settings: newNumColumns,
    });
  }

  updateNumMines( event )
  {
    let newNumMines = event.target.value;
    const minNumberMines = 1;

    if( newNumMines <= minNumberMines )
    {
      event.target.value = minNumberMines;
      newNumMines = minNumberMines;
    }

    this.setState(
    {
      numMines_settings: newNumMines,
    });
  }

  render()
  {
      return (
          <div className="game-settings">
            <div className="row settings">
              <label htmlFor="numRows">Rows: </label>
              <input id="numRows" type="number"
                     defaultValue={this.props.defaultNumRows}
                     onChange={event => this.updateNumRows(event)}
                     />
            </div>
            <div className="column settings">
              <label htmlFor="numColumns">Columns: </label>
              <input id="numColumns" type="number"
                     defaultValue={this.props.defaultNumColumns}
                     onChange={event => this.updateNumColumns(event)}
                     />
            </div>
            <div className="mine settings">
              <label htmlFor="numMines">Mines: </label>
              <input id="numMines" type="number"
                     defaultValue={this.props.defaultNumMines}
                     onChange={event => this.updateNumMines(event)}
                     />
            </div>
            <button className="new-game" onClick={ () => this.props.newGame( this.state.numRows_settings, this.state.numColumns_settings, this.state.numMines_settings ) } >New Game</button>

          </div>
      );
  }
}


class Board extends React.Component
{
  constructor(props)
  {
      super(props);

      const cellStartState =
      {
        revealed: false,
        value: null,
        processed: false,
        flagState: BLANK,
      };
      // Creating a matrix of cells with an extra margin around the edges to prevent index-out-of-bounds exceptions
      let cells = generateMatrix( this.props.numRows+2, this.props.numColumns+2, cellStartState); // The grid of cells


      for (let rowIndex = 1; rowIndex < this.props.numRows+1; rowIndex++)
      {
        for (let columnIndex = 1; columnIndex < this.props.numColumns+1; columnIndex++)
        {
            let currentCell = cells[rowIndex][columnIndex];
            currentCell.value = 0;
            currentCell.rowIndex = rowIndex;
            currentCell.columnIndex = columnIndex;
        }
      }

      // Populate the cells with mines, and increment adjacent values
      for(let i = 0; i < this.props.numMines; i++)
      {
        let mineRowIndex = generateRandomNumberInRange(1, this.props.numRows),
              mineColumnIndex = generateRandomNumberInRange(1, this.props.numColumns);

        //Ensure we don't put mines on mines
        while( cells[ mineRowIndex ][ mineColumnIndex ].value === MINE_VALUE )
        {
          mineRowIndex = generateRandomNumberInRange(1, this.props.numRows);
          mineColumnIndex = generateRandomNumberInRange(1, this.props.numColumns);
        }

        cells[ mineRowIndex ][ mineColumnIndex ].value = MINE_VALUE; // Place mines

        const adjacentCells =
            [
              cells[ mineRowIndex ][ mineColumnIndex ],         //The current cell
              cells[ mineRowIndex - 1 ][mineColumnIndex - 1], //topLeft
              cells[ mineRowIndex - 1 ][mineColumnIndex],     //top
              cells[ mineRowIndex - 1][mineColumnIndex + 1],  //topRight
              cells[ mineRowIndex][mineColumnIndex + 1],      //right
              cells[ mineRowIndex + 1][mineColumnIndex + 1],  //bottomRight
              cells[ mineRowIndex + 1][mineColumnIndex],      //bottom
              cells[ mineRowIndex + 1][mineColumnIndex - 1],  //bottomLeft
              cells[ mineRowIndex][mineColumnIndex - 1],      //left
            ]

        // console.log( `Mine at row ${rowLocation}, column ${columnIndex}` );
        for( let adjacentCell of adjacentCells )
        {
          if( adjacentCell.value !== MINE_VALUE && adjacentCell.value !== null )
          {
            adjacentCell.value++;
          }
        }
      }

      this.state = {
          cells: cells,
          gameWon: false,
          gameLost: false,
          totalCellsRevealed: 0,
      };
  }
  // bubbleClick = ( rowIndex, columnIndex ) =>
  // {
  //   // event.preventDefault();
  //   // console.log()
  //   this.props.onClick( rowIndex, columnIndex );
  // }
  handleClick( rowIndex, columnIndex)
  {
    //event.preventDefault();
    console.log( `Click at row ${rowIndex}, column ${columnIndex}` );

    const cells = this.state.cells.slice().map( (row) => {
              return row.slice();
          });
    const currentCell = cells[rowIndex][columnIndex];
    const stateToSet = {};

    //Don't take action if the game is over; if a null or already revealed cell is clicked; or if the cell is flagged
    if( this.state.gameWon ||
      this.state.gameLost ||
      currentCell.value === null ||
      currentCell.flagState !== BLANK ||
      currentCell.revealed === true)
    {
      return;
    }

    let totalCellsRevealed = this.state.totalCellsRevealed;

    if( currentCell.value !== 0 )
    {
        currentCell.revealed = true;
        totalCellsRevealed++;
    }

    if( currentCell.value === MINE_VALUE )
    {
      console.log( "BOOM");
      // Game over
      stateToSet.gameLost = true;

      // for( let cell in cells )
      // {
      //   cell.explosionVector = 
      // }
    }

    //Handle revealing of multiple cells ( adjacent 0-values )
    if( currentCell.value === 0 )
    {
      let cellsToProcess = [];

      // Get this started by adding the current location to the set
      cellsToProcess.push( cells[ rowIndex][columnIndex ] );

      while( cellsToProcess.length !== 0 )
      {
        // console.log( `---------- Pass #${index} ------------`);

        const cellToProcess = cellsToProcess.pop();

        cellToProcess.processed = true;

        const rowIndex = cellToProcess.rowIndex;
        const columnIndex = cellToProcess.columnIndex;

        const adjacentCells =
            [
              cells[ rowIndex ][ columnIndex ],       //The current cell
              cells[ rowIndex - 1 ][columnIndex - 1], //topLeft
              cells[ rowIndex - 1 ][columnIndex],     //top
              cells[ rowIndex - 1][columnIndex + 1],  //topRight
              cells[ rowIndex][columnIndex + 1],      //right
              cells[ rowIndex + 1][columnIndex + 1],  //bottomRight
              cells[ rowIndex + 1][columnIndex],      //bottom
              cells[ rowIndex + 1][columnIndex - 1],  //bottomLeft
              cells[ rowIndex][columnIndex - 1],      //left
            ]

        for( let adjacentCell of adjacentCells )
        {

          if( adjacentCell.value === null ) continue;
          if( adjacentCell.revealed === false )
          {
            adjacentCell.revealed = true;
            totalCellsRevealed++;
          }
          // this.reveal( adjacentCell, totalCellsRevealed );
          if( adjacentCell.value === 0 && adjacentCell.processed === false )
          {
            cellsToProcess.push(adjacentCell);
          }
        }
        // console.log( "Adjacent cells: ", adjacentCells );
      }

    }

    if ( this.gameHasBeenWon( totalCellsRevealed ) && stateToSet.gameLost !== true )
    {
        stateToSet.gameWon = true;
    }


    stateToSet.cells = cells;
    stateToSet.totalCellsRevealed = totalCellsRevealed;

    this.setState(stateToSet);
  }

  captureRightClick(event)
  {
    event.preventDefault();
    if( this.state.gameWon || this.state.gameLost )
    {
      event.stopPropagation(); // stop processing click if game is over
    }
    //Otherwise, pass this event to child elements
  }

  handleRightClick(event, rowIndex, columnIndex)
  {
    event.preventDefault();

    if( this.state.gameWon || this.state.gameLost )
    {
      return; // stop processing click if game is over
    }
    const cells = this.state.cells.slice().map( (row) => {
              return row.slice();
          });
    const currentCell = cells[rowIndex][columnIndex];
    const stateToSet = {};

    if( currentCell.revealed === true ) return;

    console.log( "RIGHT CLICK", rowIndex, columnIndex );

    if( currentCell.flagState === BLANK )
    {
      currentCell.flagState = FLAGGED;
      // stateToSet.numFlags = this.state.numFlags+1;
      this.props.incrementNumFlags();
    }
    else if( currentCell.flagState === FLAGGED )
    {
      // stateToSet.numFlags = this.state.numFlags-1;
      this.props.decrementNumFlags();
      currentCell.flagState = UNSURE;
    }
    else currentCell.flagState = BLANK;

    stateToSet.cells = cells;

    this.setState(stateToSet);

  }

  gameHasBeenWon( totalCellsRevealed )
  {
    // console.log('totalCellsRevealed', totalCellsRevealed, '\n', 'Win number: ', this.state.gridSize*this.state.gridSize - this.state.numMines );
    if( totalCellsRevealed >=  this.props.numRows*this.props.numColumns - this.props.numMines )
    {
      return true;
    }
    return false;
  }

  reveal( cellToReveal, totalCellsRevealed )
  {
    if( cellToReveal.revealed === false )
    {
      cellToReveal.revealed = true;
      totalCellsRevealed++;
    }
  }

  render()
  {
      const cells = this.state.cells;
      let cellsToRender = [];

      // for (let rowIndex = 0; rowIndex < cells.length; rowIndex++)
      for (let rowIndex = 1; rowIndex < cells.length-1; rowIndex++)
      {
          // renderedRows.push(this.renderRow( cells[i], i));
          let rowToRender = [];
          // for (let columnIndex = 0; columnIndex < cells[rowIndex].length; columnIndex++)
          for (let columnIndex = 1; columnIndex < cells[rowIndex].length-1; columnIndex++)
          {

            rowToRender.push(<Cell
                              key={columnIndex}

                              // onClick={ () => this.handleClick( rowIndex, columnIndex ) }
                              handleClick={ () => this.handleClick( rowIndex, columnIndex ) }
                              handleRightClick={ ( event )  => this.handleRightClick(event, rowIndex, columnIndex )}
                              value={cells[rowIndex][columnIndex].value}
                              revealed={cells[rowIndex][columnIndex].revealed}
                              flagState={cells[rowIndex][columnIndex].flagState}
                              processed={cells[rowIndex][columnIndex].processed}/>);
          }
          cellsToRender.push( <div className="board-row" key={rowIndex}>
          {rowToRender}
          </div>);
      }
      // return (<div className="board" onContextMenuCapture={ ( event ) => this.captureRightClick( event ) }>
      return (<div className="board-container" >
                <div className="board">
               {cellsToRender}
                </div>
              </div>
              );
  }
}

class Cell extends React.Component
{

  // constructor()
  // {
  //   super();
  //   this.state = 
  //   {
  //     flagState: BLANK,
  //   };
  // }

  // shouldComponentUpdate( nextProps, nextState )
  // {
  //   // console.log( "State: ", this.state, nextState );
  //   // console.log( "Props: ", this.props, nextProps );
  //   //The only time we need to rerender is when the cell is revealed, or its 'flagged/unflagged/questionmark' prop changes
  //   return ( this.props.revealed === nextProps.revealed && this.props.flagState === nextProps.flagState ) ?  false : true
  // }

  // handleClick( cellFlagState )
  // {
  //   if( cellFlagState !== BLANK )
  //   {
  //     console.log( "NOCLICK" );
  //           return;
  //   }
  //   console.log("CLICK");
  //   this.props.handleClick();
  // }

  // handleRightClick(cellRevealed, cellFlagState)
  // {
  //   if( cellRevealed === true ) return;

  //   console.log( "RIGHT CLICK", cellRevealed, cellFlagState );
  //   let flagState = cellFlagState;

  //   if( flagState === BLANK ) flagState = FLAGGED;
  //   else if( flagState === FLAGGED ) flagState = UNSURE;
  //   else flagState = BLANK;

  //   this.setState({
  //     flagState,
  //   });

  // }


  render()
  {
    // let valueClassName = "BLANK";
    // switch( this.props.value )
    // {
    //   case 1:
    //     valueClassName = "one";
    //     break;
    //   case 2: valueClassName = "two"; break;
    //   case 3: valueClassName = "three"; break;
    //   case 4: valueClassName = "four"; break;
    //   case 5: valueClassName = "five"; break;
    //   case 6: valueClassName = "six"; break;
    //   case 7: valueClassName = "seven"; break;
    //   case 8: valueClassName = "eight"; break;
    //   default: valueClassName = "blank";
    // }

    // return (
    //   <button
    //     className={`${this.props.revealed ? ( this.props.value === MINE_VALUE ? "revealed mine " : "revealed " ) :  this.props.flagState+" "}cell`}
    //     onClick={  this.props.handleClick }
    //     // onClick={  () => this.handleClick( this.state.flagState ) }
    //     onContextMenu={ this.props.handleRightClick }
    //     // onContextMenu={ () => this.handleRightClick(this.props.revealed, this.state.flagState ) }
    //     >
    //       <div className="flipper">
    //         <figure className="front">
    //           {
    //            // this.props.value
    //           }
    //           {
    //           //( this.props.revealed && this.props.value !== 0 ) ? this.props.value : ""
    //           }
    //         </figure>
    //         <figure className="back">
    //           { ( this.props.revealed && this.props.value !== 0 ) ? this.props.value : ""}
    //         </figure>
    //       </div>
    //   </button>
    // );

    return (
      <button
        className={`${this.props.revealed ? ( this.props.value === MINE_VALUE ? "revealed mine " : "revealed " ) :  this.props.flagState+" "}cell`}
        onClick={  this.props.handleClick }
        // onClick={  () => this.handleClick( this.state.flagState ) }
        onContextMenu={ this.props.handleRightClick }
        // onContextMenu={ () => this.handleRightClick(this.props.revealed, this.state.flagState ) }
        >

              { ( this.props.revealed && this.props.value !== 0 ) ? this.props.value : ""}
      </button>
    );

  }
}

ReactDOM.render(<App />, document.getElementById('root'));

function generateRandomNumberInRange( min, max )
{
    return Math.floor( Math.random()*(max-min+1)+min);
}

function generateMatrix(numrows, numcols, initial)
{
   let arr = [];
   for (let i = 0; i < numrows; ++i)
   {
      let columns = [];
      for (let j = 0; j < numcols; ++j)
      {
         columns[j] = Object.assign({}, initial);
      }
      arr[i] = columns;
    }
    return arr;
}

