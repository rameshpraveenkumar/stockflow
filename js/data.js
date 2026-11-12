/**
 * STOCKFLOW - Centralized Data Management & Business Logic
 * LocalStorage data store with realistic retail sample dataset.
 */

const DataStore = {
  KEYS: {
    PRODUCTS: 'stockflow_products',
    CATEGORIES: 'stockflow_categories',
    SUPPLIERS: 'stockflow_suppliers',
    PURCHASE_ORDERS: 'stockflow_purchase_orders',
    ACTIVITIES: 'stockflow_activities',
    SETTINGS: 'stockflow_settings'
  },

  // Default Categories
  defaultCategories: [
    { id: 'cat-1', name: 'Grains & Staples', description: 'Flours, rice, pulses, sugar and essential grains', productCount: 5, createdAt: '2026-10-10' },
    { id: 'cat-2', name: 'Oils & Condiments', description: 'Cooking oils, sauces, spices, dressings and salt', productCount: 5, createdAt: '2026-10-10' },
    { id: 'cat-3', name: 'Dairy & Beverages', description: 'Milks, teas, coffees, juices and plant-based milks', productCount: 5, createdAt: '2026-10-12' },
    { id: 'cat-4', name: 'Snacks & Confectionery', description: 'Biscuits, chocolates, cookies and cereals', productCount: 4, createdAt: '2026-10-12' },
    { id: 'cat-5', name: 'Personal Care & Hygiene', description: 'Soaps, shampoos, toothpaste and sanitizers', productCount: 5, createdAt: '2026-10-15' },
    { id: 'cat-6', name: 'Household & Cleaning', description: 'Detergents, floor cleaners, gels and paper towels', productCount: 4, createdAt: '2026-10-15' }
  ],

  // Default Suppliers
  defaultSuppliers: [
    {
      id: 'sup-1',
      name: 'Global Harvest Foods Ltd.',
      contactPerson: 'David Miller',
      email: 'sales@globalharvest.demo',
      phone: '+1 (555) 234-5678',
      address: '142 Grain Belt Blvd, Omaha, NE',
      status: 'Active',
      productsSupplied: 6
    },
    {
      id: 'sup-2',
      name: 'Golden Fields Agro Products',
      contactPerson: 'Sarah Jenkins',
      email: 'orders@goldenfields.demo',
      phone: '+1 (555) 345-6789',
      address: '88 Valley Industrial Park, Fresno, CA',
      status: 'Active',
      productsSupplied: 5
    },
    {
      id: 'sup-3',
      name: 'Apex Dairy & Beverage Co.',
      contactPerson: 'Michael Chang',
      email: 'supply@apexdairy.demo',
      phone: '+1 (555) 456-7890',
      address: '304 Meadowbrook Way, Madison, WI',
      status: 'Active',
      productsSupplied: 5
    },
    {
      id: 'sup-4',
      name: 'CrispBite Consumer Goods',
      contactPerson: 'Elena Rostova',
      email: 'distribution@crispbite.demo',
      phone: '+1 (555) 567-8901',
      address: '77 Logistics Loop, Chicago, IL',
      status: 'Active',
      productsSupplied: 4
    },
    {
      id: 'sup-5',
      name: 'PureLiving Hygiene & Care',
      contactPerson: 'Robert Hayes',
      email: 'corporate@pureliving.demo',
      phone: '+1 (555) 678-9012',
      address: '510 Wellness Parkway, Atlanta, GA',
      status: 'Active',
      productsSupplied: 5
    },
    {
      id: 'sup-6',
      name: 'EcoClean Essentials Corp',
      contactPerson: 'Claire Bennett',
      email: 'accounts@ecoclean.demo',
      phone: '+1 (555) 789-0123',
      address: '92 Green Chemistry Way, Columbus, OH',
      status: 'Active',
      productsSupplied: 4
    }
  ],

  // Default 28 Retail Products
  defaultProducts: [
    {
      id: 'prod-101',
      name: 'Royal Basmati Rice 5kg',
      sku: 'GRN-RICE-001',
      barcode: '8901030456101',
      categoryId: 'cat-1',
      categoryName: 'Grains & Staples',
      description: 'Long-grain premium aged basmati rice for daily and festive retail.',
      costPrice: 8.50,
      sellingPrice: 13.99,
      stock: 45,
      threshold: 15,
      supplierId: 'sup-1',
      supplierName: 'Global Harvest Foods Ltd.',
      unit: 'Bag (5kg)',
      icon: 'package'
    },
    {
      id: 'prod-102',
      name: 'Sunflower Cooking Oil 1L',
      sku: 'OIL-SUN-002',
      barcode: '8901030456102',
      categoryId: 'cat-2',
      categoryName: 'Oils & Condiments',
      description: 'Refined sunflower oil enriched with vitamins A & D.',
      costPrice: 2.20,
      sellingPrice: 3.75,
      stock: 8,
      threshold: 20, // LOW STOCK
      supplierId: 'sup-2',
      supplierName: 'Golden Fields Agro Products',
      unit: 'Bottle (1L)',
      icon: 'droplet'
    },
    {
      id: 'prod-103',
      name: 'Pure Refined Sugar 1kg',
      sku: 'GRN-SUG-003',
      barcode: '8901030456103',
      categoryId: 'cat-1',
      categoryName: 'Grains & Staples',
      description: 'Sparkling white cane crystal sugar in moisture-resistant pouch.',
      costPrice: 0.95,
      sellingPrice: 1.65,
      stock: 62,
      threshold: 25,
      supplierId: 'sup-1',
      supplierName: 'Global Harvest Foods Ltd.',
      unit: 'Pouch (1kg)',
      icon: 'box'
    },
    {
      id: 'prod-104',
      name: 'Whole Wheat Flour 5kg',
      sku: 'GRN-WHT-004',
      barcode: '8901030456104',
      categoryId: 'cat-1',
      categoryName: 'Grains & Staples',
      description: '100% whole grain stone-ground wheat flour with dietary fiber.',
      costPrice: 4.80,
      sellingPrice: 7.90,
      stock: 3,
      threshold: 12, // LOW STOCK (CRITICAL)
      supplierId: 'sup-1',
      supplierName: 'Global Harvest Foods Ltd.',
      unit: 'Bag (5kg)',
      icon: 'archive'
    },
    {
      id: 'prod-105',
      name: 'Fresh Dairy Milk 500ml',
      sku: 'DRY-MLK-005',
      barcode: '8901030456105',
      categoryId: 'cat-3',
      categoryName: 'Dairy & Beverages',
      description: 'Pasteurized homogenized full-cream cow milk.',
      costPrice: 0.65,
      sellingPrice: 1.15,
      stock: 24,
      threshold: 20,
      supplierId: 'sup-3',
      supplierName: 'Apex Dairy & Beverage Co.',
      unit: 'Pouch (500ml)',
      icon: 'coffee'
    },
    {
      id: 'prod-106',
      name: 'English Breakfast Tea 250g',
      sku: 'BEV-TEA-006',
      barcode: '8901030456106',
      categoryId: 'cat-3',
      categoryName: 'Dairy & Beverages',
      description: 'Rich and aromatic loose leaf black tea blend.',
      costPrice: 2.10,
      sellingPrice: 3.99,
      stock: 38,
      threshold: 15,
      supplierId: 'sup-3',
      supplierName: 'Apex Dairy & Beverage Co.',
      unit: 'Tin (250g)',
      icon: 'cup-soda'
    },
    {
      id: 'prod-107',
      name: 'Moisturizing Bath Soap (Pack of 4)',
      sku: 'HGY-SOP-007',
      barcode: '8901030456107',
      categoryId: 'cat-5',
      categoryName: 'Personal Care & Hygiene',
      description: 'Gentle almond milk and shea butter cleansing bar pack.',
      costPrice: 2.30,
      sellingPrice: 4.50,
      stock: 52,
      threshold: 20,
      supplierId: 'sup-5',
      supplierName: 'PureLiving Hygiene & Care',
      unit: 'Pack (4x100g)',
      icon: 'sparkles'
    },
    {
      id: 'prod-108',
      name: 'Active Laundry Detergent Powder 1kg',
      sku: 'CLN-DET-008',
      barcode: '8901030456108',
      categoryId: 'cat-6',
      categoryName: 'Household & Cleaning',
      description: 'Stain-lifting enzymatic detergent with fresh linen scent.',
      costPrice: 2.75,
      sellingPrice: 4.95,
      stock: 0,
      threshold: 15, // OUT OF STOCK
      supplierId: 'sup-6',
      supplierName: 'EcoClean Essentials Corp',
      unit: 'Box (1kg)',
      icon: 'layers'
    },
    {
      id: 'prod-109',
      name: 'Crunchy Butter Biscuits 200g',
      sku: 'SNK-BIS-009',
      barcode: '8901030456109',
      categoryId: 'cat-4',
      categoryName: 'Snacks & Confectionery',
      description: 'Golden oven-baked Danish butter biscuits.',
      costPrice: 1.10,
      sellingPrice: 2.25,
      stock: 75,
      threshold: 25,
      supplierId: 'sup-4',
      supplierName: 'CrispBite Consumer Goods',
      unit: 'Pack (200g)',
      icon: 'cookie'
    },
    {
      id: 'prod-110',
      name: 'All-Surface Floral Floor Cleaner 500ml',
      sku: 'CLN-FLR-010',
      barcode: '8901030456110',
      categoryId: 'cat-6',
      categoryName: 'Household & Cleaning',
      description: 'Disinfectant multi-surface cleaner kills 99.9% germs.',
      costPrice: 1.80,
      sellingPrice: 3.49,
      stock: 19,
      threshold: 15,
      supplierId: 'sup-6',
      supplierName: 'EcoClean Essentials Corp',
      unit: 'Bottle (500ml)',
      icon: 'spray-can'
    },
    {
      id: 'prod-111',
      name: 'Roasted Arabica Coffee Beans 250g',
      sku: 'BEV-COF-011',
      barcode: '8901030456111',
      categoryId: 'cat-3',
      categoryName: 'Dairy & Beverages',
      description: 'Single-origin medium roast Arabica whole coffee beans.',
      costPrice: 4.50,
      sellingPrice: 7.99,
      stock: 14,
      threshold: 12,
      supplierId: 'sup-3',
      supplierName: 'Apex Dairy & Beverage Co.',
      unit: 'Pouch (250g)',
      icon: 'coffee'
    },
    {
      id: 'prod-112',
      name: 'Organic Rolled Oats 1kg',
      sku: 'GRN-OAT-012',
      barcode: '8901030456112',
      categoryId: 'cat-1',
      categoryName: 'Grains & Staples',
      description: 'High-fiber heart-healthy quick rolled oats.',
      costPrice: 2.40,
      sellingPrice: 4.25,
      stock: 5,
      threshold: 18, // LOW STOCK
      supplierId: 'sup-1',
      supplierName: 'Global Harvest Foods Ltd.',
      unit: 'Jar (1kg)',
      icon: 'package'
    },
    {
      id: 'prod-113',
      name: 'Extra Virgin Olive Oil 500ml',
      sku: 'OIL-OLV-013',
      barcode: '8901030456113',
      categoryId: 'cat-2',
      categoryName: 'Oils & Condiments',
      description: 'Cold-pressed extra virgin culinary olive oil from Mediterranean olives.',
      costPrice: 5.60,
      sellingPrice: 9.80,
      stock: 22,
      threshold: 10,
      supplierId: 'sup-2',
      supplierName: 'Golden Fields Agro Products',
      unit: 'Glass Bottle (500ml)',
      icon: 'droplet'
    },
    {
      id: 'prod-114',
      name: 'Premium Dark Chocolate 70% 100g',
      sku: 'SNK-DKC-014',
      barcode: '8901030456114',
      categoryId: 'cat-4',
      categoryName: 'Snacks & Confectionery',
      description: 'Rich antioxidant Belgian dark cocoa bar.',
      costPrice: 1.45,
      sellingPrice: 2.95,
      stock: 40,
      threshold: 15,
      supplierId: 'sup-4',
      supplierName: 'CrispBite Consumer Goods',
      unit: 'Bar (100g)',
      icon: 'gift'
    },
    {
      id: 'prod-115',
      name: 'Antibacterial Dishwashing Gel 500ml',
      sku: 'CLN-DSH-015',
      barcode: '8901030456115',
      categoryId: 'cat-6',
      categoryName: 'Household & Cleaning',
      description: 'Lemon concentrate tough on grease gentle on hands.',
      costPrice: 1.25,
      sellingPrice: 2.50,
      stock: 31,
      threshold: 15,
      supplierId: 'sup-6',
      supplierName: 'EcoClean Essentials Corp',
      unit: 'Bottle (500ml)',
      icon: 'shield-check'
    },
    {
      id: 'prod-116',
      name: 'Kitchen Paper Towels (2-Pack)',
      sku: 'CLN-TOW-016',
      barcode: '8901030456116',
      categoryId: 'cat-6',
      categoryName: 'Household & Cleaning',
      description: 'Super absorbent 2-ply embossed paper rolls.',
      costPrice: 1.60,
      sellingPrice: 3.10,
      stock: 0,
      threshold: 12, // OUT OF STOCK
      supplierId: 'sup-6',
      supplierName: 'EcoClean Essentials Corp',
      unit: 'Pack (2 Rolls)',
      icon: 'file-text'
    },
    {
      id: 'prod-117',
      name: 'Pure Iodized Table Salt 1kg',
      sku: 'CND-SLT-017',
      barcode: '8901030456117',
      categoryId: 'cat-2',
      categoryName: 'Oils & Condiments',
      description: 'Vacuum-evaporated fine free-flowing iodized salt.',
      costPrice: 0.40,
      sellingPrice: 0.85,
      stock: 85,
      threshold: 30,
      supplierId: 'sup-2',
      supplierName: 'Golden Fields Agro Products',
      unit: 'Pouch (1kg)',
      icon: 'package'
    },
    {
      id: 'prod-118',
      name: 'Farm Fresh Tomato Ketchup 500g',
      sku: 'CND-KTC-018',
      barcode: '8901030456118',
      categoryId: 'cat-2',
      categoryName: 'Oils & Condiments',
      description: 'Thick and tangy ketchup made with sun-ripened tomatoes.',
      costPrice: 1.35,
      sellingPrice: 2.60,
      stock: 28,
      threshold: 15,
      supplierId: 'sup-2',
      supplierName: 'Golden Fields Agro Products',
      unit: 'Squeeze Bottle (500g)',
      icon: 'droplets'
    },
    {
      id: 'prod-119',
      name: 'Crispy Honey Corn Flakes 500g',
      sku: 'SNK-CRN-019',
      barcode: '8901030456119',
      categoryId: 'cat-4',
      categoryName: 'Snacks & Confectionery',
      description: 'Breakfast cereal enriched with 8 essential vitamins.',
      costPrice: 2.15,
      sellingPrice: 4.10,
      stock: 18,
      threshold: 12,
      supplierId: 'sup-4',
      supplierName: 'CrispBite Consumer Goods',
      unit: 'Box (500g)',
      icon: 'sun'
    },
    {
      id: 'prod-120',
      name: 'Organic Green Tea Bags (25s)',
      sku: 'BEV-GRN-020',
      barcode: '8901030456120',
      categoryId: 'cat-3',
      categoryName: 'Dairy & Beverages',
      description: 'Unfermented whole leaf soothing herbal green tea.',
      costPrice: 1.80,
      sellingPrice: 3.50,
      stock: 6,
      threshold: 15, // LOW STOCK
      supplierId: 'sup-3',
      supplierName: 'Apex Dairy & Beverage Co.',
      unit: 'Box (25 Bags)',
      icon: 'leaf'
    },
    {
      id: 'prod-121',
      name: 'Keratin Care Moisture Shampoo 400ml',
      sku: 'HGY-SHP-021',
      barcode: '8901030456121',
      categoryId: 'cat-5',
      categoryName: 'Personal Care & Hygiene',
      description: 'Sulfate-free nourishing botanical shampoo.',
      costPrice: 3.20,
      sellingPrice: 6.40,
      stock: 21,
      threshold: 10,
      supplierId: 'sup-5',
      supplierName: 'PureLiving Hygiene & Care',
      unit: 'Bottle (400ml)',
      icon: 'sparkles'
    },
    {
      id: 'prod-122',
      name: 'Herbal Clove & Mint Toothpaste 150g',
      sku: 'HGY-TPS-022',
      barcode: '8901030456122',
      categoryId: 'cat-5',
      categoryName: 'Personal Care & Hygiene',
      description: 'All-day cavity protection with natural clove extracts.',
      costPrice: 1.15,
      sellingPrice: 2.30,
      stock: 46,
      threshold: 20,
      supplierId: 'sup-5',
      supplierName: 'PureLiving Hygiene & Care',
      unit: 'Tube (150g)',
      icon: 'smile'
    },
    {
      id: 'prod-123',
      name: 'Pure Wildflower Blossom Honey 500g',
      sku: 'CND-HNY-023',
      barcode: '8901030456123',
      categoryId: 'cat-2',
      categoryName: 'Oils & Condiments',
      description: 'Unprocessed natural raw honey with wooden dipper.',
      costPrice: 3.80,
      sellingPrice: 6.90,
      stock: 12,
      threshold: 10,
      supplierId: 'sup-2',
      supplierName: 'Golden Fields Agro Products',
      unit: 'Glass Jar (500g)',
      icon: 'award'
    },
    {
      id: 'prod-124',
      name: 'Artisan Garam Masala Blend 100g',
      sku: 'GRN-GMS-024',
      barcode: '8901030456124',
      categoryId: 'cat-1',
      categoryName: 'Grains & Staples',
      description: 'Hand-roasted whole aromatic spice mix finely ground.',
      costPrice: 1.20,
      sellingPrice: 2.45,
      stock: 34,
      threshold: 15,
      supplierId: 'sup-1',
      supplierName: 'Global Harvest Foods Ltd.',
      unit: 'Box (100g)',
      icon: 'flame'
    },
    {
      id: 'prod-125',
      name: 'Instant Hand Sanitizer Gel 250ml',
      sku: 'HGY-SAN-025',
      barcode: '8901030456125',
      categoryId: 'cat-5',
      categoryName: 'Personal Care & Hygiene',
      description: '70% ethyl alcohol formula with aloe vera soothing agents.',
      costPrice: 1.50,
      sellingPrice: 2.99,
      stock: 29,
      threshold: 15,
      supplierId: 'sup-5',
      supplierName: 'PureLiving Hygiene & Care',
      unit: 'Pump Bottle (250ml)',
      icon: 'shield'
    },
    {
      id: 'prod-126',
      name: 'Choco-Chip Soft Cookies 150g',
      sku: 'SNK-CHK-026',
      barcode: '8901030456126',
      categoryId: 'cat-4',
      categoryName: 'Snacks & Confectionery',
      description: 'Buttery cookies loaded with rich semi-sweet chocolate morsels.',
      costPrice: 1.30,
      sellingPrice: 2.65,
      stock: 42,
      threshold: 18,
      supplierId: 'sup-4',
      supplierName: 'CrispBite Consumer Goods',
      unit: 'Pack (150g)',
      icon: 'cookie'
    },
    {
      id: 'prod-127',
      name: 'Organic Unsweetened Almond Milk 1L',
      sku: 'BEV-ALM-027',
      barcode: '8901030456127',
      categoryId: 'cat-3',
      categoryName: 'Dairy & Beverages',
      description: 'Dairy-free plant milk fortified with calcium and vitamin D.',
      costPrice: 1.90,
      sellingPrice: 3.49,
      stock: 4,
      threshold: 12, // LOW STOCK
      supplierId: 'sup-3',
      supplierName: 'Apex Dairy & Beverage Co.',
      unit: 'Tetra Pak (1L)',
      icon: 'cup-soda'
    },
    {
      id: 'prod-128',
      name: 'Disposable Nitrile Gloves (Pack of 50)',
      sku: 'HGY-GLV-028',
      barcode: '8901030456128',
      categoryId: 'cat-5',
      categoryName: 'Personal Care & Hygiene',
      description: 'Latex-free textured grip retail store & kitchen utility gloves.',
      costPrice: 3.50,
      sellingPrice: 6.99,
      stock: 16,
      threshold: 10,
      supplierId: 'sup-5',
      supplierName: 'PureLiving Hygiene & Care',
      unit: 'Box (50 pcs)',
      icon: 'hand'
    }
  ],

  // Default Purchase Orders
  defaultPurchaseOrders: [
    {
      id: 'PO-2026-081',
      supplierId: 'sup-2',
      supplierName: 'Golden Fields Agro Products',
      orderDate: '2026-10-25',
      expectedDate: '2026-10-29',
      status: 'Received',
      items: [
        { productId: 'prod-102', productName: 'Sunflower Cooking Oil 1L', qty: 40, unitCost: 2.20, receivedQty: 40, lineTotal: 88.00 },
        { productId: 'prod-113', productName: 'Extra Virgin Olive Oil 500ml', qty: 20, unitCost: 5.60, receivedQty: 20, lineTotal: 112.00 }
      ],
      totalAmount: 200.00,
      notes: 'Initial monthly restocking for high-turnover culinary oils.'
    },
    {
      id: 'PO-2026-082',
      supplierId: 'sup-1',
      supplierName: 'Global Harvest Foods Ltd.',
      orderDate: '2026-11-01',
      expectedDate: '2026-11-06',
      status: 'Pending',
      items: [
        { productId: 'prod-104', productName: 'Whole Wheat Flour 5kg', qty: 30, unitCost: 4.80, receivedQty: 0, lineTotal: 144.00 },
        { productId: 'prod-112', productName: 'Organic Rolled Oats 1kg', qty: 25, unitCost: 2.40, receivedQty: 0, lineTotal: 60.00 },
        { productId: 'prod-103', productName: 'Pure Refined Sugar 1kg', qty: 50, unitCost: 0.95, receivedQty: 0, lineTotal: 47.50 }
      ],
      totalAmount: 251.50,
      notes: 'Urgent restocking for critical staples running below safety threshold.'
    },
    {
      id: 'PO-2026-083',
      supplierId: 'sup-6',
      supplierName: 'EcoClean Essentials Corp',
      orderDate: '2026-11-02',
      expectedDate: '2026-11-07',
      status: 'Partially Received',
      items: [
        { productId: 'prod-108', productName: 'Active Laundry Detergent Powder 1kg', qty: 35, unitCost: 2.75, receivedQty: 20, lineTotal: 96.25 },
        { productId: 'prod-116', productName: 'Kitchen Paper Towels (2-Pack)', qty: 30, unitCost: 1.60, receivedQty: 0, lineTotal: 48.00 },
        { productId: 'prod-115', productName: 'Antibacterial Dishwashing Gel 500ml', qty: 25, unitCost: 1.25, receivedQty: 25, lineTotal: 31.25 }
      ],
      totalAmount: 175.50,
      notes: 'First batch delivered by courier; remaining carton delayed in transit.'
    },
    {
      id: 'PO-2026-084',
      supplierId: 'sup-3',
      supplierName: 'Apex Dairy & Beverage Co.',
      orderDate: '2026-11-03',
      expectedDate: '2026-11-08',
      status: 'Pending',
      items: [
        { productId: 'prod-120', productName: 'Organic Green Tea Bags (25s)', qty: 30, unitCost: 1.80, receivedQty: 0, lineTotal: 54.00 },
        { productId: 'prod-127', productName: 'Organic Unsweetened Almond Milk 1L', qty: 24, unitCost: 1.90, receivedQty: 0, lineTotal: 45.60 }
      ],
      totalAmount: 99.60,
      notes: 'Replenishing organic beverage aisle before weekend rush.'
    },
    {
      id: 'PO-2026-085',
      supplierId: 'sup-5',
      supplierName: 'PureLiving Hygiene & Care',
      orderDate: '2026-10-20',
      expectedDate: '2026-10-24',
      status: 'Received',
      items: [
        { productId: 'prod-107', productName: 'Moisturizing Bath Soap (Pack of 4)', qty: 40, unitCost: 2.30, receivedQty: 40, lineTotal: 92.00 },
        { productId: 'prod-122', productName: 'Herbal Clove & Mint Toothpaste 150g', qty: 30, unitCost: 1.15, receivedQty: 30, lineTotal: 34.50 }
      ],
      totalAmount: 126.50,
      notes: 'Regular bi-weekly personal care replenishment.'
    }
  ],

  // Default Activities
  defaultActivities: [
    { id: 'act-1', type: 'order_received', text: 'Received 20 units of Laundry Detergent for PO-2026-083', timestamp: '2 hours ago', icon: 'check-circle' },
    { id: 'act-2', type: 'order_created', text: 'Created Purchase Order PO-2026-084 with Apex Dairy', timestamp: 'Yesterday', icon: 'shopping-cart' },
    { id: 'act-3', type: 'stock_alert', text: 'Whole Wheat Flour 5kg dropped to 3 units (Threshold: 12)', timestamp: 'Yesterday', icon: 'alert-triangle' },
    { id: 'act-4', type: 'product_updated', text: 'Updated selling price for Royal Basmati Rice 5kg', timestamp: '2 days ago', icon: 'edit-3' },
    { id: 'act-5', type: 'order_received', text: 'Completed full receiving for PO-2026-081 from Golden Fields', timestamp: '4 days ago', icon: 'package-check' }
  ],

  // Default Settings
  defaultSettings: {
    profile: {
      storeName: 'StockFlow Superstore #104',
      retailerName: 'Alex Morgan',
      email: 'alex.morgan@retailer.demo',
      phone: '+1 (555) 789-2044',
      address: '742 Marketplace Boulevard, Suite 12B, Dallas, TX 75201',
      taxId: 'TX-892410-DEMO'
    },
    preferences: {
      currency: '$',
      currencyCode: 'USD',
      defaultThreshold: 15,
      costingMethod: 'FIFO',
      dateFormat: 'YYYY-MM-DD',
      autoStockAlerts: true
    },
    notifications: {
      lowStockAlerts: true,
      outOfStockAlerts: true,
      poStatusUpdates: true,
      emailDigestWeekly: true
    }
  },

  // Initialize and get data
  init() {
    if (!localStorage.getItem(this.KEYS.PRODUCTS)) {
      this.resetDemoData();
    }
  },

  resetDemoData() {
    localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(this.defaultProducts));
    localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(this.defaultCategories));
    localStorage.setItem(this.KEYS.SUPPLIERS, JSON.stringify(this.defaultSuppliers));
    localStorage.setItem(this.KEYS.PURCHASE_ORDERS, JSON.stringify(this.defaultPurchaseOrders));
    localStorage.setItem(this.KEYS.ACTIVITIES, JSON.stringify(this.defaultActivities));
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(this.defaultSettings));
  },

  // Products API
  getProducts() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.PRODUCTS)) || [];
    } catch (e) {
      return this.defaultProducts;
    }
  },

  saveProducts(products) {
    localStorage.setItem(this.KEYS.PRODUCTS, JSON.stringify(products));
    this.syncCategoryCounts();
  },

  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id) || null;
  },

  addProduct(productData) {
    const products = this.getProducts();
    const newProduct = {
      ...productData,
      id: 'prod-' + Date.now(),
      costPrice: parseFloat(productData.costPrice) || 0,
      sellingPrice: parseFloat(productData.sellingPrice) || 0,
      stock: parseInt(productData.stock, 10) || 0,
      threshold: parseInt(productData.threshold, 10) || 15
    };
    products.unshift(newProduct);
    this.saveProducts(products);
    this.addActivity('product_added', `Added new product "${newProduct.name}" (${newProduct.sku})`, 'plus-circle');
    return newProduct;
  },

  updateProduct(id, updatedFields) {
    const products = this.getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    products[index] = {
      ...products[index],
      ...updatedFields,
      costPrice: parseFloat(updatedFields.costPrice !== undefined ? updatedFields.costPrice : products[index].costPrice) || 0,
      sellingPrice: parseFloat(updatedFields.sellingPrice !== undefined ? updatedFields.sellingPrice : products[index].sellingPrice) || 0,
      stock: parseInt(updatedFields.stock !== undefined ? updatedFields.stock : products[index].stock, 10) || 0,
      threshold: parseInt(updatedFields.threshold !== undefined ? updatedFields.threshold : products[index].threshold, 10) || 15
    };

    this.saveProducts(products);
    this.addActivity('product_updated', `Updated product record for "${products[index].name}"`, 'edit-3');
    return products[index];
  },

  deleteProduct(id) {
    const products = this.getProducts();
    const product = products.find(p => p.id === id);
    if (!product) return false;

    const filtered = products.filter(p => p.id !== id);
    this.saveProducts(filtered);
    this.addActivity('product_deleted', `Deleted product "${product.name}" (${product.sku})`, 'trash-2');
    return true;
  },

  adjustStock(id, newQuantity, reason = 'Inventory Count') {
    const product = this.getProductById(id);
    if (!product) return false;
    const oldQty = product.stock;
    const diff = newQuantity - oldQty;
    this.updateProduct(id, { stock: newQuantity });
    this.addActivity('stock_adjusted', `Adjusted stock for "${product.name}" from ${oldQty} to ${newQuantity} (${reason})`, 'sliders');
    return true;
  },

  // Categories API
  getCategories() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.CATEGORIES)) || [];
    } catch (e) {
      return this.defaultCategories;
    }
  },

  saveCategories(categories) {
    localStorage.setItem(this.KEYS.CATEGORIES, JSON.stringify(categories));
  },

  addCategory(categoryData) {
    const categories = this.getCategories();
    const newCategory = {
      ...categoryData,
      id: 'cat-' + Date.now(),
      productCount: 0,
      createdAt: new Date().toISOString().split('T')[0]
    };
    categories.push(newCategory);
    this.saveCategories(categories);
    this.addActivity('category_added', `Created new category "${newCategory.name}"`, 'folder-plus');
    return newCategory;
  },

  updateCategory(id, updatedFields) {
    const categories = this.getCategories();
    const index = categories.findIndex(c => c.id === id);
    if (index === -1) return null;

    categories[index] = { ...categories[index], ...updatedFields };
    this.saveCategories(categories);

    // If name changed, update product categoryName
    if (updatedFields.name) {
      const products = this.getProducts();
      products.forEach(p => {
        if (p.categoryId === id) p.categoryName = updatedFields.name;
      });
      this.saveProducts(products);
    }

    return categories[index];
  },

  deleteCategory(id) {
    const products = this.getProducts();
    const assignedCount = products.filter(p => p.categoryId === id).length;
    if (assignedCount > 0) {
      return { success: false, message: `Cannot delete category. It is currently assigned to ${assignedCount} products. Please reassign them first.` };
    }

    const categories = this.getCategories();
    const cat = categories.find(c => c.id === id);
    const filtered = categories.filter(c => c.id !== id);
    this.saveCategories(filtered);
    this.addActivity('category_deleted', `Deleted category "${cat ? cat.name : id}"`, 'trash-2');
    return { success: true };
  },

  syncCategoryCounts() {
    const categories = this.getCategories();
    const products = this.getProducts();
    categories.forEach(cat => {
      cat.productCount = products.filter(p => p.categoryId === cat.id).length;
    });
    this.saveCategories(categories);
  },

  // Suppliers API
  getSuppliers() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.SUPPLIERS)) || [];
    } catch (e) {
      return this.defaultSuppliers;
    }
  },

  saveSuppliers(suppliers) {
    localStorage.setItem(this.KEYS.SUPPLIERS, JSON.stringify(suppliers));
  },

  addSupplier(supplierData) {
    const suppliers = this.getSuppliers();
    const newSupplier = {
      ...supplierData,
      id: 'sup-' + Date.now(),
      status: supplierData.status || 'Active',
      productsSupplied: 0
    };
    suppliers.push(newSupplier);
    this.saveSuppliers(suppliers);
    this.addActivity('supplier_added', `Added new supplier "${newSupplier.name}"`, 'user-plus');
    return newSupplier;
  },

  updateSupplier(id, updatedFields) {
    const suppliers = this.getSuppliers();
    const index = suppliers.findIndex(s => s.id === id);
    if (index === -1) return null;

    suppliers[index] = { ...suppliers[index], ...updatedFields };
    this.saveSuppliers(suppliers);

    // If name changed, update product supplierName
    if (updatedFields.name) {
      const products = this.getProducts();
      products.forEach(p => {
        if (p.supplierId === id) p.supplierName = updatedFields.name;
      });
      this.saveProducts(products);
    }

    return suppliers[index];
  },

  deleteSupplier(id) {
    const suppliers = this.getSuppliers();
    const sup = suppliers.find(s => s.id === id);
    const filtered = suppliers.filter(s => s.id !== id);
    this.saveSuppliers(filtered);
    this.addActivity('supplier_deleted', `Deleted supplier "${sup ? sup.name : id}"`, 'trash-2');
    return true;
  },

  // Purchase Orders API
  getPurchaseOrders() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.PURCHASE_ORDERS)) || [];
    } catch (e) {
      return this.defaultPurchaseOrders;
    }
  },

  savePurchaseOrders(orders) {
    localStorage.setItem(this.KEYS.PURCHASE_ORDERS, JSON.stringify(orders));
  },

  createPurchaseOrder(orderData) {
    const orders = this.getPurchaseOrders();
    const poNumber = 'PO-' + new Date().getFullYear() + '-' + String(orders.length + 101).padStart(3, '0');
    
    // Calculate total
    let total = 0;
    const items = (orderData.items || []).map(item => {
      const lineTotal = (parseFloat(item.qty) || 0) * (parseFloat(item.unitCost) || 0);
      total += lineTotal;
      return {
        ...item,
        qty: parseInt(item.qty, 10) || 1,
        unitCost: parseFloat(item.unitCost) || 0,
        receivedQty: 0,
        lineTotal: parseFloat(lineTotal.toFixed(2))
      };
    });

    const newPO = {
      id: poNumber,
      supplierId: orderData.supplierId,
      supplierName: orderData.supplierName,
      orderDate: orderData.orderDate || new Date().toISOString().split('T')[0],
      expectedDate: orderData.expectedDate || '',
      status: orderData.status || 'Pending',
      items: items,
      totalAmount: parseFloat(total.toFixed(2)),
      notes: orderData.notes || ''
    };

    orders.unshift(newPO);
    this.savePurchaseOrders(orders);
    this.addActivity('order_created', `Created Purchase Order ${newPO.id} for ${newPO.supplierName} ($${newPO.totalAmount.toFixed(2)})`, 'shopping-bag');
    return newPO;
  },

  /**
   * CRITICAL INVENTORY LOGIC:
   * Record received quantities for an order.
   * Increments product stock by the actual newly received quantity.
   * Prevents duplicate stock incrementation by tracking receivedQty per line.
   */
  receivePurchaseOrderItems(orderId, receivingLines) {
    // receivingLines is an array of: { productId, newlyReceivedQty }
    const orders = this.getPurchaseOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, message: 'Purchase order not found.' };

    const products = this.getProducts();
    let totalUnitsNewlyReceived = 0;
    let allLinesFullyReceived = true;

    order.items.forEach(item => {
      const match = receivingLines.find(l => l.productId === item.productId);
      if (match) {
        const newlyReceived = Math.max(0, parseInt(match.newlyReceivedQty, 10) || 0);
        const remainingToReceive = item.qty - (item.receivedQty || 0);
        const actualToAdd = Math.min(newlyReceived, remainingToReceive);

        if (actualToAdd > 0) {
          item.receivedQty = (item.receivedQty || 0) + actualToAdd;
          totalUnitsNewlyReceived += actualToAdd;

          // Increase product stock in inventory
          const prodIndex = products.findIndex(p => p.id === item.productId);
          if (prodIndex !== -1) {
            products[prodIndex].stock += actualToAdd;
          }
        }
      }

      if ((item.receivedQty || 0) < item.qty) {
        allLinesFullyReceived = false;
      }
    });

    // Update order status
    if (allLinesFullyReceived) {
      order.status = 'Received';
    } else if (order.items.some(i => (i.receivedQty || 0) > 0)) {
      order.status = 'Partially Received';
    }

    // Save changes
    this.savePurchaseOrders(orders);
    this.saveProducts(products);

    this.addActivity(
      'order_received',
      `Received ${totalUnitsNewlyReceived} units for ${order.id}. Current status: ${order.status}.`,
      'package-check'
    );

    return {
      success: true,
      order,
      totalUnitsNewlyReceived,
      status: order.status
    };
  },

  cancelPurchaseOrder(orderId, reason = '') {
    const orders = this.getPurchaseOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return false;
    if (order.status === 'Received') {
      return { success: false, message: 'Cannot cancel an order that has already been received.' };
    }

    order.status = 'Cancelled';
    order.cancelReason = reason;
    this.savePurchaseOrders(orders);
    this.addActivity('order_cancelled', `Cancelled Purchase Order ${order.id}`, 'x-circle');
    return { success: true };
  },

  // Activities API
  getActivities(limit = 10) {
    this.init();
    try {
      const list = JSON.parse(localStorage.getItem(this.KEYS.ACTIVITIES)) || [];
      return list.slice(0, limit);
    } catch (e) {
      return this.defaultActivities.slice(0, limit);
    }
  },

  addActivity(type, text, icon = 'info') {
    let activities = [];
    try {
      activities = JSON.parse(localStorage.getItem(this.KEYS.ACTIVITIES)) || [];
    } catch (e) {
      activities = [...this.defaultActivities];
    }

    const newActivity = {
      id: 'act-' + Date.now(),
      type,
      text,
      icon,
      timestamp: 'Just now',
      fullDate: new Date().toLocaleString()
    };

    activities.unshift(newActivity);
    if (activities.length > 50) activities = activities.slice(0, 50);
    localStorage.setItem(this.KEYS.ACTIVITIES, JSON.stringify(activities));
  },

  // Settings API
  getSettings() {
    this.init();
    try {
      return JSON.parse(localStorage.getItem(this.KEYS.SETTINGS)) || this.defaultSettings;
    } catch (e) {
      return this.defaultSettings;
    }
  },

  saveSettings(newSettings) {
    localStorage.setItem(this.KEYS.SETTINGS, JSON.stringify(newSettings));
    this.addActivity('settings_updated', 'Updated store profile and inventory settings', 'settings');
  },

  // Calculated Business Metrics
  calculateMetrics() {
    const products = this.getProducts();
    const orders = this.getPurchaseOrders();

    let totalProducts = products.length;
    let inStockCount = 0;
    let lowStockCount = 0;
    let outOfStockCount = 0;
    let totalStockValueCost = 0;
    let totalStockValueRetail = 0;
    let totalUnitsInStock = 0;

    products.forEach(p => {
      totalUnitsInStock += p.stock;
      totalStockValueCost += (p.stock * p.costPrice);
      totalStockValueRetail += (p.stock * p.sellingPrice);

      if (p.stock === 0) {
        outOfStockCount++;
      } else if (p.stock <= p.threshold) {
        lowStockCount++;
      } else {
        inStockCount++;
      }
    });

    const pendingOrders = orders.filter(o => o.status === 'Pending' || o.status === 'Partially Received');
    const receivedOrders = orders.filter(o => o.status === 'Received');
    let totalPurchaseValue = orders.reduce((sum, o) => sum + (o.status !== 'Cancelled' ? o.totalAmount : 0), 0);

    return {
      totalProducts,
      inStockCount,
      lowStockCount,
      outOfStockCount,
      totalStockValueCost: parseFloat(totalStockValueCost.toFixed(2)),
      totalStockValueRetail: parseFloat(totalStockValueRetail.toFixed(2)),
      totalUnitsInStock,
      totalOrders: orders.length,
      pendingOrdersCount: pendingOrders.length,
      receivedOrdersCount: receivedOrders.length,
      totalPurchaseValue: parseFloat(totalPurchaseValue.toFixed(2))
    };
  },

  // Stock Alerts list
  getStockAlerts() {
    const products = this.getProducts();
    return products
      .filter(p => p.stock <= p.threshold)
      .map(p => {
        const severity = p.stock === 0 ? 'Out of Stock' : (p.stock <= Math.floor(p.threshold / 2) ? 'Critical' : 'Low Stock');
        const suggestedReorder = Math.max(p.threshold * 2 - p.stock, 20);
        return {
          ...p,
          severity,
          suggestedReorder,
          estimatedReorderCost: parseFloat((suggestedReorder * p.costPrice).toFixed(2))
        };
      })
      .sort((a, b) => a.stock - b.stock); // Out of stock first
  },

  // Export full dataset as JSON
  exportDataAsJSON() {
    const backup = {
      exportedAt: new Date().toISOString(),
      store: this.getSettings().profile.storeName,
      products: this.getProducts(),
      categories: this.getCategories(),
      suppliers: this.getSuppliers(),
      purchaseOrders: this.getPurchaseOrders(),
      settings: this.getSettings()
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stockflow-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  // Export table rows as CSV
  exportToCSV(headers, rows, filename = 'stockflow-export.csv') {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${String(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
};

// Auto-initialize data store
DataStore.init();
