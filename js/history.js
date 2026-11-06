const dateInput = document.getElementById('date-input');
const clearBtn = document.getElementById('clearBtn');

function dateKey(iso){
    const d = new Date(iso);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
}

const historyDisplay = document.getElementById('history-display');

function loadSales(){
    return JSON.parse(localStorage.getItem('sales')) || [];
}

function displayHistory(){
    const all = loadSales().sort((a, b) => new Date(b.date) - new Date(a.date));
    let sales = all;

    if(dateInput.value){
        sales = sales.filter(s => dateKey(s.date) === dateInput.value);
    }

    historyDisplay.replaceChildren();

    if(sales.length === 0){
        historyDisplay.textContent = 'No checkouts yet.';
        return;
    }

    const table = document.createElement('table');

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['ID', 'Date', 'Time', 'Units', 'Total'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');

    sales.forEach(s => {
        let unitCount = 0;
        s.items.forEach(i => {
            unitCount += i.qty;
        });

        const d = new Date(s.date);
        const dateText = d.toLocaleDateString([], 
            {year: 'numeric', month: 'short', day: 'numeric'}
        );

        const timeText = d.toLocaleTimeString([], 
            {hour: '2-digit', minute: '2-digit'}
        );

        const row = document.createElement('tr');
        [s.id, dateText, timeText, unitCount, `₱${s.total.toFixed(2)}`].forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            row.appendChild(td);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    historyDisplay.appendChild(table);
}

dateInput.addEventListener('change', displayHistory);

clearBtn.addEventListener('click', () => {
    dateInput.value = '';
    displayHistory();
});

displayHistory();