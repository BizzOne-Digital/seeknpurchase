import type {
  BlogDTO, CategoryDTO, FaqDTO, HomepageDTO, OfferDTO, ProductDTO, ServiceDTO, SettingsDTO, TestimonialDTO,
} from "./types";

export const IMG = {
  hero: "/images/hero/curated-retail-hero.webp",
  heroAlt: "/images/hero/wardrobe-alternate.webp",
  rack: "/images/site/curated-clothing-rack.webp",
  store: "/images/site/retail-interior.webp",
  essentials: "/images/categories/everyday-essentials.webp",
  gifts: "/images/categories/gifts.webp",
  giftAlt: "/images/site/gift-arrangement.webp",
  fashionStore: "/images/site/fashion-boutique.webp",
  editorial1: "/images/site/accessories-editorial.webp",
  editorial2: "/images/site/wardrobe-editorial.webp",
  shoppingBags: "/images/site/shopping-bags.webp",
};

export const DEFAULT_SETTINGS: SettingsDTO = {
  businessName: "SeeknPurchase",
  tagline: "Seek. Shop. Save.",
  email: "info@seeknpurchase.com",
  phone: "310-409-5842",
  social: { instagram: "", facebook: "", tiktok: "", pinterest: "", youtube: "" },
  seo: {
    defaultTitle: "SeeknPurchase | Seek More. Shop Smart. Save More.",
    defaultDescription: "Discover great finds, stylish accessories, and everyday essentials—all in one place. Shop SeeknPurchase.",
    ogImage: "/images/site/og-image.webp",
  },
  store: { currency: "USD", standardShipping: 6.99, expressShipping: 14.99, freeShippingThreshold: 75, taxRate: 0 },
};

export const DEFAULT_HOMEPAGE: HomepageDTO = {
  announcements: [
    { en: "Special Offers Available", es: "Ofertas Especiales Disponibles" },
    { en: "Free Shipping on Selected Orders", es: "Envío Gratis en Pedidos Seleccionados" },
    { en: "New Arrivals Available", es: "Nuevos Productos Disponibles" },
  ],
  hero: {
    titleLine1En: "Seek More.", titleLine2En: "Shop Smart.", titleLine3En: "Save More.",
    titleLine1Es: "Busca Más.", titleLine2Es: "Compra Inteligente.", titleLine3Es: "Ahorra Más.",
    subtitleEn: "Discover a curated selection of stylish accessories and everyday essentials for your lifestyle.",
    subtitleEs: "Descubre una selección de accesorios con estilo y esenciales diarios para tu estilo de vida.",
    image: IMG.hero,
    primaryLabelEn: "Shop Now", primaryLabelEs: "Comprar Ahora", primaryLink: "/shop",
    secondaryLabelEn: "Explore Collections", secondaryLabelEs: "Explorar Colecciones", secondaryLink: "/shop?view=collections",
  },
  categoryCards: [
    { titleEn: "Fashion Accessories", titleEs: "Accesorios de Moda", image: "/images/categories/fashion-accessories.webp", link: "/shop?category=fashion-accessories" },
    { titleEn: "Everyday Essentials", titleEs: "Esenciales Diarios", image: IMG.essentials, link: "/shop?category=everyday-essentials" },
    { titleEn: "Unique Finds", titleEs: "Hallazgos Únicos", image: "/images/categories/unique-finds.webp", link: "/shop?category=unique-finds" },
    { titleEn: "Gifts", titleEs: "Regalos", image: IMG.gifts, link: "/shop?category=gifts" },
  ],
  featuredProductSlugs: [],
  about: {
    labelEn: "About SeeknPurchase", labelEs: "Sobre SeeknPurchase",
    titleEn: "A Simpler, More Enjoyable Way to Shop", titleEs: "Una Forma Más Simple y Agradable de Comprar",
    bodyEn:
      "SeeknPurchase is a modern online destination for customers who value style, quality, affordability, and convenience.\n\nWe make online shopping simple and enjoyable by offering a curated selection of fashion accessories, everyday essentials, unique finds, and merchandise for every lifestyle.",
    bodyEs:
      "SeeknPurchase es un destino en línea moderno para clientes que valoran el estilo, la calidad, el buen precio y la comodidad.\n\nHacemos que comprar en línea sea simple y agradable con una selección de accesorios de moda, esenciales diarios, hallazgos únicos y artículos para cada estilo de vida.",
    image: IMG.rack,
  },
  blogSlugs: [],
  promo: {
    titleEn: "Join SeeknPurchase Offers", titleEs: "Únete a las Ofertas de SeeknPurchase",
    textEn: "Get exclusive deals, new arrivals, and special savings straight to your inbox.",
    textEs: "Recibe ofertas exclusivas, novedades y ahorros especiales en tu correo.",
    image: IMG.shoppingBags,
  },
};

export const DEMO_CATEGORIES: CategoryDTO[] = [
  { name: "Fashion Accessories", nameEs: "Accesorios de Moda", slug: "fashion-accessories", description: "Bags, sunglasses, scarves and finishing touches.", image: "/images/categories/fashion-accessories.webp", active: true, sortOrder: 1 },
  { name: "Everyday Essentials", nameEs: "Esenciales Diarios", slug: "everyday-essentials", description: "Comfortable, reliable pieces you'll reach for daily.", image: IMG.essentials, active: true, sortOrder: 2 },
  { name: "Unique Finds", nameEs: "Hallazgos Únicos", slug: "unique-finds", description: "Distinctive pieces you won't see everywhere.", image: "/images/categories/unique-finds.webp", active: true, sortOrder: 3 },
  { name: "Gifts", nameEs: "Regalos", slug: "gifts", description: "Thoughtful gifts for every occasion.", image: IMG.gifts, active: true, sortOrder: 4 },
];

const d = (daysAgo: number) => new Date(Date.now() - daysAgo * 86400000).toISOString();

export const DEMO_PRODUCTS: ProductDTO[] = [
  {
    name: "Classic Leather Tote", titleEs: "Bolso Tote de Cuero Clásico", slug: "classic-leather-tote", sku: "SP-BAG-001", category: "fashion-accessories",
    shortDescription: "A roomy, structured tote in smooth cognac leather for work, travel and weekends.",
    description: "Crafted from smooth, full-grain leather, the Classic Leather Tote is the bag you'll carry everywhere. A spacious interior fits a laptop, notebook and daily essentials, while an inner zip pocket keeps small items organized. Reinforced handles sit comfortably on the shoulder.",
    descriptionEs: "Elaborado en cuero liso de grano completo, el Tote Clásico es el bolso que llevarás a todas partes. Su amplio interior admite una laptop y tus esenciales diarios.",
    price: 69.99, compareAtPrice: 89.99, stock: 24, featured: true, bestSeller: true, onSale: true,
    images: ["/images/products/classic-leather-tote-1.webp", "/images/products/classic-leather-tote-2.webp"], rating: 4.5, reviewCount: 128, soldCount: 310,
    variants: [{ name: "Color", options: ["Cognac", "Black"] }], tags: ["bag", "leather", "tote"], createdAt: d(40),
  },
  {
    name: "Polarized Sunglasses", titleEs: "Gafas de Sol Polarizadas", slug: "polarized-sunglasses", sku: "SP-SUN-002", category: "fashion-accessories",
    shortDescription: "Timeless frames with polarized lenses that cut glare and protect your eyes.",
    description: "Polarized lenses reduce glare from water, roads and glass while offering 100% UV protection. The lightweight acetate frame is designed for all-day comfort with a classic silhouette that suits most face shapes.",
    price: 34.99, stock: 52, featured: true, newArrival: true, wholesalePrice: 18.99, wholesaleMinQty: 12,
    images: ["/images/products/polarized-sunglasses-1.webp", "/images/products/polarized-sunglasses-2.webp"], rating: 4.8, reviewCount: 94, soldCount: 205,
    tags: ["sunglasses", "summer"], createdAt: d(5),
  },
  {
    name: "Minimalist Watch", titleEs: "Reloj Minimalista", slug: "minimalist-watch", sku: "SP-WAT-003", category: "unique-finds",
    shortDescription: "A clean dial, slim case and genuine leather strap for understated style.",
    description: "The Minimalist Watch pairs a slim stainless-steel case with a clean, easy-to-read dial and a genuine leather strap. Water-resistant for everyday wear and finished with precise quartz movement.",
    price: 59.99, stock: 15, featured: true, bestSeller: true,
    images: ["/images/products/minimalist-watch-1.webp", "/images/products/minimalist-watch-2.webp"], rating: 4.6, reviewCount: 217, soldCount: 402,
    tags: ["watch", "gift"], createdAt: d(60),
  },
  {
    name: "Knit Sweater", titleEs: "Suéter de Punto", slug: "knit-sweater", sku: "SP-KNT-004", category: "everyday-essentials",
    shortDescription: "A soft, relaxed-fit knit in warm neutral tones for effortless layering.",
    description: "Made from a soft cotton-blend knit, this relaxed-fit sweater is cozy without the bulk. Ribbed cuffs and hem hold their shape wash after wash.",
    price: 39.99, compareAtPrice: 54.99, stock: 4, lowStockThreshold: 5, featured: true, onSale: true,
    images: ["/images/products/knit-sweater-1.webp", "/images/products/knit-sweater-2.webp"], rating: 4.4, reviewCount: 156, soldCount: 188,
    variants: [{ name: "Size", options: ["XS", "S", "M", "L", "XL"] }], tags: ["sweater", "knitwear"], createdAt: d(20),
  },
  {
    name: "Elegant Scarf", titleEs: "Bufanda Elegante", slug: "elegant-scarf", sku: "SP-SCF-005", category: "fashion-accessories",
    shortDescription: "A lightweight printed scarf that adds instant polish to any outfit.",
    description: "Lightweight and soft to the touch, the Elegant Scarf can be worn around the neck, in your hair or tied to a bag. A versatile accessory for every season.",
    price: 24.99, stock: 40, featured: true, newArrival: true,
    images: ["/images/products/elegant-scarf-1.webp", "/images/products/elegant-scarf-2.webp"], rating: 4.7, reviewCount: 88, soldCount: 96,
    tags: ["scarf", "gift"], createdAt: d(3),
  },
  {
    name: "Leather Card Wallet", titleEs: "Cartera de Cuero", slug: "leather-card-wallet", sku: "SP-WAL-006", category: "gifts",
    shortDescription: "Slim, durable and perfectly sized for your everyday cards.",
    description: "A slim leather wallet with six card slots and a center pocket for folded bills. Ages beautifully with daily use.",
    price: 29.99, stock: 60, bestSeller: true,
    images: ["/images/products/leather-card-wallet-1.webp"], rating: 4.6, reviewCount: 73, soldCount: 260, tags: ["wallet", "gift"], createdAt: d(30),
  },
  {
    name: "Delicate Jewelry Set", titleEs: "Juego de Joyería Delicada", slug: "delicate-jewelry-set", sku: "SP-JWL-007", category: "gifts",
    shortDescription: "Gold-tone pieces designed for everyday elegance and gifting.",
    description: "A coordinated set of gold-tone pieces that layer beautifully. Presented in a gift-ready box.",
    price: 44.99, compareAtPrice: 59.99, stock: 18, onSale: true, newArrival: true,
    images: ["/images/products/delicate-jewelry-set-1.webp"], rating: 4.9, reviewCount: 41, soldCount: 77, tags: ["jewelry", "gift"], createdAt: d(2),
  },
  {
    name: "Everyday Backpack", titleEs: "Mochila Diaria", slug: "everyday-backpack", sku: "SP-BPK-008", category: "everyday-essentials",
    shortDescription: "A clean, practical backpack with a padded laptop sleeve.",
    description: "Water-resistant fabric, a padded laptop sleeve and smart organization make this backpack ideal for commuting and travel.",
    price: 54.99, stock: 0,
    images: ["/images/products/everyday-backpack-1.webp"], rating: 4.5, reviewCount: 64, soldCount: 140, tags: ["backpack", "travel"], createdAt: d(45),
  },
  {
    name: "Signature Fragrance", titleEs: "Fragancia Exclusiva", slug: "signature-fragrance", sku: "SP-FRG-009", category: "unique-finds",
    shortDescription: "A warm, modern scent with notes of amber and soft florals.",
    description: "A versatile eau de parfum that moves easily from day to evening. 50 ml bottle.",
    price: 49.99, stock: 22, featured: false,
    images: ["/images/products/signature-fragrance-1.webp"], rating: 4.3, reviewCount: 39, soldCount: 58, tags: ["fragrance", "gift"], createdAt: d(12),
  },
  {
    name: "Classic White Sneakers", titleEs: "Tenis Blancos Clásicos", slug: "classic-white-sneakers", sku: "SP-SNK-010", category: "everyday-essentials",
    shortDescription: "Clean, comfortable sneakers that go with everything.",
    description: "A cushioned insole and durable sole make these an everyday staple.",
    price: 64.99, compareAtPrice: 79.99, stock: 30, onSale: true, bestSeller: true,
    images: ["/images/products/classic-white-sneakers-1.webp"], rating: 4.6, reviewCount: 112, soldCount: 330,
    variants: [{ name: "Size", options: ["6", "7", "8", "9", "10", "11"] }], tags: ["shoes"], createdAt: d(25),
  },
  {
    name: "Wide-Brim Fedora", titleEs: "Sombrero Fedora de Ala Ancha", slug: "wide-brim-fedora", sku: "SP-HAT-011", category: "fashion-accessories",
    shortDescription: "A structured wool-blend hat for a refined finishing touch.",
    description: "Shaped wool-blend felt with a grosgrain band. Adds instant polish to casual and dressed-up looks.",
    price: 39.99, stock: 12, newArrival: true,
    images: ["/images/products/wide-brim-fedora-1.webp"], rating: 4.4, reviewCount: 27, soldCount: 35, tags: ["hat"], createdAt: d(1),
  },
  {
    name: "Gift Box Collection", titleEs: "Colección Caja de Regalo", slug: "gift-box-collection", sku: "SP-GFT-012", category: "gifts",
    shortDescription: "A curated, beautifully wrapped box of everyday favorites.",
    description: "A ready-to-give box featuring a selection of our most-loved small accessories, wrapped with a satin ribbon.",
    price: 79.99, stock: 10, wholesalePrice: 54.99, wholesaleMinQty: 6,
    images: ["/images/products/gift-box-collection-1.webp", "/images/products/gift-box-collection-2.webp"], rating: 4.8, reviewCount: 52, soldCount: 81, tags: ["gift"], createdAt: d(15),
  },
  {
    name: "Classic Cotton T-Shirt", titleEs: "Camiseta Clásica de Algodón", slug: "classic-cotton-t-shirt", sku: "SP-TEE-013", category: "everyday-essentials",
    shortDescription: "A soft, everyday crew-neck tee. Order it plain or customize it with your own text, logo or design.",
    description: "Made from 100% ring-spun cotton with a comfortable regular fit. Choose a plain shirt or add your own print: pick the placement, print method and custom text, or share a link to your logo. Ideal for teams, events, businesses and gifts.",
    descriptionEs: "Hecha de 100% algodón peinado con un corte regular cómodo. Elige una camiseta lisa o personalízala con tu texto, logo o diseño.",
    price: 14.99, stock: 500, featured: true, newArrival: true, customizable: true, wholesalePrice: 7.99, wholesaleMinQty: 24,
    images: ["/images/products/classic-cotton-t-shirt-1.webp"], rating: 4.7, reviewCount: 64, soldCount: 290,
    variants: [{ name: "Size", options: ["S", "M", "L", "XL", "2XL"] }, { name: "Color", options: ["White", "Black", "Navy", "Heather Gray"] }],
    tags: ["t-shirt", "custom", "apparel"], createdAt: d(3),
  },
].map((p) => ({ status: "published" as const, lowStockThreshold: 5, ...p }));

export const DEMO_TESTIMONIALS: TestimonialDTO[] = [
  { name: "Emily R.", review: "Great selection and amazing prices! The quality is excellent, and the shopping experience was so easy.", reviewEs: "¡Gran selección y precios increíbles! La calidad es excelente y comprar fue muy fácil.", rating: 5 },
  { name: "Daniel M.", review: "I love the variety of accessories and everyday essentials. My order arrived quickly and in perfect condition!", reviewEs: "Me encanta la variedad de accesorios y esenciales. ¡Mi pedido llegó rápido y en perfectas condiciones!", rating: 5 },
  { name: "Sophia L.", review: "SeeknPurchase makes it simple to find stylish, affordable pieces. I'll definitely be shopping again!", reviewEs: "SeeknPurchase hace fácil encontrar piezas con estilo y accesibles. ¡Definitivamente volveré a comprar!", rating: 5 },
];

export const DEMO_FAQS: FaqDTO[] = [
  { questionEn: "How do I place an order?", answerEn: "Simply browse our shop, add your favorite items to the cart, and proceed to checkout. It's quick, easy, and secure.", questionEs: "¿Cómo hago un pedido?", answerEs: "Explora la tienda, agrega tus artículos favoritos al carrito y procede al pago. Es rápido, fácil y seguro." },
  { questionEn: "What payment methods do you accept?", answerEn: "We accept all major credit and debit cards through our secure payment processor, Stripe. Additional wallets such as Apple Pay and Google Pay may be available at checkout.", questionEs: "¿Qué métodos de pago aceptan?", answerEs: "Aceptamos las principales tarjetas de crédito y débito a través de Stripe, nuestro procesador de pagos seguro." },
  { questionEn: "How long does shipping take?", answerEn: "Standard shipping typically arrives within 3–7 business days. Express shipping arrives within 1–3 business days.", questionEs: "¿Cuánto tarda el envío?", answerEs: "El envío estándar suele llegar en 3–7 días hábiles. El exprés llega en 1–3 días hábiles." },
  { questionEn: "Can I return or exchange an item?", answerEn: "Yes. Unused items in their original condition can be returned or exchanged within 30 days of delivery. Visit our Return Policy for details.", questionEs: "¿Puedo devolver o cambiar un artículo?", answerEs: "Sí. Los artículos sin usar en su estado original pueden devolverse o cambiarse dentro de 30 días tras la entrega." },
  { questionEn: "How can I track my order?", answerEn: "Once your order ships, you'll receive an email with tracking details. You can also view your order status anytime in your account under My Orders.", questionEs: "¿Cómo rastreo mi pedido?", answerEs: "Cuando tu pedido se envíe, recibirás un correo con el número de rastreo. También puedes verlo en Mis Pedidos." },
];

export const DEMO_BLOG: BlogDTO[] = [
  {
    title: "5 Accessory Trends to Elevate Your Look", titleEs: "5 Tendencias en Accesorios para Elevar tu Estilo", slug: "5-accessory-trends-to-elevate-your-look", category: "Style Tips",
    excerpt: "From structured totes to statement sunglasses, these five accessory trends make it easy to refresh your wardrobe.",
    excerptEs: "Desde bolsos estructurados hasta gafas llamativas, estas cinco tendencias renuevan tu guardarropa.",
    content: "Accessories are the easiest way to refresh your style without rebuilding your wardrobe.\n\n## 1. The structured tote\nA clean, structured bag instantly makes any outfit look intentional.\n\n## 2. Classic sunglasses\nTimeless frames never go out of style—and polarized lenses keep you comfortable.\n\n## 3. Minimalist watches\nA slim watch adds polish to both casual and dressed-up looks.\n\n## 4. Silk-feel scarves\nTie one on your bag, wear it in your hair, or wrap it at the neck.\n\n## 5. Delicate gold jewelry\nLayer simple pieces for an effortless finish.",
    featuredImage: "/images/blog/5-accessory-trends-to-elevate-your-look.webp", author: "SeeknPurchase Team", publishedAt: "2025-01-20T10:00:00.000Z",
  },
  {
    title: "Everyday Essentials You'll Always Reach For", titleEs: "Esenciales Diarios que Siempre Usarás", slug: "everyday-essentials-you-will-always-reach-for", category: "Lifestyle",
    excerpt: "The reliable, comfortable pieces that make busy days easier—and look good doing it.",
    excerptEs: "Las piezas cómodas y confiables que facilitan los días ocupados.",
    content: "Great essentials are the foundation of a wardrobe that works hard for you.\n\n## A soft knit sweater\nLayer it over anything from spring through winter.\n\n## Clean white sneakers\nComfortable, versatile and easy to style.\n\n## A practical backpack\nKeep your laptop and daily items organized on the go.",
    featuredImage: "/images/blog/everyday-essentials-you-will-always-reach-for.webp", author: "SeeknPurchase Team", publishedAt: "2025-01-15T10:00:00.000Z",
  },
  {
    title: "The Ultimate Gift Guide for Every Occasion", titleEs: "La Guía de Regalos Definitiva para Cada Ocasión", slug: "the-ultimate-gift-guide-for-every-occasion", category: "Gift Guide",
    excerpt: "Thoughtful, stylish gift ideas for birthdays, holidays and just-because moments.",
    excerptEs: "Ideas de regalo con estilo para cumpleaños, fiestas y cualquier momento.",
    content: "Finding the right gift doesn't have to be stressful.\n\n## For the trendsetter\nPolarized sunglasses or an elegant scarf.\n\n## For the professional\nA minimalist watch or a leather card wallet.\n\n## For someone special\nOur Delicate Jewelry Set arrives gift-ready.",
    featuredImage: "/images/blog/the-ultimate-gift-guide-for-every-occasion.webp", author: "SeeknPurchase Team", publishedAt: "2025-01-10T10:00:00.000Z",
  },
];

export const DEMO_SERVICES: ServiceDTO[] = [
  { titleEn: "Online Shopping", titleEs: "Compras en Línea", descriptionEn: "Explore our online store and discover products from the comfort of your home.", descriptionEs: "Explora nuestra tienda y descubre productos desde la comodidad de tu hogar.", icon: "Store" },
  { titleEn: "Fashion Accessories", titleEs: "Accesorios de Moda", descriptionEn: "Discover stylish accessories for different occasions and preferences.", descriptionEs: "Descubre accesorios con estilo para distintas ocasiones y gustos.", icon: "Glasses" },
  { titleEn: "General Merchandise", titleEs: "Mercancía General", descriptionEn: "Shop everyday products and unique finds.", descriptionEs: "Compra productos de uso diario y hallazgos únicos.", icon: "Package" },
  { titleEn: "Product Discovery", titleEs: "Descubrimiento de Productos", descriptionEn: "Explore new products, styles, trends, and everyday essentials.", descriptionEs: "Explora nuevos productos, estilos, tendencias y esenciales.", icon: "Search", showOnHome: true },
  { titleEn: "Convenient Online Ordering", titleEs: "Pedidos en Línea Convenientes", descriptionEn: "Shop anytime, anywhere with a seamless shopping experience.", descriptionEs: "Compra cuando quieras, desde donde quieras, con una experiencia fluida.", icon: "ShoppingCart", showOnHome: true },
  { titleEn: "Customer Support", titleEs: "Atención al Cliente", descriptionEn: "Friendly and responsive assistance with product and order inquiries.", descriptionEs: "Asistencia amable y rápida con consultas de productos y pedidos.", icon: "Headphones", showOnHome: true },
  { titleEn: "Curated Shopping", titleEs: "Compras Seleccionadas", descriptionEn: "Discover handpicked items selected for style, quality, and value.", descriptionEs: "Descubre artículos seleccionados por estilo, calidad y valor.", icon: "Layers", showOnHome: true },
];

export const DEMO_OFFERS: OfferDTO[] = [
  { title: "Seasonal Sale — Up to 25% Off", titleEs: "Venta de Temporada — Hasta 25% de Descuento", description: "Save on select bags, knitwear and jewelry while supplies last.", descriptionEs: "Ahorra en bolsos, tejidos y joyería seleccionados.", discountType: "percentage", discountValue: 25, image: IMG.fashionStore, link: "/shop?sale=1" },
  { title: "Free Shipping Over $75", titleEs: "Envío Gratis en Compras Mayores a $75", description: "Enjoy free standard shipping on qualifying orders.", descriptionEs: "Disfruta de envío estándar gratis en pedidos elegibles.", discountType: "free_shipping", discountValue: 0, image: IMG.shoppingBags, link: "/shop" },
];
