startGame(16, 16, 40);

function startGame(width, height, bombsNumber) {

    const field = document.querySelector('.field');
    const cellsCount = width * height;
    field.innerHTML = '<button class="cell field"></button>'.repeat(cellsCount);
    const cells = [...field.children];
    let firstClick = true;
    let bombsIndex;
    let startTime = null;
    let startBombs = bombsNumber;
    let closedCount = cellsCount;
    let revealedCells = new Set();
    const happy = document.querySelector('.face button');


    field.addEventListener('click', (e) => {
        if (e.target.tagName !== 'BUTTON') {
            return;
        }

        if (firstClick) {
            if (e.target.matches('.cell') || e.target.matches('.question')){
                startTime = 0;
                timeInterval = setInterval(updateClock, 1000);
                bombsIndex = [...Array(cellsCount)
                    .keys()]
                    .sort(() => Math.random() - 0.5)
                    .slice(0, bombsNumber);

                let firstIndex = cells.indexOf(e.target);

                if (bombsIndex.includes(firstIndex)) {
                    let newIndex;
                    do {
                        newIndex = Math.floor(Math.random() * cellsCount);
                    } while (bombsIndex.includes(newIndex));
                    
                    bombsIndex.splice(bombsIndex.indexOf(firstIndex), 1, newIndex); 
                }
                firstClick = false;  
            } else return;
        }
         
        const index = cells.indexOf(e.target);
        const column = index % width;
        const row = Math.floor(index / width);
        
        revealCells(row, column);
    });

    field.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        if (e.target.disabled) {
            return;
        }
        if (e.target.matches('.cell')) {
            e.target.classList.replace('cell', 'flag');
            updateBombsCounter(-1);
        } else if (e.target.matches('.flag')) {
            e.target.classList.replace('flag', 'question');
            updateBombsCounter(1)
        } else if (e.target.matches('.question_down')) {
            e.target.classList.replace('question_down', 'cell');
        }
    });

    happy.addEventListener('mousedown', (e) => {
        e.target.classList.replace('face_happy', 'face_happy_down');
    });

    happy.addEventListener('mouseleave', (e) => {
        e.target.classList.replace('face_happy_down', 'face_happy');
    });
    
    happy.addEventListener('mouseup', (e) => {
        e.target.classList.replace('face_happy_down', 'face_happy');
    });
    
    happy.addEventListener('click', () => {
        location.reload();
    });

    field.addEventListener('mousedown', (e) => {
        happy.classList.replace('face_happy', 'face_wow');
        e.target.classList.replace('question', 'question_down');
    });

    field.addEventListener('mouseout', (e) => {
        happy.classList.replace('face_wow', 'face_happy');
        e.target.classList.replace('question_down', 'question');
    });

    field.addEventListener('mouseup', (e) => {
        happy.classList.replace('face_wow', 'face_happy');
        e.target.classList.replace('question_down', 'question');
    });

    function calcCellStatus(row, column) {
        let count = 0;
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if (isBomb(row + j, column + i)) {
                    count++;
                }
            }
        }
        return count;
    }

    function revealCells(row, column) {
        let index = row * width + column;
        const cell = cells[index];
        const cellStatus = calcCellStatus(row, column);
        if (isBomb(row, column)) {
            cell.className = 'bomb_red field'
            gameOver();
        } else if (cellStatus > 0) {
            cell.className = `num-${cellStatus} field`
            if (!revealedCells.has(cell)) {
                closedCount--;
                revealedCells.add(cell);
            }        
        } else if (cell.matches('.cell') || cell.matches('.question')) {
            cell.className = 'empty field'
            if (!revealedCells.has(cell)) {
                closedCount--;
                revealedCells.add(cell);
            }            

            for (let i = -1; i <= 1; i++) {
                for (let j = -1; j <= 1; j++) {
                    if (checkCell(row + i, column + j)) {
                        let adjIndex = (row + i) * width + (column + j);
                        let adjCell = cells[adjIndex];
                        if (!adjCell.matches('.empty')) {
                            if (adjCell.matches('.flag')) {
                                return
                            }
                            revealCells(row + i, column + j);
                        }
                    }
                }
            }          
        }
        if (closedCount <= bombsNumber) {
            gameWin();
        }
    }

    function isBomb(row, column) {
        if (!checkCell(row, column)) return false;

        const index = row * width + column;
        return bombsIndex.includes(index);
    }

    function checkCell(row, column) {
        return row >= 0 && row < height && column >= 0 && column < width;
    }

    function gameOver() {
        happy.classList.replace('face_happy', 'face_lose');

        bombsIndex.forEach(elem => {
            if (cells[elem].matches('.flag')) {
                cells[elem].classList.replace('flag', 'bomb_cross');
            } else {
                cells[elem].classList.replace('cell', 'bomb_white');
            }
        })

        clearInterval(timeInterval);
        cells.forEach(elem => {
            elem.disabled = true;
        })
    }

    function gameWin() {
        happy.classList.replace('face_happy', 'face_win');

        clearInterval(timeInterval);
        cells.forEach(elem => {
            elem.disabled = true;
        }) 
    }

    function updateClock() {
        const timer = document.querySelector('.timer');
        const numbers = [...timer.children];
        
        startTime++;
        const timeString = startTime.toString().padStart(3, '0');

        for (let i = 0; i < 3; i++) {
            const digit = timeString.charAt(i);
            numbers[i].className = `digit num${digit}`;
        }
    }

    function updateBombsCounter(num) {
        const bombs_count = document.querySelector('.counter');
        const numbers = [...bombs_count.children];

        startBombs += num;
        const bombString = startBombs.toString().padStart(3, '0');

        for (let i = 0; i < 3; i++) {
            const digit = bombString.charAt(i);
            numbers[i].className = `digit num${digit}`;
        }
    }
}




