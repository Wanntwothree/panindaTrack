const salesDisplay = document.getElementById('sales-display');
const totalDisplay = document.getElementById('total');
const checkoutBtn = document.getElementById('checkoutBtn');

let cart = {};

function loadProducts(){
    return JSON.parse(localStorage.getItem('products')) || [];
}

function displaySales(){
    const products = loadProducts();
    salesDisplay.replaceChildren();

    const table = document.createElement('table');
    const tbody = document.createElement('tbody');

    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');

    ['Product', 'Price', 'Stock', 'Qty'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headRow.appendChild(th);
    });

    thead.appendChild(headRow);
    table.appendChild(thead);

    products.forEach((p, index) => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = p.name;
        row.appendChild(nameCell);

        const priceCell = document.createElement('td');
        priceCell.textContent = `₱${p.price.toFixed(2)}`;
        row.appendChild(priceCell);

        const stockCell = document.createElement('td');
        stockCell.textContent = p.quantity;
        row.appendChild(stockCell);

        const qtyCell = document.createElement('td');

        const minusBtn = document.createElement('button');
        minusBtn.type = 'button';
        minusBtn.textContent = '-';

        const qtySpan = document.createElement('span');
        qtySpan.textContent = cart[index] || 0;

        const plusBtn = document.createElement('button');
        plusBtn.type = 'button';
        plusBtn.textContent = '+';

        plusBtn.addEventListener('click', () => {
            const current = cart[index] || 0;
            if(current < p.quantity){
                cart[index] = current + 1;
                displaySales();
            }
        });

        minusBtn.addEventListener('click', () => {
            const current = cart[index] || 0;
            if(current > 0){
                cart[index] = current - 1;
                displaySales();
            }
        });

        qtyCell.appendChild(minusBtn);
        qtyCell.appendChild(qtySpan);
        qtyCell.appendChild(plusBtn);
        row.appendChild(qtyCell);

        tbody.appendChild(row);
    })

    table.appendChild(tbody);
    salesDisplay.appendChild(table);

    let total = 0;

    products.forEach((p, index) => {
        const qty = cart[index] || 0;
        total += p.price * qty;
    });

    totalDisplay.textContent = `₱${total.toFixed(2)}`;
}

displaySales();

const checkoutDialog = document.getElementById('checkout-dialog');
const checkoutSummary = document.getElementById('checkout-summary');
const checkoutTotal = document.getElementById('checkout-total');
const confirmBtn = document.getElementById('confirmBtn');
const backBtn = document.getElementById('backBtn');

checkoutBtn.addEventListener('click', () => {
    const products = loadProducts();
    checkoutSummary.replaceChildren();

    let total = 0;
    let hasItems = false;

    products.forEach((p, index) => {
        const qty = cart[index] || 0;
        if(qty === 0) return;

        hasItems = true;
        total += p.price * qty;

        const line = document.createElement('div');
        line.textContent = `${p.name} x ${qty} - ₱${(p.price * qty).toFixed(2)}`;
        checkoutSummary.appendChild(line);
    });

    if(!hasItems) return;

    checkoutTotal.textContent = `₱${total.toFixed(2)}`;
    checkoutDialog.showModal();
});

backBtn.addEventListener('click', () => {
    checkoutDialog.close();
});

confirmBtn.addEventListener('click', () => {
    const products = loadProducts();
    let total = 0;
    const items = [];

    for(let i = 0; i < products.length; i++){
        if((cart[i] || 0) > products[i].quantity){
            checkoutDialog.close();
            return;
        }
    }

    products.forEach((p, index) => {
        const qty = cart[index] || 0;
        if(qty === 0) return;

        p.quantity -= qty;
        total += p.price * qty;
        items.push({name: p.name, price: p.price, qty: qty});
    });

    localStorage.setItem('products', JSON.stringify(products));

    const sales = JSON.parse(localStorage.getItem('sales')) || [];
    const id = 'S-' + String(sales.length + 1).padStart(4, '0');
    sales.push({id: id, date: new Date().toISOString(), items: items, total: total});
    localStorage.setItem('sales', JSON.stringify(sales));

    cart = {};
    checkoutDialog.close();
    displaySales();
});


