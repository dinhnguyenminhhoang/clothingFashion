import React, { createContext, useState, useEffect, useContext } from 'react';
import { getUserWishlist, toggleWishlist as toggleWishlistAPI, syncWishlist } from '../service/wishlistService';
import { message } from 'antd';
import Cookies from 'js-cookie';

const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [synced, setSynced] = useState(false);

  const fetchWishlist = async () => {
    const token = Cookies.get('token');
    if (!token) return;

    try {
      setLoading(true);
      const res = await getUserWishlist();
      if (res.status === 200) {
        // Extract products from favorites
        const products = res.data.map(fav => fav.product).filter(p => p !== null);
        setWishlist(products);
      }
    } catch (error) {
      console.error('Error fetching wishlist', error);
    } finally {
      setLoading(false);
    }
  };

  const syncLocalWishlist = async () => {
    const token = Cookies.get('token');
    if (!token || synced) return;

    try {
      const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      
      if (localFavorites.length > 0) {
        const res = await syncWishlist(localFavorites);
        if (res.status === 200) {
          console.log('Synced wishlist:', res.data);
          localStorage.removeItem('favorites');
          setSynced(true);
          await fetchWishlist();
        }
      }
    } catch (error) {
      console.error('Error syncing wishlist', error);
    }
  };

  const toggleWishlist = async (productId) => {
    const token = Cookies.get('token');
    
    if (!token) {
      // If not logged in, use localStorage
      const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const isFavorited = localFavorites.includes(productId);
      
      if (isFavorited) {
        const updated = localFavorites.filter(id => id !== productId);
        localStorage.setItem('favorites', JSON.stringify(updated));
        message.success('Đã xóa khỏi danh sách yêu thích');
      } else {
        localFavorites.push(productId);
        localStorage.setItem('favorites', JSON.stringify(localFavorites));
        message.success('Đã thêm vào danh sách yêu thích');
      }
      return;
    }

    try {
      const res = await toggleWishlistAPI(productId);
      if (res.status === 200) {
        const { isFavorited } = res.data;
        
        if (isFavorited) {
          await fetchWishlist();
          message.success('Đã thêm vào danh sách yêu thích');
        } else {
          setWishlist(prev => prev.filter(p => p._id !== productId));
          message.success('Đã xóa khỏi danh sách yêu thích');
        }
      }
    } catch (error) {
      message.error('Có lỗi xảy ra');
      console.error('Toggle wishlist error:', error);
    }
  };

  const isInWishlist = (productId) => {
    const token = Cookies.get('token');
    
    if (!token) {
      // Check localStorage for non-logged users
      const localFavorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      return localFavorites.includes(productId);
    }
    
    return wishlist.some(p => p._id === productId);
  };

  useEffect(() => {
    const token = Cookies.get('token');
    if (token) {
      fetchWishlist();
      syncLocalWishlist();
    }
  }, []);

  return (
    <WishlistContext.Provider 
      value={{ 
        wishlist, 
        loading, 
        toggleWishlist, 
        isInWishlist, 
        fetchWishlist 
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};
