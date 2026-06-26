import React, { createContext, useState, useEffect, useContext } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (e) {
        setCartItems([]);
      }
    }
  }, []);

  // Save cart to localStorage
  const saveCart = (items) => {
    setCartItems(items);
    localStorage.setItem('cart', JSON.stringify(items));
  };

  // Add item to cart
  const addToCart = (product, quantity = 1, customizationLogo = '', deliveryAddress = null) => {
    const qty = Math.max(quantity, product.moq || 1);
    
    const existingIndex = cartItems.findIndex(item => item.productId === product._id);
    let updatedCart = [...cartItems];

    if (existingIndex >= 0) {
      updatedCart[existingIndex].quantity += qty;
    } else {
      updatedCart.push({
        id: 'cart-' + Math.random().toString(36).substring(2, 9),
        productId: product._id,
        name: product.name,
        price: product.price,
        gstPercentage: product.gstPercentage || 18,
        moq: product.moq || 1,
        image: product.images && product.images.length > 0 ? product.images[0] : '',
        quantity: qty,
        customizationLogo,
        deliveryAddress: deliveryAddress || null,
        bulkDiscountSlabs: product.bulkDiscountSlabs || [],
        vendorId: product.vendor?._id || product.vendor
      });
    }

    saveCart(updatedCart);
  };

  // Remove item from cart
  const removeFromCart = (cartItemId) => {
    const updatedCart = cartItems.filter(item => item.id !== cartItemId);
    saveCart(updatedCart);
  };

  // Update item quantity
  const updateQuantity = (cartItemId, quantity) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === cartItemId) {
        // Enforce minimum order quantity (MOQ)
        const qty = Math.max(quantity, item.moq);
        return { ...item, quantity: qty };
      }
      return item;
    });
    saveCart(updatedCart);
  };

  // Assign delivery address (multi-address delivery support!)
  const assignAddress = (cartItemId, address) => {
    const updatedCart = cartItems.map(item => {
      if (item.id === cartItemId) {
        return { ...item, deliveryAddress: address };
      }
      return item;
    });
    saveCart(updatedCart);
  };

  // Clear entire cart
  const clearCart = () => {
    saveCart([]);
  };

  // Calculate pricing breakdown
  const getCartTotals = () => {
    let subtotal = 0;
    let discountTotal = 0;
    let gstTotal = 0;
    let totalItems = 0;

    const itemsCalculated = cartItems.map(item => {
      // Find matching discount slab
      let discountPercent = 0;
      if (item.bulkDiscountSlabs && item.bulkDiscountSlabs.length > 0) {
        const sortedSlabs = [...item.bulkDiscountSlabs].sort((a, b) => b.minQty - a.minQty);
        const slab = sortedSlabs.find(s => item.quantity >= s.minQty);
        if (slab) {
          discountPercent = slab.discountPercentage;
        }
      }

      const originalCost = item.price * item.quantity;
      const discountVal = originalCost * (discountPercent / 100);
      const afterDiscount = originalCost - discountVal;
      const gstVal = afterDiscount * (item.gstPercentage / 100);
      const finalPrice = afterDiscount + gstVal;

      subtotal += originalCost;
      discountTotal += discountVal;
      gstTotal += gstVal;
      totalItems += item.quantity;

      return {
        ...item,
        discountPercentage: discountPercent,
        discountValue: discountVal,
        finalPrice
      };
    });

    const grandTotal = subtotal - discountTotal + gstTotal;

    return {
      items: itemsCalculated,
      subtotal,
      discountTotal,
      gstTotal,
      grandTotal,
      totalItems
    };
  };

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      assignAddress,
      clearCart,
      getCartTotals
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
