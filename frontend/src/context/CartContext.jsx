import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

function getCartKey(user) {
  if (!user) {
    return "civicmart_cart_guest";
  }

  return `civicmart_cart_${user.id}`;
}

export function CartProvider({ children }) {
  const { user, loading: authLoading } = useAuth();

  const [items, setItems] = useState([]);

  // Load the cart whenever the logged-in user changes
  useEffect(() => {
    if (authLoading) return;

    const key = getCartKey(user);
    const saved = localStorage.getItem(key);

    try {
      setItems(saved ? JSON.parse(saved) : []);
    } catch {
      setItems([]);
    }
  }, [user, authLoading]);

  // Save the current user's cart
  useEffect(() => {
    if (authLoading) return;

    const key = getCartKey(user);
    localStorage.setItem(key, JSON.stringify(items));
  }, [items, user, authLoading]);

  function addToCart(product, quantity = 1) {
    setItems((prev) => {
      const existing = prev.find(
        (i) => i.product.id === product.id
      );

      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? {
                ...i,
                quantity: i.quantity + quantity,
              }
            : i
        );
      }

      return [...prev, { product, quantity }];
    });
  }

  function updateQuantity(productId, quantity) {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) =>
            i.product.id === productId
              ? { ...i, quantity }
              : i
          )
    );
  }

  function removeFromCart(productId) {
    setItems((prev) =>
      prev.filter((i) => i.product.id !== productId)
    );
  }

  function clearCart() {
    setItems([]);
  }

  const total = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  const count = items.reduce(
    (sum, i) => sum + i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        total,
        count,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}


// import { createContext, useContext, useState, useEffect } from "react";

// const CartContext = createContext(null);

// // Cart lives in localStorage so it survives page refreshes; it is only
// // sent to the backend once, at checkout time (see Cart.jsx).
// export function CartProvider({ children }) {
//   const [items, setItems] = useState(() => {
//     const saved = localStorage.getItem("civicmart_cart");
//     return saved ? JSON.parse(saved) : [];
//   });

//   useEffect(() => {
//     localStorage.setItem("civicmart_cart", JSON.stringify(items));
//   }, [items]);

//   function addToCart(product, quantity = 1) {
//     setItems((prev) => {
//       const existing = prev.find((i) => i.product.id === product.id);
//       if (existing) {
//         return prev.map((i) =>
//           i.product.id === product.id ? { ...i, quantity: i.quantity + quantity } : i
//         );
//       }
//       return [...prev, { product, quantity }];
//     });
//   }

//   function updateQuantity(productId, quantity) {
//     setItems((prev) =>
//       quantity <= 0
//         ? prev.filter((i) => i.product.id !== productId)
//         : prev.map((i) => (i.product.id === productId ? { ...i, quantity } : i))
//     );
//   }

//   function removeFromCart(productId) {
//     setItems((prev) => prev.filter((i) => i.product.id !== productId));
//   }

//   function clearCart() {
//     setItems([]);
//   }

//   const total = items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
//   const count = items.reduce((sum, i) => sum + i.quantity, 0);

//   return (
//     <CartContext.Provider
//       value={{ items, addToCart, updateQuantity, removeFromCart, clearCart, total, count }}
//     >
//       {children}
//     </CartContext.Provider>
//   );
// }

// export function useCart() {
//   return useContext(CartContext);
// }
