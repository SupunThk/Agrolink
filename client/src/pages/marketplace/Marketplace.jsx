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
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const agricultureCategories = [
    "Vegetables",
    "Fruits",
    "Grains & Cereals",
    "Pulses & Legumes",
    "Spices & Herbs",
    "Cash Crops",
    "Leafy Greens",
    "Root & Tubers",
    "Seeds & Seedlings",
    "Organic Produce",
    "Other (Specify)"
  ];

  const { user } = useContext(Context);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      setError(false);
      try {
        const res = await axios.get('/products');
        setProducts(res.data);
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

  const handleEdit = (product) => {
    setEditingProduct(product);
    setActiveTab('edit');
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      try {
        await axios.delete(`/products/${id}`, {
          data: { username: user.username },
        });
        setProducts(products.filter((p) => p._id !== id));
      } catch (err) {
        console.error("Failed to delete product", err);
      }
    }
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch = (p.crop_name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) || 
                          (p.description?.toLowerCase() || "").includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === '' || p.category_id === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const allListings = filteredProducts.filter(p => p.status === 'available' || p.status === undefined);
  const myListings = filteredProducts.filter(p => p.seller_id === user?.username);

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
          {(activeTab === 'listings' || activeTab === 'mylistings') && (
            <div className="marketplaceControls">
              <div className="searchBarContainer">
                <i className="fas fa-search searchIcon"></i>
                <input 
                  type="text" 
                  placeholder="Search products by name or description..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="marketplaceSearchInput"
                />
              </div>
              <div className="filterContainer">
                <i className="fas fa-filter filterIcon"></i>
                <select 
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="marketplaceCategoryFilter"
                >
                  <option value="">All Categories</option>
                  {agricultureCategories.map((cat, index) => (
                    <option key={index} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

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
                  <ProductCard
                    key={product._id}
                    product={product}
                    isOwner={product.seller_id === user?.username}
                    onEdit={() => handleEdit(product)}
                    onDelete={() => handleDelete(product._id)}
                  />
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
                  <ProductCard
                    key={product._id}
                    product={product}
                    isOwner={true}
                    onEdit={() => handleEdit(product)}
                    onDelete={() => handleDelete(product._id)}
                  />
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

          {activeTab === 'edit' && editingProduct && (
            <div className="marketplaceSection">
              <h2>Edit Listing</h2>
              <CreateListing setActiveTab={setActiveTab} initialProduct={editingProduct} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
