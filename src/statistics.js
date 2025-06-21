// src/statistics.js

document.addEventListener('DOMContentLoaded', function () {
    const ORDER_HISTORY_KEY = 'kmaPizzaOrderHistory';

    // Function to load order history from local storage
    function loadOrderHistory() {
        const history = localStorage.getItem(ORDER_HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    }

    // Function to prepare data for WebDataRocks
    // WebDataRocks expects an array of objects.
    // Each object represents a row in your data.
    function prepareDataForWebDataRocks(orderHistory) {
        const flatData = [];
        orderHistory.forEach(order => {
            // Ensure order.timestamp exists, add if not (for older orders)
            if (!order.timestamp) {
                order.timestamp = new Date().toISOString();
            }

            order.items.forEach(item => {
                flatData.push({
                    "Дата замовлення": new Date(order.timestamp).toLocaleDateString('uk-UA'),
                    "Час замовлення": new Date(order.timestamp).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' }),
                    "Назва Піци": item.name,
                    "Розмір": item.size,
                    "Кількість": item.quantity,
                    "Ціна за одиницю": item.price,
                    "Загальна ціна товару": item.price * item.quantity
                });
            });
        });
        return flatData;
    }

    // 1. Завантажуємо дані з localStorage
    const orderHistory = loadOrderHistory();
    // 2. Готуємо дані для WebDataRocks
    const preparedData = prepareDataForWebDataRocks(orderHistory);

    // 3. Визначаємо конфігурацію звіту (Report Object)
    const report = {
        dataSource: {
            data: preparedData // Передаємо підготовлені дані сюди
        },
        options: {
            grid: {
                type: "classic",
                title: "Історія Замовлень Піцерії KMA",
                showTotals: false,
                showFilter: true // Додано для можливості фільтрації
            }
        },
        // Визначаємо, як дані мають відображатися в зведеній таблиці (slice)
        // Це базові налаштування, їх можна налаштувати під ваші потреби
        slice: {
            rows: [
                { uniqueName: "Дата замовлення", sort: "asc" },
                { uniqueName: "Час замовлення", sort: "asc" },
                { uniqueName: "Назва Піци", sort: "asc"},
                { uniqueName: "Розмір", sort: "asc"},
                { uniqueName: "Кількість", sort: "asc"},
                { uniqueName: "Ціна за одиницю", sort: "asc"},
                { uniqueName: "Загальна ціна товару", sort: "asc"}
            ],
            columns: [
                {uniqueName: "measures"}
            ],
            measures: [
                { uniqueName: "Кількість", aggregation: "sum", caption: "Кількість (шт)" }, // Caption для зрозумілості
                { uniqueName: "Ціна за одиницю", aggregation: "average", format: "currency" },
                { uniqueName: "Загальна ціна товару", aggregation: "sum", format: "currency"}
            ],
            // Ви можете додати Report Filters, якщо хочете фільтрувати дані перед відображенням у таблиці
            reportFilters: []
        },
        formats: [
            { name: "currency", maxDecimalPlaces: 2, decimalPlaces: 2, currencySymbol: " грн", currencySymbolAlign: "right" }
        ]
    };

    // 4. Ініціалізуємо WebDataRocks тільки якщо є дані
    if (preparedData.length > 0) {
        // Переконайтеся, що container: "#pivotContainer" відповідає div у HTML
        const pivot = new WebDataRocks({
            container: "#pivotContainer", // ID вашого div-контейнера
            toolbar: true, // Показувати панель інструментів
            report: report // Передаємо об'єкт звіту
        });
        console.log("WebDataRocks initialized with data.");
    } else {
        const statsContainer = document.getElementById('pivotContainer'); // Виправлено селектор
        if (statsContainer) {
            statsContainer.innerHTML = '<p class="no-history-message">Історія замовлень порожня. Зробіть перше замовлення!</p>';
            console.log("No order history found. Displaying empty message.");
        }
    }
});