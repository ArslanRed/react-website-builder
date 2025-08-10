import React, { useState, useEffect, useRef } from 'react';
import './Ecommerce.css';

// --- Debounce hook ---
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

// --- Header ---
function Header({ cartCount, onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    onSearch(debouncedSearchTerm);
  }, [debouncedSearchTerm, onSearch]);

  return (
    <header className="header header--small">
      <div className="header__logo">ShopLogo</div>
      <nav className="header__nav">
        <ul className="nav__list">
          {['Home', 'Shop', 'Categories', 'About', 'Contact'].map((item) => (
            <li key={item} className="nav__item">
              <a
                href="#"
                className="nav__link"
                onClick={(e) => e.preventDefault()}
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="header__searchbar">
        <input
          type="search"
          className="searchbar__input"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search products"
        />
      </div>
      <div className="header__actions">
        <button className="btn btn--login">Login</button>
        <button className="btn btn--cart" aria-label={`Cart with ${cartCount} items`}>
          🛒 <span className="cart-count">{cartCount}</span>
        </button>
      </div>
    </header>
  );
}

// --- Hero Banner ---
function HeroBanner() {
  return (
    <section className="hero-banner" aria-label="Promotional banner">
      <div className="hero-banner__content">
        <h1 className="hero-banner__title">Big Summer Sale!</h1>
        <p className="hero-banner__subtitle">Up to 50% off on selected items</p>
        <button className="btn btn--cta">Shop Now</button>
      </div>
    </section>
  );
}

// --- Featured Items ---
function FeaturedItems({ featuredProducts, onAddToCart }) {
  if (!featuredProducts.length) return null;

  return (
    <section className="featured-items" aria-label="Featured products">
      <h2 className="featured-items__title">Featured Items</h2>
      <div className="featured-items__grid">
        {featuredProducts.map(product => (
          <article key={product.id} className="featured-item-card">
            <img
              src={product.image}
              alt={product.name}
              className="featured-item-card__image"
              loading="lazy"
            />
            <h3 className="featured-item-card__name">{product.name}</h3>
            <p className="featured-item-card__description">{product.description}</p>
            <div className="featured-item-card__actions">
              <button
                className="btn btn--addtocart"
                onClick={() => onAddToCart(product)}
                aria-label={`Add ${product.name} to cart`}
              >
                Add to Cart
              </button>
              <button
                className="btn btn--buynow"
                onClick={() => alert(`Buying ${product.name}`)}
                aria-label={`Buy ${product.name} now`}
              >
                Buy Now
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// --- Categories Section ---
function Categories({ categories, selectedCategory, onSelectCategory }) {
  return (
    <section className="categories-section" aria-label="Product categories">
      <h2 className="categories-section__title">Categories</h2>
      <div className="categories-section__grid">
        {categories.map(({ name, image, priceRange }) => (
          <article
            key={name}
            className="category-card"
            role="button"
            tabIndex={0}
            onClick={() => onSelectCategory(name)}
            onKeyDown={(e) => { if (e.key === 'Enter') onSelectCategory(name); }}
            aria-pressed={selectedCategory === name}
          >
            <img src={image} alt={name} className="category-card__image" loading="lazy" />
            <h3 className="category-card__name">{name}</h3>
            <p className="category-card__price-range">{priceRange}</p>
            <div className="category-card__actions">
            
              <button
                className="btn btn--goto"
                onClick={(e) => { e.stopPropagation(); onSelectCategory(name); }}
                aria-label={`Go to ${name} category`}
              >
                Go to Category
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

// --- Product Card ---
function ProductCard({ product, onAddToCart, onSelect }) {
  return (
    <article
      className="product-card"
      onClick={() => onSelect(product)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => { if (e.key === 'Enter') onSelect(product); }}
    >
      <img
        src={product.image}
        alt={product.name}
        className="product-card__image"
        loading="lazy"
      />
      <div className="product-card__info">
        <h3 className="product-card__name">{product.name}</h3>
        <p className="product-card__price">${product.price.toFixed(2)}</p>
        <p className="product-card__rating" aria-label={`Rating: ${product.rating} out of 5`}>
          ⭐ {product.rating}
        </p>
      </div>
      <button
        className="btn btn--addtocart"
        onClick={(e) => { e.stopPropagation(); onAddToCart(product); }}
        aria-label={`Add ${product.name} to cart`}
      >
        Add to Cart
      </button>
    </article>
  );
}

// --- Product Listing ---
function ProductListing({ products, onAddToCart, onSelectProduct }) {
  return (
    <section className="product-listing" aria-label="Product listing">
      {products.length === 0 ? (
        <p className="product-listing__empty">No products found.</p>
      ) : (
        products.map((p) => (
          <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onSelect={onSelectProduct} />
        ))
      )}
    </section>
  );
}

// --- Product Detail ---
function ProductDetail({ product, onAddToCart }) {
  if (!product) return <section className="product-detail empty" aria-live="polite">Select a product to see details</section>;

  return (
    <section className="product-detail" aria-label={`Details for ${product.name}`}>
      <img src={product.image} alt={product.name} className="product-detail__image" loading="lazy" />
      <div className="product-detail__info">
        <h2 className="product-detail__name">{product.name}</h2>
        <p className="product-detail__price"><strong>Price:</strong> ${product.price.toFixed(2)}</p>
        <p className="product-detail__rating"><strong>Rating:</strong> ⭐ {product.rating}</p>
        <p className="product-detail__description">{product.description}</p>
        <button className="btn btn--cta" onClick={() => onAddToCart(product)}>Add to Cart</button>
      </div>
    </section>
  );
}

// --- Shopping Cart ---
function ShoppingCart({ cartItems, onRemoveItem }) {
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0);

  return (
    <aside className="sidebar shopping-cart" aria-label="Shopping cart">
      <h2 className="sidebar__title">Shopping Cart</h2>
      {cartItems.length === 0 ? (
        <p className="shopping-cart__empty">Your cart is empty</p>
      ) : (
        <>
          <ul className="shopping-cart__list">
            {cartItems.map((item, i) => (
              <li key={`${item.id}-${i}`} className="shopping-cart__item">
                <span>{item.name}</span>
                <span>${item.price.toFixed(2)}</span>
                <button
                  className="btn btn--remove"
                  aria-label={`Remove ${item.name} from cart`}
                  onClick={() => onRemoveItem(i)}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
          <p className="shopping-cart__subtotal"><strong>Subtotal:</strong> ${subtotal.toFixed(2)}</p>
          <button className="btn btn--checkout">Checkout</button>
        </>
      )}
    </aside>
  );
}

// --- Footer ---
function Footer() {
  return (
    <footer className="footer footer--small" role="contentinfo">
      <div className="footer__section footer__policies">
        <h4 className="footer__title">Policies</h4>
        <ul className="footer__list">
          <li><a href="#" className="footer__link">Privacy Policy</a></li>
          <li><a href="#" className="footer__link">Returns</a></li>
          <li><a href="#" className="footer__link">Terms of Service</a></li>
        </ul>
      </div>
      <div className="footer__section footer__contact">
        <h4 className="footer__title">Contact</h4>
        <address>
          <p>Email: <a href="mailto:support@shop.com" className="footer__link">support@shop.com</a></p>
          <p>Phone: <a href="tel:+123456789" className="footer__link">+123456789</a></p>
        </address>
      </div>
      <div className="footer__section footer__social">
        <h4 className="footer__title">Follow Us</h4>
        <p className="footer__social-links">Social media links here</p>
      </div>
      <div className="footer__section footer__newsletter">
        <h4 className="footer__title">Newsletter</h4>
        <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            className="newsletter-form__input"
            placeholder="Your email"
            aria-label="Your email"
            required
          />
          <button type="submit" className="btn btn--subscribe">Subscribe</button>
        </form>
      </div>
    </footer>
  );
}

// --- Main App ---
export default function ECommerceDemo() {
  // Product and category data
const productsData = [
  { id: 1, name: 'Smartphone', price: 599, rating: 4.5, 
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=150&q=80', 
    description: 'Latest model smartphone.', category: 'Electronics', featured: true },
  { id: 2, name: 'T-Shirt', price: 29.99, rating: 4.0, 
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=150&q=80', 
    description: 'Comfortable cotton t-shirt.', category: 'Clothing', featured: false },
  { id: 3, name: 'Novel Book', price: 15.5, rating: 4.8, 
    image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=150&q=80', 
    description: 'Bestselling novel.', category: 'Books', featured: true },
  { id: 4, name: 'Coffee Maker', price: 89.99, rating: 4.2, 
    image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=150&q=80', 
    description: 'Brew the perfect cup every morning.', category: 'Home', featured: false },
   {
  id: 5,
  name: 'Headphones',
  price: 120,
  rating: 4.3,
  image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=870&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  description: 'Bass Boosted Headphones.',
  category: 'Electronics',
  featured: true
},

  { id: 6, name: 'Jeans', price: 45, rating: 4.1, 
    image: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=150&q=80', 
    description: 'Stylish denim jeans.', category: 'Clothing', featured: true },
];

  const categoriesData = [
  { name: 'Electronics', image: 'https://images.unsplash.com/photo-1510552776732-43e0a815ee13?auto=format&fit=crop&w=150&q=80', priceRange: '$50 - $1000' },
  { name: 'Clothing', image: 'https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=150&q=80', priceRange: '$10 - $200' },
  { name: 'Books', image: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=150&q=80', priceRange: '$5 - $50' },
  { name: 'Home', image: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=150&q=80', priceRange: '$20 - $500' },
];


  const [selectedCategory, setSelectedCategory] = useState('Electronics');
  const [cart, setCart] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Filter products by category & search term
  const filteredProducts = productsData.filter(p =>
    p.category === selectedCategory &&
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const featuredProducts = productsData.filter(p => p.featured);

  function handleAddToCart(product) {
    setCart((prev) => [...prev, product]);
  }

  function handleRemoveFromCart(index) {
    setCart((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSearch(term) {
    setSearchTerm(term);
  }

  return (
    <>
      <Header cartCount={cart.length} onSearch={handleSearch} />
      <HeroBanner />
      <FeaturedItems featuredProducts={featuredProducts} onAddToCart={handleAddToCart} />
      <div className="main-layout">
        <Categories
          categories={categoriesData}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        <ProductListing
          products={filteredProducts}
          onAddToCart={handleAddToCart}
          onSelectProduct={setSelectedProduct}
        />
        <ProductDetail product={selectedProduct} onAddToCart={handleAddToCart} />
        <ShoppingCart cartItems={cart} onRemoveItem={handleRemoveFromCart} />
      </div>
      <Footer />
    </>
  );
}
