// IMPORT //
import { levelOneLayouts, levelTwoLayouts, levelThreeLayouts } from './gameLayouts.js';
// END IMPORT //


// GLOBAL VARIABLES //

// Set variables for some DOM elements //
const gameBoard = document.getElementById('game-board');
const pointTotal = document.getElementById('point-total');
const target = document.getElementById('target-point-total');

// Create some other variables //
let activeSquare, word, listOfWordLocations, targetPointTotal, letterScore;
let gameLayout = [];
let gridElements = [];
let activeWordList = [];
let lengthMistakeList = [];
let validityMistakeList = [];

// Sets the score values of each letter //
const letterScores = [
    ['A',1],['B',3],['C',3],['D',2],['E',1],['F',4],['G',2],
    ['H',4],['I',1],['J',8],['K',5],['L',1],['M',3],['N',1],
    ['O',1],['P',3],['Q',10],['R',1],['S',1],['T',1],['U',1],
    ['V',4],['W',4],['X',8],['Y',4],['Z',10]
];

// END GLOBAL VARIABLES //



// INITIAL EVENT //

// Level select page load and setting of layout and target point amount //
window.addEventListener('DOMContentLoaded', () => {
    const levelSelectModal = document.getElementById('levelSelect');
    const mainContent = document.getElementById('main-content');

    // Level 1 button click, set the layout, turn on icons, add target point total //
    document.getElementById('levelOne').addEventListener('click', () => {
        gameLayout = levelOneLayouts[Math.floor(Math.random() * 5)];
        levelSelectModal.style.display = 'none';
        mainContent.classList.remove('hidden');
        listOfWordLocations = findWords(gameLayout);
        targetPointTotal = getRandomInt(sumArrayValues(gameLayout), sumArrayValues(gameLayout) * 3);
        target.innerHTML = targetPointTotal;
        allowLetterIconClick();
        allowHowTo();
        initializeBoard();
    });
    // Level 2 button click, set the layout, turn on icons, add target point total //
    document.getElementById('levelTwo').addEventListener('click', () => {
        gameLayout = levelTwoLayouts[Math.floor(Math.random() * 5)];
        levelSelectModal.style.display = 'none';
        mainContent.classList.remove('hidden');
        listOfWordLocations = findWords(gameLayout);
        targetPointTotal = getRandomInt(sumArrayValues(gameLayout), sumArrayValues(gameLayout) * 3);
        target.innerHTML = targetPointTotal;
        allowLetterIconClick();
        allowHowTo();
        initializeBoard();
    });
    // Level 2 button click, set the layout, turn on icons, add target point total //
    document.getElementById('levelThree').addEventListener('click', () => {
        gameLayout = levelThreeLayouts[Math.floor(Math.random() * 5)];
        levelSelectModal.style.display = 'none';
        mainContent.classList.remove('hidden');
        listOfWordLocations = findWords(gameLayout);
        targetPointTotal = getRandomInt(sumArrayValues(gameLayout), sumArrayValues(gameLayout) * 3);
        target.innerHTML = targetPointTotal;
        allowLetterIconClick();
        allowHowTo();
        initializeBoard();
    });
});

// END INITIAL EVENT //



// GAMEBOARD SETUP AND ACTIONS //

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
            if (gameLayout[row][col] != 0) {
                // Create squares and inputs based on the game layout
                const inputSquare = document.createElement('div');
                inputSquare.classList.add('square');
                if (gameLayout[row][col] === 2) {inputSquare.classList.add('double-square')};
                if (gameLayout[row][col] === 3) {inputSquare.classList.add('triple-square')};
                if (gameLayout[row][col] === -1) {inputSquare.classList.add('negative-square')};

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
                    if (gameLayout[row][col] === 1) {letterScore = getLetterScore(selectedLetter)};
                    if (gameLayout[row][col] === 2) {letterScore = getLetterScore(selectedLetter) * 2};
                    if (gameLayout[row][col] === 3) {letterScore = getLetterScore(selectedLetter) * 3};
                    if (gameLayout[row][col] === -1) {letterScore = getLetterScore(selectedLetter) * -1};
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
                        if (gameLayout[row][col] === 1) {letterScore = getLetterScore(selectedLetter)};
                        if (gameLayout[row][col] === 2) {letterScore = getLetterScore(selectedLetter) * 2};
                        if (gameLayout[row][col] === 3) {letterScore = getLetterScore(selectedLetter) * 3};
                        if (gameLayout[row][col] === -1) {letterScore = getLetterScore(selectedLetter) * -1};
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
        if (currentCol < gameLayout[currentRow].length - 1 && gameLayout[currentRow][currentCol + 1] != 0) {
            focusSquare(currentRow, currentCol + 1);
            moved = true;
        }
        // Check for vertical move next
        else if (currentRow < gameLayout.length - 1 && gameLayout[currentRow + 1][currentCol] != 0) {
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

// END GAMEBOARD SETUP AND ACTIONS // 



// FUNCTIONS USED IN GAMEBOARD //

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
            if (gameLayout[i][j] != 0) {
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
            if (gameLayout[i][j] != 0) {
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

// Function to determine the score for a given letter on the board //
function getLetterScore(letter) {
    const scorePair = letterScores.find(pair => pair[0] === letter);
    return scorePair ? scorePair[1] : null;
};

// Get the total score of all the letters on the board //
const totalScore = () => {
    let totalScore = 0;
    // For regular squares, add score once //
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
    // For double squares, add the score again //
    gameBoard.querySelectorAll('.double-square').forEach(square => {
        const letterScoreText = square.textContent.trim();
        if (letterScoreText.length > 0) {
            const letter = letterScoreText.charAt(0);
            const letterScore = getLetterScore(letter);
            if (letterScore !== null) {
                totalScore += letterScore;
            }
        }
    });
    // For triple squares, add the score 2 times //
    gameBoard.querySelectorAll('.triple-square').forEach(square => {
        const letterScoreText = square.textContent.trim();
        if (letterScoreText.length > 0) {
            const letter = letterScoreText.charAt(0);
            const letterScore = getLetterScore(letter)*2;
            if (letterScore !== null) {
                totalScore += letterScore;
            }
        }
    });
    // For negative squares, remove 2 times to set at a negative value //
    gameBoard.querySelectorAll('.negative-square').forEach(square => {
        const letterScoreText = square.textContent.trim();
        if (letterScoreText.length > 0) {
            const letter = letterScoreText.charAt(0);
            const letterScore = getLetterScore(letter)*-2;
            if (letterScore !== null) {
                totalScore += letterScore;
            }
        }
    });
    increaseProgress(totalScore,targetPointTotal)

    return totalScore;
};

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

function increaseProgress(current, target) {
    const progressBar = document.getElementById('progress-bar');
    let width = parseInt(progressBar.style.width);
    const currentScoreIndicator = document.getElementById('point-total-container');
    const targetScoreIndicator = document.getElementById('target-point-total-container');
    if (isNaN(width)) width = 0;
    width = current/target*100*.67;
    if (width>100) {width = 100};
    if (width<0) {width = 0};
    progressBar.style.width = width + '%';
    currentScoreIndicator.style.left = width + '%';
    if (current===target && current>0) 
    {progressBar.style.backgroundColor = '#32CD32'; currentScoreIndicator.style.backgroundColor = '#32CD32'; targetScoreIndicator.style.backgroundColor = '#32CD32'} 
    else {progressBar.style.backgroundColor = 'var(--main-blue)'; currentScoreIndicator.style.backgroundColor = 'var(--main-blue)'; targetScoreIndicator.style.backgroundColor = 'var(--main-blue)'};

}

// Function used to sum the array //
function sumArrayValues(arrays) {
    let totalSum = 0;

    for (let i = 0; i < arrays.length; i++) {
        for (let j = 0; j < arrays[i].length; j++) {
            totalSum += arrays[i][j];
        }
    }

    return totalSum;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


// END FUNCTIONS USED IN GAMEBOARD //



// FUNCTIONS USED IN BUTTON EVENTS //

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

// Function to clear the whole game board //
function clearGameBoard() {
    gameBoard.innerHTML = '';
    initializeBoard();
    activeWordList = [];
    lengthMistakeList = [];
    validityMistakeList = [];
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

// Function to notify of results //
/*async function processResults() {
    if (lengthMistakeList.length>0 || activeWordList.length===0 || validityMistakeList.length>0 || targetPointTotal*1!=pointTotal.innerHTML*1) {errorBox()};
    if (targetPointTotal*1===pointTotal.innerHTML*1 && lengthMistakeList.length===0 && validityMistakeList.length===0) {successBox()}
}*/

// Function to bring up success box //
function successBox () {

    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    const successBox = document.createElement('div');
    successBox.classList.add('successBox');
    successBox.style.visibility = 'visible';
    successBox.textContent = 'Hooray! You got it! Refresh to play again';
    overlay.appendChild(successBox);
    document.body.appendChild(overlay);
}

// Function to bring up error box //
function errorBox () {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');

    const errorBox = document.createElement('div');
    errorBox.classList.add('errorBox');
    errorBox.style.visibility = 'visible';

    if (lengthMistakeList.length>0 || activeWordList.length===0) {errorBox.textContent = `Make sure to enter a letter in all squares`}
    else if (validityMistakeList.length>0) {errorBox.textContent = `The following are not words: ${validityMistakeList}`}
    else if (targetPointTotal*1!=pointTotal.innerHTML*1) {errorBox.textContent = `Close... Keep trying for the exact score`};

    overlay.appendChild(errorBox);
    document.body.appendChild(overlay);

    overlay.addEventListener('click', () => {
        document.body.removeChild(overlay);
    });

}

// END FUNCTIONS USED IN BUTTON EVENTS //



// FUNCTIONS USED IN NAVIGATION //

// Function to turn on the option to click the letter icon //
function allowLetterIconClick() {
    const letterIcon = document.getElementById('letterIcon');

    letterIcon.addEventListener('click', () => {
        let container = document.querySelector('.letterScores');

        if (container) {
            container.classList.remove('fade-in');
            container.classList.add('fade-out');
            letterIcon.style.color = 'black';

            container.addEventListener('animationend', function onAnimationEnd() {
                container.remove();
                container.removeEventListener('animationend', onAnimationEnd);
            });
        } else {
            container = document.createElement('div');
            container.classList.add('letterScores');
            container.classList.add('fade-in');
            letterIcon.style.color = 'var(--main-blue)';

            const header = document.createElement('h1');
            header.innerHTML = 'Scores by Letter';
            header.style.textAlign = 'center';
            container.appendChild(header);

            const letters = ['A1', 'B3', 'C3', 'D2', 'E1', 'F4', 'G2', 'H4', 'I1', 'J8', 'K5', 'L1', 'M3', 'N1', 'O1', 'P3', 'Q10', 'R1', 'S1', 'T1', 'U1', 'V4', 'W4', 'X8', 'Y4', 'Z10'];

            for (let i = 0; i < letters.length; i++) {
                const letterSquare = document.createElement('div');
                letterSquare.classList.add('scoreSquare');

                const letter = letters[i];
                const mainLetter = document.createElement('span');
                mainLetter.textContent = letter[0];
                letterSquare.appendChild(mainLetter);

                if (letter.length > 1) {
                    const subscript = document.createElement('sub');
                    subscript.textContent = letter.slice(1);
                    letterSquare.appendChild(subscript);
                }

                container.appendChild(letterSquare);
            }

            letterScoresContainer.appendChild(container);
        }
    });
};

// Function to turn on the option to click the question mark icon //
function allowHowTo() {
    const howToIcon = document.getElementById('howToIcon');

    howToIcon.addEventListener('click', () => {
        let container = document.querySelector('.howTo');

        if (container) {
            container.classList.remove('fade-in');
            container.classList.add('fade-out');
            howToIcon.style.color = 'black';

            container.addEventListener('animationend', function onAnimationEnd() {
                container.remove();
                container.removeEventListener('animationend', onAnimationEnd);
            });
        } else {
            container = document.createElement('div');
            container.classList.add('howTo');
            container.classList.add('fade-in');
            howToIcon.style.color = 'var(--main-blue)';

            const header = document.createElement('h1');
            const howToBody = document.createElement('p');
            howToBody.innerHTML = 'Enter a letter in each square. The scores for each letter are added together for the current score. Try to enter words to reach the target score.' + "<br />" + "<br />" + 'Green squares are worth double. Blue squares are worth triple. Red squares are negative.' + "<br />" + "<br />" + 'Press clear to erase entire board' + "<br />" + "<br />" + 'Press X' + "<sub>1</sub>" + ' icon to see scores by letter'  + "<br />" + "<br />" + 'Use comments icon to add comments on the whole project, and the construction icon to see future plans';
            header.innerHTML = 'How to Play';
            header.style.textAlign = 'center';
            container.appendChild(header);
            container.appendChild(howToBody);

            letterScoresContainer.appendChild(container);
        }
    });
};

// END FUNCTIONS USED IN NAVIGATION //



// BUTTONS //

// Event for clicking the clear button which clears the whole board //
/*document.getElementById('clear-button').addEventListener('click', () => {
    clearGameBoard();
    pointTotal.innerHTML = 0;
});*/

document.querySelectorAll('.key').forEach(function(button) {
    button.addEventListener('click', function() {
        this.classList.add('animate');
        setTimeout(() => {
            this.classList.remove('animate');
        }, 300); // duration of the animation in milliseconds
    });
});

// Event for clicking the submission button to alert if you've won or if there are errors //
/*document.getElementById('submission-button').addEventListener("click", async () => {

    await processWords(activeWordList, listOfWordLocations, isValidWord);
    processResults();

})*/

// END BUTTONS //
