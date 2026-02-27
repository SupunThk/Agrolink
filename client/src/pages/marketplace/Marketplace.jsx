import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { Context } from '../../context/Context';
import './marketplace.css';
import CreateListing from './components/CreateListing';
import ProductCard from './components/ProductCard';

export default function Marketplace() {
  const [activeTab, setActiveTab] = useState('listings');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { user } = useContext(Context);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await axios.get('/products');
        if (Array.isArray(res.data)) {
          setProducts(res.data);
        } else {
          console.error("Expected array but got:", typeof res.data);
          setError(true);
        }
      } catch (err) {
        console.error("Failed to fetch products", err);
        setError(true);
      }
      setLoading(false);
    };

    if (activeTab === 'listings' || activeTab === 'mylistings') {
      fetchProducts();
    }
  }, [activeTab]);

  const allListings = Array.isArray(products) ? products : [];
  const myListings = allListings.filter(p => p.seller_id === user?.username);

  const handleDeleteProduct = (deletedId) => {
    setProducts(products.filter(p => p._id !== deletedId));
  };

  return (
    <div className="marketplace fadeIn">
      <div className="marketplaceWrapper">
        <h1 className="marketplaceTitle">AgroLink Marketplace</h1>

        <div className="marketplaceTabs">
          <button
            className={`marketplaceTab ${activeTab === 'listings' ? 'active' : ''}`}
            onClick={() => setActiveTab('listings')}
          >
            <i className="fas fa-list"></i> All Listings
          </button>
          <button
            className={`marketplaceTab ${activeTab === 'mylistings' ? 'active' : ''}`}
            onClick={() => setActiveTab('mylistings')}
          >
            <i className="fas fa-boxes"></i> My Listings
          </button>
          <button
            className={`marketplaceTab ${activeTab === 'create' ? 'active' : ''}`}
            onClick={() => setActiveTab('create')}
          >
            <i className="fas fa-plus-circle"></i> Create Listing
          </button>
        </div>

        <div className="marketplaceContent">
          {activeTab === 'listings' && (
            <div className="marketplaceSection">
              <h2>Browse Listings</h2>
              <p>Explore all available products.</p>

              {loading && <p>Loading products...</p>}
              {error && <p>Failed to load products.</p>}
              {!loading && !error && allListings.length === 0 && (
                <p>No products available yet.</p>
              )}

              <div className="marketplaceGrid">
                {allListings.map(product => (
                  <ProductCard key={product._id} product={product} onDelete={handleDeleteProduct} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'mylistings' && (
            <div className="marketplaceSection">
              <h2>My Listings</h2>
              <p>Manage the products you are selling.</p>

              {loading && <p>Loading your products...</p>}
              {error && <p>Failed to load products.</p>}
              {!loading && !error && myListings.length === 0 && (
                <p>You haven't listed any products yet.</p>
              )}

              <div className="marketplaceGrid">
                {myListings.map(product => (
                  <ProductCard key={product._id} product={product} onDelete={handleDeleteProduct} />
                ))}
              </div>
            </div>
          )}

          {activeTab === 'create' && (
            <div className="marketplaceSection">
              <h2>Create a Listing</h2>
              <CreateListing setActiveTab={setActiveTab} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
