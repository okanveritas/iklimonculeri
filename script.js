// --- A. VERİTABANI VE AYARLAR ---
const settings = {
    "factorRoad": 0.12, "factorShip": 36.5, "factorAir": 650, "factorTrain": 20,
    "carEquivalencyFactorGrams": 120, "tierLowThresholdGrams": 800, "tierMediumThresholdGrams": 5000
};

// Başlangıç veritabanı (DEĞİŞKEN OLARAK TANIMLANDI - let)
let productPairsData = [
     { "pairId": 1, "category": "Muz", "import": { "id": 1, "name": "İthal Muz", "originCountry": "Ekvador", "transportType": "ship", "distanceKm": 11500, "weightKg": 1.0, "emoji": "🍌", "transportEmoji": "🚢", "price": 45.90 }, "local": { "id": 2, "name": "Yerli Muz", "originCountry": "Anamur, TR", "transportType": "road", "distanceKm": 850, "weightKg": 1.0, "emoji": "🍌", "transportEmoji": "🚚", "price": 38.50 } },
     { "pairId": 2, "category": "Avokado", "import": { "id": 3, "name": "İthal Avokado", "originCountry": "Kenya", "transportType": "ship", "distanceKm": 7500, "weightKg": 1.0, "emoji": "🥑", "transportEmoji": "🚢", "price": 75.00 }, "local": { "id": 4, "name": "Yerli Avokado", "originCountry": "Antalya, TR", "transportType": "road", "distanceKm": 700, "weightKg": 1.0, "emoji": "🥑", "transportEmoji": "🚚", "price": 65.90 } },
     { "pairId": 3, "category": "Çilek", "import": { "id": 5, "name": "İthal Çilek", "originCountry": "İspanya", "transportType": "air", "distanceKm": 2700, "weightKg": 1.0, "emoji": "🍓", "transportEmoji": "✈️", "price": 120.00 }, "local": { "id": 6, "name": "Yerli Çilek", "originCountry": "Aydın, TR", "transportType": "road", "distanceKm": 600, "weightKg": 1.0, "emoji": "🍓", "transportEmoji": "🚚", "price": 55.50 } },
     { "pairId": 4, "category": "Elma", "import": { "id": 7, "name": "İthal Elma", "originCountry": "Fransa", "transportType": "road", "distanceKm": 2500, "weightKg": 1.0, "emoji": "🍏", "transportEmoji": "🚚", "price": 42.00 }, "local": { "id": 8, "name": "Yerli Elma", "originCountry": "Amasya, TR", "transportType": "road", "distanceKm": 650, "weightKg": 1.0, "emoji": "🍎", "transportEmoji": "🚚", "price": 28.90 } },
     { "pairId": 5, "category": "Domates", "import": { "id": 9, "name": "İthal Kokteyl Domates", "originCountry": "Hollanda", "transportType": "road", "distanceKm": 3000, "weightKg": 1.0, "emoji": "🍅", "transportEmoji": "🚚", "price": 95.00 }, "local": { "id": 10, "name": "Yerli Salkım Domates", "originCountry": "Antalya, TR", "transportType": "road", "distanceKm": 700, "weightKg": 1.0, "emoji": "🍅", "transportEmoji": "🚚", "price": 48.50 } },
     { "pairId": 6, "category": "Portakal", "import": { "id": 11, "name": "İthal Portakal", "originCountry": "G. Afrika", "transportType": "ship", "distanceKm": 13000, "weightKg": 1.0, "emoji": "🍊", "transportEmoji": "🚢", "price": 35.00 }, "local": { "id": 12, "name": "Yerli Portakal", "originCountry": "Mersin, TR", "transportType": "road", "distanceKm": 900, "weightKg": 1.0, "emoji": "🍊", "transportEmoji": "🚚", "price": 22.90 } },
     { "pairId": 7, "category": "Biber", "import": { "id": 13, "name": "İthal Kırmızı Biber", "originCountry": "İspanya", "transportType": "road", "distanceKm": 3500, "weightKg": 1.0, "emoji": "🌶️", "transportEmoji": "🚚", "price": 110.00 }, "local": { "id": 14, "name": "Yerli Kapya Biber", "originCountry": "Çanakkale, TR", "transportType": "road", "distanceKm": 320, "weightKg": 1.0, "emoji": "🌶️", "transportEmoji": "🚚", "price": 60.50 } }
];


// --- B. UYGULAMA MANTIĞI ---

const App = {
    state: {
        currentPage: 'all',
        products: [],
        pairedProducts: [],
        selectedProduct: null,
        cart: [],
        isAdminMode: false,
        adminPassword: 'admin'
    },

    // Başlatıcı Fonksiyon
    init() {
        this.processInitialData();
        this.attachNavListeners();
        this.attachModalCloseListeners();
        this.attachCartButtonListener();
        this.renderPage();
        this.updateCartBadge();
    },

    // Başlangıç verisini işler ve state'e atar
    processInitialData() {
         let allProducts = [];
         this.state.pairedProducts = productPairsData.map(pair => {
             const processedImport = this.calculateEmissionData(pair.import);
             const processedLocal = this.calculateEmissionData(pair.local);
             allProducts.push(processedImport);
             allProducts.push(processedLocal);
             return {
                 pairId: pair.pairId,
                 category: pair.category,
                 import: processedImport,
                 local: processedLocal
             };
         });
         this.state.products = allProducts.sort((a,b) => b.greenScore - a.greenScore);
    },

    // --- HESAPLAMA MOTORU ---
    calculateEmissionData(product) {
        let factor = 0;
        switch (product.transportType) {
            case 'air': factor = settings.factorAir; break;
            case 'ship': factor = settings.factorShip; break;
            case 'road': factor = settings.factorRoad; break;
            case 'train': factor = settings.factorTrain; break;
            default: factor = 0;
        }
        const distance = product.distanceKm || 0;
        const weight = product.weightKg || 1;

        const carbonEmissionGrams = distance * factor * weight;

        let tier = 'high', tierColor = 'ecoRed', tierEmoji = '🔥';
        if (carbonEmissionGrams <= settings.tierLowThresholdGrams) { tier = 'low'; tierColor = 'ecoGreen'; tierEmoji = '🌱'; }
        else if (carbonEmissionGrams <= settings.tierMediumThresholdGrams) { tier = 'medium'; tierColor = 'ecoYellow'; tierEmoji = '⚠️'; }

        const score = 100 - (carbonEmissionGrams / (settings.tierMediumThresholdGrams * 2)) * 100;
        const greenScore = Math.max(0, Math.min(100, Math.round(score)));
        const equivalencyKm = carbonEmissionGrams / settings.carEquivalencyFactorGrams;

        return { ...product, carbonEmissionGrams, greenScore, tier, tierColor, tierEmoji, equivalencyKm };
    },

    // --- SEPET FONKSİYONLARI ---
    addToCart(productId) {
        const productToAdd = this.state.products.find(p => p.id === productId);
        if (!productToAdd) return;
        const existingCartItemIndex = this.state.cart.findIndex(item => item.productId === productId);
        if (existingCartItemIndex > -1) { this.state.cart[existingCartItemIndex].quantity++; }
        else { this.state.cart.push({ productId: productToAdd.id, name: productToAdd.name, price: productToAdd.price, tier: productToAdd.tier, emoji: productToAdd.emoji, quantity: 1 }); }
        this.updateCartBadge();
    },
    updateCartQuantity(productId, change) {
         const itemIndex = this.state.cart.findIndex(item => item.productId === productId);
         if (itemIndex === -1) return;
         this.state.cart[itemIndex].quantity += change;
         if (this.state.cart[itemIndex].quantity <= 0) { this.state.cart.splice(itemIndex, 1); }
         this.updateCartBadge();
         this.renderCartModal();
    },
    removeFromCart(productId) {
         const itemIndex = this.state.cart.findIndex(item => item.productId === productId);
         if (itemIndex > -1) { this.state.cart.splice(itemIndex, 1); }
         this.updateCartBadge();
         this.renderCartModal();
    },
    calculateCartTotal() {
        let subtotal = 0, ecoItemCount = 0;
        this.state.cart.forEach(item => { subtotal += (item.price || 0) * item.quantity; if (item.tier === 'low') { ecoItemCount += item.quantity; } });
        let discount = 0; const discountApplied = ecoItemCount >= 10;
        if (discountApplied) { discount = subtotal * 0.10; }
        const total = subtotal - discount;
        return { subtotal: subtotal.toFixed(2), ecoItemCount: ecoItemCount, discount: discount.toFixed(2), total: total.toFixed(2), discountApplied: discountApplied };
    },
    updateCartBadge() {
         const badge = document.getElementById('cart-badge');
         if (!badge) return;
         const totalItems = this.state.cart.reduce((sum, item) => sum + item.quantity, 0);
         if (totalItems > 0) { badge.textContent = totalItems; badge.classList.remove('hidden'); }
         else { badge.classList.add('hidden'); }
    },


    // --- SAYFA ÇİZİM (RENDER) FONKSİYONLARI ---

    /** Ana Sayfa Yönlendiricisi */
    renderPage() {
        const content = document.getElementById('page-content');
        const title = document.getElementById('page-title');
        content.innerHTML = '<div class="col-span-full flex justify-center items-center h-64"><div class="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-brandOrange"></div></div>';

        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.page === this.state.currentPage);
        });

        setTimeout(() => {
            content.innerHTML = '';
            content.classList.remove('fade-in-up');
            void content.offsetWidth;
            content.classList.add('fade-in-up');

            if (this.state.currentPage === 'all') { this.renderPairedProductPage(content, title); }
            else if (this.state.currentPage === 'eco') { this.renderEcoLabelPage(content, title); }
            else if (this.state.currentPage === 'calc') { this.renderCalculatorPage(content, title); }
            else if (this.state.currentPage === 'blog') { this.renderBlogPage(content, title); }
            else if (this.state.currentPage === 'admin' && this.state.isAdminMode) { this.renderAdminPage(content, title); }
            else if (this.state.currentPage === 'admin' && !this.state.isAdminMode) {
                 this.promptAdminPassword(content, title);
            }
        }, 150);
    },

    /** "Karşılaştır" Sayfası */
    renderPairedProductPage(content, title) {
        title.textContent = '🛒 İthal vs. Yerli Karşılaştırması';
        content.className = 'grid grid-cols-1 gap-8';
        if (this.state.pairedProducts.length === 0) { content.innerHTML = `<p class="col-span-full text-gray-500 text-center py-10">Karşılaştırılacak ürün bulunamadı.</p>`; return; }
        this.state.pairedProducts.forEach((pair, index) => {
            content.insertAdjacentHTML('beforeend', this.getComparisonCardHTML(pair, index));
        });
        this.attachCardClickListeners();
    },
    /** Karşılaştırma Ana Kartı */
    getComparisonCardHTML(pair, index) {
         return `
        <div class="comparison-card col-span-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 fade-in-up" style="animation-delay: ${index * 100}ms;">
            <h3 class="text-xl md:text-2xl font-bold text-gray-800 p-5 bg-gray-50 border-b border-gray-200">${pair.category} Karşılaştırması</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
                ${this.getComparisonSubCardHTML(pair.import, 'İthal Seçenek')}
                ${this.getComparisonSubCardHTML(pair.local, 'Yerli Seçenek')}
            </div>
        </div>`;
    },
    /** Karşılaştırma Alt Kartı */
    getComparisonSubCardHTML(product, title) {
         const scoreColor = `text-${product.tierColor}`;
         const borderColor = `border-${product.tierColor}`;
         const bgColor = `bg-${product.tierColor}/5`;
         const titleColor = `text-${product.tierColor}-dark`;
         let label = '';
         if(product.tier === 'low') { label = `<span class="bg-ecoGreen text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">${product.tierEmoji} Düşük</span>`; }
         else if (product.tier === 'medium') { label = `<span class="bg-ecoYellow text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">${product.tierEmoji} Orta</span>`; }
         else { label = `<span class="bg-ecoRed text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">${product.tierEmoji} Yüksek</span>`; }
         const priceHTML = product.price ? `<span class="text-lg font-bold text-gray-900">${product.price.toFixed(2)} TL</span>` : '<span class="text-lg font-bold text-gray-400">- TL</span>';

         return `
        <div class="product-card border ${borderColor} rounded-lg overflow-hidden flex flex-col cursor-pointer bg-white" data-id="${product.id}">
            <div class="p-3 ${bgColor} border-b ${borderColor}/20 flex justify-between items-center">
                <h4 class="text-md font-semibold ${titleColor}">${title}</h4>
                ${label}
            </div>
            <div class="w-full h-36 sm:h-44 flex items-center justify-center bg-gray-100 text-6xl md:text-7xl">
                ${product.emoji || '?'}
            </div>
            <div class="p-4 flex-grow flex flex-col">
                <h3 class="font-bold text-lg text-gray-800 mb-1" title="${product.name}">${product.name}</h3>
                <p class="text-xs text-gray-500 mb-3">${product.originCountry}</p>
                <div class="text-sm mb-3">
                    <span class="font-semibold text-gray-900">${product.carbonEmissionGrams.toFixed(0)} g CO₂e</span>
                    <span class="text-gray-600">/ 1kg</span>
                    <span class="font-bold ml-3 ${scoreColor}">(${product.greenScore} Puan)</span>
                </div>
                 <div class="text-xs text-gray-500 flex items-center mb-4">
                    ${product.transportEmoji || ''} <span class="ml-1">${product.distanceKm ? product.distanceKm.toLocaleString('tr-TR') : '?'} km (${product.transportType})</span>
                </div>
                <div class="mt-auto flex justify-between items-center pt-2 border-t border-gray-100">
                     ${priceHTML}
                     <button data-product-id="${product.id}" class="add-to-cart-btn bg-brandOrange text-white w-10 h-10 rounded-lg text-2xl font-bold flex items-center justify-center hover:bg-brandOrange-dark transition-all">+</button>
                </div>
            </div>
        </div>`;
    },
    /** "Eco-Etiketli" Sayfası */
    renderEcoLabelPage(content, title) {
         title.textContent = '🌱 Düşük Emisyonlu (Eco) Ürünler';
         content.className = 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5';
         const ecoProducts = this.state.products.filter(p => p.tier === 'low');
         if (ecoProducts.length === 0) { content.innerHTML = `<p class="col-span-full text-gray-500 text-center py-10">Eco-Etiketli ürün bulunamadı.</p>`; return; }
         ecoProducts.forEach((product, index) => { content.insertAdjacentHTML('beforeend', this.getProductCardHTML(product, index)); });
         this.attachCardClickListeners();
    },
    /** Eco-Etiketli Sayfası Ürün Kartı */
    getProductCardHTML(product, index) {
         const scoreColor = `text-${product.tierColor}`;
         const label = `<span class="absolute top-2 left-2 bg-ecoGreen text-white text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1">${product.tierEmoji} Düşük</span>`;
         const priceHTML = product.price ? `<span class="text-md font-bold text-gray-900">${product.price.toFixed(2)} TL</span>` : '<span class="text-md font-bold text-gray-400">- TL</span>';

         return `
        <div class="product-card bg-white rounded-xl shadow border border-transparent overflow-hidden flex flex-col cursor-pointer fade-in-up hover:border-ecoGreen" data-id="${product.id}" style="animation-delay: ${index * 50}ms;">
            <div class="relative">
                <div class="w-full h-36 sm:h-44 flex items-center justify-center bg-gray-100 text-6xl md:text-7xl">
                    ${product.emoji || '?'}
                </div>
                ${label}
            </div>
            <div class="p-3 flex-grow flex flex-col">
                <h3 class="font-semibold text-base text-gray-800 mb-1 truncate" title="${product.name}">${product.name}</h3>
                <p class="text-xs text-gray-500 mb-2">${product.originCountry}</p>
                 <div class="mt-auto flex justify-between items-center pt-2">
                    <div class="flex flex-col">
                         ${priceHTML}
                         <span class="text-xs font-bold ${scoreColor}">(${product.greenScore} Puan)</span>
                    </div>
                    <button data-product-id="${product.id}" class="add-to-cart-btn bg-brandOrange text-white w-9 h-9 rounded-lg text-xl font-bold flex items-center justify-center hover:bg-brandOrange-dark transition-all">+</button>
                </div>
            </div>
        </div>`;
    },
    /** Emisyon Hesaplayıcı Sayfası */
    renderCalculatorPage(content, title) {
         title.textContent = '📊 Emisyon Hesaplayıcı';
         content.className = 'grid grid-cols-1 gap-6';
         const calculatorHTML = `
            <div class="col-span-full bg-white rounded-xl shadow-lg p-6 md:p-8 max-w-lg mx-auto border border-gray-200 fade-in-up">
                <h3 class="text-2xl font-bold text-gray-800 mb-2">Manuel Hesaplama</h3>
                <p class="text-gray-600 mb-6">Bir ürünün tahmini karbon ayak izini hesaplayın.</p>
                <div class="space-y-5">
                    <div><label for="calc-km" class="admin-label">Mesafe (km)</label><input type="number" id="calc-km" placeholder="Örn: 10500" class="input-field"></div>
                    <div><label for="calc-transport" class="admin-label">Taşıma Türü</label><select id="calc-transport" class="input-field"><option value="air">✈️ Uçak - ${settings.factorAir} g/km</option><option value="ship" selected>🚢 Gemi - ${settings.factorShip} g/km</option><option value="road">🚚 Kamyon - ${settings.factorRoad} g/km</option><option value="train">🚆 Tren - ${settings.factorTrain} g/km</option></select></div>
                    <div><label for="calc-kg" class="admin-label">Ağırlık (kg)</label><input type="number" id="calc-kg" value="1" min="0.1" step="0.1" class="input-field"></div>
                    <button id="calc-submit" class="w-full bg-brandOrange text-white py-3 px-4 rounded-lg font-bold text-lg hover:bg-brandOrange-dark transition-all shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandOrange">Hesapla 🚀</button>
                </div>
                <div id="calc-result" class="mt-8"></div>
            </div>`;
         content.innerHTML = calculatorHTML;
         this.attachCalculatorListener();
    },
    /** Blog Sayfası */
    renderBlogPage(content, title) {
         title.textContent = '💡 Proje: ReEarth';
         content.className = 'grid grid-cols-1 gap-6';
         const blogHTML = `
            <div class="col-span-full bg-white rounded-xl shadow-lg p-6 md:p-10 max-w-3xl mx-auto border border-gray-200 fade-in-up">
                <div class="flex justify-center mb-8"><img src="https://i.imgur.com/kS5xP0s.png" alt="İklim Öncüleri Logosu" class="h-20"></div>
                <h3 class="text-3xl font-extrabold text-gray-900 mb-4 text-center">ReEarth: Bilinçli Tüketim Hareketi</h3>
                <p class="text-xl text-gray-600 mb-8 border-b pb-8 text-center font-medium">Karbon Ayak İzini Azaltmak İçin Yerli Üretimi Desteklemek ve Tüketiciyi Bilinçlendirmek.</p>
                <div class="prose prose-lg max-w-none text-gray-700"><h4>Problemimiz Ne?</h4><ul><li><strong>İthal Ürünlerin Gizli Maliyeti:</strong> Sofranıza gelen meyve ve sebzelerin kat ettiği binlerce kilometrelik yolculuk, ciddi bir karbon ayak izi bırakıyor.</li><li><strong>Yerel Üreticinin Mücadelesi:</strong> Kendi çiftçimiz desteklenmediğinde, hem ekonomi hem de çevre kaybediyor.</li><li><strong>Bilgi Eksikliği:</strong> Çoğu tüketici, yaptığı seçimin çevresel etkisinin farkında değil.</li></ul><h4>ReEarth Çözümü</h4><p>Bu platform, basit ama güçlü bir fikir üzerine kurulu: Şeffaflık. Amacımız:</p><ul><li><strong>Karşılaştırma Gücü:</strong> İthal ve yerli ürünlerin karbon ayak izlerini yan yana göstererek bilinçli karar vermenizi sağlamak.</li><li><strong>Dijital Etiketleme:</strong> Her ürünün çevresel etkisini <code>Düşük</code>, <code>Orta</code>, <code>Yüksek</code> olarak net bir şekilde etiketlemek.</li><li><strong>Yerel Desteği:</strong> Düşük emisyonlu yerel ürünleri öne çıkararak çiftçimizi desteklemek.</li></ul><h4>Etiket Sistemimiz: Neye Göre? (🌱 / ⚠️ / 🔥)</h4><p>Hesaplamalarımızda "Gıda Kilometresi" ve taşıma türünün etkisini birleştiren bilimsel faktörler kullanıyoruz:</p><ol><li><strong>Mesafe (km):</strong> Ne kadar uzak, o kadar emisyon.</li><li><strong>Taşıma Türü:</strong> Uçak ✈️ (En Kötü) > Kamyon 🚚 > Tren 🚆 > Gemi 🚢 (En İyi).</li></ol><p>Ürünleri 3 basit kategoriye ayırıyoruz:</p><ul><li><strong class="text-ecoGreen-text">🌱 Düşük Emisyon (Yeşil):</strong> ${settings.tierLowThresholdGrams} gCO₂e altı. Harika seçim!</li><li><strong class="text-ecoYellow-text">⚠️ Orta Emisyon (Sarı):</strong> ${settings.tierLowThresholdGrams}g - ${settings.tierMediumThresholdGrams}g arası. Daha iyisi olabilir.</li><li><strong class="text-ecoRed-text">🔥 Yüksek Emisyon (Kırmızı):</strong> ${settings.tierMediumThresholdGrams}g üzeri. Yerel alternatifini düşünün!</li></ul><h4>Gelecek: Yeşil Puan & Ödüller ✨</h4><p>Vizyonumuz, bu platformu bir adım öteye taşımak. PDF'imizde bahsettiğimiz "Yeşil Puan" sistemi ile:</p><blockquote>Düşük emisyonlu ürünleri seçen tüketicileri puanlarla, rozetlerle ve özel indirimlerle ödüllendirerek sürdürülebilir alışverişi bir alışkanlık haline getirmeyi hedefliyoruz. ("10 Yeşil Ürün Aldın!" rozeti gibi).</blockquote><h4>Sen de Katıl!</h4><p>Bu sadece bir başlangıç. Bilinçli seçimler yaparak hem gezegenimize hem de yerel ekonomiye katkıda bulunabilirsiniz. Unutmayın: Küçük değişiklikler, büyük fark yaratır!</p><p class="text-sm text-gray-500 mt-8">Bu proje, Birleşmiş Milletler Sürdürülebilir Kalkınma Hedefleri (SKH 9, 12, 13) ile uyumludur.</p></div>
            </div>`;
         content.innerHTML = blogHTML;
    },

    // --- YÖNETİM PANELİ FONKSİYONLARI ---

    /** Yönetim Paneli Sayfasını Çizer */
    renderAdminPage(content, title) {
        title.textContent = '⚙️ Yönetim Paneli';
        content.className = 'grid grid-cols-1 gap-8';

        content.innerHTML = `<p class="text-gray-600 mb-4">Buradan ürün bilgilerini (isim, menşei, mesafe, fiyat, emoji, taşıma türü) düzenleyebilirsiniz. 'Kaydet' butonuna tıkladığınızda değişiklikler sitede anında yansıyacaktır.</p>`;

        this.state.pairedProducts.forEach((pair, index) => {
            content.insertAdjacentHTML('beforeend', this.getAdminPairCardHTML(pair, index));
        });

        content.insertAdjacentHTML('beforeend', this.getAdminNewPairCardHTML());
        this.attachAdminListeners();
    },

    /** Yönetim Paneli Ürün Çifti Kartı */
    getAdminPairCardHTML(pair, index) {
        return `
        <div class="admin-card col-span-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 fade-in-up" style="animation-delay: ${index * 100}ms;">
            <h3 class="text-xl font-bold text-gray-800 p-5 bg-gray-50 border-b border-gray-200">${pair.category} Düzenle</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
                ${this.getAdminProductFormHTML(pair.import, 'İthal Seçenek')}
                ${this.getAdminProductFormHTML(pair.local, 'Yerli Seçenek')}
            </div>
        </div>`;
    },

    /** Yönetim Paneli Tek Ürün Formu */
    getAdminProductFormHTML(product, title) {
         const tierInfo = this.getProductTierInfo(product.tier);
         const priceValue = product.price ? product.price.toFixed(2) : '0.00';
         return `
            <div class="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50/50">
                <div class="flex justify-between items-center">
                     <h4 class="text-lg font-semibold ${tierInfo.textColor}">${title}</h4>
                     <span class="text-xs font-bold px-2 py-1 rounded-full text-white ${tierInfo.bgColor} flex items-center gap-1">${product.tierEmoji} ${tierInfo.text}</span>
                </div>
                <div><label class="admin-label">Ürün Adı:</label><input type="text" data-id="${product.id}" data-field="name" value="${product.name || ''}" class="admin-input"></div>
                <div><label class="admin-label">Menşei:</label><input type="text" data-id="${product.id}" data-field="originCountry" value="${product.originCountry || ''}" class="admin-input"></div>
                <div><label class="admin-label">Mesafe (km):</label><input type="number" data-id="${product.id}" data-field="distanceKm" value="${product.distanceKm || 0}" class="admin-input"></div>
                <div><label class="admin-label">Fiyat (TL):</label><input type="number" step="0.01" data-id="${product.id}" data-field="price" value="${priceValue}" class="admin-input"></div>
                <div><label class="admin-label">Emoji:</label><input type="text" data-id="${product.id}" data-field="emoji" value="${product.emoji || ''}" class="admin-input"></div>
                <div>
                     <label class="admin-label">Taşıma Türü:</label>
                     <select data-id="${product.id}" data-field="transportType" class="admin-input bg-white">
                         <option value="ship" ${product.transportType === 'ship' ? 'selected' : ''}>🚢 Gemi</option>
                         <option value="road" ${product.transportType === 'road' ? 'selected' : ''}>🚚 Kamyon</option>
                         <option value="air" ${product.transportType === 'air' ? 'selected' : ''}>✈️ Uçak</option>
                         <option value="train" ${product.transportType === 'train' ? 'selected' : ''}>🚆 Tren</option>
                     </select>
                </div>
                 <div><button data-id="${product.id}" class="admin-save-btn w-full mt-2">Kaydet</button></div>
                 <div class="text-xs text-gray-500 mt-1 text-center">Hesaplanan: ${product.carbonEmissionGrams.toFixed(0)} g CO₂e (${product.greenScore} Puan)</div>
            </div>
        `;
    },

     /** Yönetim Paneli Yeni Ürün Çifti Ekleme Kartı */
    getAdminNewPairCardHTML() {
         const newProductTemplate = { id: 'new', name: '', originCountry: '', transportType: 'road', distanceKm: 0, weightKg: 1.0, emoji: '❓', price: 0, tier: 'high', tierEmoji: '?', greenScore: 0, carbonEmissionGrams: 0 };
         return `
        <div class="admin-card col-span-full bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 mt-4 fade-in-up">
            <h3 class="text-xl font-bold text-brandOrange-dark p-5 bg-orange-50 border-b border-gray-200">Yeni Ürün Çifti Ekle</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5 p-5">
                ${this.getAdminProductFormHTML({...newProductTemplate, id: 'new-import'}, 'Yeni İthal Ürün')}
                ${this.getAdminProductFormHTML({...newProductTemplate, id: 'new-local'}, 'Yeni Yerli Ürün')}
            </div>
             <div class="p-5 border-t border-gray-200">
                 <label class="admin-label">Kategori Adı (Örn: Kiraz):</label>
                 <input type="text" id="new-pair-category" placeholder="Yeni kategori adı" class="admin-input mb-3">
                 <button id="add-new-pair-btn" class="w-full bg-brandOrange text-white py-2 px-4 rounded-md font-bold hover:bg-brandOrange-dark transition-all shadow">
                      Yeni Çifti Ekle
                 </button>
            </div>
        </div>`;
    },

     /** Tier bilgisine göre stil döndürür */
     getProductTierInfo(tier) {
         if (tier === 'low') return { textColor: 'text-ecoGreen-text', bgColor: 'bg-ecoGreen', text: 'Düşük' };
         if (tier === 'medium') return { textColor: 'text-ecoYellow-text', bgColor: 'bg-ecoYellow', text: 'Orta' };
         return { textColor: 'text-ecoRed-text', bgColor: 'bg-ecoRed', text: 'Yüksek' };
     },

    // --- Ürün Detay Modalı ---
    openModal(productId) {
         const product = this.state.products.find(p => p.id === productId); if (!product) return;
         this.state.selectedProduct = product;
         const modalContainer = document.getElementById('modal-container');
         const modalContent = document.getElementById('modal-content');
         let label = '';
         if(product.tier === 'low') { label = `<span class="text-lg font-bold text-ecoGreen-text flex items-center gap-1">${product.tierEmoji} Düşük Emisyon</span>`; }
         else if (product.tier === 'medium') { label = `<span class="text-lg font-bold text-ecoYellow-text flex items-center gap-1">${product.tierEmoji} Orta Emisyon</span>`; }
         else { label = `<span class="text-lg font-bold text-ecoRed-text flex items-center gap-1">${product.tierEmoji} Yüksek Emisyon</span>`; }
         const circumference = 2 * Math.PI * 36;
         const offset = circumference - (product.greenScore / 100) * circumference;
         const scoreRingColor = `stroke-${product.tierColor}`;
         const scoreTextColor = `text-${product.tierColor}-dark`;
         const scoreCircle = `<svg class="w-20 h-20 transform -rotate-90"><circle class="text-gray-200" stroke-width="8" stroke="currentColor" fill="transparent" r="36" cx="40" cy="40" /><circle class="${scoreRingColor}" stroke-width="8" stroke-dasharray="${circumference}" stroke-dashoffset="${offset}" stroke-linecap="round" stroke="currentColor" fill="transparent" r="36" cx="40" cy="40" style="transition: stroke-dashoffset 0.5s ease-out;" /></svg><span class="absolute text-2xl font-extrabold ${scoreTextColor}">${product.greenScore}</span>`;
         const priceHTMLModal = product.price ? `<span class="text-3xl font-extrabold text-gray-900">${product.price.toFixed(2)} TL</span>` : '<span class="text-3xl font-extrabold text-gray-400">- TL</span>';

         modalContent.innerHTML = `
             <button id="modal-close-btn" class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10 p-1 rounded-full bg-white/50 hover:bg-white/80 transition-all"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg></button>
             <div class="relative">
                  <div class="w-full h-52 md:h-64 flex items-center justify-center bg-gray-200 rounded-t-xl text-8xl">
                       ${product.emoji || '?'}
                  </div>
                  <div class="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent">
                       ${label}
                  </div>
             </div>
             <div class="p-5 md:p-6">
                  <div class="flex justify-between items-start mb-4">
                       <div>
                            <h2 class="text-3xl font-extrabold text-gray-900">${product.name}</h2>
                            <p class="text-md text-gray-500 font-medium">${product.originCountry}</p>
                       </div>
                       <div class="relative flex items-center justify-center w-20 h-20 flex-shrink-0">
                            ${scoreCircle}
                       </div>
                  </div>
                  <div class="bg-white rounded-lg p-5 shadow-inner border border-gray-200">
                       <h4 class="text-md font-semibold text-gray-800 mb-3">Karbon Ayak İzi Detayları (${product.weightKg || 1}kg)</h4>
                       <div class="space-y-3">
                            <div class="flex justify-between text-lg">
                                 <span class="text-gray-600">Toplam Emisyon:</span>
                                 <span class="font-bold text-gray-900">${product.carbonEmissionGrams.toFixed(0)} g CO₂e</span>
                            </div>
                            <div class="flex justify-between text-sm items-center">
                                 <span class="text-gray-600">Taşıma Türü:</span>
                                 <span class="font-semibold text-gray-800 flex items-center gap-1">${product.transportEmoji || ''} ${product.transportType}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                 <span class="text-gray-600">Taşıma Mesafesi:</span>
                                 <span class="font-semibold text-gray-800">${product.distanceKm ? product.distanceKm.toLocaleString('tr-TR') : '?'} km</span>
                            </div>
                            <div class="flex justify-between text-sm pb-3 border-b border-gray-100">
                                 <span class="text-gray-600">Düşük Emisyon Eşiği:</span>
                                 <span class="font-semibold text-gray-800">${(settings.tierLowThresholdGrams * (product.weightKg || 1)).toFixed(0)} g CO₂e</span>
                            </div>
                       </div>
                       <div class="mt-4 text-center text-gray-700">
                            <p class="text-3xl mb-1">🚗</p>
                            <p class="text-md font-medium">
                                 Bu, ortalama bir araba ile <strong class="text-brandOrange-dark">${product.equivalencyKm.toFixed(1)} km</strong> yol yapmaya eşdeğerdir.
                            </p>
                       </div>
                  </div>
                  <div class="mt-6 flex justify-between items-center">
                       ${priceHTMLModal}
                       <button data-product-id="${product.id}" class="add-to-cart-btn bg-brandOrange text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-brandOrange-dark transition-all shadow hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandOrange flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg>
                            Sepete Ekle
                       </button>
                  </div>
             </div>`;

         modalContainer.classList.remove('invisible', 'opacity-0');
         setTimeout(() => modalContent.classList.remove('opacity-0', 'translate-y-5'), 10);
         // Modaldaki sepete ekle butonu listener'ı
         const modalAddToCartBtn = modalContent.querySelector('.add-to-cart-btn');
         if(modalAddToCartBtn) {
             modalAddToCartBtn.onclick = (e) => {
                 const btn = e.target.closest('button');
                 const id = parseInt(btn.dataset.productId);
                 this.addToCart(id);
                 btn.classList.add('transform', 'scale-105', 'bg-ecoGreen');
                 btn.innerHTML = 'Eklendi!'; // SVG yerine metin
                 setTimeout(() => {
                     btn.classList.remove('transform', 'scale-105', 'bg-ecoGreen');
                     btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" /></svg> Sepete Ekle`;
                 }, 1500);
             };
         }
    },

     /** Sepet Modalı */
    renderCartModal() {
         const modalContainer = document.getElementById('modal-container');
         const modalContent = document.getElementById('modal-content');
         const cartData = this.calculateCartTotal();
         let cartItemsHTML = '';
         if (this.state.cart.length === 0) { cartItemsHTML = '<p class="text-gray-500 text-center py-8">Sepetiniz boş.</p>'; }
         else {
             cartItemsHTML = this.state.cart.map(item => `
                 <div class="flex items-center justify-between py-4">
                      <div class="flex items-center space-x-4">
                           <span class="text-4xl">${item.emoji}</span>
                           <div>
                                <p class="font-semibold text-gray-800">${item.name}</p>
                                <p class="text-sm text-gray-500">${item.price ? item.price.toFixed(2) : '-'} TL</p>
                           </div>
                      </div>
                      <div class="flex items-center space-x-2">
                           <button class="quantity-btn decrease-qty" data-id="${item.productId}">-</button>
                           <span class="font-bold text-gray-800 w-8 text-center">${item.quantity}</span>
                           <button class="quantity-btn increase-qty" data-id="${item.productId}">+</button>
                           <button class="quantity-btn remove-btn remove-item" data-id="${item.productId}">×</button>
                      </div>
                 </div>`).join('');
         }
         let discountHTML = '';
         if (cartData.discountApplied) { discountHTML = `<div class="flex justify-between text-ecoGreen-text font-semibold"><span>🌱 Eco İndirimi (%10 - ${cartData.ecoItemCount} ürün):</span><span>- ${cartData.discount} TL</span></div>`; }
         else if (this.state.cart.length > 0 && cartData.ecoItemCount < 10) { discountHTML = `<p class="text-sm text-center text-ecoGreen-text mt-2 p-2 bg-ecoGreen/10 rounded">Sepetinize ${10 - cartData.ecoItemCount} adet daha 🌱 Düşük Emisyonlu ürün ekleyerek <strong>%10 indirim</strong> kazanın!</p>`; }

         modalContent.innerHTML = `
             <div class="p-6">
                 <div class="flex justify-between items-center mb-6 border-b pb-4">
                     <h2 class="text-2xl font-bold text-gray-900">🛒 Sepetim</h2>
                     <button id="modal-close-btn" class="text-gray-500 hover:text-gray-800 p-1"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"></path></svg></button>
                 </div>
                 <div class="max-h-60 overflow-y-auto pr-2 mb-6 space-y-0 divide-y divide-gray-100"> <!-- divide eklendi, space-y kaldırıldı -->
                    ${cartItemsHTML}
                 </div>
                 <div class="space-y-3 border-t pt-4">
                     <div class="flex justify-between text-gray-700 font-medium"><span>Ara Toplam:</span><span>${cartData.subtotal} TL</span></div>
                     ${discountHTML}
                     <div class="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t mt-3"><span>Toplam:</span><span>${cartData.total} TL</span></div>
                 </div>
                 ${this.state.cart.length > 0 ? `<button class="w-full mt-6 bg-brandOrange text-white py-3 px-4 rounded-lg font-bold text-lg hover:bg-brandOrange-dark transition-all shadow hover:shadow-md">Ödemeye Geç</button>` : ''}
             </div>`;

         modalContainer.classList.remove('invisible', 'opacity-0');
         setTimeout(() => modalContent.classList.remove('opacity-0', 'translate-y-5'), 10);
         this.attachCartActionListeners();
    },

    // Modalı kapatır
    closeModal() {
         const modalContainer = document.getElementById('modal-container');
         const modalContent = document.getElementById('modal-content');
         modalContent.classList.add('opacity-0', 'translate-y-5');
         setTimeout(() => {
             modalContainer.classList.add('invisible', 'opacity-0');
             this.state.selectedProduct = null;
             modalContent.style.transition = 'none';
             modalContent.classList.remove('opacity-0', 'translate-y-5');
             setTimeout(() => { modalContent.style.transition = ''; }, 50);
         }, 300);
    },

    // --- OLAY DİNLEYİCİLERİ (Event Listeners) ---

    /** Navigasyon */
    attachNavListeners() {
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                 const page = tab.dataset.page;
                 if (page === 'admin' && !this.state.isAdminMode) {
                      this.promptAdminPassword();
                      if (!this.state.isAdminMode) return;
                 }
                 document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
                 tab.classList.add('active');
                 this.state.currentPage = page;
                 this.renderPage();
            });
        });
    },

    /** Ürün Kartları */
    attachCardClickListeners() {
         document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const isAddToCartButton = e.target.tagName === 'BUTTON' || e.target.closest('button.add-to-cart-btn');
                if (isAddToCartButton) {
                     const button = e.target.closest('button.add-to-cart-btn');
                     const id = parseInt(button.dataset.productId);
                     this.addToCart(id);
                     button.classList.add('transform', 'scale-110', 'bg-ecoGreen');
                     setTimeout(() => button.classList.remove('transform', 'scale-110', 'bg-ecoGreen'), 400);
                    return;
                }
                const id = parseInt(card.dataset.id);
                if (this.state.currentPage !== 'admin') {
                    this.openModal(id);
                }
            });
        });
    },

     /** Sepet Butonu (Header) */
    attachCartButtonListener() {
         const cartButton = document.getElementById('cart-button');
         if(cartButton) cartButton.addEventListener('click', () => { this.renderCartModal(); });
    },

    /** Sepet Modalı İçindeki Butonlar */
    attachCartActionListeners() {
         const modalContent = document.getElementById('modal-content');
         if(!modalContent) return; // Modal yoksa çık
         modalContent.querySelectorAll('.increase-qty').forEach(btn => { btn.onclick = () => this.updateCartQuantity(parseInt(btn.dataset.id), 1); });
         modalContent.querySelectorAll('.decrease-qty').forEach(btn => { btn.onclick = () => this.updateCartQuantity(parseInt(btn.dataset.id), -1); });
         modalContent.querySelectorAll('.remove-item').forEach(btn => { btn.onclick = () => this.removeFromCart(parseInt(btn.dataset.id)); });
    },

    /** Hesaplayıcı Butonu */
    attachCalculatorListener() {
         const submitButton = document.getElementById('calc-submit');
         if (!submitButton) return;
         submitButton.addEventListener('click', () => {
             const kmInput = document.getElementById('calc-km'); const kgInput = document.getElementById('calc-kg');
             const transportSelect = document.getElementById('calc-transport'); const resultDiv = document.getElementById('calc-result');
             const km = parseFloat(kmInput.value); const kg = parseFloat(kgInput.value); const transport = transportSelect.value;
             let isValid = true;
             [kmInput, kgInput].forEach(input => { if (isNaN(parseFloat(input.value)) || parseFloat(input.value) <= 0) { input.classList.add('border-red-500', 'ring-red-500'); input.classList.remove('focus:ring-brandOrange', 'focus:border-transparent'); isValid = false; } else { input.classList.remove('border-red-500', 'ring-red-500'); input.classList.add('focus:ring-brandOrange', 'focus:border-transparent'); } });
             if (!isValid) { resultDiv.innerHTML = `<p class="text-ecoRed text-center font-medium">Lütfen geçerli değerler girin.</p>`; return; }
             let factor = 0;
             switch (transport) { case 'air': factor = settings.factorAir; break; case 'ship': factor = settings.factorShip; break; case 'road': factor = settings.factorRoad; break; case 'train': factor = settings.factorTrain; break; }
             const emission = km * kg * factor; const equivalency = emission / settings.carEquivalencyFactorGrams;
             let tierText = '', tierColor = '', tierEmoji = '';
             if (emission <= (settings.tierLowThresholdGrams * kg)) { tierText = 'Düşük Emisyon'; tierColor = 'text-ecoGreen-text'; tierEmoji = '🌱'; }
             else if (emission <= (settings.tierMediumThresholdGrams * kg)) { tierText = 'Orta Emisyon'; tierColor = 'text-ecoYellow-text'; tierEmoji = '⚠️'; }
             else { tierText = 'Yüksek Emisyon'; tierColor = 'text-ecoRed-text'; tierEmoji = '🔥'; }
             resultDiv.innerHTML = '';
             const resultBoxHTML = `<div class="bg-gray-50 rounded-lg p-5 border border-gray-200 mt-6 fade-in-up" id="result-box"><h4 class="text-xl font-bold text-center mb-4 ${tierColor}">${tierEmoji} Tahmini Sonuç</h4><div class="space-y-3"><div class="flex justify-between text-lg"><span class="text-gray-600">Toplam Emisyon:</span><span class="font-extrabold text-gray-900">${emission.toFixed(0)} g CO₂e</span></div><div class="flex justify-between text-md"><span class="text-gray-600">Durum:</span><span class="font-bold ${tierColor}">${tierText}</span></div></div><div class="mt-5 pt-5 border-t border-gray-200 text-center text-gray-700"><p class="text-3xl mb-1">🚗</p><p class="text-md font-medium">Bu, ortalama bir araba ile <strong class="text-brandOrange-dark">${equivalency.toFixed(1)} km</strong> yol yapmaya eşdeğerdir.</p></div></div>`;
             setTimeout(() => { resultDiv.innerHTML = resultBoxHTML; }, 50);
         });
    },

     // Yönetim Paneli Butonları için Listener'lar
    attachAdminListeners() {
        // Kaydet Butonları
        document.querySelectorAll('.admin-save-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const productId = parseInt(btn.dataset.id);
                if (!isNaN(productId)) {
                     this.handleProductSave(productId);
                }
            });
        });

        // Yeni Çift Ekle Butonu
        const addNewPairBtn = document.getElementById('add-new-pair-btn');
        if (addNewPairBtn) {
             addNewPairBtn.addEventListener('click', () => {
                  this.handleAddNewPair();
             });
        }
    },

     // Ürün Kaydetme İşlemi
    handleProductSave(productId) {
        const updatedProductData = { id: productId };
        document.querySelectorAll(`input[data-id="${productId}"], select[data-id="${productId}"]`).forEach(input => {
            const field = input.dataset.field;
            let value = input.value;
            if (['distanceKm', 'weightKg', 'price'].includes(field)) {
                 value = parseFloat(value) || 0;
                 if(field === 'price') value = parseFloat(value.toFixed(2));
            }
            if (field === 'weightKg' && value <= 0) value = 1;
            updatedProductData[field] = value;
        });

        let productNeedsRecalculation = false;
        const recalculateFields = ['distanceKm', 'transportType', 'weightKg'];

        // Çiftli listeyi güncelle
        this.state.pairedProducts = this.state.pairedProducts.map(pair => {
            let importUpdated = false, localUpdated = false;
            let needsRecalcImport = false, needsRecalcLocal = false;

            if (pair.import.id === productId) {
                 for(const field in updatedProductData) {
                     if(recalculateFields.includes(field) && pair.import[field] !== updatedProductData[field]) {
                         needsRecalcImport = true;
                     }
                     pair.import[field] = updatedProductData[field];
                 }
                 if(needsRecalcImport) pair.import = this.calculateEmissionData(pair.import);
                 importUpdated = true;
            } else if (pair.local.id === productId) {
                 for(const field in updatedProductData) {
                     if(recalculateFields.includes(field) && pair.local[field] !== updatedProductData[field]) {
                         needsRecalcLocal = true;
                     }
                      pair.local[field] = updatedProductData[field];
                 }
                  if(needsRecalcLocal) pair.local = this.calculateEmissionData(pair.local);
                 localUpdated = true;
            }
            // productNeedsRecalculation, bu çift için genel bir durum tutar (yeniden çizim için)
            if(needsRecalcImport || needsRecalcLocal) productNeedsRecalculation = true;
            return pair;
        });

         // Düz listeyi güncelle
         const productIndex = this.state.products.findIndex(p => p.id === productId);
         if (productIndex > -1) {
              const originalProduct = this.state.products[productIndex];
              let needsRecalcFlat = false;
               for(const field in updatedProductData) {
                    if(recalculateFields.includes(field) && originalProduct[field] !== updatedProductData[field]) {
                        needsRecalcFlat = true;
                    }
                    originalProduct[field] = updatedProductData[field];
               }
               if (needsRecalcFlat) {
                   this.state.products[productIndex] = this.calculateEmissionData(originalProduct);
               } else {
                   this.state.products[productIndex] = { ...originalProduct };
               }
               this.state.products.sort((a, b) => b.greenScore - a.greenScore);
         }

        console.log(`Ürün ${productId} güncellendi.`);
        // Sadece admin panelini yeniden çiz, diğer sayfalar zaten güncel state'i kullanacak
        if (this.state.currentPage === 'admin') {
            this.renderPage();
        }
    },


    // Yeni Ürün Çifti Ekleme İşlemi
    handleAddNewPair() {
         const categoryInput = document.getElementById('new-pair-category');
         const category = categoryInput.value.trim();
         if (!category) { alert('Lütfen kategori adı girin.'); categoryInput.focus(); return; }

         const maxId = this.state.products.reduce((max, p) => Math.max(max, p.id), 0);
         const newImportId = maxId + 1;
         const newLocalId = maxId + 2;

         const newImportData = { id: newImportId, weightKg: 1.0 };
         document.querySelectorAll(`input[data-id="new-import"], select[data-id="new-import"]`).forEach(input => {
             const field = input.dataset.field; let value = input.value;
             if (['distanceKm', 'price'].includes(field)) value = parseFloat(value) || 0;
             newImportData[field] = value;
         });

         const newLocalData = { id: newLocalId, weightKg: 1.0 };
         document.querySelectorAll(`input[data-id="new-local"], select[data-id="new-local"]`).forEach(input => {
              const field = input.dataset.field; let value = input.value;
              if (['distanceKm', 'price'].includes(field)) value = parseFloat(value) || 0;
             newLocalData[field] = value;
         });

         const processedNewImport = this.calculateEmissionData(newImportData);
         const processedNewLocal = this.calculateEmissionData(newLocalData);

         this.state.pairedProducts.push({ pairId: Date.now(), category: category, import: processedNewImport, local: processedNewLocal });
         this.state.products.push(processedNewImport, processedNewLocal);
         this.state.products.sort((a,b) => b.greenScore - a.greenScore);

         console.log('Yeni ürün çifti eklendi:', category);
         this.renderPage(); // Yönetim panelini yeniden çiz
    },

    // Yönetim Paneli Şifresini Sorar
    promptAdminPassword(content, title) { // content ve title parametreleri eklendi
         const enteredPassword = prompt("Yönetim Paneline erişmek için şifreyi girin (İpucu: admin):");
         if (enteredPassword === this.state.adminPassword) {
              this.state.isAdminMode = true;
              document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
              document.getElementById('nav-admin').classList.add('active');
              this.state.currentPage = 'admin';
              this.renderAdminPage(content, title); // Artık content ve title ile çağırılıyor
         } else if (enteredPassword !== null) {
              alert("Yanlış şifre!");
              this.state.currentPage = 'all';
              // Aktif sekmeyi düzelt
              document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
              document.getElementById('nav-all').classList.add('active');
              this.renderPage(); // Doğru sayfayı yükle
         } else {
               this.state.currentPage = 'all';
               // Aktif sekmeyi düzelt
               document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
               document.getElementById('nav-all').classList.add('active');
               this.renderPage(); // Doğru sayfayı yükle
         }
    },


    /** Modal Kapatma */
    attachModalCloseListeners() {
         const modalContainer = document.getElementById('modal-container');
         modalContainer.addEventListener('click', (e) => {
             if (e.target.id === 'modal-close-btn' || e.target.closest('#modal-close-btn') || e.target.id === 'modal-container') {
                 this.closeModal();
             }
         });
         document.addEventListener('keydown', (e) => {
             if (e.key === 'Escape' && !modalContainer.classList.contains('invisible')) {
                 this.closeModal();
             }
         });
    }
};

// --- UYGULAMAYI BAŞLAT ---
document.addEventListener('DOMContentLoaded', () => { App.init(); });

