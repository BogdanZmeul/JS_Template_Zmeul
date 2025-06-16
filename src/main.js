document.addEventListener('DOMContentLoaded', function() {
    const toggleCartButton = document.getElementById('toggleCartButton');
    const cartAside = document.getElementById('cartAside');

    toggleCartButton.addEventListener('click', function() {
        cartAside.classList.toggle('active');
        const isExpanded = cartAside.classList.contains('active');
        toggleCartButton.setAttribute('aria-expanded', isExpanded);
    });

    document.addEventListener('click', function(event) {
        if (cartAside.classList.contains('active') &&
            !cartAside.contains(event.target) &&
            !toggleCartButton.contains(event.target)) {
            cartAside.classList.remove('active');
            toggleCartButton.setAttribute('aria-expanded', 'false');
        }
    });
});