// Load existing data
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

function addToCart(name, price, img) {
    cart.push({name, price, img});
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Added to Cart');
}

function addToWishlist(name, price, img) {
    wishlist.push({name, price, img});
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
    alert('Added to Wishlist');
}

function loadCart() {
    let cartList = document.getElementById('cart');
    if(!cartList) return;
    cartList.innerHTML = '';
    cart.forEach((item, index) => {
        cartList.innerHTML += 
        <li>
            <img src="${item.img}" width="60"> 
            ${item.name} - ₹${item.price}
            <button onclick="removeCart(${index})">Remove</button>
        </li>;
    });
}

function loadWishlist() {
    let wishList = document.getElementById('wishlist');
    if(!wishList) return;
    wishList.innerHTML = '';
    wishlist.forEach((item, index) => {
        wishList.innerHTML += 
        <li>
            <img src="${item.img}" width="60"> 
            ${item.name} - ₹${item.price}
            <button onclick="removeWishlist(${index})">Remove</button>
        </li>;
    });
}

function removeCart(i){cart.splice(i,1);localStorage.setItem('cart',JSON.stringify(cart));loadCart();}
function removeWishlist(i){wishlist.splice(i,1);localStorage.setItem('wishlist',JSON.stringify(wishlist));loadWishlist();}

window.onload = function(){loadCart();loadWishlist();}
`javascript
function addToCart(){alert('Added to Cart');}
function addToWishlist(){alert('Added to Wishlist');}