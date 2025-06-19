document.addEventListener('DOMContentLoaded', function () {
    const toggleCartButton = document.getElementById('toggleCartButton');
    const cartAside = document.getElementById('cartAside');
    const orderList = document.querySelector('.order.list');
    const totalAmountSpan = document.querySelector('.order.total .total-amount');
    const orderCardCount = document.querySelector('.order.summary .order.count');
    const pizzaContainer = document.querySelector('.pizza-container');

    let allPizzas = [];
    let cartItems = [];

    const LOCAL_STORAGE_KEY = 'kmaPizzaCart';

    loadCartFromLocalStorage();
    fetchPizzas();

    function loadCartFromLocalStorage() {
        const storedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedCart) {
            cartItems = JSON.parse(storedCart);
        } else {
            cartItems = [];
        }
        initializeCartDisplay();
    }

    function saveCartToLocalStorage() {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
    }

    async function fetchPizzas() {
        try {
            const response = await fetch('./src/data/pizzas.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allPizzas = await response.json();
            displayPizzas(allPizzas);
        } catch (error) {
            console.error('Не вдалося завантажити піци:', error);
            pizzaContainer.innerHTML = '<p>Не вдалося завантажити список піц. Спробуйте пізніше.</p>';
        }
    }

    function initializeCartDisplay() {
        orderList.innerHTML = '';

        if (cartItems.length === 0) {
            toggleEmptyCartMessage();
            return;
        }
        let total = 0;
        let totalItemsInCart = 0;
        const fragment = document.createDocumentFragment();
        cartItems.forEach(item => {
            total += item.price * item.quantity;
            totalItemsInCart += item.quantity;
            fragment.appendChild(createCartElement(item));
        });
        orderList.appendChild(fragment);
        totalAmountSpan.textContent = `${total} грн`;
        orderCardCount.textContent = totalItemsInCart;

    }

    function toggleEmptyCartMessage() {
        const emptyCartMessage = document.querySelector('.empty-cart-message');
        if (cartItems.length === 0) {
            if (!emptyCartMessage) {
                const newEmptyCartMessage = document.createElement('li');
                newEmptyCartMessage.classList.add('empty-cart-message');
                newEmptyCartMessage.textContent = 'Ваш кошик порожній.';
                totalAmountSpan.textContent = '0 грн';
                orderCardCount.textContent = '0';
                orderList.innerHTML = '';
                orderList.appendChild(newEmptyCartMessage);
            }
        } else {
            if (emptyCartMessage) {
                emptyCartMessage.remove();
            }
        }
    }

    function createCartElement(item) {
        toggleEmptyCartMessage();
        const li = document.createElement('li');
        li.classList.add('order', 'item');
        li.dataset.itemId = item.id;
        li.dataset.itemSize = item.size;

        li.innerHTML += `
                    <div class="item details">
                        <h3 class="item name">${item.name} (${item.size === 30 ? 'Мала' : 'Велика'})</h3>
                        <div class="item attributes">
                            <img src="images/size-icon.svg" alt="Розмір піци"> ${item.size}
                            <img src="images/weight.svg" alt="Вага піци"> ${item.weight}
                        </div>
                        <div class="item controls">
                            <span class="item price">${item.price * item.quantity}грн</span>
                            <button class="btn quantity minus" data-action="decrease" data-item-id="${item.id}" data-item-size="${item.size}"><span>-</span></button>
                            <span class="item quantity">${item.quantity}</span>
                            <button class="btn quantity plus" data-action="increase" data-item-id="${item.id}" data-item-size="${item.size}"><span>+</span></button>
                            <button class="btn remove-item" data-action="remove" data-item-id="${item.id}" data-item-size="${item.size}">x</button>
                        </div>
                    </div>
                    <img src="${item.image}" alt="Піца ${item.name}" class="item image">
                `;
        return li;
    }

    function clearOrderCart() {
        cartItems = [];
        toggleEmptyCartMessage();
        saveCartToLocalStorage();
    }

    function addPizzaToCart(pizzaId, pizzaSize) {
        const pizza = allPizzas.find(p => p.id === pizzaId);
        if (!pizza) return;

        const priceOption = pizza.prices.find(p => p.size == pizzaSize);
        if (!priceOption) return;

        const existingItemIndex = cartItems.findIndex(item => item.id === pizzaId && item.size == pizzaSize);

        if (existingItemIndex > -1) {
            updateItemQuantity(cartItems[existingItemIndex].id, pizzaSize, 'increase');
        } else {
            cartItems.push({
                id: pizza.id,
                name: pizza.name,
                size: priceOption.size,
                weight: priceOption.weight,
                price: priceOption.price,
                quantity: 1,
                image: pizza.image
            });
            orderList.appendChild(createCartElement(cartItems[cartItems.length - 1]));
            orderCardCount.textContent = parseInt(orderCardCount.textContent) + 1;
            totalAmountSpan.textContent = `${parseInt(totalAmountSpan.textContent) + priceOption.price} грн`;
        }

    }

    function updateItemQuantity(itemId, itemSize, action) {
        const itemIndex = cartItems.findIndex(item => item.id === itemId && item.size == itemSize);

        if (itemIndex > -1) {
            const item = cartItems[itemIndex];

            if (action === 'increase') {
                item.quantity++;
            } else if (action === 'decrease') {
                if (item.quantity > 1) {
                    item.quantity--;
                } else {
                    removeItemFromCart(itemId, itemSize);
                }
            }
            const itemElement = orderList.querySelector(`li[data-item-id="${itemId}"][data-item-size="${itemSize}"]`);
            if (itemElement) {
                const quantityElement = itemElement.querySelector('.item.quantity');
                const priceElement = itemElement.querySelector('.item.price');
                quantityElement.textContent = item.quantity;
                priceElement.textContent = `${item.price * item.quantity}грн`;
                totalAmountSpan.textContent = `${parseInt(totalAmountSpan.textContent) + (action === 'increase' ? item.price : -item.price)} грн`;
                orderCardCount.textContent = `${action === 'increase' ? parseInt(orderCardCount.textContent) + 1 : parseInt(orderCardCount.textContent) - 1}`;
            }
            saveCartToLocalStorage();
        }
    }

    function removeItemFromCart(itemId, itemSize) {
        const itemIndex = cartItems.findIndex(item => item.id === itemId && item.size == itemSize);
        if (itemIndex > -1) {
            const itemElement = orderList.querySelector(`li[data-item-id="${itemId}"][data-item-size="${itemSize}"]`);
            if (itemElement) {
                itemElement.remove();
                totalAmountSpan.textContent = `${parseInt(totalAmountSpan.textContent) - (cartItems[itemIndex].price * cartItems[itemIndex].quantity)} грн`;
                orderCardCount.textContent = parseInt(orderCardCount.textContent) - cartItems[itemIndex].quantity;
            }
            cartItems.splice(itemIndex, 1);
            toggleEmptyCartMessage();
            saveCartToLocalStorage();
        }
    }

    function displayPizzas(pizzasToDisplay) {
        const pizzaCardTemplate = document.getElementById('pizzaCardTemplate');
        pizzaContainer.innerHTML = '';
        const pizzaCountElement = document.querySelector('.page-title .order.count');

        if (pizzasToDisplay.length === 0) {
            const noPizzasMessage = document.createElement('h2');
            noPizzasMessage.textContent = 'Не знайдено піц за цією категорією';
            noPizzasMessage.classList.add('no-pizzas-message');
            pizzaContainer.appendChild(noPizzasMessage);
            pizzaCountElement.textContent = 0;
            return;
        }

        const fragment = document.createDocumentFragment();

        pizzasToDisplay.forEach(pizza => {
            const pizzaCard = pizzaCardTemplate.cloneNode(true);
            pizzaCard.style.display = '';
            pizzaCard.removeAttribute('id');
            pizzaCard.classList.remove('pizza-card-template');

            pizzaCard.querySelector('.pizza-image').src = pizza.image;
            pizzaCard.querySelector('.pizza-image').alt = `Піца ${pizza.name}`;
            pizzaCard.querySelector('.pizza-title').textContent = pizza.name;
            pizzaCard.querySelector('.pizza-category').textContent = pizza.category;
            pizzaCard.querySelector('.pizza-description').textContent = pizza.description;

            const badge = pizzaCard.querySelector('.pizza-badge');
            if (pizza.badge) {
                badge.textContent = pizza.badge;
                badge.className = `pizza-badge ${pizza.badgeClass}`;
                badge.style.display = '';
            } else {
                badge.style.display = 'none';
            }

            const pizzaSizesContainer = pizzaCard.querySelector('.pizza-sizes');
            pizzaSizesContainer.innerHTML = '';

            pizza.prices.forEach(priceOption => {
                const sizeOptionDiv = document.createElement('div');
                sizeOptionDiv.classList.add('pizza-size-option');
                sizeOptionDiv.innerHTML = `
                    <div class="pizza-size-info">
                        <div>
                            <img src="images/size-icon.svg" alt="Розмір піци"> ${priceOption.size}
                        </div>
                        <div>
                            <img src="images/weight.svg" alt="Вага піци"> ${priceOption.weight}
                        </div>
                    </div>
                    <div class="pizza-price">${priceOption.price}</div>
                    <div class="pizza-price currency">грн.</div>
                    <button class="pizza-buy-button" data-pizza-id="${pizza.id}" data-pizza-size="${priceOption.size}">Купити</button>
                `;
                pizzaSizesContainer.appendChild(sizeOptionDiv);
            });
            fragment.appendChild(pizzaCard);
        });
        pizzaContainer.appendChild(fragment);
        pizzaCountElement.textContent = pizzasToDisplay.length;
    }

    document.body.addEventListener('click', function (event) {
        const target = event.target;

        if (toggleCartButton.contains(target)) {
            cartAside.classList.toggle('active');
        } else if (cartAside.classList.contains('active') && !cartAside.contains(target)) {
            cartAside.classList.remove('active');
        }

        if (target.classList.contains('clear-order')) {
            clearOrderCart();
        }

        if (target.closest('.item.controls')) {
            const clickedButton = target.closest('.btn.quantity') || target.closest('.btn.remove-item');

            if (clickedButton) {
                const action = clickedButton.dataset.action;
                const itemId = clickedButton.dataset.itemId;
                const itemSize = clickedButton.dataset.itemSize;

                if (itemId && itemSize) {
                    if (action === 'remove') {
                        removeItemFromCart(itemId, itemSize);
                    } else if (action === 'increase' || action === 'decrease') {
                        updateItemQuantity(itemId, itemSize, action);
                    }
                }
            }
        }

        if (target.classList.contains('pizza-buy-button')) {
            const pizzaId = target.dataset.pizzaId;
            const pizzaSize = target.dataset.pizzaSize;
            if (pizzaId && pizzaSize) {
                addPizzaToCart(pizzaId, pizzaSize);
            }
        }

        if (target.closest('.page-nav.links li') && target.tagName === 'A') {
            event.preventDefault();

            const listItem = target.closest('.page-nav.links li');
            const selectedCategoryAttribute = listItem.dataset.category;
            const pageTitle = document.querySelector('.page-title h1');

            document.querySelectorAll('.page-nav.links li').forEach(li => li.classList.remove('active'));
            listItem.classList.add('active');

            let filteredPizzas = [];

            if (selectedCategoryAttribute === 'all') {
                filteredPizzas = allPizzas;
            } else {
                filteredPizzas = allPizzas.filter(pizza => {
                    return pizza.categoryAttribute === selectedCategoryAttribute;
                });
            }

            if (selectedCategoryAttribute === 'all') {
                pageTitle.innerHTML = 'Усі піци' + ` <span class="order count">"${filteredPizzas.length}"</span>`;
            } else {
                pageTitle.innerHTML = 'Піци ' + listItem.textContent.trim().toLocaleLowerCase() +
                    ` <span class="order count">"${filteredPizzas.length}"</span>`;
            }

            displayPizzas(filteredPizzas);
        }
    });

});