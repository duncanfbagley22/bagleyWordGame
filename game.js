const letterScores = [
    ['A',1],['B',3],['C',3],['D',2],['E',1],['F',4],['G',2],
    ['H',4],['I',1],['J',8],['K',5],['L',1],['M',3],['N',1],
    ['O',1],['P',3],['Q',10],['R',1],['S',1],['T',1],['U',1],
    ['V',4],['W',4],['X',8],['Y',4],['Z',10]
];

function getLetterScore(letter) {
    const scorePair = letterScores.find(pair => pair[0] === letter);
    return scorePair ? scorePair[1] : null;
};

function getCurrentWord() {
    return Array.from(gameBoard.querySelectorAll('.square'))
        .map(square => square.textContent.trim().charAt(0))
        .join('');
}

const gameBoard = document.getElementById('game-board');
const pointTotal = document.getElementById('point-total');
let activeSquare, word;
let wordLength = Math.floor(Math.random() * 5)+3;
console.log(wordLength);
const target = document.getElementById('target-point-total');
const targetPointTotal = wordLength*(Math.floor(Math.random() * 3)+1);
target.innerHTML = targetPointTotal

function initializeBoard() {
    while (gameBoard.firstChild) {
        gameBoard.removeChild(gameBoard.firstChild);
    };
    for (let i = 0; i < wordLength; i++) {
        const inputSquare = document.createElement('div');
        inputSquare.classList.add('square');

        const inputElement = document.createElement('input');
        inputElement.type = 'text';
        inputElement.maxLength = 1;
        inputElement.classList.add('square-input');
        inputSquare.appendChild(inputElement);

        gameBoard.appendChild(inputSquare);

        inputSquare.addEventListener('click', () => {
            if (activeSquare) {
                activeSquare.classList.remove('active');
            }
            activeSquare = inputSquare;
            inputSquare.classList.add('active');
            inputElement.focus();
            inputElement.value = '';
        });

        inputElement.addEventListener('input', () => {
            const selectedLetter = inputElement.value.trim().toUpperCase();
            const letterScore = getLetterScore(selectedLetter);
            if (selectedLetter && letterScore !== null) {
                inputSquare.innerHTML = `<strong>${selectedLetter}</strong>` + `<sub>${letterScore}</sub>`;
                inputSquare.appendChild(inputElement);
        
                inputSquare.classList.remove('active');
                inputSquare.classList.add('inactive');
                activeSquare = null;
        
                const score = totalScore();
                pointTotal.innerHTML = score;
            }
        });

    }
};

initializeBoard();

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

async function isValidWord(word) {
    try{
        const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
        return response.ok;
    }
    catch(error) {
        return false;
    }
}

document.getElementById('submission-button').addEventListener("click", async () => {
   if (getCurrentWord().length === wordLength) {
    if (targetPointTotal * 1 === totalScore() * 1) {
        const isValid = await isValidWord(getCurrentWord());
      if (isValid) {
        alert('Correct!');
      } else {
        alert('Not a valid word!');
      }
    }
    else {alert(`The scores don't match`)}
   } 
   else {alert('Enter a word of the correct length')}
})

function clearGameBoard() {
    gameBoard.innerHTML = '';
    initializeBoard();
}

document.getElementById('clear-button').addEventListener('click', () => {
    clearGameBoard();
    pointTotal.innerHTML = 0;
});
