// Cart Management System
let cart = JSON.parse(localStorage.getItem('cart')) || [];

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCounter();
    updateCartTotal();
}

function updateCartCounter() {
    const counters = document.querySelectorAll('#cart-counter');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    counters.forEach(counter => {
        if (totalItems > 0) {
            counter.textContent = totalItems;
            counter.classList.add('active');
        } else {
            counter.textContent = '';
            counter.classList.remove('active');
        }
    });
}

function updateCartTotal() {
    const totalPriceElement = document.getElementById('cart-total-price');
    if (totalPriceElement) {
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        totalPriceElement.textContent = total.toLocaleString('ru-RU') + ' ₽';
    }
    
    // Update summary
    const summaryItemsCount = document.getElementById('summary-items-count');
    const summaryItemsPrice = document.getElementById('summary-items-price');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (summaryItemsCount) {
        summaryItemsCount.textContent = `Товары (${totalItems} шт.)`;
    }
    if (summaryItemsPrice) {
        summaryItemsPrice.textContent = totalPrice.toLocaleString('ru-RU') + ' ₽';
    }
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartWrapper = document.getElementById('cart-wrapper');
    const emptyCart = document.querySelector('.empty-cart');
    const checkoutBtn = document.getElementById('checkout-btn');
    
    if (!cartItemsContainer) return;
    
    cartItemsContainer.innerHTML = '';
    
    if (cart.length === 0) {
        if (cartWrapper) cartWrapper.style.display = 'none';
        if (emptyCart) emptyCart.style.display = 'block';
        if (checkoutBtn) {
            checkoutBtn.style.display = 'none';
        }
        updateCartCounter();
        updateCartTotal();
        return;
    }
    
    if (cartWrapper) cartWrapper.style.display = 'grid';
    if (emptyCart) emptyCart.style.display = 'none';
    if (checkoutBtn) {
        checkoutBtn.style.display = 'block';
    }
    
    cart.forEach(item => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        cartItem.dataset.itemId = item.id;
        
        const itemTotal = item.price * item.quantity;
        
        cartItem.innerHTML = `
            <div class="cart-item-image">
                <img src="${item.image || 'https://via.placeholder.com/150/4a5568/ffffff?text=Товар'}" alt="${item.title}">
            </div>
            <div class="cart-item-info">
                <h3 class="cart-item-title">${item.title}</h3>
                <p class="cart-item-desc">Артикул: ${item.id}</p>
                <p class="cart-item-price">${item.price.toLocaleString('ru-RU')} ₽</p>
            </div>
            <div class="cart-item-controls">
                <div class="quantity-control">
                    <button class="qty-btn minus">-</button>
                    <input type="number" class="qty-input" value="${item.quantity}" min="1" data-item-id="${item.id}">
                    <button class="qty-btn plus">+</button>
                </div>
                <button class="remove-btn" title="Удалить" data-item-id="${item.id}">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M18 6L6 18M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            <div class="cart-item-total">
                <span class="total-price">${itemTotal.toLocaleString('ru-RU')} ₽</span>
            </div>
        `;
        
        cartItemsContainer.appendChild(cartItem);
    });
    
    // Re-attach event listeners
    attachCartEventListeners();
    updateCartTotal();
}

function attachCartEventListeners() {
    // Quantity buttons
    document.querySelectorAll('.cart-item .qty-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const input = this.parentElement.querySelector('.qty-input');
            const itemId = input.dataset.itemId;
            let currentValue = parseInt(input.value) || 1;
            
            if (this.classList.contains('plus')) {
                currentValue += 1;
            } else if (this.classList.contains('minus') && currentValue > 1) {
                currentValue -= 1;
            }
            
            input.value = currentValue;
            updateCartItemQuantity(itemId, currentValue);
            renderCart();
        });
    });
    
    // Quantity input change
    document.querySelectorAll('.cart-item .qty-input').forEach(input => {
        input.addEventListener('change', function() {
            const itemId = this.dataset.itemId;
            const quantity = parseInt(this.value) || 1;
            updateCartItemQuantity(itemId, quantity);
            renderCart();
        });
    });
    
    // Remove buttons
    document.querySelectorAll('.cart-item .remove-btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const itemId = this.dataset.itemId;
            if (confirm('Удалить товар из корзины?')) {
                removeFromCart(itemId);
                renderCart();
            }
        });
    });
}

function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += product.quantity;
    } else {
        cart.push({...product});
    }
    
    saveCart();
    
    // Show notification
    showNotification('Товар добавлен в корзину!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
}

function updateCartItemQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = quantity;
        saveCart();
    }
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cart-notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Smooth scroll for anchor links
document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart counter
    updateCartCounter();
    updateCartTotal();
    
    // Render cart if on cart page
    if (document.getElementById('cart-items')) {
        renderCart();
    }
    
    // Catalog add to cart buttons
    document.querySelectorAll('.btn-add-catalog').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            const productId = this.dataset.productId;
            const productName = this.dataset.productName;
            const productPrice = parseInt(this.dataset.productPrice);
            const productImage = this.dataset.productImage;
            
            const product = {
                id: productId,
                title: productName,
                price: productPrice,
                quantity: 1,
                image: productImage
            };
            
            addToCart(product);
            
            // Button animation
            const originalText = this.textContent;
            this.textContent = 'Добавлено!';
            this.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = '';
            }, 2000);
        });
    });
    // Handle anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's just "#"
            if (href === '#') {
                return;
            }
            
            // Check if it's a link to another page with anchor
            if (href.includes('#')) {
                const [page, anchor] = href.split('#');
                
                // If it's a different page, let the browser handle navigation
                if (page && page !== window.location.pathname && page !== 'index.html') {
                    return;
                }
                
                // If it's the same page, scroll to anchor
                if (anchor) {
                    e.preventDefault();
                    const target = document.getElementById(anchor);
                    if (target) {
                        const header = document.querySelector('.sticky-header');
                        const headerHeight = header ? header.offsetHeight : 0;
                        const targetPosition = target.offsetTop - headerHeight;
                        
                        window.scrollTo({
                            top: targetPosition,
                            behavior: 'smooth'
                        });
                    }
                }
            }
        });
    });

    // Catalog submenu toggle on click (for all devices)
    const menuItems = document.querySelectorAll('.menu-item');

    menuItems.forEach(item => {
        const submenu = item.querySelector('.submenu');

        if (submenu) {
            const menuLink = item.querySelector('.menu-link');

            menuLink.addEventListener('click', function(e) {
                // Prevent navigation if submenu exists
                e.preventDefault();
                e.stopPropagation();

                // Close all other submenus first
                menuItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove('active');
                    }
                });

                // Toggle active class to show/hide submenu
                item.classList.toggle('active');
            });
        }
    });

    // Burger menu functionality
    const burgerBtn = document.getElementById('burger-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');

    if (burgerBtn && mobileMenu) {
        burgerBtn.addEventListener('click', function() {
            this.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });

        // Close mobile menu when clicking on a link
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', function() {
                burgerBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
            });
        });

        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!burgerBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
                burgerBtn.classList.remove('active');
                mobileMenu.classList.remove('active');
            }
        });
    }

    // Product filtering functionality
    function filterProducts(category) {
        const products = document.querySelectorAll('.product-card');
        const noProducts = document.getElementById('no-products');
        let visibleCount = 0;

        products.forEach(product => {
            const productCategory = product.dataset.category;

            if (category === 'all' || productCategory === category) {
                product.style.display = 'block';
                visibleCount++;
            } else {
                product.style.display = 'none';
            }
        });

        // Show/hide no products message
        if (visibleCount === 0) {
            noProducts.style.display = 'block';
        } else {
            noProducts.style.display = 'none';
        }
    }

    function showAllProducts() {
        const products = document.querySelectorAll('.product-card');
        const noProducts = document.getElementById('no-products');

        products.forEach(product => {
            product.style.display = 'block';
        });

        noProducts.style.display = 'none';

        // Remove active class from all menu items
        document.querySelectorAll('.menu-link').forEach(link => {
            link.classList.remove('active');
        });

        // Add active class to "All products" link
        const allProductsLink = document.querySelector('[data-category="all"]');
        if (allProductsLink) {
            allProductsLink.classList.add('active');
        }
    }

    // Desktop filtering for categories without submenu and subcategories
    document.addEventListener('click', function(e) {
        const menuLink = e.target.closest('.menu-link');

        if (menuLink && !e.defaultPrevented) { // Only if not already handled
            if (menuLink.hasAttribute('data-category') && !menuLink.closest('.menu-item').querySelector('.submenu')) {
                // This is a category without submenu - filter products
                e.preventDefault();
                const category = menuLink.dataset.category;

                // Remove active class from all menu links
                document.querySelectorAll('.menu-link').forEach(link => {
                    link.classList.remove('active');
                });

                // Add active class to clicked link
                menuLink.classList.add('active');

                // Filter products
                filterProducts(category);
            } else if (menuLink.hasAttribute('data-subcategory')) {
                // This is a subcategory - filter by subcategory
                e.preventDefault();
                const subcategory = menuLink.dataset.subcategory;

                // Remove active class from all menu links
                document.querySelectorAll('.menu-link').forEach(link => {
                    link.classList.remove('active');
                });

                // Add active class to clicked link
                menuLink.classList.add('active');

                // Find parent category and filter by it
                const parentItem = menuLink.closest('.menu-item');
                const parentLink = parentItem.querySelector('.menu-link[data-category]');
                if (parentLink) {
                    const category = parentLink.dataset.category;
                    filterProducts(category);
                }
            }
        }
    });

    // Mobile filter button functionality (initialized later)

    // Initialize catalog filtering
    if (document.querySelector('.catalog-page')) {
        // Add mobile filter button only on mobile devices
        if (window.innerWidth <= 768) {
            const catalogContainer = document.querySelector('.catalog-page .container');
            const title = document.querySelector('.page-title');

            const mobileFilterBtn = document.createElement('button');
            mobileFilterBtn.className = 'mobile-filter-btn';
            mobileFilterBtn.id = 'mobile-filter-btn';
            mobileFilterBtn.innerHTML = '<span class="filter-icon">🔍</span> Фильтр товаров';

            catalogContainer.insertBefore(mobileFilterBtn, title.nextSibling);

            // Initialize mobile filter button functionality
            const catalogSidebar = document.querySelector('.catalog-sidebar');
            if (mobileFilterBtn && catalogSidebar) {
                mobileFilterBtn.addEventListener('click', function() {
                    this.classList.toggle('active');
                    catalogSidebar.classList.toggle('active');
                });
            }
        }

        // Set "All products" as active by default
        const allProductsLink = document.querySelector('[data-category="all"]');
        if (allProductsLink) {
            allProductsLink.classList.add('active');
        }

        // Show all products by default
        showAllProducts();
    }

    // Handle window resize
    window.addEventListener('resize', function() {
        // Reset submenu states on resize (optional - you can remove this if you want to keep state)
        // menuItems.forEach(item => {
        //     item.classList.remove('active');
        // });

        // Handle mobile filter button on resize
        if (document.querySelector('.catalog-page')) {
            const existingBtn = document.getElementById('mobile-filter-btn');
            const catalogContainer = document.querySelector('.catalog-page .container');
            const title = document.querySelector('.page-title');

            if (window.innerWidth <= 768) {
                // Add button if it doesn't exist
                if (!existingBtn) {
                    const mobileFilterBtn = document.createElement('button');
                    mobileFilterBtn.className = 'mobile-filter-btn';
                    mobileFilterBtn.id = 'mobile-filter-btn';
                    mobileFilterBtn.innerHTML = '<span class="filter-icon">🔍</span> Фильтр товаров';

                    if (catalogContainer && title) {
                        catalogContainer.insertBefore(mobileFilterBtn, title.nextSibling);

                        // Initialize functionality
                        const catalogSidebar = document.querySelector('.catalog-sidebar');
                        if (mobileFilterBtn && catalogSidebar) {
                            mobileFilterBtn.addEventListener('click', function() {
                                this.classList.toggle('active');
                                catalogSidebar.classList.toggle('active');
                            });
                        }
                    }
                }
            } else {
                // Remove button if it exists
                if (existingBtn) {
                    existingBtn.remove();
                }
            }
        }

        // Close mobile menu on resize to desktop
        if (window.innerWidth > 480) {
            if (burgerBtn) burgerBtn.classList.remove('active');
            if (mobileMenu) mobileMenu.classList.remove('active');
            const mobileFilterBtn = document.getElementById('mobile-filter-btn');
            if (mobileFilterBtn) mobileFilterBtn.classList.remove('active');
            if (catalogSidebar) catalogSidebar.classList.remove('active');
        }
    });

    // Add scroll effect to header
    let lastScroll = 0;
    const header = document.querySelector('.sticky-header');
    
    if (header) {
        window.addEventListener('scroll', function() {
            const currentScroll = window.pageYOffset;
            
            if (currentScroll > 100) {
                header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.15)';
            } else {
                header.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }
            
            lastScroll = currentScroll;
        });
    }

    // Account page tabs
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            this.classList.add('active');
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });

    // Cart quantity controls
    const qtyButtons = document.querySelectorAll('.qty-btn');
    qtyButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const input = this.parentElement.querySelector('.qty-input');
            const currentValue = parseInt(input.value) || 1;
            const cartItem = this.closest('.cart-item');
            
            if (this.classList.contains('plus')) {
                input.value = currentValue + 1;
            } else if (this.classList.contains('minus') && currentValue > 1) {
                input.value = currentValue - 1;
            }
            
            // Update cart if on cart page
            if (cartItem) {
                const itemId = cartItem.dataset.itemId || cartItem.querySelector('.cart-item-title')?.textContent;
                updateCartItemQuantity(itemId, parseInt(input.value));
                updateCartItemTotal(cartItem);
                updateCartTotal();
            } else {
                // Product page quantity selector
                updateCartItemTotal(cartItem);
            }
        });
    });


    function updateCartItemTotal(item) {
        const priceElement = item.querySelector('.cart-item-price');
        const qtyInput = item.querySelector('.qty-input');
        const totalElement = item.querySelector('.total-price');

        if (priceElement && qtyInput && totalElement) {
            const price = parseInt(priceElement.textContent.replace(/[^\d]/g, '')) || 0;
            const quantity = parseInt(qtyInput.value) || 1;
            const total = price * quantity;
            totalElement.textContent = total.toLocaleString('ru-RU') + ' ₽';

            // Update cart summary using global cart data
            updateCartTotal();
        }
    }

    function checkEmptyCart() {
        const cartItems = document.querySelectorAll('.cart-item');
        const emptyCart = document.querySelector('.empty-cart');
        const cartWrapper = document.querySelector('.cart-wrapper');
        
        if (cartItems.length === 0 && emptyCart && cartWrapper) {
            cartWrapper.style.display = 'none';
            emptyCart.style.display = 'block';
        }
    }

    // Product page thumbnail switching
    const thumbnails = document.querySelectorAll('.thumbnail');
    const mainImage = document.getElementById('main-product-image');
    
    if (thumbnails.length > 0 && mainImage) {
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                const imageUrl = this.getAttribute('data-image');
                if (imageUrl && mainImage) {
                    mainImage.src = imageUrl;
                    
                    // Update active thumbnail
                    thumbnails.forEach(t => t.classList.remove('active'));
                    this.classList.add('active');
                }
            });
        });
    }

    // Add to cart button functionality
    const addToCartBtn = document.getElementById('add-to-cart-btn');
    if (addToCartBtn) {
        addToCartBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            const productTitle = document.querySelector('.product-title')?.textContent || 'Товар';
            const productPrice = parseInt(document.getElementById('product-price')?.textContent.replace(/[^\d]/g, '') || '3500');
            const productQuantity = parseInt(document.querySelector('.qty-input')?.value || '1');
            const productImage = document.getElementById('main-product-image')?.src || '';
            const productArt = document.querySelector('.product-art')?.textContent || '';
            
            const product = {
                id: productArt || Date.now().toString(),
                title: productTitle,
                price: productPrice,
                quantity: productQuantity,
                image: productImage
            };
            
            addToCart(product);
            
            // Button animation
            const originalText = this.textContent;
            this.textContent = 'Добавлено!';
            this.style.background = 'linear-gradient(135deg, #27ae60 0%, #229954 100%)';
            
            setTimeout(() => {
                this.textContent = originalText;
                this.style.background = '';
            }, 2000);
        });
    }
    
    
    // Checkout button
    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (cart.length === 0) {
                alert('Корзина пуста. Добавьте товары перед оформлением заказа.');
                return;
            }
            alert('Переход к оформлению заказа. Здесь будет страница оформления заказа.');
            // window.location.href = 'checkout.html';
        });
        
        // Show/hide checkout button based on cart
        if (cart.length === 0) {
            checkoutBtn.style.display = 'none';
        }
    }

    // Smooth scroll animations on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    // Observe all content sections
    document.querySelectorAll('.content-section, .info-block, .product-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});
