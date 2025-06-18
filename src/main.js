document.addEventListener('DOMContentLoaded', function () {
    const toggleCartButton = document.getElementById('toggleCartButton');
    const cartAside = document.getElementById('cartAside');
    const orderList = document.querySelector('.order.list');
    const totalAmountSpan = document.querySelector('.order.total .total-amount');
    const orderCountSpans = document.querySelectorAll('.order.summary .order.count');
    const pizzaContainer = document.querySelector('.pizza-container');
    const pizzaCardTemplate = document.getElementById('pizzaCardTemplate');
    const pageNavLinks = document.querySelector('.page-nav.links'); // No direct change here, but used below

    let allPizzas = []; // Зберігатиме всі піци після завантаження з JSON
    let cartItems = []; // Зберігатиме елементи кошика

    const LOCAL_STORAGE_KEY = 'kmaPizzaCart';

    // Функція для завантаження кошика з Local Storage
    function loadCartFromLocalStorage() {
        const storedCart = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedCart) {
            cartItems = JSON.parse(storedCart);
        } else {
            cartItems = [];
        }
        updateCartDisplay();
    }

    // Функція для збереження кошика в Local Storage
    function saveCartToLocalStorage() {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(cartItems));
    }

    // Функція для оновлення відображення кошика та загальної суми
    function updateCartDisplay() {
        orderList.innerHTML = ''; // Очищаємо поточний список замовлень

        let total = 0;
        let totalItemsInCart = 0;
        const fragment = document.createDocumentFragment();

        if (cartItems.length === 0) {
            const emptyCartMessage = document.createElement('li');
            emptyCartMessage.classList.add('empty-cart-message');
            emptyCartMessage.textContent = 'Ваш кошик порожній.';
            fragment.appendChild(emptyCartMessage);
        } else {
            cartItems.forEach(item => {
                const li = document.createElement('li');
                li.classList.add('order', 'item');
                // Використовуємо комбінацію id та розміру для унікальності товару в кошику
                li.dataset.itemId = item.id;
                li.dataset.itemSize = item.size;

                li.innerHTML = `
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
                fragment.appendChild(li);

                total += item.price * item.quantity;
                totalItemsInCart += item.quantity;
            });
        }

        orderList.appendChild(fragment); // Додаємо всі елементи одним разом
        totalAmountSpan.textContent = `${total} грн`;
        orderCountSpans.forEach(span => {
            span.textContent = totalItemsInCart;
        });
        saveCartToLocalStorage(); // Зберігаємо кошик після кожного оновлення
    }

    // Функція для очищення кошика
    function clearOrder() {
        cartItems = [];
        updateCartDisplay();
    }

    // Функція для додавання піци до кошика
    function addPizzaToCart(pizzaId, pizzaSize) {
        const pizza = allPizzas.find(p => p.id === pizzaId);
        if (!pizza) return;

        const priceOption = pizza.prices.find(p => p.size == pizzaSize);
        if (!priceOption) return;

        const existingItemIndex = cartItems.findIndex(item => item.id === pizzaId && item.size == pizzaSize);

        if (existingItemIndex > -1) {
            cartItems[existingItemIndex].quantity++;
        } else {
            cartItems.push({
                id: pizza.id,
                name: pizza.name,
                size: priceOption.size,
                weight: priceOption.weight,
                price: priceOption.price, // Ціна за одну одиницю
                quantity: 1,
                image: pizza.image
            });
        }
        updateCartDisplay();
    }

    // Функція для зміни кількості товару в кошику
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
                    // Якщо кількість стає 0, видаляємо товар
                    cartItems.splice(itemIndex, 1);
                }
            }
            updateCartDisplay();
        }
    }

    // Функція для видалення піци з кошика
    function removeItemFromCart(itemId, itemSize) {
        const itemIndex = cartItems.findIndex(item => item.id === itemId && item.size == itemSize);
        if (itemIndex > -1) {
            cartItems.splice(itemIndex, 1);
            updateCartDisplay();
        }
    }

    // Функція для відображення піц на сторінці
    function displayPizzas(pizzasToDisplay) {
        pizzaContainer.innerHTML = ''; // Очищаємо контейнер
        const pizzaCountElement = document.querySelector('.page-title .order.count');

        if (pizzasToDisplay.length === 0) {
            // Якщо піц немає, виводимо повідомлення
            const noPizzasMessage = document.createElement('h2');
            noPizzasMessage.textContent = 'Не знайдено піц за цією категорією';
            noPizzasMessage.classList.add('no-pizzas-message'); // Додайте клас для стилізації в CSS
            pizzaContainer.appendChild(noPizzasMessage);
            pizzaCountElement.textContent = 0; // Оновлюємо лічильник на 0
            return; // Виходимо з функції
        }

        const fragment = document.createDocumentFragment();

        pizzasToDisplay.forEach(pizza => {
            const pizzaCard = pizzaCardTemplate.cloneNode(true);
            pizzaCard.style.display = ''; // Показуємо шаблон
            pizzaCard.removeAttribute('id'); // Видаляємо ID шаблону
            pizzaCard.classList.remove('pizza-card-template');

            pizzaCard.querySelector('.pizza-image').src = pizza.image;
            pizzaCard.querySelector('.pizza-image').alt = `Піца ${pizza.name}`;
            pizzaCard.querySelector('.pizza-title').textContent = pizza.name;
            pizzaCard.querySelector('.pizza-category').textContent = pizza.category; // Відображаємо українську назву категорії
            pizzaCard.querySelector('.pizza-description').textContent = pizza.description;

            const badge = pizzaCard.querySelector('.pizza-badge');
            if (pizza.badge) {
                badge.textContent = pizza.badge;
                badge.className = `pizza-badge ${pizza.badgeClass}`;
                badge.style.display = ''; // Переконаємося, що бейдж видимий
            } else {
                badge.style.display = 'none'; // Ховаємо бейдж, якщо його немає
            }

            const pizzaSizesContainer = pizzaCard.querySelector('.pizza-sizes');
            pizzaSizesContainer.innerHTML = ''; // Очищаємо розміри перед додаванням

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
        pizzaCountElement.textContent = pizzasToDisplay.length; // Оновлюємо лічильник відповідно до відфільтрованих піц
    }

    // Завантаження піц з JSON
    async function fetchPizzas() {
        try {
            const response = await fetch('./src/data/pizzas.json'); // Шлях до вашого JSON
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allPizzas = await response.json();
            displayPizzas(allPizzas); // Відображаємо всі піци за замовчуванням
        } catch (error) {
            console.error('Не вдалося завантажити піци:', error);
            pizzaContainer.innerHTML = '<p>Не вдалося завантажити список піц. Спробуйте пізніше.</p>';
        }
    }

    // Єдиний eventListener на документі
    document.addEventListener('click', function (event) {
        const target = event.target;

        // 1. Логіка для toggleCartButton та закриття aside при кліку поза ним
        if (toggleCartButton.contains(target)) {
            cartAside.classList.toggle('active');
        } else if (cartAside.classList.contains('active') && !cartAside.contains(target)) {
            cartAside.classList.remove('active');
        }

        // 2. Логіка для кнопки "Очистити замовлення"
        if (target.classList.contains('clear-order')) {
            clearOrder();
        }

        // 3. Логіка для кнопок зміни кількості та видалення товару в кошику
        if (target.closest('.item.controls')) {
            // Шукаємо найближчу кнопку, яка є батьківською для клікнутого елемента
            const clickedButton = target.closest('.btn.quantity') || target.closest('.btn.remove-item');

            if (clickedButton) {
                const action = clickedButton.dataset.action;
                const itemId = clickedButton.dataset.itemId;
                const itemSize = clickedButton.dataset.itemSize; // Розмір піци

                if (itemId && itemSize) {
                    if (action === 'remove') {
                        removeItemFromCart(itemId, itemSize);
                    } else if (action === 'increase' || action === 'decrease') {
                        updateItemQuantity(itemId, itemSize, action);
                    }
                }
            }
        }

        // 4. Логіка для кнопок "Купити" на картках піц
        if (target.classList.contains('pizza-buy-button')) {
            const pizzaId = target.dataset.pizzaId;
            const pizzaSize = target.dataset.pizzaSize;
            if (pizzaId && pizzaSize) {
                addPizzaToCart(pizzaId, pizzaSize);
            }
        }

        // 5. Логіка для фільтрації піц за категоріями
        if (target.closest('.page-nav.links li') && target.tagName === 'A') {
            event.preventDefault(); // Запобігаємо переходу за посиланням

            const listItem = target.closest('.page-nav.links li');
            const selectedCategoryAttribute = listItem.dataset.category; // Отримуємо data-category

            // Оновлюємо активний клас
            document.querySelectorAll('.page-nav.links li').forEach(li => li.classList.remove('active'));
            listItem.classList.add('active');

            let filteredPizzas = [];

            if (selectedCategoryAttribute === 'all') {
                filteredPizzas = allPizzas;
            } else {
                // Фільтруємо за новим полем categoryAttribute
                filteredPizzas = allPizzas.filter(pizza => {
                    return pizza.categoryAttribute === selectedCategoryAttribute;
                });
            }
            displayPizzas(filteredPizzas);
        }
    });

    // Ініціалізація: завантажуємо кошик і піци
    loadCartFromLocalStorage();
    fetchPizzas();
});