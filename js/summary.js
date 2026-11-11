const totalAll = document.getElementById('total-all');
const topDisplay = document.getElementById('top-display');

const totalStockEl = document.getElementById('total-stock');
const totalInEl = document.getElementById('total-in');
const totalOutEl = document.getElementById('total-out');
const statusDisplay = document.getElementById('status-display');
const statusBtns = document.querySelectorAll('.status-btn');
let currentStatus = 'all';

const todayDate = document.getElementById('today-date');

const checkoutCount = document.getElementById('checkout-count');

function showToday(){
    todayDate.textContent = new Date().toLocaleDateString([], {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
}

showToday();
setInterval(showToday, 60000);

function loadLogs(){
    return JSON.parse(localStorage.getItem('stockLogs')) || [];
}

function loadProducts(){
    return JSON.parse(localStorage.getItem('products')) || [];
}

function loadSales(){
    return JSON.parse(localStorage.getItem('sales')) || [];
}

function dateKey(iso){
    const d = new Date(iso);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
}

function displaySummary(){
    const sales = loadSales();

    let total = 0;
    sales.forEach(s => {
        total += s.total;
    });

    totalAll.textContent = `₱${total.toFixed(2)}`;
    checkoutCount.textContent = `${sales.length} checkout${sales.length === 1 ? '' : 's'}`;

    const units = {};

    sales.forEach(s => {
        s.items.forEach(i => {
            units[i.name] = (units[i.name] || 0) + i.qty;
        });
    });

    const ranked = Object.entries(units).sort((a,b) => b[1] - a[1]);

    topDisplay.replaceChildren();

    if(ranked.length === 0){
        topDisplay.textContent = 'No sales yet';
    }else{
        const topTable = document.createElement('table');
        const topBody = document.createElement('tbody');

        ranked.forEach((r, index) => {
            const row = document.createElement('tr');

            [index + 1, r[0], r[1]].forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                row.appendChild(td);
            });

            topBody.appendChild(row);
        });

        topTable.appendChild(topBody);
        topDisplay.appendChild(topTable);
    }
    displayStockCards();
    displayStatus();
}

//stock status cards
function displayStockCards(){
    let stock = 0;
    loadProducts().forEach(p => stock += p.quantity);
    totalStockEl.textContent = stock;

    let totalIn = 0;
    let totalOut = 0;
    loadLogs().forEach(l => {
        if(l.type === 'in') totalIn += l.qty;
        else totalOut += l.qty;
    });
    totalInEl.textContent = totalIn;
    totalOutEl.textContent = totalOut;
}

function getStatus(qty){
    if(qty > 10) return 'high';
    if(qty > 5) return 'moderate';
    return 'low';
}

function displayStatus(){
    const items = loadProducts().filter(p =>
        currentStatus === 'all' || getStatus(p.quantity) === currentStatus
    );

    statusDisplay.replaceChildren();

    if(items.length === 0){
        statusDisplay.textContent = 'No products with this status.';
        return;
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['Product', 'Qty', 'Status'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    items.forEach(p => {
        const status = getStatus(p.quantity);
        const row = document.createElement('tr');

        [p.name, p.quantity, null].forEach((value, i) => {
            const td = document.createElement('td');
            if(i === 2){
                const badge = document.createElement('span');
                badge.className = `badge ${status}`;
                badge.textContent = status.charAt(0).toUpperCase() + status.slice(1);
                td.appendChild(badge);
            }else{
                td.textContent = value;
            }
            row.appendChild(td);
        });

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    statusDisplay.appendChild(table);
}

statusBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        currentStatus = btn.dataset.status;
        statusBtns.forEach(b => b.classList.toggle('active', b === btn));
        displayStatus();
    });
});

displaySummary();