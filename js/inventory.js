const nameInput = document.getElementById('productName-input');
const priceInput = document.getElementById('price-input');
const quantityInput = document.getElementById('quantity-input');
const addBtn = document.getElementById('addBtn');
const deleteBtn = document.getElementById('deleteBtn');
const backBtn = document.getElementById('backBtn');
const display = document.getElementById('products-display');
const message = document.getElementById('message');

let selectedIndex = null;

function loadProducts() {
    return JSON.parse(localStorage.getItem('products')) || [];
}

function saveProducts(products) {
    localStorage.setItem('products', JSON.stringify(products));
}

function clearInputs() {
    nameInput.value = '';
    priceInput.value = '';
    quantityInput.value = '';
    selectedIndex = null;
}

function readInputs() {
    const name = nameInput.value.trim();
    const price = Number(priceInput.value);
    const quantity = Number(quantityInput.value);
    //name is empty
    if(name === ''){
        showMessage('Product name is required.', 'error');
        return null;
    }
    //if name is long
    if(name.length > 50){
        showMessage('Name must be 50 characters or less.', 'error');
        return null;
    }
    //if price is 0
    if(priceInput.value === '' || !Number.isFinite(price) || price <= 0){
        showMessage('Price must be a number greater than 0.', 'error');
        return null;
    }
    //if quantity 0
    if(quantityInput.value === '' || !Number.isInteger(quantity) || quantity < 0){
        showMessage('Quantity must be a whole number (0 or more).', 'error');
        return null;
    }
    return { name, price, quantity };
}

//displaying the buttons, tables, text
function displayProducts() {
    updateButtons();
    const products = loadProducts();
    display.replaceChildren();

    if (products.length === 0) {
        display.textContent = 'No products yet.';
        return;
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['Product', 'Price', 'Qty', 'Actions'].forEach(text => {
        const th = document.createElement('th');
        th.textContent = text;
        headRow.appendChild(th);
    });
    thead.appendChild(headRow);

    const tbody = document.createElement('tbody');
    products.forEach((p, index) => {
        const row = document.createElement('tr');
        [p.name, `₱${p.price.toFixed(2)}`, p.quantity].forEach(value => {
            const td = document.createElement('td');
            td.textContent = value;
            row.appendChild(td);
        });

        //placing the edit and delete buttons beside the quantity
        const actionTd = document.createElement('td');
        const editRowBtn = document.createElement('button');
        editRowBtn.textContent = 'Edit';

        if(index === selectedIndex) editRowBtn.classList.add('active');

        editRowBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedIndex = index;
            nameInput.value = p.name;
            priceInput.value = p.price;
            quantityInput.value = p.quantity;
            displayProducts();
        });

        const deleteRowBtn = document.createElement('button');
        deleteRowBtn.textContent = 'Delete';
        deleteRowBtn.classList.add('delete-btn');
        deleteRowBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedIndex = index;
            deleteBtn.click();
        });

        const stockRowBtn = document.createElement('button');
        stockRowBtn.textContent = 'Add Stock';
        stockRowBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            stockIndex = index;
            stockTitle.textContent = `Add stock to ${p.name} (current: ${p.quantity})`;
            stockInput.value = '';
            stockError.textContent = '';
            stockDialog.showModal();
        });

        actionTd.append(stockRowBtn, editRowBtn, deleteRowBtn);
        row.appendChild(actionTd);

        if (index === selectedIndex) row.classList.add('selected');

        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    display.appendChild(table);
}

/*input validation*/
let messageTimer = null;
function showMessage(text, type) {
    clearTimeout(messageTimer);
    message.textContent = text;
    message.className = type; // 'error' or 'success'

    if(text === '') return;

    void message.offsetWidth;
    message.classList.add('show');
    messageTimer = setTimeout(() => message.classList.remove('show'), 2500);
}

function updateButtons(){
    addBtn.textContent = selectedIndex === null ? 'Add Product' : 'Save';
    backBtn.style.display = selectedIndex === null ? 'none' : 'inline-block';
    quantityInput.disabled = selectedIndex !== null;
}

//adding products
addBtn.addEventListener('click', () => {
    const product = readInputs();
    if (!product) return;

    const editing = selectedIndex !== null;
    if(nameExists(product.name, editing ? selectedIndex : -1)){
        showMessage('Product already exists.', 'error');
        return;
    }

    const products = loadProducts();
    if(editing) products[selectedIndex] = product;
    else {
        products.push(product);
        logStock(product.name, 'in', product.quantity, product.quantity);
    }
    saveProducts(products);
    clearInputs();
    displayProducts();
    showMessage(editing ? 
        'Product updated successfully!' : 'Product added successfully!', 'success'
    );
});

backBtn.addEventListener('click', () => {
    clearInputs();
    displayProducts();
    showMessage('', '');
});

const dialog = document.getElementById('confirm-dialog');
const yesBtn = document.getElementById('yesBtn');
const noBtn = document.getElementById('noBtn');
let timer = null;

function closeDialog() {
    clearInterval(timer);
    dialog.close();
}

deleteBtn.addEventListener('click', () => {
    //not select product error
    if (selectedIndex === null){
        showMessage('Select a product first.', 'error');
        return;
    }

    let seconds = 2;
    yesBtn.disabled = true;
    yesBtn.textContent = `Yes (${seconds})`;
    dialog.showModal();

    timer = setInterval(() => {
        seconds--;
        if (seconds > 0) {
            yesBtn.textContent = `Yes (${seconds})`;
        } else {
            clearInterval(timer);
            yesBtn.textContent = 'Yes';
            yesBtn.disabled = false;
        }
    }, 1000);
});

yesBtn.addEventListener('click', () => {
    const products = loadProducts();
    products.splice(selectedIndex, 1);
    saveProducts(products);
    clearInputs();
    displayProducts();
    closeDialog();
    showMessage('Product deleted successfully!', 'success');
});

noBtn.addEventListener('click', () => {
    closeDialog();
    clearInputs();
    displayProducts();
});

dialog.addEventListener('cancel', () => {
    clearInterval(timer);
    clearInputs();
    displayProducts();
});

displayProducts();

//Add stock dialog
const stockDialog = document.getElementById('stock-dialog');
const stockTitle = document.getElementById('stock-title');
const stockInput = document.getElementById('stock-input');
const stockError = document.getElementById('stock-error');
const stockSaveBtn = document.getElementById('stockSaveBtn');
const stockCancelBtn = document.getElementById('stockCancelBtn');
let stockIndex = null;

stockSaveBtn.addEventListener('click', () => {
    const qty = Number(stockInput.value);
    if(stockInput.value === '' || !Number.isInteger(qty) || qty <= 0){
        stockError.textContent = 'Enter a whole number greater than 0.';
        return;
    }
    const products = loadProducts();
    products[stockIndex].quantity += qty;
    logStock(products[stockIndex].name, 'in', qty, products[stockIndex].quantity);
    saveProducts(products);
    stockDialog.close();
    displayProducts();
    showMessage('Stock updated successfully!', 'success');
});

stockCancelBtn.addEventListener('click', () => stockDialog.close());

function nameExists(name, ignoreIndex){
    const products = loadProducts();
    return products.some((p, i) =>
        i !== ignoreIndex && p.name.toLowerCase() === name.toLowerCase()
    );
}