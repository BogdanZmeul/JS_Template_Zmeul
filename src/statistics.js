document.addEventListener('DOMContentLoaded', function () {
    const ORDER_HISTORY_KEY = 'kmaPizzaOrderHistory';

    function loadOrderHistory() {
        const history = localStorage.getItem(ORDER_HISTORY_KEY);
        return history ? JSON.parse(history) : [];
    }

    function prepareDataForWebDataRocks(orderHistory) {
        const reportData = [];
        orderHistory.forEach(order => {
            order.items.forEach(item => {
                reportData.push({
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
        return reportData;
    }

    const orderHistory = loadOrderHistory();
    const preparedData = prepareDataForWebDataRocks(orderHistory);

    const report = {
        dataSource: {
            data: preparedData
        },
        options: {
            grid: {
                type: "classic",
                title: "Історія Замовлень Піцерії KMA",
                showTotals: false,
                showFilter: true
            }
        },
        slice: {
            rows: [
                { uniqueName: "Дата замовлення", sort: "asc" },
                { uniqueName: "Час замовлення", sort: "asc" },
                { uniqueName: "Назва Піци", sort: "asc"},
                { uniqueName: "Розмір", sort: "asc"}
            ],
            columns: [
            ],
            measures: [
                { uniqueName: "Кількість", aggregation: "sum", caption: "Кількість (шт)" },
                { uniqueName: "Ціна за одиницю", aggregation: "average", format: "currency" },
                { uniqueName: "Загальна ціна товару", aggregation: "sum", format: "currency"}
            ]
        },
        formats: [
            { name: "currency", maxDecimalPlaces: 2, decimalPlaces: 2, currencySymbol: " грн", currencySymbolAlign: "right" }
        ]
    };

    if (preparedData.length > 0) {
        const pivot = new WebDataRocks({
            container: "#pivotContainer",
            toolbar: true,
            report: report 
        });
        console.log("WebDataRocks initialized with data.");
    } else {
        const statsContainer = document.getElementById('pivotContainer');
        if (statsContainer) {
            statsContainer.innerHTML = '<p class="no-history-message">Історія замовлень порожня. Зробіть перше замовлення!</p>';
            console.log("No order history found. Displaying empty message.");
        }
    }
});