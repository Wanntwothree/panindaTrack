const fromInput = document.getElementById('from-input');
const toInput = document.getElementById('to-input');
const typeInput = document.getElementById('type-input');
const clearBtn = document.getElementById('clearBtn');
const totalStockEl = document.getElementById('total-stock');
const totalInEl = document.getElementById('total-in');
const totalOutEl = document.getElementById('total-out');
const historyDisplay = document.getElementById('history-display');
const historyMessage = document.getElementById('history-message');

function loadProducts(){
    return JSON.parse(localStorage.getItem('products')) || [];
}

function loadLogs(){
    return JSON.parse(localStorage.getItem('stockLogs')) || [];
}

function monthKey(iso){
    const d = new Date(iso);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${month}`;
}

function formatDate(iso){
    const d = new Date(iso);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = String(d.getFullYear()).slice(-2);
    return `${month}/${day}/${year}`;
}

function displayHistory(){
    let stock = 0;
    loadProducts().forEach(p => stock += p.quantity);
    totalStockEl.textContent = stock;
    totalInEl.textContent = 0;
    totalOutEl.textContent = 0;

    historyMessage.textContent = '';
    historyDisplay.replaceChildren();

    if(fromInput.value && !toInput.value){
        historyMessage.textContent = 'Please select a To month.';
        return;
    }

    if(!fromInput.value && toInput.value){
        historyMessage.textContent = 'Please select a From month.';
        return;
    }

    if(fromInput.value && toInput.value && fromInput.value > toInput.value){
        historyMessage.textContent = 'From month cannot be later than To month.';
        return;
    }

    let logs = loadLogs().sort((a, b) => new Date(b.date) - new Date(a.date));

    if(fromInput.value) logs = logs.filter(l => dateKey(l.date) >= fromInput.value);
    if(toInput.value) logs = logs.filter(l => dateKey(l.date) <= toInput.value);
    if(typeInput.value !== 'all') logs = logs.filter(l => l.type === typeInput.value);

    historyDisplay.replaceChildren();

    if(logs.length === 0){
        const table = document.createElement('table');

        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');
        ['Date', 'Time', 'Product', 
            'Type', 'Qty', 'Stock after'].forEach(text => {
                const th = document.createElement('th');
                th.textContent = text;
                headRow.appendChild(th);
            });
        thead.appendChild(headRow);
        table.appendChild(thead);

        const tbody = document.createElement('tbody');
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 6;
        cell.className = 'empty-cell';
        cell.textContent = 'No stock logs yet.';
        row.appendChild(cell);
        tbody.appendChild(row);
        table.appendChild(tbody);

        historyDisplay.replaceChildren(table);
        return;
    }

    let totalIn = 0;
    let totalOut = 0;
    logs.forEach(l => {
        if(l.type === 'in') totalIn += l.qty;
        else totalOut += l.qty;
    });
    totalInEl.textContent = totalIn;
    totalOutEl.textContent = totalOut;

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['Date', 'Time', 'Product', 'Type', 'Qty', 'Stock after'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    logs.forEach(l => {
        const d = new Date(l.date);
        const dateText = formatDate(l.date);
        const timeText = d.toLocaleTimeString([], 
            {hour: '2-digit', minute: '2-digit'});
        const typeText = l.type === 'in' ? 'Stock in' : 'Stock out';
        const qtyText = (l.type === 'in' ? '+' : '-') + l.qty;

        const row = document.createElement('tr');
        [dateText, timeText, l.product, typeText, qtyText, l.after].forEach((value, i) => {
            const td = document.createElement('td');
            if(i === 3){
                const badge = document.createElement('span');
                badge.className = `badge ${l.type}`;
                badge.textContent = typeText;
                td.appendChild(badge);
            }else{
                td.textContent = value;
            }
            row.appendChild(td);
        });
        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    historyDisplay.appendChild(table);
}

[fromInput, toInput, typeInput].forEach(input => {
    input.addEventListener('change', displayHistory);
});

clearBtn.addEventListener('click', () => {
    fromInput.value = '';
    toInput.value = '';
    typeInput.value = 'all';
    displayHistory();
});

displayHistory();

const tabBtns = document.querySelectorAll('.tab-btn');
const stockSection = document.getElementById('stock-section');
const checkoutSection = document.getElementById('checkout-section');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const isStock = btn.dataset.tab === 'stock';
        stockSection.hidden = !isStock;
        checkoutSection.hidden = isStock;
        tabBtns.forEach(b => b.classList.toggle('active', b === btn));
    });
});

const coFrom = document.getElementById('co-from');
const coTo = document.getElementById('co-to');
const coClear = document.getElementById('co-clear');
const coMessage = document.getElementById('co-message');
const coTotal = document.getElementById('co-total');
const coTop = document.getElementById('co-top');
const coDisplay = document.getElementById('co-display');

const receiptDialog = document.getElementById('receipt-dialog');
const rcHead = document.getElementById('rc-head');
const rcItems = document.getElementById('rc-items');
const rcTotal = document.getElementById('rc-total');
const rcClose = document.getElementById('rc-close');

function loadSales(){
    return JSON.parse(localStorage.getItem('sales')) || [];
}

function dateKey(iso){
    const d = new Date(iso);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
}

function makeRow(left, right){
    const row = document.createElement('div');
    row.className = 'co-row';
    const l = document.createElement('span');
    l.textContent = left;
    const r = document.createElement('span');
    r.textContent = right;
    row.append(l, r);
    return row;
}

function showReceipt(s){
    rcHead.replaceChildren();
    rcItems.replaceChildren();
    rcTotal.replaceChildren();

    const d = new Date(s.date);
    const dateText = formatDate(s.date);
    const timeText = d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

    const idLine = document.createElement('div');
    idLine.textContent = s.id;
    idLine.style.fontWeight = '600';
    const dateLine = document.createElement('div');
    dateLine.textContent = `${dateText} · ${timeText}`;
    rcHead.append(idLine, dateLine);

    s.items.forEach(i => {
        rcItems.appendChild(makeRow(`${i.name} x ${i.qty}`, `₱${(i.price * i.qty).toFixed(2)}`));
    });

    rcTotal.appendChild(makeRow('Total', `₱${s.total.toFixed(2)}`));
    receiptDialog.showModal();
}

function displayCheckouts(){
    coMessage.textContent = '';
    coTotal.textContent = '₱0.00';
    coTop.replaceChildren();
    coDisplay.replaceChildren();

    if(coFrom.value && !coTo.value){
        coMessage.textContent = 'Please select a To date.';
        return;
    }
    if(!coFrom.value && coTo.value){
        coMessage.textContent = 'Please select a From date.';
        return;
    }
    if(coFrom.value && coTo.value && coFrom.value > coTo.value){
        coMessage.textContent = 'From date cannot be later than To date.';
        return;
    }

    let sales = loadSales().sort((a, b) => new Date(b.date) - new Date(a.date));
    if(coFrom.value) sales = sales.filter(s => dateKey(s.date) >= coFrom.value);
    if(coTo.value) sales = sales.filter(s => dateKey(s.date) <= coTo.value);

    let total = 0;
    const units = {};
    sales.forEach(s => {
        total += s.total;
        s.items.forEach(i => {
            units[i.name] = (units[i.name] || 0) + i.qty;
        });
    });
    coTotal.textContent = `₱${total.toFixed(2)}`;

    const ranked = Object.entries(units).sort((a, b) => b[1] - a[1]);

    const unitsHead = makeRow('Product', 'Units');
    unitsHead.classList.add('co-head');
    coTop.appendChild(unitsHead);

    if(ranked.length === 0){
        const empty = document.createElement('div');
        empty.className = 'co-empty';
        empty.textContent = 'No sales';
        coTop.appendChild(empty);
    }else{
        ranked.forEach((r, index) => {
            coTop.appendChild(makeRow(`${index + 1}. ${r[0]}`, r[1]));
        });
    }

    if(sales.length === 0){
        const table = document.createElement('table');
        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');
        ['ID', 'Date', 'Time', 'Units', 'Total', ''].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        table.appendChild(thead);

        // One row with one cell that stretches across all 6 columns
        const tbody = document.createElement('tbody');
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 6;
        cell.className = 'empty-cell';
        cell.textContent = 'No checkouts in this range.';
        row.appendChild(cell);
        tbody.appendChild(row);
        table.appendChild(tbody);

        coDisplay.replaceChildren(table);
        return;
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['ID', 'Date', 'Time', 'Units', 'Total', ''].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);
    table.appendChild(thead);

    const tbody = document.createElement('tbody');
    sales.forEach(s => {
        let unitCount = 0;
        s.items.forEach(i => unitCount += i.qty);

        const d = new Date(s.date);
        const dateText = formatDate(s.date);
        const timeText = d.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});

        const row = document.createElement('tr');
        [s.id, dateText, timeText, unitCount, `₱${s.total.toFixed(2)}`].forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            row.appendChild(td);
        });

        const actionTd = document.createElement('td');
        const viewBtn = document.createElement('button');
        viewBtn.type = 'button';
        viewBtn.textContent = 'View';
        viewBtn.addEventListener('click', () => showReceipt(s));
        actionTd.appendChild(viewBtn);
        row.appendChild(actionTd);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    coDisplay.appendChild(table);
}

[coFrom, coTo].forEach(input => {
    input.addEventListener('change', displayCheckouts);
});

coClear.addEventListener('click', () => {
    coFrom.value = '';
    coTo.value = '';
    displayCheckouts();
});

rcClose.addEventListener('click', () => receiptDialog.close());

displayCheckouts();