// scripts.js - JAVASCRIPT COMPLETO PARA FASHIONHUB
// Sistema completo de e-commerce con todas las funcionalidades

class FashionHub {
    constructor() {
        this.cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        this.wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.recentSearches = JSON.parse(localStorage.getItem('recentSearches')) || [];
        this.apiBaseUrl = 'http://localhost/fashionhub/api/';
        
        this.init();
    }

    init() {
        this.initNavigation();
        this.initHeader();
        this.initCart();
        this.initWishlist();
        this.initFilters();
        this.initProductInteractions();
        this.initCheckout();
        this.initUserAccount();
        this.initSearch();
        this.initAnimations();
        this.initNotifications();
        this.initFormValidations();
        this.initExportFunctions();
        this.initModalSystem();
        this.initResponsiveMenu();
        this.initSocialMedia();
        this.initOfflineSupport();
        this.initPerformance();
        
        console.log('🛍️ FashionHub inicializado correctamente');
    }

    // ==================== SISTEMA DE NAVEGACIÓN ====================

    initNavigation() {
        // Navegación suave para enlaces internos
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.getAttribute('href')?.startsWith('#')) {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                if (targetElement) {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });

        // Enlaces activos
        this.updateActiveNavLinks();

        // Botones de volver
        const backButtons = document.querySelectorAll('.back-home-btn, .back-btn');
        backButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.history.back();
            });
        });
    }

    updateActiveNavLinks() {
        const currentPage = window.location.pathname.split('/').pop() || 'index.html';
        document.querySelectorAll('.nav-links a').forEach(link => {
            if (link.getAttribute('href') === currentPage) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    // ==================== HEADER Y MENÚ RESPONSIVE ====================

    initHeader() {
        const header = document.getElementById('mainHeader');
        if (header) {
            let lastScrollY = window.scrollY;
            
            window.addEventListener('scroll', () => {
                if (window.scrollY > 100) {
                    header.classList.add('header-scrolled');
                    
                    // Ocultar/mostrar header al hacer scroll
                    if (window.scrollY > lastScrollY && window.scrollY > 200) {
                        header.style.transform = 'translateY(-100%)';
                    } else {
                        header.style.transform = 'translateY(0)';
                    }
                } else {
                    header.classList.remove('header-scrolled');
                    header.style.transform = 'translateY(0)';
                }
                
                lastScrollY = window.scrollY;
            });
        }
    }

    initResponsiveMenu() {
        const mobileBtn = document.querySelector('.mobile-menu-btn');
        if (mobileBtn) {
            mobileBtn.addEventListener('click', () => {
                const navLinks = document.querySelector('.nav-links');
                const isOpen = navLinks.classList.toggle('mobile-open');
                
                mobileBtn.innerHTML = isOpen ? 
                    '<i class="fas fa-times"></i>' : 
                    '<i class="fas fa-bars"></i>';
                
                mobileBtn.setAttribute('aria-label', 
                    isOpen ? 'Cerrar menú de navegación' : 'Abrir menú de navegación');
            });
        }

        // Cerrar menú al hacer clic fuera
        document.addEventListener('click', (e) => {
            if (!e.target.closest('nav') && !e.target.closest('.mobile-menu-btn')) {
                const navLinks = document.querySelector('.nav-links');
                const mobileBtn = document.querySelector('.mobile-menu-btn');
                
                if (navLinks.classList.contains('mobile-open')) {
                    navLinks.classList.remove('mobile-open');
                    mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
                    mobileBtn.setAttribute('aria-label', 'Abrir menú de navegación');
                }
            }
        });
    }

    // ==================== SISTEMA DE CARRITO MEJORADO ====================

    initCart() {
        this.updateCartIcon();
        
        // Delegación de eventos para botones dinámicos
        document.addEventListener('click', (e) => {
            // Añadir al carrito
            if (e.target.matches('.add-btn, .add-to-cart-btn') || 
                e.target.closest('.add-btn, .add-to-cart-btn')) {
                e.preventDefault();
                const button = e.target.matches('.add-btn, .add-to-cart-btn') ? 
                    e.target : e.target.closest('.add-btn, .add-to-cart-btn');
                this.addToCart(button);
            }
            
            // Eliminar del carrito
            if (e.target.matches('.remove-btn, .remove-item-btn') || 
                e.target.closest('.remove-btn, .remove-item-btn')) {
                e.preventDefault();
                const button = e.target.matches('.remove-btn, .remove-item-btn') ? 
                    e.target : e.target.closest('.remove-btn, .remove-item-btn');
                this.removeFromCart(button);
            }
            
            // Ver carrito
            if (e.target.closest('.nav-icons a[aria-label*="carrito"]')) {
                e.preventDefault();
                this.showCartModal();
            }
        });

        // Control de cantidad
        this.initQuantityControls();
    }

    initQuantityControls() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.quantity-btn') || e.target.closest('.quantity-btn')) {
                const button = e.target.matches('.quantity-btn') ? 
                    e.target : e.target.closest('.quantity-btn');
                this.handleQuantityChange(button);
            }
        });

        document.addEventListener('change', (e) => {
            if (e.target.matches('.quantity-input')) {
                this.updateQuantityFromInput(e.target);
            }
        });

        document.addEventListener('input', this.debounce((e) => {
            if (e.target.matches('.quantity-input')) {
                this.updateCartPrices();
            }
        }, 300));
    }

    handleQuantityChange(button) {
        const controls = button.closest('.quantity-controls, .item-quantity');
        const input = controls?.querySelector('.quantity-input');
        if (!input) return;

        let quantity = parseInt(input.value);
        const isIncrease = button.textContent === '+' || button.querySelector('.fa-plus');
        const max = parseInt(input.getAttribute('max')) || 10;
        const min = parseInt(input.getAttribute('min')) || 1;

        if (isIncrease) {
            quantity = Math.min(quantity + 1, max);
        } else {
            quantity = Math.max(quantity - 1, min);
        }

        input.value = quantity;
        this.updateQuantityButtons(controls, quantity, min, max);
        
        // Actualizar carrito si es un item del carrito
        const cartItem = controls.closest('[data-id], [data-index]');
        if (cartItem) {
            this.updateCartItemQuantity(cartItem, quantity);
        }
    }

    updateQuantityFromInput(input) {
        let quantity = parseInt(input.value);
        const max = parseInt(input.getAttribute('max')) || 10;
        const min = parseInt(input.getAttribute('min')) || 1;

        if (isNaN(quantity) || quantity < min) quantity = min;
        if (quantity > max) quantity = max;

        input.value = quantity;
        const controls = input.closest('.quantity-controls, .item-quantity');
        this.updateQuantityButtons(controls, quantity, min, max);
    }

    updateQuantityButtons(controls, quantity, min, max) {
        const decreaseBtn = controls?.querySelector('.quantity-btn:first-child');
        const increaseBtn = controls?.querySelector('.quantity-btn:last-child');

        if (decreaseBtn) {
            decreaseBtn.disabled = quantity <= min;
            decreaseBtn.style.opacity = quantity <= min ? '0.5' : '1';
        }
        if (increaseBtn) {
            increaseBtn.disabled = quantity >= max;
            increaseBtn.style.opacity = quantity >= max ? '0.5' : '1';
        }
    }

    addToCart(button) {
        const productCard = button.closest('[data-id]');
        if (!productCard) {
            this.showNotification('Error: No se pudo agregar el producto', 'error');
            return;
        }

        const productId = productCard.dataset.id;
        const productName = productCard.querySelector('.product-name, .product-title, .item-name')?.textContent?.trim() || 'Producto';
        const priceElement = productCard.querySelector('.current-price, .product-price, .item-price');
        const price = priceElement ? this.parsePrice(priceElement.textContent) : 0;

        // Obtener variantes
        const colorElement = productCard.querySelector('.variant-option.selected[data-color]');
        const sizeElement = productCard.querySelector('.variant-option.selected:not([data-color])');
        
        const variant = {
            color: colorElement ? colorElement.getAttribute('data-color') || colorElement.textContent : 'Default',
            size: sizeElement ? sizeElement.textContent : 'M'
        };

        // Obtener cantidad
        const quantityInput = productCard.querySelector('.quantity-input');
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;

        // Obtener imagen
        const imageElement = productCard.querySelector('.product-img img, .product-image img, .item-image img');
        const imageUrl = imageElement ? imageElement.src : '';

        const existingItemIndex = this.cartItems.findIndex(item => 
            item.id === productId && 
            item.variant.color === variant.color && 
            item.variant.size === variant.size
        );

        if (existingItemIndex !== -1) {
            this.cartItems[existingItemIndex].quantity += quantity;
        } else {
            this.cartItems.push({
                id: productId,
                name: productName,
                price: price,
                quantity: quantity,
                image: imageUrl,
                variant: variant
            });
        }

        this.saveCart();
        this.showNotification(`✓ ${quantity} ${productName} añadido al carrito`, 'success');
        this.animateAddToCart(button);
    }

    animateAddToCart(button) {
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = 'scale(1)';
        }, 150);

        // Animación al icono del carrito
        const cartIcon = document.querySelector('.nav-icons a[aria-label*="carrito"]');
        if (cartIcon) {
            cartIcon.style.transform = 'scale(1.2)';
            setTimeout(() => {
                cartIcon.style.transform = 'scale(1)';
            }, 300);
        }
    }

    removeFromCart(button) {
        const cartItem = button.closest('[data-index], [data-id]');
        if (!cartItem) return;

        let itemName = 'Producto';
        
        if (cartItem.dataset.index !== undefined) {
            // Es un item del modal del carrito
            const index = parseInt(cartItem.dataset.index);
            itemName = this.cartItems[index]?.name || 'Producto';
            this.cartItems.splice(index, 1);
        } else {
            // Es un item de la página del carrito
            const productId = cartItem.dataset.id;
            this.cartItems = this.cartItems.filter(item => item.id !== productId);
            const itemElement = cartItem.querySelector('.item-name');
            itemName = itemElement ? itemElement.textContent : 'Producto';
        }

        this.saveCart();
        this.showNotification(`🗑️ ${itemName} eliminado del carrito`, 'info');
        
        // Si estamos en la página del carrito, recargar la vista
        if (window.location.pathname.includes('carrito.html')) {
            this.updateCartView();
        }
    }

    updateCartItemQuantity(cartItem, quantity) {
        if (cartItem.dataset.index !== undefined) {
            const index = parseInt(cartItem.dataset.index);
            if (this.cartItems[index]) {
                this.cartItems[index].quantity = quantity;
                this.saveCart();
            }
        }
    }

    updateCartView() {
        if (!window.location.pathname.includes('carrito.html')) return;

        const cartContainer = document.querySelector('.cart-items');
        const emptyCart = document.querySelector('.cart-empty');
        const cartStats = document.querySelector('.cart-stats');

        if (this.cartItems.length === 0) {
            if (cartContainer) cartContainer.style.display = 'none';
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartStats) cartStats.textContent = '0 productos en el carrito';
        } else {
            if (cartContainer) cartContainer.style.display = 'block';
            if (emptyCart) emptyCart.style.display = 'none';
            if (cartStats) {
                const totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
                cartStats.textContent = `${totalItems} producto${totalItems !== 1 ? 's' : ''} en el carrito`;
            }
            this.updateCartPrices();
        }
    }

    updateCartPrices() {
        const subtotal = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shipping = subtotal > 100000 ? 0 : 9900;
        const total = subtotal + shipping;

        // Actualizar en la página del carrito
        const subtotalElement = document.querySelector('.total-row .total-value');
        const shippingElement = document.querySelector('.shipping .total-value');
        const totalElement = document.querySelector('.final-total .total-value');

        if (subtotalElement) subtotalElement.textContent = this.formatPrice(subtotal);
        if (shippingElement) shippingElement.textContent = shipping === 0 ? 'GRATIS' : this.formatPrice(shipping);
        if (totalElement) totalElement.textContent = this.formatPrice(total);
    }

    showCartModal() {
        if (this.cartItems.length === 0) {
            this.showNotification('Tu carrito está vacío', 'info');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.setAttribute('aria-label', 'Carrito de compras');
        
        const total = this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const shippingCost = total > 100000 ? 0 : 9900;
        const finalTotal = total + shippingCost;

        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🛒 Tu Carrito de Compras</h3>
                    <button class="close-modal" aria-label="Cerrar carrito">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="cart-items-list">
                        ${this.cartItems.map((item, index) => `
                            <div class="cart-modal-item" data-index="${index}">
                                <div class="cart-modal-item-image">
                                    ${item.image ? `<img src="${item.image}" alt="${item.name}" loading="lazy">` : '<i class="fas fa-tshirt"></i>'}
                                </div>
                                <div class="cart-modal-item-details">
                                    <h4>${item.name}</h4>
                                    <div class="item-variant">
                                        ${item.variant.color ? `Color: ${item.variant.color}` : ''}
                                        ${item.variant.size ? `, Talla: ${item.variant.size}` : ''}
                                    </div>
                                    <div class="item-price-modal">
                                        ${this.formatPrice(item.price)} x ${item.quantity} = 
                                        <strong>${this.formatPrice(item.price * item.quantity)}</strong>
                                    </div>
                                    <div class="item-quantity-controls">
                                        <button class="quantity-btn minus" data-index="${index}" aria-label="Reducir cantidad">-</button>
                                        <span class="quantity-display">${item.quantity}</span>
                                        <button class="quantity-btn plus" data-index="${index}" aria-label="Aumentar cantidad">+</button>
                                    </div>
                                </div>
                                <button class="remove-item-btn" data-index="${index}" aria-label="Eliminar producto" title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="modal-footer">
                    <div class="cart-total-section">
                        <div class="subtotal">
                            <span>Subtotal:</span>
                            <span>${this.formatPrice(total)}</span>
                        </div>
                        <div class="shipping">
                            <span>Envío:</span>
                            <span>${shippingCost === 0 ? '🎁 GRATIS' : this.formatPrice(shippingCost)}</span>
                        </div>
                        <div class="total">
                            <span>Total:</span>
                            <span class="total-price">${this.formatPrice(finalTotal)}</span>
                        </div>
                    </div>
                    <div class="cart-actions">
                        <button class="btn btn-outline" id="continueShopping">🛍️ Seguir Comprando</button>
                        <a href="comprar.html" class="btn btn-primary" id="goToCheckout">💰 Finalizar Compra</a>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('#continueShopping').addEventListener('click', () => this.closeModal(modal));
        
        modal.querySelectorAll('.quantity-btn.minus').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.decreaseCartQuantity(index);
                this.closeModal(modal);
                this.showCartModal(); // Recargar modal
            });
        });

        modal.querySelectorAll('.quantity-btn.plus').forEach(btn => {
            btn.addEventListener('click', () => {
                const index = parseInt(btn.dataset.index);
                this.increaseCartQuantity(index);
                this.closeModal(modal);
                this.showCartModal(); // Recargar modal
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });

        // Enfocar el modal para accesibilidad
        modal.setAttribute('tabindex', '0');
        modal.focus();
    }

    increaseCartQuantity(index) {
        if (this.cartItems[index]) {
            this.cartItems[index].quantity += 1;
            this.saveCart();
        }
    }

    decreaseCartQuantity(index) {
        if (this.cartItems[index]) {
            if (this.cartItems[index].quantity > 1) {
                this.cartItems[index].quantity -= 1;
                this.saveCart();
            } else {
                this.cartItems.splice(index, 1);
                this.saveCart();
            }
        }
    }

    saveCart() {
        localStorage.setItem('cartItems', JSON.stringify(this.cartItems));
        this.updateCartIcon();
        this.updateCartView();
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('cartUpdated', {
            detail: { cartItems: this.cartItems }
        }));
    }

    updateCartIcon() {
        const cartIcon = document.querySelector('.nav-icons a[aria-label*="carrito"]');
        if (cartIcon) {
            const totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
            let cartCount = cartIcon.querySelector('.cart-count');
            
            if (totalItems > 0) {
                if (!cartCount) {
                    cartCount = document.createElement('span');
                    cartCount.className = 'cart-count';
                    cartIcon.appendChild(cartCount);
                }
                cartCount.textContent = totalItems > 99 ? '99+' : totalItems.toString();
                cartCount.setAttribute('aria-label', `${totalItems} productos en el carrito`);
            } else if (cartCount) {
                cartCount.remove();
            }
        }
    }

    // ==================== SISTEMA DE FAVORITOS ====================

    initWishlist() {
        // Inicializar estado de botones de favoritos
        this.updateWishlistButtons();
        
        // Delegación de eventos
        document.addEventListener('click', (e) => {
            if (e.target.matches('.product-wishlist, .wishlist-btn, .favorite-btn') || 
                e.target.closest('.product-wishlist, .wishlist-btn, .favorite-btn')) {
                e.preventDefault();
                const button = e.target.matches('.product-wishlist, .wishlist-btn, .favorite-btn') ? 
                    e.target : e.target.closest('.product-wishlist, .wishlist-btn, .favorite-btn');
                this.toggleWishlist(button);
            }
            
            // Icono de favoritos en header
            if (e.target.closest('.nav-icons a[aria-label*="cuenta"]')) {
                e.preventDefault();
                this.showWishlistModal();
            }
        });
    }

    toggleWishlist(button) {
        const productCard = button.closest('[data-id]');
        if (!productCard) return;

        const productId = productCard.dataset.id;
        const icon = button.querySelector('i');
        const isActive = this.wishlistItems.includes(productId);

        if (isActive) {
            // Remover de favoritos
            this.wishlistItems = this.wishlistItems.filter(id => id !== productId);
            button.classList.remove('active');
            if (icon) {
                icon.className = 'far fa-heart';
                icon.style.animation = 'heartPulse 0.3s ease';
            }
            this.showNotification('💔 Producto removido de favoritos', 'info');
        } else {
            // Añadir a favoritos
            this.wishlistItems.push(productId);
            button.classList.add('active');
            if (icon) {
                icon.className = 'fas fa-heart';
                icon.style.animation = 'heartPulse 0.3s ease';
                setTimeout(() => icon.style.animation = '', 300);
            }
            this.showNotification('❤️ Producto añadido a favoritos', 'success');
        }

        this.saveWishlist();
    }

    updateWishlistButtons() {
        document.querySelectorAll('.product-wishlist, .wishlist-btn, .favorite-btn').forEach(button => {
            const productCard = button.closest('[data-id]');
            if (productCard) {
                const productId = productCard.dataset.id;
                const icon = button.querySelector('i');
                
                if (this.wishlistItems.includes(productId)) {
                    button.classList.add('active');
                    if (icon) icon.className = 'fas fa-heart';
                } else {
                    button.classList.remove('active');
                    if (icon) icon.className = 'far fa-heart';
                }
            }
        });
    }

    showWishlistModal() {
        if (this.wishlistItems.length === 0) {
            this.showNotification('💝 No tienes productos en favoritos', 'info');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal active';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>❤️ Tus Favoritos</h3>
                    <button class="close-modal" aria-label="Cerrar favoritos">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Tienes <strong>${this.wishlistItems.length}</strong> productos en tu lista de favoritos.</p>
                    <div class="modal-actions">
                        <button class="btn btn-primary" id="viewWishlist">📋 Ver Mis Favoritos</button>
                        <button class="btn btn-outline" id="closeWishlist">Cerrar</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('#closeWishlist').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('#viewWishlist').addEventListener('click', () => {
            window.location.href = 'cuenta.html#favoritos';
            this.closeModal(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    }

    saveWishlist() {
        localStorage.setItem('wishlistItems', JSON.stringify(this.wishlistItems));
        
        // Disparar evento personalizado
        window.dispatchEvent(new CustomEvent('wishlistUpdated', {
            detail: { wishlistItems: this.wishlistItems }
        }));
    }

    // ==================== SISTEMA DE BÚSQUEDA ====================

    initSearch() {
        const searchInputs = document.querySelectorAll('.search-input');
        
        searchInputs.forEach(input => {
            let timeout;
            
            // Búsqueda en tiempo real
            input.addEventListener('input', this.debounce((e) => {
                const term = e.target.value.trim();
                this.handleSearchInput(term, input);
            }, 500));

            // Búsqueda al presionar Enter
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    const term = input.value.trim();
                    this.performSearch(term);
                }
            });
        });

        // Botones de búsqueda
        document.addEventListener('click', (e) => {
            if (e.target.matches('.search-btn') || e.target.closest('.search-btn')) {
                const button = e.target.matches('.search-btn') ? 
                    e.target : e.target.closest('.search-btn');
                const searchInput = button.closest('.search-box')?.querySelector('.search-input') ||
                                 document.querySelector('.search-input');
                if (searchInput) {
                    const term = searchInput.value.trim();
                    this.performSearch(term);
                }
            }
        });

        // Icono de búsqueda en header
        const searchIcon = document.querySelector('.nav-icons a[aria-label*="Buscar"]');
        if (searchIcon) {
            searchIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSearchModal();
            });
        }
    }

    handleSearchInput(term, input) {
        if (term.length > 2) {
            this.showSearchSuggestions(term, input);
        } else {
            this.hideSearchSuggestions(input);
        }
    }

    showSearchSuggestions(term, input) {
        // Crear o actualizar contenedor de sugerencias
        let suggestionsContainer = input.parentNode.querySelector('.search-suggestions');
        if (!suggestionsContainer) {
            suggestionsContainer = document.createElement('div');
            suggestionsContainer.className = 'search-suggestions';
            input.parentNode.appendChild(suggestionsContainer);
        }

        // Generar sugerencias basadas en búsquedas recientes y términos comunes
        const suggestions = this.generateSearchSuggestions(term);
        
        suggestionsContainer.innerHTML = `
            <div class="suggestions-list">
                ${suggestions.map(suggestion => `
                    <div class="suggestion-item" data-term="${suggestion}">
                        <i class="fas fa-search"></i>
                        <span>${suggestion}</span>
                    </div>
                `).join('')}
            </div>
        `;

        suggestionsContainer.style.display = 'block';

        // Event listeners para sugerencias
        suggestionsContainer.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                input.value = item.dataset.term;
                this.performSearch(item.dataset.term);
                suggestionsContainer.style.display = 'none';
            });
        });
    }

    generateSearchSuggestions(term) {
        const commonTerms = ['camisetas', 'jeans', 'zapatos', 'chaquetas', 'vestidos', 'accesorios'];
        const recentTerms = this.recentSearches.filter(search => 
            search.toLowerCase().includes(term.toLowerCase())
        );
        
        const allSuggestions = [...new Set([...recentTerms, ...commonTerms])];
        return allSuggestions.slice(0, 5); // Máximo 5 sugerencias
    }

    hideSearchSuggestions(input) {
        const suggestionsContainer = input.parentNode.querySelector('.search-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.style.display = 'none';
        }
    }

    performSearch(term) {
        if (!term) {
            this.showNotification('🔍 Por favor, ingresa un término de búsqueda', 'warning');
            return;
        }

        // Guardar en búsquedas recientes
        this.saveToRecentSearches(term);

        // Mostrar loading
        this.showNotification(`🔍 Buscando: "${term}"`, 'info');

        // Simular búsqueda (en una implementación real, aquí iría la llamada a la API)
        setTimeout(() => {
            if (window.location.pathname.includes('buscar.html')) {
                // Actualizar resultados en página de búsqueda
                this.updateSearchResults(term);
            } else {
                // Redirigir a página de búsqueda
                window.location.href = `buscar.html?q=${encodeURIComponent(term)}`;
            }
        }, 1000);
    }

    updateSearchResults(term) {
        const resultsInfo = document.querySelector('.results-info');
        const searchTermElement = document.getElementById('searchTerm');
        
        if (resultsInfo) {
            resultsInfo.innerHTML = `Se encontraron <strong>8 productos</strong> para "<strong>${term}</strong>"`;
        }
        
        if (searchTermElement) {
            searchTermElement.textContent = term;
        }
    }

    saveToRecentSearches(term) {
        // Evitar duplicados
        this.recentSearches = this.recentSearches.filter(search => search !== term);
        
        // Añadir al principio
        this.recentSearches.unshift(term);
        
        // Limitar a 10 búsquedas
        this.recentSearches = this.recentSearches.slice(0, 10);
        
        // Guardar en localStorage
        localStorage.setItem('recentSearches', JSON.stringify(this.recentSearches));
    }

    showSearchModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔍 Buscar Productos</h3>
                    <button class="close-modal" aria-label="Cerrar búsqueda">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="search-form">
                        <input type="text" id="searchModalInput" 
                               class="form-input search-input" 
                               placeholder="¿Qué estás buscando?"
                               aria-label="Término de búsqueda">
                        <button class="btn btn-primary search-btn">
                            <i class="fas fa-search"></i> Buscar
                        </button>
                    </div>
                    
                    ${this.recentSearches.length > 0 ? `
                    <div class="recent-searches">
                        <h4>📚 Búsquedas recientes:</h4>
                        <div class="recent-list">
                            ${this.recentSearches.map(term => `
                                <span class="recent-item" data-term="${term}">${term}</span>
                            `).join('')}
                        </div>
                    </div>
                    ` : ''}
                    
                    <div class="search-suggestions">
                        <h4>💡 Sugerencias populares:</h4>
                        <div class="suggestion-tags">
                            <span class="suggestion-tag" data-term="camisetas">Camisetas</span>
                            <span class="suggestion-tag" data-term="jeans">Jeans</span>
                            <span class="suggestion-tag" data-term="zapatos">Zapatos</span>
                            <span class="suggestion-tag" data-term="chaquetas">Chaquetas</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        const searchInput = modal.querySelector('#searchModalInput');
        searchInput.focus();

        // Event listeners
        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
        
        modal.querySelector('.search-btn').addEventListener('click', () => {
            const term = searchInput.value.trim();
            if (term) {
                this.performSearch(term);
                this.closeModal(modal);
            }
        });

        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                modal.querySelector('.search-btn').click();
            }
        });

        // Sugerencias clickeables
        modal.querySelectorAll('.suggestion-tag, .recent-item').forEach(item => {
            item.addEventListener('click', () => {
                searchInput.value = item.dataset.term;
                modal.querySelector('.search-btn').click();
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    }

    // ==================== SISTEMA DE FILTROS ====================

    initFilters() {
        // Filtros por categoría
        const filterSelects = document.querySelectorAll('select');
        filterSelects.forEach(select => {
            select.addEventListener('change', this.debounce(() => {
                this.applyFilters();
            }, 300));
        });

        // Limpiar filtros
        const clearFiltersBtn = document.querySelector('.clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearFilters();
            });
        }

        // Tags de filtros
        document.addEventListener('click', (e) => {
            if (e.target.matches('.filter-tag i') || e.target.closest('.filter-tag i')) {
                const icon = e.target.matches('.filter-tag i') ? 
                    e.target : e.target.closest('.filter-tag i');
                this.removeFilterTag(icon);
            }
        });

        // Toggle de vista (tabla/cajas)
        const viewToggle = document.querySelectorAll('.view-toggle a');
        viewToggle.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!btn.classList.contains('active')) {
                    viewToggle.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.trackEvent('ui', 'view_changed', btn.querySelector('i').className);
                }
            });
        });
    }

    applyFilters() {
        const activeFilters = this.getActiveFilters();
        
        if (Object.keys(activeFilters).length > 0) {
            this.showNotification('✅ Filtros aplicados', 'success');
            this.trackEvent('filters', 'applied', JSON.stringify(activeFilters));
        }
        
        // En una implementación real, aquí se filtrarían los productos
    }

    getActiveFilters() {
        const filters = {};
        const filterSelects = document.querySelectorAll('select');
        
        filterSelects.forEach(select => {
            if (select.value) {
                filters[select.id] = select.value;
            }
        });
        
        return filters;
    }

    clearFilters() {
        const filterSelects = document.querySelectorAll('select');
        filterSelects.forEach(select => {
            select.value = '';
        });
        
        const filterTags = document.querySelector('.filter-tags');
        if (filterTags) {
            filterTags.innerHTML = '';
        }
        
        this.showNotification('🔄 Filtros limpiados', 'info');
        this.trackEvent('filters', 'cleared');
    }

    removeFilterTag(icon) {
        const filterTag = icon.closest('.filter-tag');
        if (filterTag) {
            const filterText = filterTag.querySelector('span').textContent;
            filterTag.remove();
            this.showNotification(`🗑️ Filtro "${filterText}" removido`, 'info');
        }
    }

    // ==================== INTERACCIONES DE PRODUCTOS ====================

    initProductInteractions() {
        // Vista rápida
        document.addEventListener('click', (e) => {
            if (e.target.matches('.quick-view-btn') || e.target.closest('.quick-view-btn')) {
                e.preventDefault();
                const button = e.target.matches('.quick-view-btn') ? 
                    e.target : e.target.closest('.quick-view-btn');
                this.showQuickView(button);
            }
        });

        // Selectores de variantes
        document.addEventListener('click', (e) => {
            if (e.target.matches('.variant-option:not(.disabled)') || 
                e.target.closest('.variant-option:not(.disabled)')) {
                const option = e.target.matches('.variant-option') ? 
                    e.target : e.target.closest('.variant-option');
                this.selectVariant(option);
            }
        });

        // Tabs de productos
        this.initProductTabs();

        // Galería de productos
        this.initProductGallery();

        // Ordenamiento de tabla
        this.initTableSorting();

        // Paginación
        this.initPagination();
    }

    showQuickView(button) {
        const productCard = button.closest('.product-card');
        if (!productCard) return;

        const productId = productCard.dataset.id;
        const productName = productCard.querySelector('.product-name, .product-title')?.textContent || 'Producto';
        const productPrice = productCard.querySelector('.current-price')?.textContent || '';
        const productImage = productCard.querySelector('.product-image, .product-img')?.innerHTML || '';

        const modal = document.createElement('div');
        modal.className = 'modal active';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>👀 Vista Rápida</h3>
                    <button class="close-modal" aria-label="Cerrar vista rápida">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="quick-view-content">
                        <div class="product-gallery">
                            ${productImage}
                        </div>
                        <div class="product-info">
                            <h3>${productName}</h3>
                            <div class="product-price">${productPrice}</div>
                            <p>Vista previa rápida del producto. Haz clic en "Ver Detalles" para más información.</p>
                            <div class="product-actions">
                                <a href="producto.html" class="btn btn-primary">📖 Ver Detalles</a>
                                <button class="btn btn-secondary add-to-cart-btn">🛒 Añadir al Carrito</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('.add-to-cart-btn').addEventListener('click', () => {
            this.addToCart(button);
            this.closeModal(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    }

    selectVariant(option) {
        const variantGroup = option.closest('.variant-selector');
        const options = variantGroup.querySelectorAll('.variant-option');
        
        // Remover selección anterior
        options.forEach(opt => opt.classList.remove('selected'));
        
        // Añadir nueva selección
        option.classList.add('selected');
        
        // Actualizar texto del selector
        const selectedSpan = variantGroup.querySelector('#selected-color, #selected-size');
        if (selectedSpan) {
            selectedSpan.textContent = option.textContent;
        }
        
        this.showNotification(`🎨 Variante seleccionada: ${option.textContent}`, 'info');
    }

    initProductTabs() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.tab-btn') || e.target.closest('.tab-btn')) {
                const btn = e.target.matches('.tab-btn') ? 
                    e.target : e.target.closest('.tab-btn');
                const tabId = btn.dataset.tab;
                this.switchTab(tabId, btn);
            }
        });
    }

    switchTab(tabId, btn) {
        const tabContainer = btn.closest('.tabs-header, .account-menu');
        if (!tabContainer) return;

        // Remover clase active de todos los botones y contenidos
        const tabBtns = tabContainer.querySelectorAll('.tab-btn, .menu-item');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabBtns.forEach(tab => tab.classList.remove('active'));
        tabContents.forEach(content => content.classList.remove('active'));
        
        // Añadir clase active al botón y contenido seleccionado
        btn.classList.add('active');
        const targetTab = document.getElementById(tabId);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }

    initProductGallery() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.product-thumbnail') || e.target.closest('.product-thumbnail')) {
                const thumbnail = e.target.matches('.product-thumbnail') ? 
                    e.target : e.target.closest('.product-thumbnail');
                this.selectProductImage(thumbnail);
            }
        });
    }

    selectProductImage(thumbnail) {
        const gallery = thumbnail.closest('.product-gallery');
        const thumbnails = gallery.querySelectorAll('.product-thumbnail');
        const mainImage = gallery.querySelector('.product-main-image img');
        
        if (!mainImage) return;

        // Remover clase active de todas las miniaturas
        thumbnails.forEach(thumb => thumb.classList.remove('active'));
        
        // Añadir clase active a la miniatura clickeada
        thumbnail.classList.add('active');
        
        // Cambiar imagen principal
        const newImage = thumbnail.dataset.image;
        if (newImage) {
            mainImage.src = newImage;
            mainImage.alt = thumbnail.querySelector('img')?.alt || 'Producto';
        }
    }

    initTableSorting() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.sortable') || e.target.closest('.sortable')) {
                const header = e.target.matches('.sortable') ? 
                    e.target : e.target.closest('.sortable');
                this.sortTable(header);
            }
        });
    }

    sortTable(header) {
        const sortBy = header.dataset.sort;
        const isActive = header.classList.contains('active');
        const currentDirection = header.querySelector('.fa-sort-up') ? 'asc' : 'desc';
        
        // Remover clases activas de todos los headers
        document.querySelectorAll('.sortable').forEach(h => {
            h.classList.remove('active');
            const icon = h.querySelector('i');
            if (icon) icon.className = 'fas fa-sort';
        });
        
        // Añadir clase activa al header clickeado
        header.classList.add('active');
        
        // Determinar nueva dirección
        let newDirection = 'asc';
        if (isActive && currentDirection === 'asc') {
            newDirection = 'desc';
        }
        
        // Actualizar icono
        const icon = header.querySelector('i');
        if (icon) {
            icon.className = newDirection === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
        }
        
        this.showNotification(`📊 Tabla ordenada por: ${sortBy} (${newDirection})`, 'info');
        this.trackEvent('table', 'sorted', `${sortBy}_${newDirection}`);
    }

    initPagination() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.pagination-item:not(.pagination-dots)') || 
                e.target.closest('.pagination-item:not(.pagination-dots)')) {
                const item = e.target.matches('.pagination-item') ? 
                    e.target : e.target.closest('.pagination-item');
                this.handlePagination(item);
            }
        });
    }

    handlePagination(item) {
        if (item.classList.contains('active')) return;

        const paginationItems = document.querySelectorAll('.pagination-item:not(.pagination-dots)');
        paginationItems.forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        
        this.showNotification('📄 Cambiando de página...', 'info');
    }

    // ==================== SISTEMA DE CHECKOUT ====================

    initCheckout() {
        // Métodos de pago
        document.addEventListener('click', (e) => {
            if (e.target.matches('.payment-method') || e.target.closest('.payment-method')) {
                const method = e.target.matches('.payment-method') ? 
                    e.target : e.target.closest('.payment-method');
                this.selectPaymentMethod(method);
            }
        });

        // Métodos de envío
        document.addEventListener('click', (e) => {
            if (e.target.matches('.shipping-method') || e.target.closest('.shipping-method')) {
                const method = e.target.matches('.shipping-method') ? 
                    e.target : e.target.closest('.shipping-method');
                this.selectShippingMethod(method);
            }
        });

        // Formulario de tarjeta
        this.initCardForm();

        // Validación de formulario
        const submitBtn = document.getElementById('submitOrder');
        if (submitBtn) {
            submitBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.submitOrder();
            });
        }

        // Código de descuento
        const promoBtn = document.querySelector('.promo-btn');
        if (promoBtn) {
            promoBtn.addEventListener('click', () => {
                this.applyPromoCode();
            });
        }

        // Términos y condiciones
        const termsCheckbox = document.getElementById('acceptTerms');
        if (termsCheckbox) {
            termsCheckbox.addEventListener('change', () => {
                this.updateSubmitButton();
            });
        }

        // Progreso del checkout
        this.initCheckoutProgress();
    }

    selectPaymentMethod(method) {
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(m => m.classList.remove('selected'));
        method.classList.add('selected');
        
        const methodType = method.dataset.method;
        this.showNotification(`💳 Método de pago seleccionado: ${methodType}`, 'info');
        
        // Mostrar formulario correspondiente
        const cardForm = document.querySelector('.card-form');
        if (cardForm) {
            if (methodType === 'credit' || methodType === 'debit') {
                cardForm.classList.add('active');
            } else {
                cardForm.classList.remove('active');
            }
        }
    }

    selectShippingMethod(method) {
        const shippingMethods = document.querySelectorAll('.shipping-method');
        shippingMethods.forEach(m => m.classList.remove('selected'));
        method.classList.add('selected');
        
        const methodName = method.querySelector('.shipping-name').textContent;
        this.showNotification(`🚚 Método de envío seleccionado: ${methodName}`, 'info');
    }

    initCardForm() {
        // Formatear número de tarjeta
        const cardNumberInput = document.getElementById('cardNumber');
        if (cardNumberInput) {
            cardNumberInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                let matches = value.match(/\d{4,16}/g);
                let match = matches && matches[0] || '';
                let parts = [];
                
                for (let i = 0; i < match.length; i += 4) {
                    parts.push(match.substring(i, i + 4));
                }
                
                if (parts.length) {
                    e.target.value = parts.join(' ');
                } else {
                    e.target.value = value;
                }
            });
        }

        // Formatear fecha de expiración
        const expiryInput = document.getElementById('cardExpiry');
        if (expiryInput) {
            expiryInput.addEventListener('input', (e) => {
                let value = e.target.value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
                if (value.length >= 2) {
                    e.target.value = value.substring(0, 2) + '/' + value.substring(2, 4);
                }
            });
        }
    }

    submitOrder() {
        const termsCheckbox = document.getElementById('acceptTerms');
        if (termsCheckbox && !termsCheckbox.checked) {
            this.showNotification('❌ Debes aceptar los términos y condiciones', 'error');
            return;
        }
        
        this.showNotification('⏳ Procesando pedido...', 'info');
        
        // Simular procesamiento
        setTimeout(() => {
            this.showNotification('✅ ¡Pedido realizado con éxito!', 'success');
            
            // Limpiar carrito después de una compra exitosa
            this.cartItems = [];
            this.saveCart();
            
            // Redirigir a página de confirmación
            setTimeout(() => {
                window.location.href = 'confirmacion.html';
            }, 2000);
        }, 3000);
    }

    applyPromoCode() {
        const promoInput = document.getElementById('promoCode');
        if (promoInput) {
            const code = promoInput.value.trim();
            if (code) {
                // Simular validación de código
                const validCodes = ['FASHION10', 'VERANO20', 'BIENVENIDO'];
                if (validCodes.includes(code.toUpperCase())) {
                    this.showNotification(`🎉 ¡Código ${code} aplicado! Descuento aplicado`, 'success');
                } else {
                    this.showNotification('❌ Código de descuento inválido', 'error');
                }
            } else {
                this.showNotification('📝 Por favor, ingresa un código de descuento', 'warning');
            }
        }
    }

    updateSubmitButton() {
        const termsCheckbox = document.getElementById('acceptTerms');
        const submitBtn = document.getElementById('submitOrder');
        
        if (termsCheckbox && submitBtn) {
            submitBtn.disabled = !termsCheckbox.checked;
            submitBtn.style.opacity = termsCheckbox.checked ? '1' : '0.6';
        }
    }

    initCheckoutProgress() {
        const progressSteps = document.querySelectorAll('.progress-step');
        progressSteps.forEach(step => {
            step.addEventListener('click', () => {
                if (step.classList.contains('completed')) {
                    this.showNotification('✅ Paso completado', 'info');
                }
            });
        });
    }

    // ==================== SISTEMA DE USUARIO ====================

    initUserAccount() {
        // Icono de usuario en header
        const userIcon = document.querySelector('.nav-icons a[aria-label*="cuenta"]');
        if (userIcon) {
            userIcon.addEventListener('click', (e) => {
                e.preventDefault();
                if (this.currentUser) {
                    this.showUserModal();
                } else {
                    this.showLoginModal();
                }
            });
        }

        // Tabs de cuenta
        this.initAccountTabs();

        // Formularios de cuenta
        this.initAccountForms();
    }

    initAccountTabs() {
        const tabItems = document.querySelectorAll('.account-menu .menu-item');
        
        tabItems.forEach(item => {
            if (!item.classList.contains('logout')) {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const tabId = item.getAttribute('href')?.substring(1);
                    if (tabId) {
                        this.switchTab(tabId, item);
                    }
                });
            }
        });
    }

    initAccountForms() {
        // Formulario de perfil
        const profileForm = document.querySelector('.profile-form');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfile(profileForm);
            });
        }

        // Botón de cerrar sesión
        const logoutBtn = document.querySelector('.logout');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }

    showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>🔐 Iniciar Sesión</h3>
                    <button class="close-modal" aria-label="Cerrar login">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="login-form">
                        <div class="form-group">
                            <label for="loginEmail">📧 Email</label>
                            <input type="email" id="loginEmail" class="form-input" 
                                   placeholder="tu@email.com" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">🔒 Contraseña</label>
                            <input type="password" id="loginPassword" class="form-input" 
                                   placeholder="Tu contraseña" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">🚀 Iniciar Sesión</button>
                    </form>
                    <div class="login-options">
                        <p class="text-center">¿No tienes cuenta? <a href="#" class="register-link">Regístrate aquí</a></p>
                        <div class="divider">o</div>
                        <button class="btn btn-outline btn-block guest-btn">
                            🎭 Continuar como invitado
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        const form = modal.querySelector('.login-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin(form);
        });

        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('.register-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal(modal);
            this.showRegisterModal();
        });
        modal.querySelector('.guest-btn').addEventListener('click', () => {
            this.closeModal(modal);
            this.showNotification('🎭 Continuando como invitado', 'info');
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });

        modal.querySelector('#loginEmail').focus();
    }

    showRegisterModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>👤 Crear Cuenta</h3>
                    <button class="close-modal" aria-label="Cerrar registro">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="register-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="registerFirstName" class="required">👤 Nombres</label>
                                <input type="text" id="registerFirstName" class="form-input" 
                                       placeholder="Tus nombres" required>
                            </div>
                            <div class="form-group">
                                <label for="registerLastName" class="required">👥 Apellidos</label>
                                <input type="text" id="registerLastName" class="form-input" 
                                       placeholder="Tus apellidos" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="registerEmail" class="required">📧 Correo Electrónico</label>
                            <input type="email" id="registerEmail" class="form-input" 
                                   placeholder="tu@email.com" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="registerPhone">📞 Teléfono (Opcional)</label>
                            <input type="tel" id="registerPhone" class="form-input" 
                                   placeholder="+57 300 123 4567">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="registerPassword" class="required">🔒 Contraseña</label>
                                <input type="password" id="registerPassword" class="form-input" 
                                       placeholder="Mínimo 6 caracteres" required minlength="6">
                            </div>
                            <div class="form-group">
                                <label for="registerConfirmPassword" class="required">🔒 Confirmar Contraseña</label>
                                <input type="password" id="registerConfirmPassword" class="form-input" 
                                       placeholder="Repite tu contraseña" required>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label class="checkbox-label">
                                <input type="checkbox" id="acceptNewsletter">
                                <span class="checkmark"></span>
                                📬 Recibir ofertas y novedades por email
                            </label>
                        </div>
                        
                        <div class="form-group">
                            <label class="checkbox-label required">
                                <input type="checkbox" id="acceptTerms" required>
                                <span class="checkmark"></span>
                                ✅ Acepto los <a href="#" class="terms-link">términos y condiciones</a>
                            </label>
                        </div>
                        
                        <button type="submit" class="btn btn-primary btn-block">🚀 Crear Cuenta</button>
                    </form>
                    
                    <div class="login-options">
                        <p class="text-center">¿Ya tienes cuenta? <a href="#" class="login-link">Inicia sesión aquí</a></p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        const form = modal.querySelector('.register-form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister(form);
        });

        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('.login-link').addEventListener('click', (e) => {
            e.preventDefault();
            this.closeModal(modal);
            this.showLoginModal();
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });

        modal.querySelector('#registerFirstName').focus();
    }

    handleLogin(form) {
        const email = form.querySelector('#loginEmail').value;
        const password = form.querySelector('#loginPassword').value;
        
        if (!email || !password) {
            this.showNotification('❌ Por favor, completa todos los campos', 'error');
            return;
        }

        this.showNotification('⏳ Iniciando sesión...', 'info');
        
        setTimeout(() => {
            // Simular login exitoso
            this.currentUser = {
                name: 'Usuario Demo',
                email: email,
                joined: new Date().toISOString()
            };
            
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.showNotification(`🎉 ¡Bienvenido ${this.currentUser.name}!`, 'success');
            this.closeAllModals();
            this.updateUserInterface();
            
        }, 1500);
    }

    handleRegister(form) {
        const firstName = form.querySelector('#registerFirstName').value.trim();
        const lastName = form.querySelector('#registerLastName').value.trim();
        const email = form.querySelector('#registerEmail').value.trim();
        const phone = form.querySelector('#registerPhone').value.trim();
        const password = form.querySelector('#registerPassword').value;
        const confirmPassword = form.querySelector('#registerConfirmPassword').value;
        const acceptTerms = form.querySelector('#acceptTerms').checked;

        // Validaciones
        if (!firstName || !lastName || !email || !password || !confirmPassword) {
            this.showNotification('❌ Por favor, completa todos los campos obligatorios', 'error');
            return;
        }

        if (password.length < 6) {
            this.showNotification('❌ La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        if (password !== confirmPassword) {
            this.showNotification('❌ Las contraseñas no coinciden', 'error');
            return;
        }

        if (!acceptTerms) {
            this.showNotification('❌ Debes aceptar los términos y condiciones', 'error');
            return;
        }

        this.showNotification('⏳ Creando tu cuenta...', 'info');
        
        setTimeout(() => {
            this.currentUser = {
                name: `${firstName} ${lastName}`,
                email: email,
                phone: phone || 'No proporcionado',
                joined: new Date().toISOString()
            };
            
            localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
            this.showNotification(`🎉 ¡Bienvenido/a ${this.currentUser.name}!`, 'success');
            this.closeAllModals();
            this.updateUserInterface();
            
        }, 2000);
    }

    updateUserInterface() {
        const userIcon = document.querySelector('.nav-icons a[aria-label*="cuenta"]');
        if (userIcon && this.currentUser) {
            userIcon.innerHTML = '<i class="fas fa-user-check"></i>';
            userIcon.title = `Mi cuenta (${this.currentUser.name})`;
        }
    }

    showUserModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>👤 Mi Cuenta</h3>
                    <button class="close-modal" aria-label="Cerrar cuenta">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="user-info">
                        <h4>¡Hola, ${this.currentUser.name}!</h4>
                        <p>📧 ${this.currentUser.email}</p>
                        ${this.currentUser.phone && this.currentUser.phone !== 'No proporcionado' ? 
                          `<p>📞 ${this.currentUser.phone}</p>` : ''}
                    </div>
                    <div class="user-actions">
                        <button class="user-action-btn" onclick="window.location.href='cuenta.html#pedidos'">
                            📦 Mis Pedidos
                        </button>
                        <button class="user-action-btn" onclick="window.location.href='cuenta.html#favoritos'">
                            ❤️ Mis Favoritos
                        </button>
                        <button class="user-action-btn" onclick="window.location.href='cuenta.html#configuracion'">
                            ⚙️ Configuración
                        </button>
                        <button class="user-action-btn logout-btn">
                            🚪 Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('.logout-btn').addEventListener('click', () => {
            this.logout();
            this.closeModal(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showNotification('👋 Sesión cerrada correctamente', 'info');
        this.updateUserInterface();
    }

    saveProfile(form) {
        this.showNotification('💾 Guardando cambios...', 'info');
        
        setTimeout(() => {
            this.showNotification('✅ Perfil actualizado correctamente', 'success');
        }, 1000);
    }

    // ==================== SISTEMA DE NOTIFICACIONES ====================

    initNotifications() {
        // Estilos CSS para animaciones
        this.injectNotificationStyles();
    }

    injectNotificationStyles() {
        const styles = `
            @keyframes heartPulse {
                0% { transform: scale(1); }
                50% { transform: scale(1.3); }
                100% { transform: scale(1); }
            }
            
            @keyframes slideInRight {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
            
            @keyframes slideOutRight {
                from { transform: translateX(0); opacity: 1; }
                to { transform: translateX(100%); opacity: 0; }
            }
        `;
        
        const styleSheet = document.createElement('style');
        styleSheet.textContent = styles;
        document.head.appendChild(styleSheet);
    }

    showNotification(message, type = 'info') {
        // Eliminar notificaciones existentes
        document.querySelectorAll('.notification').forEach(notification => {
            notification.remove();
        });

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.setAttribute('role', 'alert');
        notification.setAttribute('aria-live', 'polite');
        
        notification.innerHTML = `
            <span>${message}</span>
            <button class="close-notification" aria-label="Cerrar notificación">&times;</button>
        `;
        
        document.body.appendChild(notification);

        // Animación de entrada
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease';
            notification.classList.add('active');
        }, 10);

        // Cerrar notificación
        const closeBtn = notification.querySelector('.close-notification');
        closeBtn.addEventListener('click', () => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        });

        // Auto-cerrar después de 5 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideOutRight 0.3s ease';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    // ==================== SISTEMA DE MODALES ====================

    initModalSystem() {
        // Cerrar modales con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });

        // Prevenir scroll del body cuando hay modales abiertos
        this.preventBodyScroll();
    }

    preventBodyScroll() {
        const observer = new MutationObserver((mutations) => {
            const hasModal = document.querySelector('.modal.active');
            if (hasModal) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    closeModal(modal) {
        modal.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
        }, 300);
    }

    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            this.closeModal(modal);
        });
    }

    // ==================== VALIDACIONES DE FORMULARIOS ====================

    initFormValidations() {
        // Newsletter
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleNewsletterSubmit(newsletterForm);
            });
        }

        // Validación en tiempo real
        const formInputs = document.querySelectorAll('.form-input');
        formInputs.forEach(input => {
            input.addEventListener('blur', () => {
                this.validateField(input);
            });
            
            input.addEventListener('input', () => {
                this.clearFieldError(input);
            });
        });
    }

    handleNewsletterSubmit(form) {
        const emailInput = form.querySelector('.newsletter-input');
        const email = emailInput.value.trim();
        
        if (this.validateEmail(email)) {
            this.showNotification('🎉 ¡Te has suscrito exitosamente!', 'success');
            emailInput.value = '';
        } else {
            this.showNotification('❌ Por favor, ingresa un email válido', 'error');
        }
    }

    validateField(field) {
        const value = field.value.trim();
        
        if (field.type === 'email' && value) {
            if (!this.validateEmail(value)) {
                this.showFieldError(field, 'Por favor, ingresa un email válido');
                return false;
            }
        }
        
        if (field.hasAttribute('required') && !value) {
            this.showFieldError(field, 'Este campo es obligatorio');
            return false;
        }
        
        this.clearFieldError(field);
        return true;
    }

    showFieldError(field, message) {
        field.classList.add('error');
        
        // Mostrar mensaje de error
        let errorElement = field.parentNode.querySelector('.field-error');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'field-error';
            field.parentNode.appendChild(errorElement);
        }
        errorElement.textContent = message;
    }

    clearFieldError(field) {
        field.classList.remove('error');
        const errorElement = field.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // ==================== FUNCIONES DE EXPORTACIÓN ====================

    initExportFunctions() {
        document.addEventListener('click', (e) => {
            if (e.target.matches('.export-btn') || e.target.closest('.export-btn')) {
                const btn = e.target.matches('.export-btn') ? 
                    e.target : e.target.closest('.export-btn');
                this.handleExport(btn);
            }
        });
    }

    handleExport(btn) {
        const icon = btn.querySelector('i');
        if (icon.classList.contains('fa-file-export')) {
            this.exportToCSV();
        } else if (icon.classList.contains('fa-print')) {
            this.printPage();
        }
    }

    exportToCSV() {
        this.showNotification('📊 Exportando a CSV...', 'info');
        
        setTimeout(() => {
            this.showNotification('✅ Archivo CSV descargado', 'success');
        }, 1500);
    }

    printPage() {
        window.print();
    }

    // ==================== ANIMACIONES ====================

    initAnimations() {
        // Animación al hacer scroll
        const animateOnScroll = () => {
            const elements = document.querySelectorAll('.category-card, .product-card, .feature-card, .hero-content');
            
            elements.forEach(element => {
                const elementPosition = element.getBoundingClientRect().top;
                const screenPosition = window.innerHeight / 1.3;
                
                if (elementPosition < screenPosition) {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            });
        };

        // Configurar elementos inicialmente
        const animatedElements = document.querySelectorAll('.category-card, .product-card, .feature-card, .hero-content');
        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'all 0.6s ease';
        });

        window.addEventListener('scroll', animateOnScroll);
        animateOnScroll();

        // Efectos hover
        this.initHoverEffects();
    }

    initHoverEffects() {
        const cards = document.querySelectorAll('.category-card, .product-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-10px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Efectos en botones
        const buttons = document.querySelectorAll('.btn');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
            });
        });
    }

    // ==================== REDES SOCIALES ====================

    initSocialMedia() {
        const socialIcons = document.querySelectorAll('.social-icons a');
        socialIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = icon.querySelector('i').className.split('-')[1];
                this.showNotification(`🔗 Redirigiendo a ${platform}`, 'info');
            });
        });
    }

    // ==================== SOPORTE OFFLINE ====================

    initOfflineSupport() {
        // Detectar cambios en la conexión
        window.addEventListener('online', () => {
            this.showNotification('🌐 Conexión restaurada', 'success');
        });

        window.addEventListener('offline', () => {
            this.showNotification('📶 Estás trabajando sin conexión', 'warning');
        });

        // Guardar datos localmente para soporte offline
        this.initOfflineStorage();
    }

    initOfflineStorage() {
        // Verificar si hay datos pendientes de sincronizar
        const pendingActions = JSON.parse(localStorage.getItem('pendingActions')) || [];
        if (pendingActions.length > 0 && navigator.onLine) {
            this.syncPendingActions(pendingActions);
        }
    }

    syncPendingActions(pendingActions) {
        this.showNotification('🔄 Sincronizando datos...', 'info');
        
        // Simular sincronización
        setTimeout(() => {
            localStorage.removeItem('pendingActions');
            this.showNotification('✅ Datos sincronizados correctamente', 'success');
        }, 2000);
    }

    // ==================== OPTIMIZACIÓN DE RENDIMIENTO ====================

    initPerformance() {
        // Lazy loading para imágenes
        this.initLazyLoading();

        // Debounce para eventos de scroll y resize
        this.initPerformanceOptimizations();

        // Preload de recursos críticos
        this.preloadCriticalResources();
    }

    initLazyLoading() {
        const images = document.querySelectorAll('img[data-src]');
        
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            });
        });

        images.forEach(img => imageObserver.observe(img));
    }

    initPerformanceOptimizations() {
        // Debounce para eventos de scroll
        let scrollTimeout;
        window.addEventListener('scroll', () => {
            clearTimeout(scrollTimeout);
            scrollTimeout = setTimeout(() => {
                // Código que se ejecuta después de que el scroll se detiene
            }, 100);
        });

        // Debounce para eventos de resize
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // Código que se ejecuta después de que el resize se detiene
            }, 250);
        });
    }

    preloadCriticalResources() {
        // Preload de fuentes críticas
        const criticalFonts = [
            'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
            'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap'
        ];

        criticalFonts.forEach(font => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = font;
            link.as = 'style';
            document.head.appendChild(link);
        });
    }

    // ==================== MÉTODOS AUXILIARES ====================

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    parsePrice(priceString) {
        if (!priceString) return 0;
        return parseInt(priceString.replace(/[^\d]/g, '')) || 0;
    }

    formatPrice(price) {
        return `$${price.toLocaleString()}`;
    }

    trackEvent(category, action, label = '') {
        // En una implementación real, aquí se integraría con Google Analytics
        console.log('📊 Evento:', { category, action, label });
        
        // Simular envío a analytics
        if (typeof gtag !== 'undefined') {
            gtag('event', action, {
                'event_category': category,
                'event_label': label
            });
        }
    }

    // ==================== SECCIÓN DE NIÑOS Y ACCESORIOS ====================

    initKidsAndAccessories() {
        // Añadir categorías al filtro si no existen
        this.addCategoriesToFilter();
        
        // Inicializar sección de niños
        this.initKidsSection();
        
        // Inicializar sección de accesorios
        this.initAccessoriesSection();
    }

    addCategoriesToFilter() {
        const categorySelects = document.querySelectorAll('select#category, select#search-category');
        
        categorySelects.forEach(select => {
            // Verificar si ya existen las opciones
            const hasKids = select.querySelector('option[value="ninos"]');
            const hasAccessories = select.querySelector('option[value="accesorios"]');
            
            if (!hasKids) {
                const kidsOption = document.createElement('option');
                kidsOption.value = 'ninos';
                kidsOption.textContent = 'Niños';
                select.appendChild(kidsOption);
            }
            
            if (!hasAccessories) {
                const accessoriesOption = document.createElement('option');
                accessoriesOption.value = 'accesorios';
                accessoriesOption.textContent = 'Accesorios';
                select.appendChild(accessoriesOption);
            }
        });
    }

    initKidsSection() {
        const kidsCategory = document.querySelector('[data-category="ninos"]');
        if (kidsCategory) {
            kidsCategory.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadKidsProducts();
            });
        }

        // Cargar productos de niños si estamos en esa categoría
        if (window.location.href.includes('category=ninos')) {
            this.loadKidsProducts();
        }
    }

    loadKidsProducts() {
        const kidsProducts = [
            {
                id: 'kid-1',
                name: 'Camiseta Infantil Algodón',
                category: 'Niños',
                price: 24900,
                originalPrice: 29900,
                image: 'Imagenes_pagina_web/camiseta basica algodon hombre.png',
                description: 'Camiseta de algodón 100% para niños, suave y cómoda.',
                sizes: ['XS', 'S', 'M'],
                colors: ['Azul', 'Rojo', 'Verde', 'Amarillo'],
                inStock: true,
                rating: 4.7,
                reviews: 89
            },
            {
                id: 'kid-2',
                name: 'Polo Infantil Clásico',
                category: 'Niños',
                price: 35900,
                originalPrice: 42900,
                image: 'Imagenes_pagina_web/polo classic mujer.png',
                description: 'Polo clásico para niños, perfecto para ocasiones especiales.',
                sizes: ['XS', 'S', 'M', 'L'],
                colors: ['Blanco', 'Azul Marino', 'Rojo'],
                inStock: true,
                rating: 4.5,
                reviews: 67
            }
        ];

        this.renderProductsSection(kidsProducts, '👶 Productos para Niños');
    }

    initAccessoriesSection() {
        const accessoriesCategory = document.querySelector('[data-category="accesorios"]');
        if (accessoriesCategory) {
            accessoriesCategory.addEventListener('click', (e) => {
                e.preventDefault();
                this.loadAccessoriesProducts();
            });
        }

        // Cargar productos de accesorios si estamos en esa categoría
        if (window.location.href.includes('category=accesorios')) {
            this.loadAccessoriesProducts();
        }
    }

    loadAccessoriesProducts() {
        const accessoriesProducts = [
            {
                id: 'acc-1',
                name: 'Gorra FashionHub',
                category: 'Accesorios',
                price: 29900,
                originalPrice: 39900,
                image: 'Imagenes_pagina_web/camiseta basica algodon hombre.png',
                description: 'Gorra ajustable con logo FashionHub, perfecta para el día a día.',
                sizes: ['Única'],
                colors: ['Negro', 'Azul', 'Rojo', 'Verde'],
                inStock: true,
                rating: 4.4,
                reviews: 156
            },
            {
                id: 'acc-2',
                name: 'Mochila Casual',
                category: 'Accesorios',
                price: 79900,
                originalPrice: 99900,
                image: 'Imagenes_pagina_web/chaqueta de cuero sintético mujer.webp',
                description: 'Mochila espaciosa y resistente, ideal para el día a día.',
                sizes: ['Única'],
                colors: ['Negro', 'Azul', 'Gris'],
                inStock: true,
                rating: 4.7,
                reviews: 89
            }
        ];

        this.renderProductsSection(accessoriesProducts, '🕶️ Accesorios');
    }

    renderProductsSection(products, sectionTitle) {
        const productsContainer = document.querySelector('.products-grid, .featured-products');
        if (!productsContainer) return;

        // Limpiar contenedor existente
        productsContainer.innerHTML = '';

        // Crear título de sección
        const sectionHeader = document.createElement('div');
        sectionHeader.className = 'section-header';
        sectionHeader.innerHTML = `
            <h2 class="section-title">${sectionTitle}</h2>
            <p class="section-subtitle">Descubre nuestra colección exclusiva</p>
        `;
        productsContainer.parentNode.insertBefore(sectionHeader, productsContainer);

        // Renderizar productos
        products.forEach(product => {
            const productCard = this.createProductCard(product);
            productsContainer.appendChild(productCard);
        });

        this.showNotification(`✅ ${sectionTitle} cargada`, 'success');
    }

    createProductCard(product) {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.dataset.id = product.id;

        const discount = product.originalPrice ? 
            Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

        card.innerHTML = `
            ${discount > 0 ? `<span class="product-badge badge-sale">${discount}% OFF</span>` : ''}
            <button class="product-wishlist" aria-label="Añadir a favoritos">
                <i class="far fa-heart"></i>
            </button>
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" 
                     onerror="this.src='Imagenes_pagina_web/default-product.jpg'">
                <div class="product-overlay">
                    <button class="quick-view-btn">Vista Rápida</button>
                </div>
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <a href="producto.html" class="product-name">${product.name}</a>
                <p class="product-description">${product.description}</p>
                <div class="product-price">
                    <span class="current-price">${this.formatPrice(product.price)}</span>
                    ${product.originalPrice ? `
                        <span class="original-price">${this.formatPrice(product.originalPrice)}</span>
                        <span class="discount">${discount}% OFF</span>
                    ` : ''}
                </div>
                <div class="product-rating">
                    <div class="stars">
                        ${this.generateStarRating(product.rating)}
                    </div>
                    <span class="rating-count">(${product.reviews})</span>
                </div>
                <span class="product-status ${product.inStock ? 'status-instock' : 'status-outstock'}">
                    ${product.inStock ? '✅ En stock' : '❌ Agotado'}
                </span>
                <div class="product-actions">
                    <a href="producto.html" class="btn btn-primary">👀 Ver Detalles</a>
                    <button class="btn btn-secondary add-btn" ${!product.inStock ? 'disabled' : ''}>
                        ${product.inStock ? '🛒 Añadir al Carrito' : '😞 Agotado'}
                    </button>
                </div>
            </div>
        `;

        return card;
    }

    generateStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;

        for (let i = 1; i <= 5; i++) {
            if (i <= fullStars) {
                stars += '<i class="fas fa-star"></i>';
            } else if (i === fullStars + 1 && hasHalfStar) {
                stars += '<i class="fas fa-star-half-alt"></i>';
            } else {
                stars += '<i class="far fa-star"></i>';
            }
        }

        return stars;
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.fashionHub = new FashionHub();
    
    // Asegurar que todos los botones tengan funcionalidad básica
    document.querySelectorAll('button').forEach(button => {
        if (!button.hasAttribute('data-initialized')) {
            button.setAttribute('data-initialized', 'true');
            if (!button.onclick && button.type !== 'submit' && !button.classList.contains('add-btn')) {
                button.addEventListener('click', (e) => {
                    if (!e.defaultPrevented && button.id !== 'submitOrder') {
                        window.fashionHub.showNotification(`🔘 ${button.textContent || button.className}`, 'info');
                    }
                });
            }
        }
    });

    // Inicializar secciones de niños y accesorios
    window.fashionHub.initKidsAndAccessories();
});

// Service Worker para funcionalidad offline (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration);
            })
            .catch(error => {
                console.log('❌ Error registrando Service Worker:', error);
            });
    });
}