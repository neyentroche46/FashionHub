// script.js - JAVASCRIPT COMPLETO PARA TODOS LOS BOTONES DE FASHIONHUB

class FashionHub {
    constructor() {
        this.cartItems = JSON.parse(localStorage.getItem('cartItems')) || [];
        this.wishlistItems = JSON.parse(localStorage.getItem('wishlistItems')) || [];
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
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
    }

    // NAVEGACIÓN Y ENLACES
    initNavigation() {
        // Prevenir comportamiento por defecto de enlaces vacíos
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a');
            if (link && link.getAttribute('href') === '#') {
                e.preventDefault();
                this.showNotification('Enlace en desarrollo', 'info');
            }
        });

        // Navegación entre páginas
        const navLinks = document.querySelectorAll('.nav-links a, .footer-links a, .category-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.getAttribute('href') && !link.getAttribute('href').startsWith('#')) {
                    // Permitir navegación normal
                    return true;
                }
            });
        });

        // Botones de volver al inicio
        const backButtons = document.querySelectorAll('.back-home-btn, .back-btn');
        backButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                window.location.href = 'index.html';
            });
        });

        // Botones de ver detalles
        const detailButtons = document.querySelectorAll('.btn-primary, .view-details-btn');
        detailButtons.forEach(btn => {
            if (btn.getAttribute('href') === 'producto.html') {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    // Simular navegación a página de producto
                    this.showNotification('Redirigiendo a detalles del producto...', 'info');
                    setTimeout(() => {
                        window.location.href = 'producto.html';
                    }, 1000);
                });
            }
        });
    }

    // HEADER Y MENÚ RESPONSIVE
    initHeader() {
        const header = document.getElementById('mainHeader');
        if (header) {
            window.addEventListener('scroll', () => {
                if (window.scrollY > 50) {
                    header.classList.add('header-scrolled');
                } else {
                    header.classList.remove('header-scrolled');
                }
            });
        }
    }

    initResponsiveMenu() {
        // Crear botón de menú móvil si no existe
        if (window.innerWidth <= 768 && !document.querySelector('.mobile-menu-btn')) {
            const nav = document.querySelector('nav');
            const mobileBtn = document.createElement('button');
            mobileBtn.className = 'mobile-menu-btn';
            mobileBtn.innerHTML = '<i class="fas fa-bars"></i>';
            mobileBtn.setAttribute('aria-label', 'Abrir menú de navegación');
            
            nav.insertBefore(mobileBtn, nav.firstChild);
            
            mobileBtn.addEventListener('click', () => {
                const navLinks = document.querySelector('.nav-links');
                navLinks.classList.toggle('mobile-open');
                mobileBtn.innerHTML = navLinks.classList.contains('mobile-open') ? 
                    '<i class="fas fa-times"></i>' : '<i class="fas fa-bars"></i>';
            });
        }
    }

    // SISTEMA DE CARRITO MEJORADO
    initCart() {
        this.updateCartCount();
        
        // Añadir productos al carrito
        const addToCartButtons = document.querySelectorAll('.add-btn, .add-to-cart-btn, .action-btn.add-btn');
        addToCartButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                if (button.disabled) {
                    this.showNotification('Producto agotado', 'error');
                    return;
                }
                this.addToCart(button);
            });
        });

        // Control de cantidad en el carrito
        const quantityControls = document.querySelectorAll('.quantity-controls, .item-quantity');
        quantityControls.forEach(control => {
            const minusBtn = control.querySelector('.quantity-btn:first-child');
            const plusBtn = control.querySelector('.quantity-btn:last-child');
            const input = control.querySelector('.quantity-input');

            if (minusBtn && plusBtn && input) {
                minusBtn.addEventListener('click', () => {
                    let value = parseInt(input.value);
                    if (value > 1) {
                        input.value = value - 1;
                        this.updateCartPrices();
                    }
                });

                plusBtn.addEventListener('click', () => {
                    let value = parseInt(input.value);
                    input.value = value + 1;
                    this.updateCartPrices();
                });

                input.addEventListener('change', () => {
                    let value = parseInt(input.value);
                    if (isNaN(value) || value < 1) {
                        input.value = 1;
                    }
                    this.updateCartPrices();
                });
            }
        });

        // Botón comprar ahora
        const buyNowButtons = document.querySelectorAll('.buy-now-btn');
        buyNowButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.buyNow(button);
            });
        });

        // Icono del carrito en el header
        const cartIcon = document.querySelector('.nav-icons a[aria-label*="carrito"]');
        if (cartIcon) {
            cartIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.showCartModal();
            });
        }
    }

    addToCart(button) {
        const productCard = button.closest('[data-id]');
        if (!productCard) return;

        const productId = productCard.dataset.id;
        const productName = productCard.querySelector('.product-name, .item-name, .product-title')?.textContent || 'Producto';
        const priceElement = productCard.querySelector('.current-price, .item-price, .product-price');
        const price = priceElement ? this.parsePrice(priceElement.textContent) : 0;
        
        const existingItem = this.cartItems.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.cartItems.push({
                id: productId,
                name: productName,
                price: price,
                quantity: 1,
                image: productCard.querySelector('.product-img, .item-image, .product-image')?.innerHTML || '<i class="fas fa-tshirt"></i>',
                variant: this.getProductVariant(productCard)
            });
        }

        this.saveCart();
        this.showNotification(`✓ ${productName} añadido al carrito`, 'success');
    }

    showCartModal() {
        if (this.cartItems.length === 0) {
            this.showNotification('Tu carrito está vacío', 'info');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Tu Carrito de Compras</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    ${this.cartItems.map(item => `
                        <div class="cart-item">
                            <div class="cart-item-image">${item.image}</div>
                            <div class="cart-item-details">
                                <h4>${item.name}</h4>
                                <p>${item.variant}</p>
                                <div class="cart-item-price">${this.formatPrice(item.price)} x ${item.quantity}</div>
                            </div>
                            <button class="remove-from-cart" data-id="${item.id}">&times;</button>
                        </div>
                    `).join('')}
                </div>
                <div class="modal-footer">
                    <div class="cart-total">
                        Total: ${this.formatPrice(this.cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                    </div>
                    <div class="cart-actions">
                        <button class="btn btn-outline" id="continueShopping">Seguir Comprando</button>
                        <button class="btn btn-primary" id="goToCheckout">Finalizar Compra</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        // Event listeners del modal del carrito
        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('#continueShopping').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('#goToCheckout').addEventListener('click', () => {
            window.location.href = 'comprar.html';
        });

        // Eliminar items del carrito
        modal.querySelectorAll('.remove-from-cart').forEach(btn => {
            btn.addEventListener('click', () => {
                const itemId = btn.dataset.id;
                this.removeFromCart(itemId);
                this.closeModal(modal);
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    }

    removeFromCart(itemId) {
        this.cartItems = this.cartItems.filter(item => item.id !== itemId);
        this.saveCart();
        this.showNotification('Producto eliminado del carrito', 'success');
    }

    // SISTEMA DE FAVORITOS MEJORADO
    initWishlist() {
        const wishlistButtons = document.querySelectorAll('.product-wishlist, .wishlist-btn');
        
        wishlistButtons.forEach(button => {
            const productCard = button.closest('[data-id]');
            if (productCard) {
                const productId = productCard.dataset.id;
                
                if (this.wishlistItems.includes(productId)) {
                    button.classList.add('active');
                    const icon = button.querySelector('i');
                    if (icon) icon.className = 'fas fa-heart';
                }

                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.toggleWishlist(button, productId);
                });
            }
        });

        // Icono de favoritos en el header
        const wishlistIcon = document.querySelector('.nav-icons a[aria-label*="cuenta"]');
        if (wishlistIcon) {
            wishlistIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.showWishlistModal();
            });
        }
    }

    showWishlistModal() {
        if (this.wishlistItems.length === 0) {
            this.showNotification('No tienes productos en favoritos', 'info');
            return;
        }

        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Tus Favoritos</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <p>Tienes ${this.wishlistItems.length} productos en tu lista de favoritos.</p>
                    <button class="btn btn-primary" id="viewWishlist">Ver Mis Favoritos</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('#viewWishlist').addEventListener('click', () => {
            this.showNotification('Página de favoritos en desarrollo', 'info');
            this.closeModal(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    }

    // SISTEMA DE BÚSQUEDA
    initSearch() {
        const searchIcon = document.querySelector('.nav-icons a[aria-label*="Buscar"]');
        if (searchIcon) {
            searchIcon.addEventListener('click', (e) => {
                e.preventDefault();
                this.showSearchModal();
            });
        }
    }

    showSearchModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Buscar Productos</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="search-form">
                        <input type="text" id="searchInput" placeholder="¿Qué estás buscando?" class="form-input">
                        <button class="btn btn-primary" id="performSearch">
                            <i class="fas fa-search"></i> Buscar
                        </button>
                    </div>
                    <div class="search-suggestions">
                        <h4>Sugerencias populares:</h4>
                        <div class="suggestion-tags">
                            <span class="suggestion-tag">Camisetas</span>
                            <span class="suggestion-tag">Jeans</span>
                            <span class="suggestion-tag">Zapatos</span>
                            <span class="suggestion-tag">Accesorios</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        const searchInput = modal.querySelector('#searchInput');
        searchInput.focus();

        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('#performSearch').addEventListener('click', () => {
            const query = searchInput.value.trim();
            if (query) {
                this.performSearch(query);
                this.closeModal(modal);
            } else {
                this.showNotification('Por favor, ingresa un término de búsqueda', 'warning');
            }
        });

        // Búsqueda al presionar Enter
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                modal.querySelector('#performSearch').click();
            }
        });

        // Sugerencias clickeables
        modal.querySelectorAll('.suggestion-tag').forEach(tag => {
            tag.addEventListener('click', () => {
                searchInput.value = tag.textContent;
                modal.querySelector('#performSearch').click();
            });
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    }

    performSearch(query) {
        this.showNotification(`Buscando: "${query}"`, 'info');
        // Simular búsqueda
        setTimeout(() => {
            this.showNotification(`Se encontraron productos para "${query}"`, 'success');
        }, 1500);
    }

    // SISTEMA DE USUARIO Y CUENTA
    initUserAccount() {
        const userIcon = document.querySelector('.nav-icons a[aria-label*="cuenta"], .nav-icons a[aria-label*="sesión"]');
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
    }

    showLoginModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Iniciar Sesión</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <form class="login-form">
                        <div class="form-group">
                            <label for="loginEmail">Email</label>
                            <input type="email" id="loginEmail" class="form-input" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Contraseña</label>
                            <input type="password" id="loginPassword" class="form-input" required>
                        </div>
                        <button type="submit" class="btn btn-primary btn-block">Iniciar Sesión</button>
                    </form>
                    <div class="login-options">
                        <p>¿No tienes cuenta? <a href="#" class="register-link">Regístrate aquí</a></p>
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

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    }

    handleLogin(form) {
        const email = form.querySelector('#loginEmail').value;
        const password = form.querySelector('#loginPassword').value;
        
        // Simular login
        this.currentUser = {
            name: 'Usuario Demo',
            email: email
        };
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        this.showNotification(`¡Bienvenido ${this.currentUser.name}!`, 'success');
        this.closeAllModals();
    }

    showUserModal() {
        const modal = document.createElement('div');
        modal.className = 'modal active';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Mi Cuenta</h3>
                    <button class="close-modal">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="user-info">
                        <h4>¡Hola, ${this.currentUser.name}!</h4>
                        <p>${this.currentUser.email}</p>
                    </div>
                    <div class="user-actions">
                        <button class="user-action-btn">
                            <i class="fas fa-shopping-bag"></i> Mis Pedidos
                        </button>
                        <button class="user-action-btn">
                            <i class="fas fa-heart"></i> Mis Favoritos
                        </button>
                        <button class="user-action-btn">
                            <i class="fas fa-cog"></i> Configuración
                        </button>
                        <button class="user-action-btn logout-btn">
                            <i class="fas fa-sign-out-alt"></i> Cerrar Sesión
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';

        modal.querySelector('.close-modal').addEventListener('click', () => this.closeModal(modal));
        modal.querySelector('.logout-btn').addEventListener('click', () => {
            this.currentUser = null;
            localStorage.removeItem('currentUser');
            this.showNotification('Sesión cerrada correctamente', 'success');
            this.closeModal(modal);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal(modal);
        });
    }

    // SISTEMA DE MODALES
    initModalSystem() {
        // Cerrar modales con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    closeModal(modal) {
        modal.classList.remove('active');
        setTimeout(() => {
            if (modal.parentNode) {
                modal.parentNode.removeChild(modal);
            }
            document.body.style.overflow = 'auto';
        }, 300);
    }

    closeAllModals() {
        document.querySelectorAll('.modal.active').forEach(modal => {
            this.closeModal(modal);
        });
    }

    // FILTROS MEJORADOS
    initFilters() {
        const filterSelects = document.querySelectorAll('select');
        filterSelects.forEach(select => {
            select.addEventListener('change', () => {
                this.applyFilters();
            });
        });

        const clearFiltersBtn = document.querySelector('.clear-filters');
        if (clearFiltersBtn) {
            clearFiltersBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearFilters();
            });
        }

        const filterTags = document.querySelectorAll('.filter-tag i');
        filterTags.forEach(tag => {
            tag.addEventListener('click', () => {
                this.removeFilterTag(tag);
            });
        });

        // Botones de vista (tabla/cajas)
        const viewToggle = document.querySelectorAll('.view-toggle a');
        viewToggle.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                if (!btn.classList.contains('active')) {
                    viewToggle.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    this.showNotification('Vista cambiada', 'info');
                }
            });
        });
    }

    // INTERACCIONES DE PRODUCTOS MEJORADAS
    initProductInteractions() {
        // Vista rápida
        const quickViewButtons = document.querySelectorAll('.quick-view-btn');
        quickViewButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.showQuickView(button);
            });
        });

        // Selectores de variantes
        const variantOptions = document.querySelectorAll('.variant-option:not(.disabled)');
        variantOptions.forEach(option => {
            option.addEventListener('click', () => {
                this.selectVariant(option);
            });
        });

        // Tabs de productos
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.getAttribute('data-tab');
                this.switchTab(tabId, btn);
            });
        });

        // Galería de imágenes
        this.initProductGallery();

        // Ordenamiento de tabla
        this.initTableSorting();

        // Paginación
        this.initPagination();

        // Botones de acción en tabla
        const actionButtons = document.querySelectorAll('.action-btn');
        actionButtons.forEach(btn => {
            if (btn.classList.contains('view-btn')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.location.href = 'producto.html';
                });
            }
        });
    }

    initPagination() {
        const paginationItems = document.querySelectorAll('.pagination-item:not(.pagination-dots)');
        paginationItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.preventDefault();
                if (!item.classList.contains('active')) {
                    paginationItems.forEach(i => i.classList.remove('active'));
                    item.classList.add('active');
                    this.showNotification('Cambiando de página...', 'info');
                }
            });
        });
    }

    // CHECKOUT MEJORADO
    initCheckout() {
        // Métodos de pago
        const paymentMethods = document.querySelectorAll('.payment-method');
        paymentMethods.forEach(method => {
            method.addEventListener('click', () => {
                this.selectPaymentMethod(method);
            });
        });

        // Métodos de envío
        const shippingMethods = document.querySelectorAll('.shipping-method');
        shippingMethods.forEach(method => {
            method.addEventListener('click', () => {
                this.selectShippingMethod(method);
            });
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

    initCheckoutProgress() {
        const progressSteps = document.querySelectorAll('.progress-step');
        progressSteps.forEach(step => {
            step.addEventListener('click', () => {
                if (step.classList.contains('completed')) {
                    this.showNotification('Paso completado', 'info');
                }
            });
        });
    }

    // ANIMACIONES MEJORADAS
    initAnimations() {
        const animateOnScroll = () => {
            const elements = document.querySelectorAll('.category-card, .product-card, .feature-card, .product-box, .hero-content');
            
            elements.forEach(element => {
                const elementPosition = element.getBoundingClientRect().top;
                const screenPosition = window.innerHeight / 1.3;
                
                if (elementPosition < screenPosition) {
                    element.style.opacity = '1';
                    element.style.transform = 'translateY(0)';
                }
            });
        };

        const animatedElements = document.querySelectorAll('.category-card, .product-card, .feature-card, .product-box, .hero-content');
        animatedElements.forEach(element => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(30px)';
            element.style.transition = 'all 0.6s ease';
        });

        window.addEventListener('scroll', animateOnScroll);
        animateOnScroll();

        // Efectos hover en botones
        const buttons = document.querySelectorAll('.btn, .action-btn, .product-wishlist');
        buttons.forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                btn.style.transform = 'translateY(-2px)';
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = 'translateY(0)';
            });
        });
    }

    // SISTEMA DE NOTIFICACIONES MEJORADO
    initNotifications() {
        // Ya está implementado en showNotification
    }

    showNotification(message, type = 'success') {
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
            notification.style.transform = 'translateX(0)';
            notification.style.opacity = '1';
        }, 10);

        const closeBtn = notification.querySelector('.close-notification');
        closeBtn.addEventListener('click', () => {
            notification.remove();
        });

        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                notification.style.opacity = '0';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 5000);
    }

    // VALIDACIONES DE FORMULARIOS MEJORADAS
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
                input.classList.remove('error');
                input.classList.add('validating');
            });
        });

        // Formulario de contacto en footer
        const contactLinks = document.querySelectorAll('a[href^="mailto"], a[href^="tel"]');
        contactLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.showNotification('Redirigiendo a aplicación externa', 'info');
                setTimeout(() => {
                    window.open(link.getAttribute('href'), '_blank');
                }, 1000);
            });
        });
    }

    // FUNCIONES DE EXPORTACIÓN E IMPRESIÓN
    initExportFunctions() {
        const exportCSVBtn = document.querySelector('.export-btn .fa-file-export')?.closest('.export-btn');
        const printBtn = document.querySelector('.export-btn .fa-print')?.closest('.export-btn');
        
        if (exportCSVBtn) {
            exportCSVBtn.addEventListener('click', () => {
                this.exportToCSV();
            });
        }
        
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                this.printPage();
            });
        }
    }

    // REDES SOCIALES
    initSocialMedia() {
        const socialIcons = document.querySelectorAll('.social-icons a');
        socialIcons.forEach(icon => {
            icon.addEventListener('click', (e) => {
                e.preventDefault();
                const platform = icon.querySelector('i').className.split('-')[1];
                this.showNotification(`Redirigiendo a ${platform}`, 'info');
            });
        });
    }

    // MÉTODOS AUXILIARES (sin cambios)
    updateCartCount() {
        const cartCount = document.querySelector('.cart-count');
        if (cartCount) {
            const totalItems = this.cartItems.reduce((sum, item) => sum + item.quantity, 0);
            cartCount.textContent = totalItems;
        }
    }

    parsePrice(priceString) {
        return parseInt(priceString.replace(/[^\d]/g, '')) || 0;
    }

    formatPrice(price) {
        return `$${price.toLocaleString()}`;
    }

    generateId() {
        return 'prod_' + Math.random().toString(36).substr(2, 9);
    }

    // ... (otros métodos auxiliares sin cambios)
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.fashionHub = new FashionHub();
    
    // Asegurar que todos los botones tengan funcionalidad
    document.querySelectorAll('button').forEach(button => {
        if (!button.hasAttribute('data-initialized')) {
            button.setAttribute('data-initialized', 'true');
            if (!button.onclick && button.type !== 'submit') {
                button.addEventListener('click', (e) => {
                    if (!e.defaultPrevented && button.id !== 'submitOrder') {
                        window.fashionHub.showNotification(`Función: ${button.textContent || button.className}`, 'info');
                    }
                });
            }
        }
    });
});

// Estilos CSS adicionales para los nuevos modales
const additionalStyles = `
    .modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .modal.active {
        opacity: 1;
        visibility: visible;
    }
    
    .modal-content {
        background: white;
        border-radius: 16px;
        padding: 0;
        max-width: 500px;
        width: 90%;
        max-height: 80vh;
        overflow: hidden;
        transform: translateY(-50px);
        transition: transform 0.3s ease;
    }
    
    .modal.active .modal-content {
        transform: translateY(0);
    }
    
    .modal-header {
        padding: 20px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .modal-body {
        padding: 20px;
        max-height: 60vh;
        overflow-y: auto;
    }
    
    .modal-footer {
        padding: 20px;
        border-top: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    
    .close-modal {
        background: none;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: #666;
    }
    
    .cart-item {
        display: flex;
        align-items: center;
        padding: 15px 0;
        border-bottom: 1px solid #eee;
    }
    
    .cart-item-image {
        width: 60px;
        height: 60px;
        background: #f5f5f5;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
    }
    
    .cart-item-details {
        flex: 1;
    }
    
    .remove-from-cart {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #ff4444;
    }
    
    .search-form {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
    }
    
    .search-suggestions h4 {
        margin-bottom: 10px;
        color: #666;
    }
    
    .suggestion-tags {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
    }
    
    .suggestion-tag {
        background: #f0f0f0;
        padding: 8px 15px;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .suggestion-tag:hover {
        background: #6a11cb;
        color: white;
    }
    
    .user-actions {
        display: flex;
        flex-direction: column;
        gap: 10px;
    }
    
    .user-action-btn {
        background: none;
        border: 1px solid #ddd;
        padding: 15px;
        border-radius: 8px;
        cursor: pointer;
        text-align: left;
        transition: all 0.3s ease;
    }
    
    .user-action-btn:hover {
        background: #f5f5f5;
    }
    
    .logout-btn {
        color: #ff4444;
        border-color: #ff4444;
    }
    
    .mobile-menu-btn {
        display: none;
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
    }
    
    @media (max-width: 768px) {
        .mobile-menu-btn {
            display: block;
        }
        
        .nav-links {
            display: none;
            position: absolute;
            top: 100%;
            left: 0;
            right: 0;
            background: white;
            flex-direction: column;
            padding: 20px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
        }
        
        .nav-links.mobile-open {
            display: flex;
        }
        
        .nav-links a {
            color: #333;
            padding: 10px 0;
        }
    }
`;

// Inyectar estilos adicionales
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);