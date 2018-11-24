var roundScore, activePlayer, winner, prevdice;
var winAmount = 100;

function newGame() {
    roundScore = 0;
    activePlayer = 0;
    winner = false;
    prevDice = 0;
    document.getElementById('score-0').textContent = '0';
    document.getElementById('score-1').textContent = '0';
    document.getElementById('current-0').textContent = '0';
    document.getElementById('current-1').textContent = '0';
    document.querySelector('.player-0-panel').classList.remove('winner');
    document.querySelector('.player-0-panel').classList.add('active');
    document.querySelector('.player-1-panel').classList.remove('winner');
};

function swapPlayers(){
    document.querySelector('#current-'+ activePlayer).textContent = 0;
    activePlayer === 1 ? activePlayer = 0 : activePlayer = 1;
    roundScore = 0;
    document.querySelector('.player-0-panel').classList.toggle('active');
    document.querySelector('.player-1-panel').classList.toggle('active');
}

function rollDice(){
    if (winner) return;
    var dice = Math.floor(Math.random() * 6) + 1;
    document.querySelector('#dice').src = 'img/dice-' + dice + '.png';
    if (dice === 1 && prevDice === 0){
        document.querySelector('#score-'+ activePlayer).textContent = 0;
        swapPlayers();
        prevDice = 0;
    }
    if (dice > 1){ 
        roundScore += dice;
        prevDice = dice;
        document.querySelector('#current-'+ activePlayer).textContent = roundScore;
    } else {
        swapPlayers();
        prevDice = 0;
    }
};

function hold() {
    if (winner) return;
    // Get active player's current score
    var x = Number(document.querySelector('#score-'+ activePlayer).textContent);
    // Add current score and write back to players total score
    x += roundScore;
    document.querySelector('#score-'+ activePlayer).textContent = x;
    if (x >= winAmount){
        document.querySelector('#name-' + activePlayer).textContent = 'WINNER!'
        document.querySelector('.player-' + activePlayer + '-panel').classList.add('winner');
        document.querySelector('.player-' + activePlayer + '-panel').classList.remove('active');
        winner = true;
    } else {
        swapPlayers();
    }
};

document.querySelector('.btn-roll').addEventListener('click', rollDice);
document.querySelector('.btn-hold').addEventListener('click', hold);
document.querySelector('.btn-new').addEventListener('click', newGame);
document.querySelector('.max-score').addEventListener('input', function(){
    winAmount = parseInt(document.getElementById('max-score').value)
});
newGame();