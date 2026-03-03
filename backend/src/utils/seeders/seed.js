// import bcrypt from 'bcrypt';
// import models from '../../models/index.js';

// const { User, University, Category, Product, ProductImage, Like, Comment } = models;

// // ─── Curated product-only Unsplash photo IDs ─────────────────────────────────
// // All photos are object/product shots – no people.
// const img = (id) => `https://images.unsplash.com/photo-${id}?w=600&fit=crop&auto=format&q=80`;

// const IMGS = {
//   // ── Laptops / Computers ───────────────────────────────────────────────────
//   macbook1:    img('1611186871348-b1ce696e52c9'), // MacBook Air silver, angled
//   macbook2:    img('1517336714731-489689fd1ca8'), // MacBook keyboard close-up
//   macbook3:    img('1484788984921-03950022c9ef'), // laptop open top-down
//   laptop1:     img('1496181133206-80ce9b88a853'), // generic laptop open
//   laptop2:     img('1593642632559-0c6d3fc62b89'), // laptop side view
//   laptop3:     img('1525547719571-a2d4ac8945e2'), // laptop flat lay

//   // ── iPad / Tablet ─────────────────────────────────────────────────────────
//   ipad1:       img('1544244015-0df4b3ffc6b0'), // iPad on white surface
//   ipad2:       img('1561154464-02ce557a7996'), // iPad with Smart Keyboard
//   ipad3:       img('1587033411391-5d9e51cce1ef'), // iPad flat lay with stylus

//   // ── Mouse ─────────────────────────────────────────────────────────────────
//   mouse1:      img('1527443224154-c4a3942d3acf'), // Logitech mouse, white bg
//   mouse2:      img('1563297007-a52e5f2bd6e1'), // gaming mouse RGB close-up
//   mouse3:      img('1615750185825-cd72e29e23ab'), // mouse on pad overhead

//   // ── Keyboard ─────────────────────────────────────────────────────────────
//   keyboard1:   img('1541140532154-b024d705b90a'), // mechanical keyboard RGB
//   keyboard2:   img('1511467687858-23d96c32e4ae'), // keyboard flat lay
//   keyboard3:   img('1587829741301-dc798b83add3'), // keys close-up

//   // ── Monitor ──────────────────────────────────────────────────────────────
//   monitor1:    img('1527443195645-1133f7f28990'), // monitor on desk
//   monitor2:    img('1585792180666-f7347c490ee2'), // monitor screen glow
//   monitor3:    img('1593640495253-23196b27a87f'), // monitor side angle

//   // ── Headphones ───────────────────────────────────────────────────────────
//   headphones1: img('1505740420928-5e560c06d30e'), // Sony headphones flat lay
//   headphones2: img('1484704849700-f032a568e944'), // headphones overhead
//   headphones3: img('1546435770-a3e426bf472b'), // headphones on stand

//   // ── Smartphone ───────────────────────────────────────────────────────────
//   phone1:      img('1598327105666-5b89351aff97'), // phone flat lay back
//   phone2:      img('1565849904461-04a58ad377e0'), // phone screen on
//   phone3:      img('1512054502232-10a0a035d672'), // phone top-down

//   // ── Charger / Accessories ────────────────────────────────────────────────
//   charger1:    img('1609091839311-d5365f9ff1c5'), // USB-C charger
//   charger2:    img('1588508065123-287b28d13a43'), // USB-C cable flat
//   charger3:    img('1583863788434-e58a36330cf3'), // power brick overhead

//   // ── GoPro ────────────────────────────────────────────────────────────────
//   gopro1:      img('1526170375885-4d8ecf77b99f'), // GoPro front view
//   gopro2:      img('1583743814966-8d4f4a23b3fc'), // GoPro with mounts
//   gopro3:      img('1568605114967-8130f3a36994'), // action cam accessories

//   // ── Raspberry Pi / Arduino ────────────────────────────────────────────────
//   raspi1:      img('1550751827-4bd374c3f58b'), // Raspberry Pi board
//   raspi2:      img('1518770660439-4636190af475'), // circuit board close-up
//   arduino1:    img('1553406830-ef2513450d76'), // Arduino board

//   // ── Speaker ──────────────────────────────────────────────────────────────
//   speaker1:    img('1608043152269-423dbba4e7e1'), // JBL Flip speaker
//   speaker2:    img('1545454782-26de5b5e0cb7'), // portable speaker flat lay
//   speaker3:    img('1558756393-f69ade757b8d'), // speaker on surface

//   // ── Books ─────────────────────────────────────────────────────────────────
//   book1:       img('1532012197367-2836fd329e24'), // stack of books
//   book2:       img('1456513080510-7bf3a84b82f8'), // books on shelf
//   book3:       img('1589998059171-988d887df646'), // open textbook
//   book4:       img('1512820790803-83ca734da794'), // single book flat
//   book5:       img('1543002588-bfa74002ed7e'), // book cover close-up
//   book6:       img('1521587760476-6c12a4b040da'), // library books spine

//   // ── Drawing Tablet ───────────────────────────────────────────────────────
//   tablet1:     img('1585314062604-1a357de8b000'), // Wacom tablet flat
//   tablet2:     img('1517694712202-14dd9538aa97'), // tablet and stylus

//   // ── Pencil / Stationery ──────────────────────────────────────────────────
//   pencil1:     img('1583485088034-697b5bc54ccd'), // pencil set flat lay
//   pencil2:     img('1497032628192-86f99bcd76bc'), // stationery overhead

//   // ── Hoodie / Clothing ────────────────────────────────────────────────────
//   hoodie1:     img('1556821840-3a63f15732ce'), // hoodie flat lay
//   hoodie2:     img('1620799140408-edc6dcb6d633'), // hoodie folded top-down
//   hoodie3:     img('1578587018452-892bacefd3d2'), // hoodie hanging

//   // ── Shoes ─────────────────────────────────────────────────────────────────
//   shoes1:      img('1542291026-7eec264c27ff'), // Nike AF1 side view
//   shoes2:      img('1600185365926-3a2ce3cdb9eb'), // sneaker flat lay
//   shoes3:      img('1491553895911-0055eca6402d'), // sneaker top-down

//   // ── Backpack ──────────────────────────────────────────────────────────────
//   bag1:        img('1553062407-98eeb64c6a62'), // Adidas backpack front
//   bag2:        img('1622560480654-d96214fdc887'), // backpack side view
//   bag3:        img('1547949003-9792a18a2601'), // open backpack overhead

//   // ── Shirts ────────────────────────────────────────────────────────────────
//   shirts1:     img('1489987707025-afc232f7ea0f'), // shirts flat lay
//   shirts2:     img('1516762689617-e1cffcef479d'), // folded shirts stack
//   shirts3:     img('1581655353564-df123a1eb820'), // t-shirt flat lay

//   // ── Watch ─────────────────────────────────────────────────────────────────
//   watch1:      img('1523275335684-37898b6baf30'), // G-Shock flat lay
//   watch2:      img('1548169268-bea17a1e5b3a'), // watch close-up
//   watch3:      img('1612817288484-6f916006741a'), // watch on surface

//   // ── Sunglasses ────────────────────────────────────────────────────────────
//   sunglasses1: img('1572635196237-14b3f281503f'), // Rayban flat lay
//   sunglasses2: img('1508296695146-257a814a5d73'), // sunglasses overhead
//   sunglasses3: img('1618354691438-25bc04584c23'), // sunglasses side angle

//   // ── Sling Bag ─────────────────────────────────────────────────────────────
//   sling1:      img('1548036328-c9fa89d128fa'), // sling bag front
//   sling2:      img('1581605405669-fcdf81165afa'), // sling bag flat lay

//   // ── Desk Lamp ─────────────────────────────────────────────────────────────
//   lamp1:       img('1534073828943-f801091bb18c'), // desk lamp on
//   lamp2:       img('1507473885765-e6ed057f782c'), // lamp close-up
//   lamp3:       img('1555680202-1f01cb87e18c'), // lamp overhead

//   // ── Rice Cooker ───────────────────────────────────────────────────────────
//   ricecooker1: img('1558618047-3d7c6f34e61d'), // rice cooker side
//   ricecooker2: img('1556909114-f6e7ad7d3136'), // rice cooker top open

//   // ── Fan ───────────────────────────────────────────────────────────────────
//   fan1:        img('1585771724684-38269d6639fd'), // USB desk fan
//   fan2:        img('1590419401-4c6a3a244ad7'), // small fan overhead

//   // ── Mini Fridge ───────────────────────────────────────────────────────────
//   fridge1:     img('1584568694244-14fbdf83bd30'), // mini fridge door open
//   fridge2:     img('1571175443880-49e1d25b2bc5'), // fridge interior

//   // ── Desk / Table ─────────────────────────────────────────────────────────
//   desk1:       img('1555041469-a586c61ea9bc'), // foldable desk
//   desk2:       img('1593642634315-48f5414c3ad9'), // desk surface clean

//   // ── Power Strip ───────────────────────────────────────────────────────────
//   powerstrip1: img('1519389950473-47ba0277781c'), // extension cord flat
//   powerstrip2: img('1547190503-47c10c9c1e3a'), // power strip overhead

//   // ── Yoga Mat ──────────────────────────────────────────────────────────────
//   yogamat1:    img('1603988363607-e1e4a66962c6'), // yoga mat rolled
//   yogamat2:    img('1518611012118-696072aa579a'), // mat flat lay

//   // ── Motorcycle ───────────────────────────────────────────────────────────
//   moto1:       img('1568772585407-9361f9bf3a87'), // Honda Dream side view
//   moto2:       img('1558981403-c5f9899a28bc'), // motorcycle parked
//   moto3:       img('1558981806-ec527fa27326'), // moto engine close

//   // ── Scooter ───────────────────────────────────────────────────────────────
//   scooter1:    img('1558618666-fcd25c85cd64'), // Yamaha Fino scooter
//   scooter2:    img('1609775238070-1cf5a9cc0d6d'), // scooter parked side

//   // ── Bicycle ───────────────────────────────────────────────────────────────
//   bicycle1:    img('1485965120184-e220f721d03e'), // hybrid bicycle
//   bicycle2:    img('1532298229144-0ec0c57515c7'), // bicycle side view
//   bicycle3:    img('1507035895418-e1996dad0a01'), // bike close-up

//   // ── E-Scooter ─────────────────────────────────────────────────────────────
//   escooter1:   img('1615397349754-cfa2066a298e'), // Xiaomi e-scooter
//   escooter2:   img('1558981406-c5a29a4b5f3e'), // e-scooter handlebar

//   // ── Dumbbells ─────────────────────────────────────────────────────────────
//   dumbbell2:   img('1583454110551-21f2fa2afe61'), // adjustable dumbbell
//   dumbbell3:   img('1534438327835-ff54d9b5c9b4'), // weights flat lay

//   // ── Basketball ────────────────────────────────────────────────────────────
//   ball3:       img('1517466787-5d9f7923e7a3'), // ball close texture

//   // ── Badminton ─────────────────────────────────────────────────────────────
//   badminton1:  img('1626224583764-f87db24ac4ea'), // badminton rackets
//   badminton2:  img('1599391016776-eb8e7c7c0143'), // shuttlecock and racket

//   // ── Jump Rope ─────────────────────────────────────────────────────────────
//   jumprope1:   img('1434596922112-19c563067271'), // jump rope flat lay
//   jumprope2:   img('1598575285-8f4a34ac0ae4'), // rope detail close-up

//   // ── Coffee Machine ────────────────────────────────────────────────────────
//   coffee2:     img('1545665277-4173d2ea9e8e'), // coffee pods flat lay
//   coffee3:     img('1495474472287-4d71bcdd2085'), // machine with cup

//   // ── Water Bottle ──────────────────────────────────────────────────────────
//   bottle1:     img('1536939459926-301728717817'), // Hydro Flask
//   bottle2:     img('1602143407151-7111542de6e8'), // bottle overhead
//   bottle3:     img('1551538827-9c037cb4f32a'), // bottle side flat

//   // ── Tripod / Ring Light ───────────────────────────────────────────────────
//   tripod3:     img('1598387993441-a364f854b322'), // light stand

//   // ── Projector ─────────────────────────────────────────────────────────────
//   projector1:  img('1478720568477-152d9b164e26'), // projector side
//   projector2:  img('1509281373149-e957c6296406'), // projector beam
//   projector3:  img('1540575467063-ba5571b8e95d'), // projector flat lay

//   // ── Bundle / Misc ─────────────────────────────────────────────────────────
//   bundle1:     img('1484820540491-e6e29b9d0476'), // desk accessories flat
//   bundle2:     img('1527864550417-7fd91fc51a46'), // stationery bundle
//   bundle3:     img('1483058712412-4245e9b90334'), // workspace items
// };

// const seedData = async () => {
//   try {
//     console.log('🇰🇭 Starting Cambodia-based database seeding...');

//     // ─────────────────────────────────────────────
//     // 1. UNIVERSITIES
//     // ─────────────────────────────────────────────
//     const universities = await University.bulkCreate([
//       { name: 'Cambodia Academy of Digital Technology', domain: 'cadt.edu.kh' },
//       { name: 'Royal University of Phnom Penh',         domain: 'rupp.edu.kh' },
//       { name: 'Institute of Technology of Cambodia',    domain: 'itc.edu.kh' },
//       { name: 'American University of Phnom Penh',      domain: 'aupp.edu.kh' },
//       { name: 'Paragon International University',       domain: 'paragoniu.edu.kh' },
//     ]);
//     console.log(`✅ Created ${universities.length} universities`);

//     // ─────────────────────────────────────────────
//     // 2. USERS
//     // ─────────────────────────────────────────────
//     const hashedPassword = await bcrypt.hash('password123', 10);
//     const cadtId = universities[0].id;

//     const usersData = [
//       { full_name: 'Sophea Srun',     email: 'sophea.srun@student.cadt.edu.kh',     profile_image: 'https://i.pravatar.cc/150?u=sophea',    role: 'user'  },
//       { full_name: 'Ratana Meas',     email: 'ratana.meas@student.cadt.edu.kh',     profile_image: 'https://i.pravatar.cc/150?u=ratana',    role: 'user'  },
//       { full_name: 'Serey Roth',      email: 'serey.roth@student.cadt.edu.kh',      profile_image: 'https://i.pravatar.cc/150?u=serey',     role: 'user'  },
//       { full_name: 'Bopha Chan',      email: 'bopha.chan@student.cadt.edu.kh',       profile_image: 'https://i.pravatar.cc/150?u=bopha',     role: 'user'  },
//       { full_name: 'Dara Vong',       email: 'dara.vong@student.cadt.edu.kh',       profile_image: 'https://i.pravatar.cc/150?u=dara',      role: 'user'  },
//       { full_name: 'Kimly Pich',      email: 'kimly.pich@student.cadt.edu.kh',      profile_image: 'https://i.pravatar.cc/150?u=kimly',     role: 'user'  },
//       { full_name: 'Visal Keo',       email: 'visal.keo@student.cadt.edu.kh',       profile_image: 'https://i.pravatar.cc/150?u=visal',     role: 'user'  },
//       { full_name: 'Chanthy Sok',     email: 'chanthy.sok@student.cadt.edu.kh',     profile_image: 'https://i.pravatar.cc/150?u=chanthy',   role: 'user'  },
//       { full_name: 'Pisach Heng',     email: 'pisach.heng@student.cadt.edu.kh',     profile_image: 'https://i.pravatar.cc/150?u=pisach',    role: 'user'  },
//       { full_name: 'Sreymom Lim',     email: 'sreymom.lim@student.cadt.edu.kh',     profile_image: 'https://i.pravatar.cc/150?u=sreymom',   role: 'user'  },
//       { full_name: 'Makara Tep',      email: 'makara.tep@student.cadt.edu.kh',      profile_image: 'https://i.pravatar.cc/150?u=makara',    role: 'user'  },
//       { full_name: 'Dina Oun',        email: 'dina.oun@student.cadt.edu.kh',        profile_image: 'https://i.pravatar.cc/150?u=dina',      role: 'user'  },
//       { full_name: 'Ratha Kong',      email: 'ratha.kong@student.cadt.edu.kh',      profile_image: 'https://i.pravatar.cc/150?u=ratha',     role: 'user'  },
//       { full_name: 'Leakena Sam',     email: 'leakena.sam@student.cadt.edu.kh',     profile_image: 'https://i.pravatar.cc/150?u=leakena',   role: 'user'  },
//       { full_name: 'Kosal Nhem',      email: 'kosal.nhem@student.cadt.edu.kh',      profile_image: 'https://i.pravatar.cc/150?u=kosal',     role: 'user'  },
//       { full_name: 'Sreynich Ros',    email: 'sreynich.ros@student.cadt.edu.kh',    profile_image: 'https://i.pravatar.cc/150?u=sreynich',  role: 'user'  },
//       { full_name: 'Panha Chum',      email: 'panha.chum@student.cadt.edu.kh',      profile_image: 'https://i.pravatar.cc/150?u=panha',     role: 'user'  },
//       { full_name: 'Vicheka Pen',     email: 'vicheka.pen@student.cadt.edu.kh',     profile_image: 'https://i.pravatar.cc/150?u=vicheka',   role: 'user'  },
//       { full_name: 'Socheata Ky',     email: 'socheata.ky@student.cadt.edu.kh',     profile_image: 'https://i.pravatar.cc/150?u=socheata',  role: 'user'  },
//       { full_name: 'Bunthoeun Chhay', email: 'bunthoeun.chhay@student.cadt.edu.kh', profile_image: 'https://i.pravatar.cc/150?u=bunthoeun', role: 'user'  },
//       { full_name: 'Sreyleak Mao',    email: 'sreyleak.mao@student.cadt.edu.kh',    profile_image: 'https://i.pravatar.cc/150?u=sreyleak',  role: 'user'  },
//       { full_name: 'Chanrotha Yim',   email: 'chanrotha.yim@student.cadt.edu.kh',   profile_image: 'https://i.pravatar.cc/150?u=chanrotha', role: 'user'  },
//       { full_name: 'Sovannara Kang',  email: 'sovannara.kang@student.cadt.edu.kh',  profile_image: 'https://i.pravatar.cc/150?u=sovannara', role: 'user'  },
//       { full_name: 'Pisey Nget',      email: 'pisey.nget@student.cadt.edu.kh',      profile_image: 'https://i.pravatar.cc/150?u=pisey',     role: 'user'  },
//       { full_name: 'Menghour Kuy',    email: 'menghour.kuy@student.cadt.edu.kh',    profile_image: 'https://i.pravatar.cc/150?u=menghour',  role: 'user'  },
//       { full_name: 'Admin Nisit',     email: 'admin@student.cadt.edu.kh',           profile_image: 'https://i.pravatar.cc/150?u=admin',     role: 'admin' },
//     ];

//     const users = await User.bulkCreate(
//       usersData.map(u => ({
//         ...u,
//         password_hash: hashedPassword,
//         password_set: true,
//         provider: 'local',
//         university_id: cadtId,
//       }))
//     );
//     console.log(`✅ Created ${users.length} users`);

//     // ─────────────────────────────────────────────
//     // 3. CATEGORIES
//     // ─────────────────────────────────────────────
//     const categories = await Category.bulkCreate([
//       { name: 'Electronics',        image_url: IMGS.macbook1    },
//       { name: 'Books & Stationery', image_url: IMGS.book2       },
//       { name: 'Fashion',            image_url: IMGS.hoodie2     },
//       { name: 'Home & Dorm',        image_url: IMGS.lamp1       },
//       { name: 'Vehicles',           image_url: IMGS.moto1       },
//       { name: 'Sports & Fitness',   image_url: IMGS.dumbbell2   },
//       { name: 'Food & Drinks',      image_url: IMGS.coffee3     },
//     ]);
//     console.log(`✅ Created ${categories.length} categories`);
//     const [ELEC, BOOK, FASH, HOME, VEHI, SPRT, FOOD, OTHR] = categories.map(c => c.id);

//     // ─────────────────────────────────────────────
//     // 4. PRODUCTS  (3 product-only images each)
//     // ─────────────────────────────────────────────
//     const productsData = [
//       // ─ 0 ─ Electronics ───────────────────────────────────────────────────
//       {
//         title: 'MacBook Air M2 (2022) – Silver',
//         description: 'Used only for coding at CADT. 8 GB RAM, 256 GB SSD. Battery health 91 %. Comes with original charger and sleeve. Can meet at CADT canteen or Chip Mong 271.',
//         price: 850.00, status: 'available', user_id: users[0].id, category_id: ELEC,
//         images: [IMGS.macbook1, IMGS.macbook2, IMGS.macbook3],
//       },
//       // ─ 1 ─
//       {
//         title: 'iPad Air 5th Gen (Wi-Fi, 64 GB)',
//         description: 'Great for taking notes in class and watching lecture recordings. Apple Pencil 1st gen included. Minor scratches on the back, screen is perfect.',
//         price: 420.00, status: 'available', user_id: users[1].id, category_id: ELEC,
//         images: [IMGS.ipad1, IMGS.ipad2, IMGS.ipad3],
//       },
//       // ─ 2 ─
//       {
//         title: 'Logitech G Pro Wireless Gaming Mouse',
//         description: 'Barely used. Perfect for gaming or design work at CADT lab. Bought 2 months ago from a shop near Orussey Market.',
//         price: 65.00, status: 'available', user_id: users[2].id, category_id: ELEC,
//         images: [IMGS.mouse1, IMGS.mouse2, IMGS.mouse3],
//       },
//       // ─ 3 ─
//       {
//         title: 'Custom Mechanical Keyboard – Blue Switches',
//         description: 'RGB backlit custom build. Selling because I upgraded to silent switches for the library. TKL form factor.',
//         price: 45.00, status: 'available', user_id: users[3].id, category_id: ELEC,
//         images: [IMGS.keyboard1, IMGS.keyboard2, IMGS.keyboard3],
//       },
//       // ─ 4 ─
//       {
//         title: 'Samsung 27" Curved Monitor (FHD, 75 Hz)',
//         description: 'Perfect second screen for your dorm setup. Used for 1 year, no dead pixels. HDMI cable included. Pickup in Toul Kork.',
//         price: 110.00, status: 'available', user_id: users[4].id, category_id: ELEC,
//         images: [IMGS.monitor1, IMGS.monitor2, IMGS.monitor3],
//       },
//       // ─ 5 ─
//       {
//         title: 'Sony WH-1000XM4 Noise-Cancelling Headphones',
//         description: 'Ideal for studying in noisy coffee shops like Brown Coffee or Amazon. Bought in Bangkok. Box and all accessories included.',
//         price: 195.00, status: 'available', user_id: users[5].id, category_id: ELEC,
//         images: [IMGS.headphones1, IMGS.headphones2, IMGS.headphones3],
//       },
//       // ─ 6 ─
//       {
//         title: 'Xiaomi Redmi Note 12 Pro – 8/256 GB',
//         description: 'Like new. Switching to iPhone. No scratches. Comes with original box, charger and case. Meet near CADT or Aeon 1.',
//         price: 180.00, status: 'available', user_id: users[6].id, category_id: ELEC,
//         images: [IMGS.phone1, IMGS.phone2, IMGS.phone3],
//       },
//       // ─ 7 ─
//       {
//         title: 'Anker 65 W GaN USB-C Charger (3-port)',
//         description: 'Bought two by mistake. Still sealed in original box. Great for charging MacBook, phone, and tablet at the same time.',
//         price: 28.00, status: 'available', user_id: users[7].id, category_id: ELEC,
//         images: [IMGS.charger1, IMGS.charger2, IMGS.charger3],
//       },
//       // ─ 8 ─
//       {
//         title: 'Lenovo IdeaPad 3 – i5 11th Gen, 8 GB RAM, 512 GB SSD',
//         description: 'Used 2 semesters for assignments and group projects. Windows 11 activated. Original charger and laptop bag included. Condition 8/10.',
//         price: 340.00, status: 'sold', user_id: users[8].id, category_id: ELEC,
//         images: [IMGS.laptop1, IMGS.laptop2, IMGS.laptop3],
//       },
//       // ─ 9 ─
//       {
//         title: 'GoPro Hero 10 Black',
//         description: 'Used for a club trip to Koh Rong. All mounts included. Battery + extra battery pack. Perfect condition.',
//         price: 220.00, status: 'available', user_id: users[9].id, category_id: ELEC,
//         images: [IMGS.gopro1, IMGS.gopro2, IMGS.gopro3],
//       },
//       // ─ 10 ─
//       {
//         title: 'Raspberry Pi 4 Model B – 4 GB Starter Kit',
//         description: 'Full kit: official case, 64 GB SD card, power supply, and cooling fan. Great for IoT or Embedded Systems projects at CADT.',
//         price: 55.00, status: 'available', user_id: users[10].id, category_id: ELEC,
//         images: [IMGS.raspi1, IMGS.raspi2, IMGS.arduino1],
//       },
//       // ─ 11 ─
//       {
//         title: 'Dell XPS 15 (2021) – i7, 16 GB RAM, 512 GB SSD',
//         description: 'Powerful machine for data science and deep learning. 4K OLED display. Selling because I switched to the Apple ecosystem.',
//         price: 780.00, status: 'available', user_id: users[11].id, category_id: ELEC,
//         images: [IMGS.laptop1, IMGS.macbook2, IMGS.laptop3],
//       },
//       // ─ 12 ─
//       {
//         title: 'JBL Flip 6 Bluetooth Speaker',
//         description: 'Waterproof, great for dorm room or outdoor hangouts at riverside. Excellent sound quality. Selling because I bought a bigger one.',
//         price: 55.00, status: 'available', user_id: users[12].id, category_id: ELEC,
//         images: [IMGS.speaker1, IMGS.speaker2, IMGS.speaker3],
//       },

//       // ─ 13 ─ Books & Stationery ──────────────────────────────────────────
//       {
//         title: 'Introduction to Algorithms (CLRS) – 3rd Edition',
//         description: 'Used for Year 2 Algorithms class. Condition 9/10. No handwriting inside. Essential for every CS student at CADT.',
//         price: 15.00, status: 'available', user_id: users[13].id, category_id: BOOK,
//         images: [IMGS.book1, IMGS.book3, IMGS.book5],
//       },
//       // ─ 14 ─
//       {
//         title: 'Computer Networks – Tanenbaum 5th Edition',
//         description: 'Required for the Networks course. Clean copy, minor highlighting in Chapter 3 only.',
//         price: 12.00, status: 'available', user_id: users[14].id, category_id: BOOK,
//         images: [IMGS.book4, IMGS.book2, IMGS.book6],
//       },
//       // ─ 15 ─
//       {
//         title: 'Calculus – James Stewart (Metric Edition)',
//         description: 'Used for Year 1 Calculus. Helpful notes in the margins. Good overall condition.',
//         price: 10.00, status: 'available', user_id: users[0].id, category_id: BOOK,
//         images: [IMGS.book2, IMGS.book5, IMGS.book3],
//       },
//       // ─ 16 ─
//       {
//         title: 'Clean Code – Robert C. Martin',
//         description: 'Must-read for any software developer. Like new condition. Will change how you write code forever.',
//         price: 9.00, status: 'available', user_id: users[1].id, category_id: BOOK,
//         images: [IMGS.book4, IMGS.book1, IMGS.book6],
//       },
//       // ─ 17 ─
//       {
//         title: 'Wacom Intuos Small Drawing Tablet',
//         description: 'Great for digital art and UI/UX design courses. All pens and extra nibs included. Works perfectly with Figma and Photoshop.',
//         price: 35.00, status: 'available', user_id: users[2].id, category_id: BOOK,
//         images: [IMGS.tablet1, IMGS.tablet2, IMGS.pencil2],
//       },
//       // ─ 18 ─
//       {
//         title: 'Bundle: 5 Khmer–English CS Glossaries',
//         description: 'Perfect for Year 1 students. Covers networking, programming, databases, AI, and cybersecurity. Compiled by a senior student.',
//         price: 8.00, status: 'available', user_id: users[3].id, category_id: BOOK,
//         images: [IMGS.book6, IMGS.book2, IMGS.book5],
//       },
//       // ─ 19 ─
//       {
//         title: 'Staedtler Mars Technical Pencil Set (0.3 / 0.5 / 0.7 mm)',
//         description: 'Barely used. All three pencils with extra lead cartridges included. Perfect for engineering drawing assignments.',
//         price: 7.00, status: 'sold', user_id: users[4].id, category_id: BOOK,
//         images: [IMGS.pencil1, IMGS.pencil2, IMGS.tablet2],
//       },
//       // ─ 20 ─
//       {
//         title: 'Database System Concepts – Silberschatz 7th Edition',
//         description: 'Required for the DB class at CADT. Good condition. A few pencil marks that are easily erasable.',
//         price: 13.00, status: 'available', user_id: users[5].id, category_id: BOOK,
//         images: [IMGS.book3, IMGS.book4, IMGS.book1],
//       },

//       // ─ 21 ─ Fashion ───────────────────────────────────────────────────────
//       {
//         title: 'CADT Hoodie (Official Merch) – Size M',
//         description: 'Official CADT merchandise from the 2023 orientation week. Only worn twice. Navy blue. Excellent condition.',
//         price: 14.00, status: 'available', user_id: users[6].id, category_id: FASH,
//         images: [IMGS.hoodie1, IMGS.hoodie2, IMGS.hoodie3],
//       },
//       // ─ 22 ─
//       {
//         title: 'Nike Air Force 1 – Size 42 (Men)',
//         description: 'Used a few times. No yellowing on the sole. Bought from Nike at Aeon Mall. Selling because they are too small now.',
//         price: 55.00, status: 'available', user_id: users[7].id, category_id: FASH,
//         images: [IMGS.shoes1, IMGS.shoes2, IMGS.shoes3],
//       },
//       // ─ 23 ─
//       {
//         title: 'Adidas Classic Backpack – Black',
//         description: 'Fits 15" laptop with a side bottle holder. Good for daily campus use. Minor wear on the bottom.',
//         price: 18.00, status: 'available', user_id: users[8].id, category_id: FASH,
//         images: [IMGS.bag1, IMGS.bag2, IMGS.bag3],
//       },
//       // ─ 24 ─
//       {
//         title: 'Uniqlo Casual Shirts Bundle – 4 pcs, Size S',
//         description: 'Lightly used, washed and ready. Selling because I gained weight. Mix of solid and striped patterns.',
//         price: 20.00, status: 'available', user_id: users[9].id, category_id: FASH,
//         images: [IMGS.shirts1, IMGS.shirts2, IMGS.shirts3],
//       },
//       // ─ 25 ─
//       {
//         title: 'Casio G-Shock GA-2100 – All-Black',
//         description: 'Classic "CasiOak" design. Scratch-resistant. Selling because I received one as a birthday gift. Comes with original box.',
//         price: 60.00, status: 'available', user_id: users[10].id, category_id: FASH,
//         images: [IMGS.watch1, IMGS.watch2, IMGS.watch3],
//       },
//       // ─ 26 ─
//       {
//         title: 'Ray-Ban Wayfarer Sunglasses (Authentic)',
//         description: 'Bought from an optical shop near BKK1. Original case and cleaning cloth included. Perfect for the Phnom Penh sun!',
//         price: 40.00, status: 'sold', user_id: users[11].id, category_id: FASH,
//         images: [IMGS.sunglasses1, IMGS.sunglasses2, IMGS.sunglasses3],
//       },
//       // ─ 27 ─
//       {
//         title: 'Streetwear Sling Bag – Gray',
//         description: 'Perfect size for phone, wallet, earbuds, and keys. Waterproof exterior. Brand new, never used.',
//         price: 12.00, status: 'available', user_id: users[12].id, category_id: FASH,
//         images: [IMGS.sling1, IMGS.sling2, IMGS.bag2],
//       },

//       // ─ 28 ─ Home & Dorm ──────────────────────────────────────────────────
//       {
//         title: 'IKEA-Style Adjustable Desk Lamp',
//         description: 'Warm white light, adjustable neck. Perfect for late-night study sessions. USB charging port built into the base.',
//         price: 10.00, status: 'available', user_id: users[13].id, category_id: HOME,
//         images: [IMGS.lamp1, IMGS.lamp2, IMGS.lamp3],
//       },
//       // ─ 29 ─
//       {
//         title: 'Pensonic Rice Cooker – 1.8 L',
//         description: 'Works perfectly. Moving out of the dorm so selling. Great for students cooking their own meals to save money in Phnom Penh.',
//         price: 12.00, status: 'available', user_id: users[14].id, category_id: HOME,
//         images: [IMGS.ricecooker1, IMGS.ricecooker2, IMGS.fan2],
//       },
//       // ─ 30 ─
//       {
//         title: 'Portable USB Desk Fan',
//         description: 'Very quiet operation. USB-A powered so it works with any power bank. A must-have for the Phnom Penh heat. Like new.',
//         price: 8.00, status: 'available', user_id: users[0].id, category_id: HOME,
//         images: [IMGS.fan1, IMGS.fan2, IMGS.lamp2],
//       },
//       // ─ 31 ─
//       {
//         title: 'Haier Mini Fridge – 50 L',
//         description: 'Works perfectly. Moving back home to Siem Reap after graduation so I cannot take it with me. Great dorm essential.',
//         price: 65.00, status: 'available', user_id: users[1].id, category_id: HOME,
//         images: [IMGS.fridge1, IMGS.fridge2, IMGS.ricecooker1],
//       },
//       // ─ 32 ─
//       {
//         title: 'Foldable Study Table with Storage Shelf',
//         description: 'Space-saving design, perfect for small dorm rooms. Folds flat when not in use. Easy to carry on a moto.',
//         price: 16.00, status: 'available', user_id: users[2].id, category_id: HOME,
//         images: [IMGS.desk1, IMGS.desk2, IMGS.lamp1],
//       },
//       // ─ 33 ─
//       {
//         title: 'Extension Power Strip – 3 m, 6 Outlets',
//         description: 'Built-in surge protection. Essential for dorm rooms with limited wall outlets. Never had any issues.',
//         price: 7.00, status: 'available', user_id: users[3].id, category_id: HOME,
//         images: [IMGS.powerstrip1, IMGS.powerstrip2, IMGS.charger2],
//       },
//       // ─ 34 ─
//       {
//         title: 'Non-Slip Yoga / Exercise Mat – 6 mm',
//         description: 'Used only 3–4 times for home workouts. Non-slip surface, good grip. Selling because I joined Fitness One gym near CADT.',
//         price: 9.00, status: 'available', user_id: users[4].id, category_id: HOME,
//         images: [IMGS.yogamat1, IMGS.yogamat2, IMGS.jumprope1],
//       },

//       // ─ 35 ─ Vehicles ──────────────────────────────────────────────────────
//       {
//         title: 'Honda Dream 110 (2021) – Black',
//         description: 'Well maintained, low mileage ~8,000 km. Perfect for commuting Takhmao ↔ CADT. All legal papers included, fresh road tax.',
//         price: 1850.00, status: 'available', user_id: users[5].id, category_id: VEHI,
//         images: [IMGS.moto1, IMGS.moto2, IMGS.moto3],
//       },
//       // ─ 36 ─
//       {
//         title: 'Yamaha Fino 125 (2020) – Pearl White',
//         description: 'Automatic scooter, very easy to ride around the city. Used by my sister during her studies at CADT. All documents complete.',
//         price: 1500.00, status: 'available', user_id: users[6].id, category_id: VEHI,
//         images: [IMGS.scooter1, IMGS.scooter2, IMGS.moto2],
//       },
//       // ─ 37 ─
//       {
//         title: 'Giant Escape 3 Hybrid Bicycle – Size M',
//         description: 'Great alternative to a moto – no traffic, free parking. Used to commute from Boeung Trabek to CADT. New tires fitted last month.',
//         price: 160.00, status: 'available', user_id: users[7].id, category_id: VEHI,
//         images: [IMGS.bicycle1, IMGS.bicycle2, IMGS.bicycle3],
//       },
//       // ─ 38 ─
//       {
//         title: 'Xiaomi Mi Pro 2 Electric Scooter',
//         description: 'Range ~45 km per charge. Ideal for short Phnom Penh commutes. Minor scratch on footboard, no mechanical issues. Charger included.',
//         price: 320.00, status: 'sold', user_id: users[8].id, category_id: VEHI,
//         images: [IMGS.escooter1, IMGS.escooter2, IMGS.moto3],
//       },
//       // ─ 39 ─
//       {
//         title: 'Honda Wave 110 (2019) – Red/Black',
//         description: 'Very fuel efficient. Perfect for a student budget. Engine recently serviced at a certified shop near Psar Thmei.',
//         price: 1100.00, status: 'available', user_id: users[9].id, category_id: VEHI,
//         images: [IMGS.moto2, IMGS.moto3, IMGS.moto1],
//       },

//       // ─ 40 ─ Sports & Fitness ───────────────────────────────────────────────
//       {
//         title: 'Adjustable Dumbbell Set – 2 × 20 kg',
//         description: 'Quick-adjust mechanism, space-saving design. Great for home workouts. Selling because I now go to Fitness One near CADT.',
//         price: 55.00, status: 'available', user_id: users[10].id, category_id: SPRT,
//         images: [IMGS.dumbbell2, IMGS.dumbbell3],
//       },
//       // ─ 41 ─
//       {
//         title: 'Spalding NBA Street Basketball – Size 7',
//         description: 'Used on outdoor courts around Phnom Penh. Good grip still remaining. Great for afternoon games at CADT sports area.',
//         price: 14.00, status: 'available', user_id: users[11].id, category_id: SPRT,
//         images: [IMGS.ball3, IMGS.dumbbell2, IMGS.dumbbell3],
//       },
//       // ─ 42 ─
//       {
//         title: 'Yonex Badminton Racket Set – 2 Rackets + Shuttlecocks',
//         description: 'Good for both beginners and intermediate players. Played maybe 10 times. Carry bag with shoulder strap included.',
//         price: 18.00, status: 'available', user_id: users[12].id, category_id: SPRT,
//         images: [IMGS.badminton1, IMGS.badminton2, IMGS.ball3],
//       },
//       // ─ 43 ─
//       {
//         title: 'Weighted Jump Rope – Adjustable Length',
//         description: 'Great for warm-ups or cardio. Adjustable length fits any height. Like new. Perfect budget buy at just $3.',
//         price: 3.00, status: 'available', user_id: users[13].id, category_id: SPRT,
//         images: [IMGS.jumprope1, IMGS.jumprope2, IMGS.yogamat2],
//       },

//       // ─ 44 ─ Food & Drinks ─────────────────────────────────────────────────
//       {
//         title: 'Nespresso Vertuo Next Coffee Machine',
//         description: 'Perfect for early morning classes. Includes 10 capsules to get you started. Moving out of dorm and cannot take it with me.',
//         price: 60.00, status: 'available', user_id: users[14].id, category_id: FOOD,
//         images: [IMGS.coffee2, IMGS.coffee3],
//       },
//       // ─ 45 ─
//       {
//         title: 'Hydro Flask 32 oz Water Bottle – Mango',
//         description: 'Keeps drinks cold for 24 hours. Great for class or the gym. Minor dent at the bottom, does not affect function at all.',
//         price: 16.00, status: 'available', user_id: users[0].id, category_id: FOOD,
//         images: [IMGS.bottle1, IMGS.bottle2, IMGS.bottle3],
//       },

//       // ─ 46 ─ Other ─────────────────────────────────────────────────────────
//       {
//         title: 'Arduino Uno R3 Starter Kit',
//         description: 'All components included: breadboard, sensors, LEDs, jumper wires, servo motor, and 16x2 LCD. Ideal for Electronics or IoT course at CADT.',
//         price: 22.00, status: 'available', user_id: users[1].id, category_id: OTHR,
//         images: [IMGS.arduino1, IMGS.raspi2, IMGS.raspi1],
//       },
//       // ─ 47 ─
//       {
//         title: 'Photography Tripod + Ring Light Set',
//         description: 'Three color temperature modes (warm / cool / daylight). Great for recording presentations, Zoom calls, or vlogs. Foldable and portable.',
//         price: 20.00, status: 'available', user_id: users[2].id, category_id: OTHR,
//         images: [IMGS.tripod3],
//       },
//       // ─ 48 ─
//       {
//         title: 'Xiaomi Mi Portable Projector – 700 ANSI Lumens',
//         description: 'Perfect for movie nights in the dorm or group project presentations. HDMI + USB-A support. 720p native resolution. Very portable.',
//         price: 130.00, status: 'available', user_id: users[3].id, category_id: OTHR,
//         images: [IMGS.projector1, IMGS.projector2, IMGS.projector3],
//       },
//       // ─ 49 ─
//       {
//         title: 'Year 1 Dorm Essentials Bundle',
//         description: 'All-in-one bundle for incoming CADT students: desk lamp, power strip, 4-port USB hub, mouse pad, and a small A4 whiteboard. Huge deal!',
//         price: 25.00, status: 'available', user_id: users[4].id, category_id: OTHR,
//         images: [IMGS.bundle1, IMGS.bundle2, IMGS.bundle3],
//       },
//     ];

//     const createdProducts = [];
//     const now = new Date();
    
//     for (let index = 0; index < productsData.length; index++) {
//       const { images, ...info } = productsData[index];
      
//       // Add different timestamps for each product
//       // Products are spread across different times (0 to 14 days ago)
//       const hoursAgo = Math.floor((index / productsData.length) * 14 * 24);
//       const createdAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
//       const updatedAt = createdAt;
      
//       const product = await Product.create({
//         ...info,
//         created_at: createdAt,
//         updated_at: updatedAt,
//       });
//       createdProducts.push(product);
//       if (images?.length) {
//         await ProductImage.bulkCreate(images.map(url => ({ product_id: product.id, image_url: url })));
//       }
//     }
//     console.log(`✅ Created ${createdProducts.length} products (3 images each) with varied timestamps`);

//     // ─────────────────────────────────────────────
//     // 5. LIKES
//     // ─────────────────────────────────────────────
//     const rawLikes = [
//       [1,0],[2,0],[3,0],[4,0],[5,0],[6,0],[7,0],         // MacBook
//       [0,1],[3,1],[8,1],[10,1],[15,1],                    // iPad
//       [1,2],[4,2],[9,2],[13,2],                           // Mouse
//       [0,3],[2,3],[7,3],[14,3],[19,3],                    // Keyboard
//       [1,4],[3,4],[5,4],[11,4],                           // Monitor
//       [2,5],[6,5],[11,5],[13,5],[20,5],                   // Headphones
//       [3,6],[8,6],[12,6],[17,6],                          // Redmi
//       [4,7],[9,7],[16,7],                                 // Charger
//       [0,9],[5,9],[10,9],[15,9],[22,9],                   // GoPro
//       [2,10],[6,10],[11,10],[18,10],                      // Raspberry Pi
//       [1,11],[7,11],[12,11],[16,11],[21,11],              // Dell XPS
//       [3,12],[8,12],[14,12],[23,12],                      // JBL
//       [4,13],[9,13],[13,13],[19,13],                      // CLRS
//       [0,14],[5,14],[12,14],                              // Tanenbaum
//       [1,16],[6,16],[11,16],[18,16],                      // Clean Code
//       [2,17],[7,17],[15,17],                              // Wacom
//       [4,21],[9,21],[14,21],[19,21],[24,21],              // CADT Hoodie
//       [5,22],[10,22],[15,22],[20,22],                     // Nike
//       [6,23],[11,23],[16,23],                             // Backpack
//       [3,25],[8,25],[13,25],[21,25],                      // G-Shock
//       [0,35],[5,35],[10,35],[15,35],[20,35],[22,35],      // Honda Dream
//       [1,36],[6,36],[11,36],[17,36],                      // Yamaha Fino
//       [2,37],[7,37],[12,37],[18,37],                      // Bicycle
//       [3,39],[8,39],[13,39],[19,39],                      // Honda Wave
//       [4,40],[9,40],[14,40],[22,40],                      // Dumbbells
//       [5,41],[10,41],[15,41],[23,41],                     // Basketball
//       [6,42],[11,42],[16,42],                             // Badminton
//       [2,44],[7,44],[12,44],[20,44],                      // Nespresso
//       [3,45],[8,45],[13,45],                              // Water Bottle
//       [0,46],[4,46],[9,46],[14,46],[18,46],[23,46],       // Arduino
//       [2,48],[7,48],[12,48],[17,48],[21,48],              // Projector
//       [1,49],[6,49],[11,49],[16,49],                      // Bundle
//     ];

//     const seenLikes = new Set();
//     const likeBulk = rawLikes
//       .filter(([u, p]) => u < users.length && p < createdProducts.length)
//       .map(([u, p]) => ({ user_id: users[u].id, product_id: createdProducts[p].id }))
//       .filter(({ user_id, product_id }) => {
//         const key = `${user_id}-${product_id}`;
//         if (seenLikes.has(key)) return false;
//         seenLikes.add(key);
//         return true;
//       });

//     await Like.bulkCreate(likeBulk);
//     console.log(`✅ Created ${likeBulk.length} likes`);

//     // ─────────────────────────────────────────────
//     // 6. COMMENTS
//     // ─────────────────────────────────────────────
//     const p = (i) => createdProducts[i].id;

//     await Comment.bulkCreate([
//       // MacBook (0)
//       { user_id: users[1].id,  product_id: p(0),  content: 'Can I check the battery health percentage? I can meet you at the CADT canteen anytime this week.',              rating: 5    },
//       { user_id: users[2].id,  product_id: p(0),  content: 'Is the price final? I can do $800 cash today if you are free after class.',                                     rating: null },
//       { user_id: users[3].id,  product_id: p(0),  content: 'Does it come with the original box and MagSafe charger? Very interested!',                                      rating: null },
//       { user_id: users[4].id,  product_id: p(0),  content: 'Bought my previous laptop from this seller – very honest, item exactly as described. Highly recommend!',         rating: 5    },
//       { user_id: users[7].id,  product_id: p(0),  content: 'The M2 chip is incredible for compiling large codebases. Worth every dollar for a CS student.',                  rating: 4    },

//       // iPad (1)
//       { user_id: users[0].id,  product_id: p(1),  content: 'Does the Apple Pencil have any lag when writing notes during lectures?',                                         rating: null },
//       { user_id: users[5].id,  product_id: p(1),  content: 'Is it still linked to an Apple ID? Can I do a full factory reset before purchase?',                              rating: null },
//       { user_id: users[9].id,  product_id: p(1),  content: 'Price seems fair for this spec. Any chance you can do $400?',                                                   rating: 4    },

//       // Mouse (2)
//       { user_id: users[4].id,  product_id: p(2),  content: 'Does it come with the USB receiver? What is the real-world battery life like?',                                  rating: null },
//       { user_id: users[7].id,  product_id: p(2),  content: 'I use this exact mouse – best wireless option at this price range, no debate.',                                  rating: 5    },
//       { user_id: users[13].id, product_id: p(2),  content: 'Any double-click issues? I had problems with an older G-series mouse before.',                                   rating: null },

//       // Keyboard (3)
//       { user_id: users[0].id,  product_id: p(3),  content: 'Is this TKL or full-size layout? Any custom keycaps swapped in?',                                               rating: null },
//       { user_id: users[2].id,  product_id: p(3),  content: 'RGB lighting still works on all keys? Can we meet near CADT on Thursday?',                                      rating: 4    },
//       { user_id: users[6].id,  product_id: p(3),  content: 'Blue switches in the CADT library will get you kicked out instantly lol. But for home use this is perfect!',     rating: null },

//       // Monitor (4)
//       { user_id: users[1].id,  product_id: p(4),  content: 'Does it support VESA mounting? I want to pair it with a monitor arm for my dorm desk.',                          rating: null },
//       { user_id: users[3].id,  product_id: p(4),  content: 'Great price for a 27" curved. Any burn-in or noticeable backlight bleed?',                                      rating: 4    },

//       // Headphones (5)
//       { user_id: users[2].id,  product_id: p(5),  content: 'Is the noise cancellation still at full strength? Perfect for studying at Starbucks near Noro.',                  rating: 5    },
//       { user_id: users[8].id,  product_id: p(5),  content: 'Can you do $180 if the original carry case is included?',                                                       rating: null },
//       { user_id: users[11].id, product_id: p(5),  content: 'The best investment for any CADT student. Completely blocks the tuk-tuk noise outside the campus!',              rating: 5    },

//       // Redmi (6)
//       { user_id: users[3].id,  product_id: p(6),  content: 'Any dead zones on the display? And what is the current battery health?',                                         rating: null },
//       { user_id: users[5].id,  product_id: p(6),  content: 'I can meet you at Aeon 1 this Saturday. Is the camera module still working properly?',                           rating: 4    },

//       // GoPro (9)
//       { user_id: users[0].id,  product_id: p(9),  content: 'Is the waterproofing still fully intact after the Koh Rong trip? Any lens scratches?',                           rating: null },
//       { user_id: users[5].id,  product_id: p(9),  content: 'Need this for my upcoming Kampot trip next month! Does it come with a chest mount?',                             rating: 5    },
//       { user_id: users[14].id, product_id: p(9),  content: 'Does it shoot 4K at 60 fps? How many mounts are included in the package?',                                      rating: null },

//       // CLRS (13)
//       { user_id: users[4].id,  product_id: p(13), content: 'Is this the hardcover edition? I need it for next semester\'s Algorithms class at CADT.',                        rating: null },
//       { user_id: users[9].id,  product_id: p(13), content: 'This book literally saved my Year 2 exams. $15 is a total steal!',                                              rating: 5    },
//       { user_id: users[13].id, product_id: p(13), content: 'Any handwriting or highlights inside? I prefer a clean copy to annotate myself.',                                 rating: null },

//       // Tanenbaum (14)
//       { user_id: users[3].id,  product_id: p(14), content: 'Is this the international or US edition? Does the ISBN match what our professor listed on the syllabus?',         rating: null },
//       { user_id: users[7].id,  product_id: p(14), content: 'Our Networks professor uses this exact edition. Great deal – I will take it!',                                   rating: 5    },

//       // CADT Hoodie (21)
//       { user_id: users[4].id,  product_id: p(21), content: 'Does medium run regular or slightly small? I usually wear a large.',                                             rating: null },
//       { user_id: users[9].id,  product_id: p(21), content: 'These were limited from the 2023 orientation. Wish I had kept mine when I had the chance!',                      rating: 5    },
//       { user_id: users[14].id, product_id: p(21), content: 'Is the CADT logo embroidered or just screen-printed? Asking before I decide.',                                   rating: null },

//       // Honda Dream (35)
//       { user_id: users[0].id,  product_id: p(35), content: 'Can I take it for a short test ride? I live in Takhmao so the location is very convenient for me.',              rating: null },
//       { user_id: users[5].id,  product_id: p(35), content: 'Is $1,750 cash possible? I can come pick it up this week if we agree.',                                         rating: null },
//       { user_id: users[10].id, product_id: p(35), content: 'Road tax valid until when? Looks like a great daily commuter for CADT students.',                                rating: 4    },
//       { user_id: users[15].id, product_id: p(35), content: 'Bought my last moto from this seller – documents were all clean and the bike was exactly as described!',          rating: 5    },

//       // Yamaha Fino (36)
//       { user_id: users[1].id,  product_id: p(36), content: 'Automatic means no manual clutch right? Perfect for me as a first-time rider.',                                  rating: null },
//       { user_id: users[6].id,  product_id: p(36), content: 'What is the mileage? Any battery or starter problems in the mornings?',                                         rating: null },

//       // Dumbbells (40)
//       { user_id: users[10].id, product_id: p(40), content: 'What brand are these? Do the settings go as low as 2 kg for lighter warm-up sets?',                              rating: null },
//       { user_id: users[14].id, product_id: p(40), content: 'Perfect for a small dorm home gym setup. Any rust or corrosion on the plates?',                                  rating: 4    },

//       // Nespresso (44)
//       { user_id: users[2].id,  product_id: p(44), content: 'Does it work with all Vertuo pods? Can you actually find compatible capsules here in Phnom Penh?',               rating: null },
//       { user_id: users[7].id,  product_id: p(44), content: 'Great price for a Nespresso. What flavours are the 10 included capsules?',                                      rating: 5    },
//       { user_id: users[11].id, product_id: p(44), content: 'Absolute lifesaver for all-nighters before CADT final exams. I need one of these!',                              rating: 5    },

//       // Arduino (46)
//       { user_id: users[0].id,  product_id: p(46), content: 'Does the kit include a DHT11 temperature sensor? I need it for my IoT final project.',                           rating: null },
//       { user_id: users[4].id,  product_id: p(46), content: 'Perfect for the Embedded Systems course at CADT. Are all components still present?',                             rating: 4    },
//       { user_id: users[9].id,  product_id: p(46), content: 'Is the Arduino a genuine board or a clone? Both work fine for coursework, just curious.',                        rating: null },
//       { user_id: users[18].id, product_id: p(46), content: 'Used this exact kit for my Year 3 capstone project. Highly recommend to any junior student!',                    rating: 5    },

//       // Projector (48)
//       { user_id: users[2].id,  product_id: p(48), content: 'Can it connect via Miracast or is it HDMI only? Asking because I want to use it wirelessly.',                    rating: null },
//       { user_id: users[7].id,  product_id: p(48), content: 'Does it need full darkness or does it work with some ambient light in the room?',                                rating: 4    },
//       { user_id: users[12].id, product_id: p(48), content: 'My group used this exact model for our semester presentation. Works great with any laptop!',                      rating: 5    },

//       // Bundle (49)
//       { user_id: users[1].id,  product_id: p(49), content: 'This is perfect for Year 1 students! What size is the whiteboard included in the set?',                          rating: null },
//       { user_id: users[6].id,  product_id: p(49), content: 'Is the USB hub USB 3.0? I need fast transfer speeds for my external SSD.',                                      rating: null },
//     ]);
//     console.log(`✅ Created comments`);

//     // ─────────────────────────────────────────────
//     // SUMMARY
//     // ─────────────────────────────────────────────
//     console.log('\n📊 Cambodia Database Seeding Summary:');
//     console.log(`   Universities  : ${await University.count()}`);
//     console.log(`   Users         : ${await User.count()}`);
//     console.log(`   Categories    : ${await Category.count()}`);
//     console.log(`   Products      : ${await Product.count()}`);
//     console.log(`   Product Images: ${await ProductImage.count()} (3 per product)`);
//     console.log(`   Likes         : ${await Like.count()}`);
//     console.log(`   Comments      : ${await Comment.count()}`);
//     console.log('\n✨ Seeding completed successfully!');
//     console.log('\n🔑 Test Logins:');
//     console.log('   User  → sophea.srun@student.cadt.edu.kh  / password123');
//     console.log('   Admin → admin@student.cadt.edu.kh         / password123');

//   } catch (error) {
//     console.error('❌ Error seeding database:', error);
//     throw error;
//   }
// };

// export default seedData;


import { DefaultRetention$ } from '@aws-sdk/client-s3';
import models from '../../models/index.js';

const { Category } = models;

// ─── Image Helper ────────────────────────────────────────────────────────────
const img = (id) => `https://images.unsplash.com/photo-${id}?w=600&fit=crop&auto=format&q=80`;

const CATEGORY_IMGS = {
  electronics: img('1611186871348-b1ce696e52c9'),
  books:       img('1456513080510-7bf3a84b82f8'),
  fashion:     img('1620799140408-edc6dcb6d633'),
  home:        img('1534073828943-f801091bb18c'),
  vehicles:    img('1568772585407-9361f9bf3a87'),
  sports:      img('1583454110551-21f2fa2afe61'),
  food:        img('1495474472287-4d71bcdd2085'),
};

const seedData = async () => {
  try {
    console.log('🌱 Starting category-only seeding...');

    // This will insert the categories into your database
    const categories = await Category.bulkCreate([
      { name: 'Electronics',       image_url: CATEGORY_IMGS.electronics },
      { name: 'Books & Stationery', image_url: CATEGORY_IMGS.books       },
      { name: 'Fashion',           image_url: CATEGORY_IMGS.fashion     },
      { name: 'Home & Dorm',       image_url: CATEGORY_IMGS.home        },
      { name: 'Vehicles',          image_url: CATEGORY_IMGS.vehicles    },
      { name: 'Sports & Fitness',  image_url: CATEGORY_IMGS.sports      },
      { name: 'Food & Drinks',     image_url: CATEGORY_IMGS.food        },
    ]);

    console.log(`✅ Successfully created ${categories.length} categories.`);
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
  }
};

export default seedData;

// Execute the seed
seedData();