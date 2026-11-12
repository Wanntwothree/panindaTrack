const salesDisplay = document.getElementById('sales-display');
const totalDisplay = document.getElementById('total');
const checkoutBtn = document.getElementById('checkoutBtn');

let cart = {};

function loadProducts(){
    return JSON.parse(localStorage.getItem('products')) || [];
}

const salesMessage = document.getElementById('sales-message');
let salesMessageTimer = null;

function showSalesMessage(text){
    clearTimeout(salesMessageTimer);
    salesMessage.textContent = text;
    if(text === '') return;
    salesMessageTimer = setTimeout(() => salesMessage.textContent = '', 2500);
}

function updateTotal(){
    let total = 0;
    loadProducts().forEach((p, index) => {
        total += p.price * (cart[index] || 0); 
    });
    totalDisplay.textContent = `₱${total.toFixed(2)}`;
}

function setQty(index, p, input){
    const raw = input.value.trim();
    if(raw === ''){
        cart[index] = 0;
        updateTotal();
        return;
    }

    let qty = Number(raw);
    if(!Number.isFinite(qty) || qty < 0){
        qty = 0;
        input.value = 0;
        showSalesMessage('Quantity cannot be negative.');
    }else if(!Number.isInteger(qty)){
        qty = Math.floor(qty);
        input.value = qty;
        showSalesMessage('Quantity must be a whole number.');
    }

    if(qty > p.quantity){
        qty = p.quantity;
        input.value = qty;
        showSalesMessage(`Only ${p.quantity} ${p.name} in stock`);
    }

    cart[index] = qty;
    updateTotal();
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

        if(p.quantity === 0){
            const noStock = document.createElement('span');
            noStock.className = 'badge none';
            noStock.textContent = 'No stock';
            qtyCell.appendChild(noStock);
        }else{
            const box = document.createElement('div');
            box.className = 'qty-box';

            const minusBtn = document.createElement('button');
            minusBtn.type = 'button';
            minusBtn.textContent = '-';
            
            const qtyInput = document.createElement('input');
            qtyInput.type = 'number';
            qtyInput.min = '0';
            qtyInput.max = p.quantity;
            qtyInput.step = '1';
            qtyInput.value = cart[index] || 0;

            const plusBtn = document.createElement('button');
            plusBtn.type = 'button';
            plusBtn.textContent = '+';

            minusBtn.addEventListener('click', () => {
                const current = cart[index] || 0;
                if(current > 0){
                    qtyInput.value = current - 1;
                    setQty(index, p, qtyInput);
                }
            });
            
            plusBtn.addEventListener('click', () => {
                const current = cart[index] || 0;
                if(current < p.quantity){
                    qtyInput.value = current + 1;
                    setQty(index, p, qtyInput);
                }else{
                    showSalesMessage(`Only ${p.quantity} ${p.name} in stock.`);
                }
            });
            
            qtyInput.addEventListener('input', () => setQty(index, p, qtyInput));
            qtyInput.addEventListener('keydown', (e) => {
                if(['.', '-', 'e', '+', ','].includes(e.key)) e.preventDefault();
            });
            qtyInput.addEventListener('focus', () => qtyInput.select());

            box.append(minusBtn, qtyInput, plusBtn);
            qtyCell.appendChild(box);
        }

        row.appendChild(qtyCell);
        tbody.appendChild(row);
    })

    table.appendChild(tbody);
    salesDisplay.appendChild(table);

    updateTotal();
}

displaySales();

const checkoutDialog = document.getElementById('checkout-dialog');
const checkoutSummary = document.getElementById('checkout-summary');
const checkoutTotal = document.getElementById('checkout-total');
const confirmBtn = document.getElementById('confirmBtn');
const backBtn = document.getElementById('backBtn');

checkoutBtn.addEventListener('click', () => {
    const products = loadProducts();

    for(let i = 0; i < products.length; i++){
        if((cart[i] || 0) > products[i].quantity){
            cart[i] = products[i].quantity;
            displaySales();
            showSalesMessage(`
                Only ${products[i].quantity} 
                ${products[i].name} in stock. Quantity adjusted.
            `);
            return;
        }
    }

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

    if(!hasItems){
        showSalesMessage('Add at least one item before checkout.');
        return;
    }

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
            displaySales();
            showSalesMessage(`Not enough stock for ${products[i].name}.`);
            return;
        }
    }

    products.forEach((p, index) => {
        const qty = cart[index] || 0;
        if(qty === 0) return;

        p.quantity -= qty;
        logStock(p.name, 'out', qty, p.quantity);
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


