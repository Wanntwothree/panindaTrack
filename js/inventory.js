const nameInput = document.getElementById('productName-input');
const priceInput = document.getElementById('price-input');
const quantityInput = document.getElementById('quantity-input');
const addBtn = document.getElementById('addBtn');
const editBtn = document.getElementById('editBtn');
const deleteBtn = document.getElementById('deleteBtn');
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
    if (name === '' || price <= 0 || quantity <= 0) return null;
    return { name, price, quantity };
}

function displayProducts() {
    const products = loadProducts();
    display.replaceChildren();

    if (products.length === 0) {
        display.textContent = 'No products yet.';
        return;
    }

    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const headRow = document.createElement('tr');
    ['Product', 'Price', 'Qty'].forEach(text => {
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

        if (index === selectedIndex) row.classList.add('selected');

        row.addEventListener('click', () => {
            selectedIndex = index;
            nameInput.value = p.name;
            priceInput.value = p.price;
            quantityInput.value = p.quantity;
            displayProducts();
        });

        tbody.appendChild(row);
    });

    table.appendChild(thead);
    table.appendChild(tbody);
    display.appendChild(table);
}

addBtn.addEventListener('click', () => {
    const product = readInputs();
    if (!product) return;

    if(nameExists(product.name, -1)){
        message.textContent = 'This product already exists.';
        return;
    }
    message.textContent = '';

    const products = loadProducts();
    products.push(product);
    saveProducts(products);
    clearInputs();
    displayProducts();
});

editBtn.addEventListener('click', () => {
    if (selectedIndex === null) return;
    const product = readInputs();
    if (!product) return;
    
    if(nameExists(product.name, selectedIndex)){
        message.textContent = 'This product already exists.';
        return;
    }
    message.textContent = '';

    const products = loadProducts();
    products[selectedIndex] = product;
    saveProducts(products);
    clearInputs();
    displayProducts();
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
    if (selectedIndex === null) return;

    let seconds = 5;
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
});

noBtn.addEventListener('click', closeDialog);
dialog.addEventListener('cancel', () => clearInterval(timer));

displayProducts();

function nameExists(name, ignoreIndex){
    const products = loadProducts();
    return products.some((p, i) =>
        i !== ignoreIndex && p.name.toLowerCase() === name.toLowerCase()
    );
}