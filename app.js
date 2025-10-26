// app.js

// Trivia (Bilgi) veritabanı
const TRIVIA = [
    "Biliyor muydunuz? Gıda taşımacılığı, küresel sera gazı emisyonlarının yaklaşık %6'sını oluşturur.",
    "Hava yoluyla taşınan gıdalar, deniz yoluyla taşınanlara göre 50 kat daha fazla CO₂ üretebilir.",
    "Yerel ve mevsiminde ürünler tüketmek, gıda kaynaklı karbon ayak izinizi azaltmanın en etkili yollarından biridir.",
    "Ambalaj atıkları da gıdanın çevresel etkisine büyük katkıda bulunur. Mümkünse ambalajsız ürünleri tercih edin."
];

// Ana uygulama fonksiyonu
document.addEventListener('DOMContentLoaded', async () => {
    // Global değişkenler
    let allProducts = [];
    let processedProducts = [];
    let settings = {};

    // 1. Veri Yükleme Fonksiyonu
    async function loadData() {
        try {
            const [settingsRes, productsRes] = await Promise.all([
                fetch('data/settings.json'),
                fetch('data/products.json')
            ]);
            
            if (!settingsRes.ok || !productsRes.ok) {
                throw new Error('Veri dosyaları yüklenemedi.');
            }

            settings = await settingsRes.json();
            allProducts = await productsRes.json();
            
            // Tüm ürünler için emisyonları hesapla
            processedProducts = allProducts.map(product => calculateEmissionData(product, settings));
            
            return true;

        } catch (error) {
            console.error('Veri yükleme hatası:', error);
            return false;
        }
    }

    // 2. Emisyon Hesaplama Motoru
    function calculateEmissionData(product, settings) {
        let factor = 0;
        switch (product.transportType) {
            case 'air': factor = settings.factorAir; break;
            case 'ship': factor = settings.factorShip; break;
            case 'road': factor = settings.factorRoad; break;
            case 'train': factor = settings.factorTrain; break;
        }

        const carbonEmissionKg = product.distanceKm * factor * product.weightKg;
        
        // Green Score (0-100)
        // Eşik değer = 50 puan. Eşik değerin 2 katı = 0 puan. 0 emisyon = 100 puan.
        const score = 100 - (carbonEmissionKg / (settings.emissionThresholdKg * 2)) * 100;
        const greenScore = Math.max(0, Math.min(100, Math.round(score)));
        
        const hasEcoLabel = carbonEmissionKg <= settings.emissionThresholdKg;
        const equivalencyKm = carbonEmissionKg / settings.carEquivalencyFactor;

        // Eğitimsel içerik üret
        const educationalContent = generateEducationalContent(product, carbonEmissionKg, score);

        return {
            ...product, // Orijinal ürün verilerini kopyala
            carbonEmissionKg,
            greenScore,
            hasEcoLabel,
            equivalencyKm,
            educationalContent
        };
    }

    // 3. (AI-Powered) Eğitimsel İçerik Üretici
    function generateEducationalContent(product, emission, score) {
        let impact, tips;
        const emissionFixed = emission.toFixed(2);
        
        if (score > 80) {
            impact = `Harika seçim! ${product.originCountry} menşeli bu ${product.name}, ${emissionFixed} kg CO₂e ile çok düşük bir ayak izine sahip.`;
            tips = "Yerel ve mevsiminde ürünleri tercih etmeye devam edin.";
        } else if (score > 50) {
            impact = `${product.originCountry} (${product.transportType} ile) gelen bu ürün ${emissionFixed} kg CO₂e ile orta düzeyde bir ayak izine sahip.`;
            tips = "Deniz veya demir yoluyla taşınan alternatifleri araştırmak ayak izinizi daha da azaltabilir.";
        } else {
            impact = `Dikkat! Özellikle ${product.transportType} ile ${product.originCountry}'dan gelen bu ürün, ${emissionFixed} kg CO₂e ile yüksek bir karbon ayak izine sahip.`;
            tips = "Bu ürünü tüketirken daha yerel veya deniz yoluyla taşınan alternatiflerini aramayı düşünün.";
        }

        return { impact, tips };
    }

    // 4. Ana Sayfa (index.html) Mantığı
    function renderProductList(filter = 'all', category = 'all') {
        const productListContainer = document.getElementById('product-list');
        if (!productListContainer) return; // Yanlış sayfadayız

        let filteredProducts = processedProducts;

        // Etiket filtresi
        if (filter === 'label') {
            filteredProducts = filteredProducts.filter(p => p.hasEcoLabel);
        } else if (filter === 'high-footprint') {
            filteredProducts = filteredProducts.filter(p => !p.hasEcoLabel);
        }
        
        // Kategori filtresi
        if (category !== 'all') {
            filteredProducts = filteredProducts.filter(p => p.category === category);
        }

        productListContainer.innerHTML = ''; // Listeyi temizle

        if (filteredProducts.length === 0) {
            productListContainer.innerHTML = '<p>Bu kriterlere uyan ürün bulunamadı.</p>';
            return;
        }

        filteredProducts.forEach(product => {
            const card = document.createElement('a');
            card.href = `product.html?id=${product.id}`;
            card.className = 'product-card';
            
            const scoreClass = product.greenScore > 80 ? 'score-100' : product.greenScore > 50 ? 'score-50' : 'score-0';
            const badge = product.hasEcoLabel 
                ? '<div class="badge green">Eco-Etiketli</div>'
                : '<div class="badge red">Yüksek Ayak İzi</div>';

            card.innerHTML = `
                <div class="product-card-content">
                    <h3>${product.name}</h3>
                    <p>${product.originCountry} (${product.transportType})</p>
                </div>
                <div class="product-card-footer">
                    ${badge}
                    <div class="score ${scoreClass}">${product.greenScore}/100</div>
                </div>
            `;
            productListContainer.appendChild(card);
        });
    }
    
    // Ana sayfa kategori filtresini doldur
    function populateCategoryFilter() {
        const categoryFilter = document.getElementById('category-filter');
        if(!categoryFilter) return;
        
        const categories = [...new Set(allProducts.map(p => p.category))];
        categories.sort().forEach(category => {
            const option = document.createElement('option');
            option.value = category;
            option.textContent = category;
            categoryFilter.appendChild(option);
        });
    }

    // 5. Ürün Detay Sayfası (product.html) Mantığı
    function renderProductDetail() {
        const detailContainer = document.getElementById('product-detail-content');
        if (!detailContainer) return; // Yanlış sayfadayız

        const urlParams = new URLSearchParams(window.location.search);
        const productId = parseInt(urlParams.get('id'));

        if (!productId) {
            detailContainer.innerHTML = '<p>Ürün ID bulunamadı. Lütfen ana sayfaya dönün.</p>';
            return;
        }

        const product = processedProducts.find(p => p.id === productId);

        if (!product) {
            detailContainer.innerHTML = '<p>Ürün bulunamadı.</p>';
            return;
        }

        // Sayfa başlığını güncelle
        document.title = `${product.name} - EcoLabelr`;

        const scoreClass = product.greenScore > 80 ? 'score-100' : product.greenScore > 50 ? 'score-50' : 'score-0';
        const badge = product.hasEcoLabel 
            ? '<div class="badge green">Eco-Etiketli</div>'
            : '<div class="badge red">Yüksek Ayak İzi</div>';

        detailContainer.innerHTML = `
            <div class="product-info">
                <h2>${product.name}</h2>
                <p><strong>Menşei:</strong> ${product.originCountry}</p>
                <p><strong>Taşıma:</strong> ${product.transportType.charAt(0).toUpperCase() + product.transportType.slice(1)}</p>
                <p><strong>Mesafe:</strong> ${product.distanceKm} km</p>
                <p><strong>Kategori:</strong> ${product.category}</p>
            </div>

            <div class="emission-card">
                ${badge}
                <div class="score ${scoreClass}">
                    ${product.greenScore}<span style="font-size: 1.5rem; color: #666;">/100</span>
                </div>
                <div class="score-label">Green Score</div>
                
                <div class="emission-details">
                    <p><strong>Toplam Emisyon:</strong> ${product.carbonEmissionKg.toFixed(2)} kg CO₂e (her ${product.weightKg}kg için)</p>
                    
                    <div class="equivalency">
                        🚗 Bu, ortalama bir araba ile <strong>${product.equivalencyKm.toFixed(1)} km</strong> yol yapmaya eşdeğerdir.
                    </div>
                </div>
                
                <div class="educational-box">
                    <h4>Etki Değerlendirmesi</h4>
                    <p><strong>Etki:</strong> ${product.educationalContent.impact}</p>
                    <p><strong>İpucu:</strong> ${product.educationalContent.tips}</p>
                </div>
            </div>
        `;

        // Alternatifleri yükle
        renderAlternatives(product);
        
        // Trivia yükle
        renderTrivia();
    }
    
    // (AI-Powered) Alternatif Ürünleri Yükle
    function renderAlternatives(currentProduct) {
        const alternativesList = document.getElementById('alternatives-list');
        const alternativesSection = document.getElementById('alternatives-section');
        
        const alternatives = processedProducts
            .filter(p => 
                p.category === currentProduct.category && // Aynı kategori
                p.id !== currentProduct.id &&             // Kendisi değil
                p.greenScore > currentProduct.greenScore   // Daha iyi skora sahip
            )
            .sort((a, b) => b.greenScore - a.greenScore) // En iyiden sırala
            .slice(0, 3); // İlk 3'ü al

        if (alternatives.length === 0) {
            alternativesSection.style.display = 'none';
            return;
        }

        alternativesList.innerHTML = '';
        alternatives.forEach(product => {
            const card = document.createElement('a');
            card.href = `product.html?id=${product.id}`;
            card.className = 'product-card';
            
            const scoreClass = 'score-100'; // Alternatifler her zaman daha iyi
            const badge = '<div class="badge green">Daha İyi Seçim</div>';

            card.innerHTML = `
                <div class="product-card-content">
                    <h3>${product.name}</h3>
                    <p>${product.originCountry} (${product.transportType})</p>
                </div>
                <div class="product-card-footer">
                    ${badge}
                    <div class="score ${scoreClass}">${product.greenScore}/100</div>
                </div>
            `;
            alternativesList.appendChild(card);
        });
    }

    // (AI-Powered) Trivia Yükle
    function renderTrivia() {
        const triviaText = document.getElementById('trivia-text');
        if(triviaText) {
            const randomIndex = Math.floor(Math.random() * TRIVIA.length);
            triviaText.textContent = TRIVIA[randomIndex];
        }
    }


    // 6. Sayfa Yönlendirme ve Başlatma
    const success = await loadData();
    if (success) {
        if (document.getElementById('product-list')) {
            // Ana Sayfadayız
            populateCategoryFilter();
            renderProductList();
            
            // Filtre event listener'ları
            let currentFilter = 'all';
            let currentCategory = 'all';
            
            document.querySelectorAll('.filter-btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    document.querySelector('.filter-btn.active').classList.remove('active');
                    btn.classList.add('active');
                    currentFilter = btn.dataset.filter;
                    renderProductList(currentFilter, currentCategory);
                });
            });
            
            document.getElementById('category-filter').addEventListener('change', (e) => {
                currentCategory = e.target.value;
                renderProductList(currentFilter, currentCategory);
            });
            
        } else if (document.getElementById('product-detail-content')) {
            // Ürün Detay Sayfasındayız
            renderProductDetail();
        }
    } else {
        document.querySelector('main.container').innerHTML = '<h2>Hata</h2><p>Veriler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.</p>';
    }
});