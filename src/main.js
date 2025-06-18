document.addEventListener('DOMContentLoaded', function() {
    const toggleCartButton = document.getElementById('toggleCartButton');
    const cartAside = document.getElementById('cartAside');

    document.addEventListener('click', function(event) {
        if (cartAside.classList.contains('active') &&
            !cartAside.contains(event.target) &&
            !toggleCartButton.contains(event.target)) {
            cartAside.classList.remove('active');
        } else if(toggleCartButton.contains(event.target)) {
            cartAside.classList.toggle('active');
        }
    });
});