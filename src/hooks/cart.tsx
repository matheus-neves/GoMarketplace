import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE

      const storagedProducts = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (storagedProducts) {
        setProducts(JSON.parse(storagedProducts));
      }
    }

    loadProducts();
  }, []);

  const addToCart = useCallback(
    async (product: Product) => {
      // TODO ADD A NEW ITEM TO THE CART

      const index = products.findIndex(p => p.id === product.id);

      let newProducts: Product[] = [];

      if (index === -1) {
        newProducts = [
          ...products,
          {
            id: product.id,
            title: product.title,
            image_url: product.image_url,
            price: product.price,
            quantity: 1,
          },
        ];
      } else {
        newProducts = products.map(p => {
          return p.id === product.id
            ? {
                ...p,
                quantity: p.quantity + 1,
              }
            : p;
        });
      }

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      const newProducts = products.map(p => {
        return p.id === id
          ? {
              ...p,
              quantity: p.quantity + 1,
            }
          : p;
      });

      setProducts(newProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(newProducts),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // let index = 0;
      // const newProducts = products.map((p, i) => {
      //   if (p.id === id) {
      //     index = i;
      //     return { ...p, quantity: p.quantity - 1 };
      //   }
      //   return p;
      // });
      // const { quantity } = newProducts[index];
      // quantity === 0 && newProducts.splice(index, 1);

      const newProducts = products.map(p =>
        p.id === id ? { ...p, quantity: p.quantity - 1 } : p,
      );

      const filterProducts = newProducts.filter(
        p => !(p.id === id && p.quantity === 0),
      );

      setProducts(filterProducts);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(filterProducts),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({
      addToCart,
      increment,
      decrement,
      products,
    }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
