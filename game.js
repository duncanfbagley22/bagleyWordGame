// Set variables for some DOM elements //
const gameBoard = document.getElementById('game-board');
const pointTotal = document.getElementById('point-total');
const target = document.getElementById('target-point-total');

// Create some other variables //
let activeSquare, word;
let gridElements = [];
let activeWordList = [];
let lengthMistakeList = [];
let validityMistakeList = [];

// sets the layout //
let gameLayout = [
    [0,0,0,0,0,0,0],
    [0,1,1,1,1,1,0],
    [0,1,0,0,0,0,0],
    [0,1,1,1,0,0,0],
    [0,0,1,0,0,0,0],
    [0,1,1,1,1,1,0],
    [0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0]
];

// Determine what are locations of the words in the layout and sets it as //
function findWords(gameLayout) {
    let words = [];

    function addWord(positions) {
        if (positions.length >= 3) {
            words.push(positions);
        }
    }

    for (let i = 0; i < gameLayout.length; i++) {
        let horizontalWord = [];
        for (let j = 0; j < gameLayout[i].length; j++) {
            if (gameLayout[i][j] === 1) {
                horizontalWord.push([i, j]);
            } else {
                addWord(horizontalWord);
                horizontalWord = [];
            }
        }
        addWord(horizontalWord);
    }

    for (let j = 0; j < gameLayout[0].length; j++) {
        let verticalWord = [];
        for (let i = 0; i < gameLayout.length; i++) {
            if (gameLayout[i][j] === 1) {
                verticalWord.push([i, j]);
            } else {
                addWord(verticalWord);
                verticalWord = [];
            }
        }
        addWord(verticalWord);
    }

    return words;
}

const listOfWordLocations = findWords(gameLayout);

// Sets the score values of each letter //
const letterScores = [
    ['A',1],['B',3],['C',3],['D',2],['E',1],['F',4],['G',2],
    ['H',4],['I',1],['J',8],['K',5],['L',1],['M',3],['N',1],
    ['O',1],['P',3],['Q',10],['R',1],['S',1],['T',1],['U',1],
    ['V',4],['W',4],['X',8],['Y',4],['Z',10]
];

// Function to determine the score for a given letter on the board //
function getLetterScore(letter) {
    const scorePair = letterScores.find(pair => pair[0] === letter);
    return scorePair ? scorePair[1] : null;
};

// Set the target score in the page //
const targetPointTotal = listOfWordLocations.length*(Math.floor(Math.random() * 5)+5);
target.innerHTML = targetPointTotal

// Function that handles inputs of letters and creating the board //
function initializeBoard() {

    // Clear anything currently on the board
    while (gameBoard.firstChild) {
        gameBoard.removeChild(gameBoard.firstChild);
    }

    // Set the number of CSS columns to equal the number from the game board
    gameBoard.style.gridTemplateColumns = `repeat(${gameLayout[0].length}, 1fr)`;

    // Create gridElements variable
    gridElements = [];

    for (let row = 0; row < gameLayout.length; row++) {
        gridElements[row] = [];
        for (let col = 0; col < gameLayout[row].length; col++) {
            if (gameLayout[row][col] === 1) {
                // Create squares and inputs based on the game layout
                const inputSquare = document.createElement('div');
                inputSquare.classList.add('square');

                const inputElement = document.createElement('input');
                inputElement.type = 'text';
                inputElement.maxLength = 1;
                inputElement.classList.add('square-input');
                inputSquare.appendChild(inputElement);
                gameBoard.appendChild(inputSquare);

                // Event listener to add an inputted letter to the running list of words
                inputElement.addEventListener('input', (event) => {
                    if (event.inputType === 'deleteContentBackward') {
                        gridElements[row][col] = '';
                        inputElement.value = '';
                        inputSquare.innerHTML = '';
                        inputSquare.appendChild(inputElement);
                        inputElement.focus();
                        updateScore();
                    } else {
                        gridElements[row][col] = inputElement.value.trim().toUpperCase();
                        activeWordList = updateWords();
                        // Automatically move to the next square
                        moveToNextSquare(row, col);
                        updateScore();
                    }

                    // Check if there's no active square to set
                    if (!activeSquare) {
                        document.removeEventListener('click', removeActiveClass);
                    }
                });

                // Event listener to set the square as active if you click on it
                inputSquare.addEventListener('click', (event) => {
                    // Prevent event propagation to document click listener
                    event.stopPropagation();

                    // Remove active class from the previously active square
                    if (activeSquare) {
                        activeSquare.classList.remove('active');
                    }

                    // Set the clicked square as the active square
                    activeSquare = inputSquare;
                    inputSquare.classList.add('active');
                    inputElement.focus();
                });

                // Event listener to input the letter, add the score to it, and add the score to the point total
                inputElement.addEventListener('input', () => {
                    const selectedLetter = inputElement.value.trim().toUpperCase();
                    const letterScore = getLetterScore(selectedLetter);
                    if (selectedLetter && letterScore !== null) {
                        inputSquare.innerHTML = `<strong>${selectedLetter}</strong><sub>${letterScore}</sub>`;
                        inputSquare.appendChild(inputElement);

                        // Move the active class to the next square
                        moveToNextSquare(row, col);
                        updateScore();
                    }
                });

                inputElement.addEventListener('keydown', (event) => {
                    if (event.key.length === 1 && !event.metaKey && !event.ctrlKey) { // Check for single character key press
                        gridElements[row][col] = event.key.toUpperCase();
                        inputElement.value = event.key.toUpperCase();
                        const selectedLetter = inputElement.value.trim().toUpperCase();
                        const letterScore = getLetterScore(selectedLetter);
                        if (selectedLetter && letterScore !== null) {
                            inputSquare.innerHTML = `<strong>${selectedLetter}</strong><sub>${letterScore}</sub>`;
                            inputSquare.appendChild(inputElement);
                            activeWordList = updateWords();
                
                            // Move the active class to the next square
                            moveToNextSquare(row, col);
                            updateScore();
                        }
                        event.preventDefault(); // Prevent the default action to avoid adding the character again
                    }
                    else if (event.key === 'Backspace' && inputElement.value==='') {moveToNextSquare(row-1, col-1);}
                });
            } else {
                // Creates an empty square if the square location is blank
                const emptySquare = document.createElement('div');
                emptySquare.classList.add('empty-square');
                gameBoard.appendChild(emptySquare);
                }
        }
    }

    // Event listener to remove the active square CSS if you click anywhere else on the screen
    document.addEventListener('click', removeActiveClass);

    // Function to remove active class from activeSquare
    function removeActiveClass(event) {
        if (activeSquare && !activeSquare.contains(event.target)) {
            activeSquare.classList.remove('active');
            activeSquare = null;
        }
    }

    // Function to move to the next square
    function moveToNextSquare(currentRow, currentCol) {
        let moved = false;

        // Check for horizontal move first
        if (currentCol < gameLayout[currentRow].length - 1 && gameLayout[currentRow][currentCol + 1] === 1) {
            focusSquare(currentRow, currentCol + 1);
            moved = true;
        }
        // Check for vertical move next
        else if (currentRow < gameLayout.length - 1 && gameLayout[currentRow + 1][currentCol] === 1) {
            focusSquare(currentRow + 1, currentCol);
            moved = true;
        }

        // If no move was made, remove active class and clear activeSquare
        if (!moved) {
            if (activeSquare) {
                activeSquare.classList.remove('active');
                activeSquare = null;
            }
        }
    }

    // Function to focus a square and set it as active
    function focusSquare(row, col) {
        const nextSquare = gameBoard.children[row * gameLayout[row].length + col];
        const nextInputElement = nextSquare.querySelector('input');

        if (activeSquare) {
            activeSquare.classList.remove('active');
        }
        activeSquare = nextSquare;
        activeSquare.classList.add('active');
        nextInputElement.focus();
    }

    // Function to update the score
    function updateScore() {
        const score = totalScore();
        document.getElementById('point-total').innerHTML = score;
    }
}

initializeBoard();

// Get the total score of all the letters on the board //
const totalScore = () => {
    let totalScore = 0;
    gameBoard.querySelectorAll('.square').forEach(square => {
        const letterScoreText = square.textContent.trim();
        if (letterScoreText.length > 0) {
            const letter = letterScoreText.charAt(0);
            const letterScore = getLetterScore(letter);
            if (letterScore !== null) {
                totalScore += letterScore;
            }
        }
    });
    return totalScore;
};

// Function to determine whether something is a word //
async function isValidWord(word) {
    try{
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        return response.ok;
    }
    catch(error) {
        return false;
    }
}

// Event flor clicking the submission button to alert if you've won or if there are errors //
document.getElementById('submission-button').addEventListener("click", async () => {

    await processWords(activeWordList, listOfWordLocations, isValidWord);
    processResults();

})

// Function to clear the whole game board //
function clearGameBoard() {
    gameBoard.innerHTML = '';
    initializeBoard();
    lengthMistakeList = [];
    validityMistakeList = [];
}

// Event for clicking the clear button which clears the whole board //
document.getElementById('clear-button').addEventListener('click', () => {
    clearGameBoard();
    pointTotal.innerHTML = 0;
});

// Function to update the list of words with values of the entered letters //
function updateWords() {
    const words = [];

    listOfWordLocations.forEach(wordLocations => {
        let word = '';
        wordLocations.forEach(([row, col]) => {
            word += gridElements[row][col] || '';
        });
        words.push(word);
    });
    return words
}

// Function to take all the letters and maps them to words and determines if they are valid words //
async function processWords(activeWordList, listOfWordLocations, isValidWord) {
    lengthMistakeList = [];
    validityMistakeList = [];

    for (let index = 0; index < activeWordList.length; index++) {
        const element = activeWordList[index];

        if (listOfWordLocations[index].length > element.length) {lengthMistakeList.push(element)}

        const result = await isValidWord(element);
        if (!result) {validityMistakeList.push(element);
        }
    }
}

// Function to notify of results
async function processResults() {
    if (lengthMistakeList.length>0 || activeWordList.length===0) {alert(`Make sure to enter a letter in all squares`)};
    console.log(activeWordList.length);
    if (validityMistakeList.length>0) {alert(`${validityMistakeList} is not a word`)};
    if (targetPointTotal*1===pointTotal.innerHTML*1 && lengthMistakeList.length===0 && validityMistakeList.length===0) {alert(`Hooray! You got it!`)}
}
