
        // База данных товаров
let categories;
let products;
        // Удалите статические данные и добавьте функцию загрузки
async function loadProductsAndCategories() {
    try {
        const response = await fetch('api/products.php');
        if (!response.ok) throw new Error('Network response was not ok');
        
        const data = await response.json();
        categories = data.categories;
        products = data.products;
        
        // Инициализируйте страницу после загрузки данных
        if (typeof initPage === 'function') {
            initPage();
        }
    } catch (error) {
        console.error('Error loading products:', error);
        // Можно показать сообщение об ошибке пользователю
    }
}


        
        // Корзина
        let cart = JSON.parse(localStorage.getItem('cart')) || [];
        
        // Обновление счетчика корзины
        function updateCartCount() {
            const count = cart.reduce((total, item) => total + item.quantity, 0);
            document.getElementById('cart-count').textContent = count;
            localStorage.setItem('cart', JSON.stringify(cart));
        }
        
        // Открытие корзины
        function openCart() {
            const modal = document.getElementById('cart-modal');
            modal.style.display = 'block';
            renderCart();
        }
        
        // Закрытие корзины
        function closeCart() {
            const modal = document.getElementById('cart-modal');
            modal.style.display = 'none';
        }
        
        // Оформление заказа
        function checkout() {
            if (cart.length === 0) {
                alert('Корзина пуста!');
                return;
            }
            alert('Заказ оформлен! Спасибо за покупку!');
            cart = [];
            updateCartCount();
            renderCart();
            closeCart();
        }
        
        // Рендер корзины
        function renderCart() {
            const cartItems = document.getElementById('cart-items');
            cartItems.innerHTML = '';
            
            let total = 0;
            
            cart.forEach(item => {
                const product = getAllProducts().find(p => p.id === item.id);
                if (product) {
                    const row = document.createElement('tr');
                    const sum = product.price * item.quantity;
                    total += sum;
                    
                    row.innerHTML = `
                        <td>
                            <img src="${product.image}" alt="${product.name}" style="width:50px; margin-right:10px;">
                            ${product.name}
                        </td>
                        <td>${product.price} ₽</td>
                        <td>
                            <button class="quantity-btn" onclick="changeQuantity(${item.id}, -1)">-</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="changeQuantity(${item.id}, 1)">+</button>
                        </td>
                        <td>${sum} ₽</td>
                        <td><span class="remove-item" onclick="removeFromCart(${item.id})">✕</span></td>
                    `;
                    cartItems.appendChild(row);
                }
            });
            
            document.getElementById('cart-total').textContent = total;
        }
        
        // Изменение количества товара в корзине
        function changeQuantity(productId, delta) {
            const index = cart.findIndex(item => item.id === productId);
            if (index !== -1) {
                cart[index].quantity += delta;
                
                if (cart[index].quantity <= 0) {
                    cart.splice(index, 1);
                }
                
                updateCartCount();
                renderCart();
            }
        }
        
        // Удаление товара из корзины
        function removeFromCart(productId) {
            cart = cart.filter(item => item.id !== productId);
            updateCartCount();
            renderCart();
        }
        
        // Добавление товара в корзину
        function addToCart(productId, quantity = 1) {
            const existingItem = cart.find(item => item.id === productId);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                cart.push({ id: productId, quantity });
            }
            
            updateCartCount();
            openCart();
        }
        
        // Получение всех товаров
        function getAllProducts() {
            return Object.values(products).flat();
        }
        
        // Получение товара по ID
        function getProductById(id) {
            return getAllProducts().find(product => id);
        }
        
        // Навигация по страницам
        function navigate(page, categoryId = null, productId = null) {
            let content = '';
            if (!products || !categories) {
        console.error('Данные не загружены');
        showError('Данные каталога не загружены. Пожалуйста, обновите страницу.');
        return;
    }
            
            switch(page) {
                case 'index':
                    content = `
                        <section class="banner">
                            <h1>Добро пожаловать в PililShop!</h1>
                            <p>Лучшие товары по самым выгодным ценам</p>
                            <button class="btn" onclick="navigate('catalog')">Перейти в каталог</button>
                        </section>
                        
                        <section class="categories">
                            ${categories.map(cat => `
                                <div class="category" onclick="navigate('category', '${cat.id}')">
                                    <img src="${cat.image}" alt="${cat.name}">
                                    <h3>${cat.name}</h3>
                                </div>
                            `).join('')}
                        </section>
                        
                        <h2>Популярные товары</h2>
                        <section class="products">
                            ${getAllProducts().slice(0, 8).map(product => `
                                <div class="product">
                                    <div class="product-image">
                                        <img src="${product.image}" alt="${product.name}">
                                    </div>
                                    <div class="product-info">
                                        <h3 class="product-title">${product.name}</h3>
                                        <div class="product-price">${product.price.toLocaleString()} ₽</div>
                                        <button class="btn" style="width:100%; margin-top:10px;" onclick="navigate('product', null, ${product.id})">Подробнее</button>
                                    </div>
                                </div>
                            `).join('')}
                        </section>
                    `;
                    break;
                    
                case 'catalog':
    content = `
        <h1>Каталог товаров</h1>
        <section class="categories" style="margin-top:30px;">
            ${categories.map(cat => {
                const productsCount = products[cat.id]?.length || 0; // Защита от undefined
                return `
                    <div class="category" onclick="navigate('category', '${cat.id}')">
                        <img src="${cat.image}" alt="${cat.name}">
                        <h3>${cat.name}</h3>
                        <p>${productsCount} товаров</p>
                    </div>
                `;
            }).join('')}
        </section>
    `;
    break;
                    
                case 'category':
                    const category = categories.find(c => c.id === categoryId);
                    const categoryProducts = products[categoryId] || [];
                    
                    content = `
                        <a href="#" class="back-btn" onclick="navigate('catalog')">← Назад в каталог</a>
                        <h1 class="category-title">${category.name}</h1>
                        <section class="products">
                            ${categoryProducts.map(product => `
                                <div class="product">
                                    <div class="product-image">
                                        <img src="${product.image}" alt="${product.name}">
                                    </div>
                                    <div class="product-info">
                                        <h3 class="product-title">${product.name}</h3>
                                        <div class="product-price">${product.price.toLocaleString()} ₽</div>
                                        <button class="btn" style="width:100%; margin-top:10px;" onclick="navigate('product', null, ${product.id})">Подробнее</button>
                                    </div>
                                </div>
                            `).join('')}
                        </section>
                    `;
                    break;
                    
                case 'product':
                    const product = getProductById(productId);
                    const categoryName = "eblast"
                    const img2 = (product.image2 === null || product.image2 === undefined) ? 'null.png' : product.image2;
                    const img3 = (product.image3 === null || product.image3 === undefined) ? 'null.png' : product.image3;
                    console.log(product)
                    
                    content = `
                        <a href="#" class="back-btn" onclick="navigate('category', '${product.category}')">← Назад в ${categoryName}</a>
                        <div class="product-page">
                            <div class="product-gallery">
                                <div class="main-image">
                                    <img src="${product.image}" alt="${product.name}" id="main-product-image">
                                </div>
                                <div class="thumbnails">
                                    <div class="thumbnail active" onclick="changeProductImage('${product.image}')">
                                        <img src="${product.image}" alt="Изображение 1">
                                    </div>
                                    <div class="thumbnail" onclick="changeProductImage('${img2}')">
                                        <img src="${img2}" alt="Изображение 2">
                                    </div>
                                    <div class="thumbnail" onclick="changeProductImage('${img3}')">
                                        <img src="${img3}" alt="Изображение 3">
                                    </div>
                                </div>
                            </div>
                            <div class="product-details">
                                <h1 class="product-name">${product.name}</h1>
                                <div class="product-price-large">${product.price.toLocaleString()} ₽</div>
                                <div class="product-description">
                                    <p>${product.description}</p>
                                    
                                </div>
                                <div class="product-actions">
                                    <div class="quantity-selector">
                                        <button onclick="changeProductQuantity(-1)">-</button>
                                        <input type="number" value="1" min="1" id="product-quantity">
                                        <button onclick="changeProductQuantity(1)">+</button>
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    `;
                    break;
                    
                case 'about':
                    content = `
                        <h1>О нас</h1>
                        <div style="background-color:white; padding:20px; border-radius:5px; margin-top:20px;">
                            <p>PililShop - это современный интернет-магазин, который предлагает широкий ассортимент товаров по доступным ценам.</p>
                            <p>Мы работаем с 2025 года </p>
                        </div>
                    `;
                    break;
                    
                case 'contacts':
                    content = `
                        <h1>Контакты</h1>
                        <div style="background-color:white; padding:20px; border-radius:5px; margin-top:20px;">
                            <h3>Наши контактные данные</h3>

                            <p><strong>Email:</strong> PililShop@Pililmail</p>

                        </div>
                    `;
                    break;
                    
                case 'delivery':
                    content = `
                        <h1>Доставка и оплата</h1>
                        <div style="background-color:white; padding:20px; border-radius:5px; margin-top:20px;">
                            <h3>Покупка происходит в лс телеграмме у продавца!</h3>
                            
                        </div>
                    `;
                    break;
                    
                case 'returns':
                    content = `
                        <h1>Возврат и обмен</h1>
                        <div style="background-color:white; padding:20px; border-radius:5px; margin-top:20px;">
                            пук
                        </div>
                    `;
                    break;
                    
                case 'privacy':
                    content = `
                        ПОШЩАВРПЩВАРПЩОВРАПДОЩР
                    `;
                    break;
                    
                default:
                    content = '<h1>Страница не найдена</h1>';
            }
            
            document.getElementById('content').innerHTML = content;
            window.scrollTo(0, 0);
        }
        
        // Функции для страницы товара
        function changeProductImage(src) {
            document.getElementById('main-product-image').src = src;
            const thumbnails = document.querySelectorAll('.thumbnail');
            thumbnails.forEach(thumb => thumb.classList.remove('active'));
            event.target.closest('.thumbnail').classList.add('active');
        }
        
        function changeProductQuantity(delta) {
            const input = document.getElementById('product-quantity');
            let value = parseInt(input.value) + delta;
            if (value < 1) value = 1;
            input.value = value;
        }
        
        function addProductToCart(productId) {
            const quantity = parseInt(document.getElementById('product-quantity').value);
            addToCart(productId, quantity);
        }
        
        // Поиск товаров
        document.getElementById('search-input').addEventListener('keyup', function(e) {
            if (e.key === 'Enter') {
                const query = this.value.toLowerCase();
                if (query.trim() === '') return;
                
                const results = getAllProducts().filter(product => 
                    product.name.toLowerCase().includes(query) || 
                    product.description.toLowerCase().includes(query)
                );
                
                let content = `
                    <h1>Результаты поиска: "${query}"</h1>
                    <p>Найдено товаров: ${results.length}</p>
                `;
                
                if (results.length > 0) {
                    content += `
                        <section class="products" style="margin-top:20px;">
                            ${results.map(product => `
                                <div class="product">
                                    <div class="product-image">
                                        <img src="${product.image}" alt="${product.name}">
                                    </div>
                                    <div class="product-info">
                                        <h3 class="product-title">${product.name}</h3>
                                        <div class="product-price">${product.price.toLocaleString()} ₽</div>
            
                                        <button class="btn" style="width:100%; margin-top:10px;" onclick="navigate('product', null, ${product.id})">Подробнее</button>
                                    </div>
                                </div>
                            `).join('')}
                        </section>
                    `;
                } else {
                    content += `
                        <div style="background-color:white; padding:20px; border-radius:5px; margin-top:20px;">
                            <p>К сожалению, по вашему запросу ничего не найдено.</p>
                            <button class="btn" onclick="navigate('catalog')">Перейти в каталог</button>
                        </div>
                    `;
                }
                
                document.getElementById('content').innerHTML = content;
                window.scrollTo(0, 0);
            }
        });
        
        // Инициализация - загрузка главной страницы
        document.addEventListener('DOMContentLoaded', function() {
              loadProductsAndCategories().then(() => {
        // После загрузки инициализируем остальное
        updateCartCount();
        navigate('index');
    });
            
            // Закрытие модального окна при клике вне его
            window.onclick = function(event) {
                const modal = document.getElementById('cart-modal');
                if (event.target == modal) {
                    closeCart();
                }
            }
        });
