const totalAll = document.getElementById('total-all');
const dateInput = document.getElementById('date-input');
const topDisplay = document.getElementById('top-display');
const checkoutDisplay = document.getElementById('checkout-display');

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
    const daySales = sales.filter(s => dateKey(s.date) === dateInput.value);

    let total = 0;
    daySales.forEach(s => {
        total += s.total;
    });

    totalAll.textContent = `₱${total.toFixed(2)}`;

    const units = {};

    daySales.forEach(s => {
        s.items.forEach(i => {
            units[i.name] = (units[i.name] || 0) + i.qty;
        });
    });

    const ranked = Object.entries(units).sort((a,b) => b[1] - a[1]);

    topDisplay.replaceChildren();

    if(ranked.length === 0){
        topDisplay.textContent = 'No sales on this date.';
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

    checkoutDisplay.replaceChildren();

    if(daySales.length === 0){
        checkoutDisplay.textContent = 'No checkouts on this date.';
    }else{
        const checkoutTable = document.createElement('table');

        const thead = document.createElement('thead');
        const headRow = document.createElement('tr');
        ['ID', 'Time', 'Units', 'Total'].forEach(text => {
            const th = document.createElement('th');
            th.textContent = text;
            headRow.appendChild(th);
        });
        thead.appendChild(headRow);
        checkoutTable.appendChild(thead);

        const checkoutBody = document.createElement('tbody');

        daySales.forEach(s => {
            let unitCount = 0;
            s.items.forEach(i => {
                unitCount += i.qty;
            });

            const time = new Date(s.date).toLocaleTimeString([], 
                {hour: '2-digit', minute: '2-digit'});
            
            const row = document.createElement('tr');
            [s.id, time, unitCount, `₱${s.total.toFixed(2)}`].forEach(value => {
                const td = document.createElement('td');
                td.textContent = value;
                row.appendChild(td);
            });

        checkoutBody.appendChild(row);
        checkoutTable.appendChild(checkoutBody);
        checkoutDisplay.appendChild(checkoutTable);

        });
    }

    /*Low stock*/
    const products = loadProducts();
    const lowDisplay = document.getElementById('low-display');
    const LOW_STOCK = 5;

    lowDisplay.replaceChildren();

    const lowItems = products.filter(p => p.quantity <= LOW_STOCK);
    
    if(lowItems.length === 0){
        lowDisplay.textContent = 'No low stock products.';
        return;
    }

    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    lowItems.forEach(p => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = p.name;
        row.appendChild(nameCell);

        const stockCell = document.createElement('td');
        stockCell.textContent = p.quantity;
        row.appendChild(stockCell);

        tbody.appendChild(row);
    });

    table.appendChild(tbody);
    lowDisplay.appendChild(table);
}

dateInput.value = dateKey(new Date().toISOString());
dateInput.addEventListener('change', displaySummary);
displaySummary();