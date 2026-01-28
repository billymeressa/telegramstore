# Ethiopian E-Commerce Telegram Mini App - Project Specification

## 1. Project Overview
A fully-featured E-commerce platform integrated directly into Telegram as a Mini App. The application allows users to browse products, filter by categories, view details, and purchase items seamlessly without leaving the Telegram environment. It includes a comprehensive Admin Dashboard for inventory and order management.

## 2. Technology Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: TailwindCSS 3.4 (Custom Theme Variables)
- **Routing**: React Router 7
- **UI Libraries**: Framer Motion (Animations), Lucide React (Icons)
- **Integration**: Telegram WebApp SDK

### Backend
- **Runtime**: Node.js
- **Server**: Express.js
- **Database**: MongoDB (Mongoose ORM)
- **Bot Framework**: Telegraf.js
- **Image Hosting**: Cloudinary

### Deployment
- **Platform**: Vercel (Frontend & Serverless Functions) / Render (Backend)
- **Database**: MongoDB Atlas

---

## 3. Database Schema

The application uses a MongoDB database with the following key schemas defined in `db.js`.

### User
- `userId` (String, Unique): Telegram User ID.
- `username` (String): Telegram handle.
- `firstName`: User's first name.
- `joinedAt`, `lastActiveAt`: Activity tracking.
- `checkInStreak`, `lastCheckInTime`: Engagement gamification.

### Product
- `id` (Number): Numeric ID for legacy compatibility.
- `title`, `price` (Number), `description`, `images` (Array[URL]).
- `category`, `department`: Filtering fields (e.g., Men, Electronics).
- `stock` (Number): Quantity available.
- `isUnique` (Boolean): For one-of-a-kind items (e.g., Vintage/Used).
- `stockStatus` (String): Custom label for unique items.
- `variations`: Array of objects `{ name, price, stock }` (e.g., Sizes, Colors).

### Order
- `items`: Array of purchased products.
- `total_price`: Final calculated price.
- `status`: `pending`, `shipped`, `delivered`, `cancelled`.
- `userId`, `userInfo`: Buyer details.

### Other Collections
- `Session`: Tracks user dwell time and event counts.
- `AnalyticsEvent`: Tracks specific actions like `view_product`, `add_to_cart`.
- `PromoCode`: Manages discount codes (Fixed/Percent).

---

## 4. Key Features

### 🛍️ User Application
1.  **Home Feed**:
    -   **Infinite Scroll**: Automatically loads more products as you scroll.
    -   **Smart Sort**: Randomizes product order once per session to keep the feed fresh, while keeping "Generic" items (cables, parts) at the bottom.
2.  **Product Discovery**:
    -   **Search & Filter**: Real-time filtering by Department (Men, Women, Tech) and Category.
    -   **Product Details**: High-quality image carousel, variations selection (Price updates dynamically), sticky "Recommended" header.
3.  **Shopping experience**:
    -   **Cart**: Add multiple items, quantity management.
    -   **Wishlist**: Save items for later.
    -   **Checkout Options**:
        -   **Add to Cart -> Checkout**: Closes Mini App and sends a structured order message to the bot.
        -   **Buy Now**: Shows a transient "Order Started" toast, then immediately opens a direct chat with the seller pre-filled with the inquiry.

### 🛠️ Admin Dashboard (`/admin`)
*(Accessible only to users with IDs in `ADMIN_ID` env variable)*
1.  **Inventory Management**:
    -   **Add Product**: Full form with multi-image upload, variation builder, and stock settings.
    -   **Edit Product**: Update all fields, including stock and variations.
2.  **Order Management**:
    -   View incoming orders.
    -   Change status (Mark as Sold/Cancelled).
3.  **Analytics (`/analytics` - Super Admin)**:
    -   View usage statistics, sales metrics.

### 🤖 Telegram Bot
1.  **Welcome Flow**: `/start` command registers user and shows a "Shop Now" WebApp button.
2.  **Order Handling**: Listens for `web_app_data` events to process orders sent from the Mini App.
3.  **Notifications**: Connects Buyers <-> Sellers by notifying admins of new orders.

---

## 5. Specific Implementation Details

### Checkout Flow Customization
-   **Method**: `tele.sendData(JSON.stringify(order))`
-   **Behavior**: When a user checks out from the **Cart**, the Mini App executes `sendData`. This is a Telegram-specific method that closes the webview and triggers a message in the chat on behalf of the user containing the data. The bot intercepts this to confirm the order.

### Direct "Buy Now" Flow
-   **Method**: `window.open(telegram_url)` / `tele.openTelegramLink(url)`
-   **Behavior**: Bypasses the cart.
    1.  Silently notifies the backend API `/api/notify-order` for analytics/admin records.
    2.  Displays a **Transient Overlay** (Custom Toast) saying "Order Started".
    3.  After 1.5s, redirects to a direct DM with the seller using `tg://user?id=...`.

### "Smart Sort" Algorithm
-   Located in `App.jsx` (fetch logic).
-   Separates "Premium" items from "Generic" items (defined by a constant list of categories).
-   Shuffles "Premium" items using Fisher-Yates shuffle.
-   Appends "Generic" items at the end.
-   **Crucially**: Only runs ONCE when data is fetched/appended. Does not re-run on re-renders, ensuring scroll stability.

## 6. Environment Configuration
Required `.env` variables:
-   `BOT_TOKEN`: Telegram Bot API Token.
-   `MONGODB_URI`: Connection string for Atlas.
-   `ADMIN_ID`: Telegram User ID for the main admin.
-   `CLOUDINARY_*`: Keys for image storage.
-   `WEB_APP_URL`: The live Vercel URL.

## 7. Data Specification

### Overview
- **Total Products**: 185
- **Price Range**: 0 ETB - 945542690 ETB
- **Average Price**: 5127972.58 ETB

### Category Breakdown
| Category | Count |
| :--- | :---: |
| Audio | 5 |
| Storage | 41 |
| Laptops | 61 |
| Electronics | 11 |
| Networking | 3 |
| Gaming | 6 |
| Phones | 48 |
| Computer Accessories | 6 |
| Wearables | 3 |
| Cameras | 1 |

### Full Data
<details>
<summary>Click to view full products.json</summary>

```json
[
  {
    "id": 30,
    "title": "Bluetooth headset",
    "price": 100,
    "description": "Bluetooth headset",
    "category": "Audio",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136586/telegram_store_products/xxe0oaergnpnvwhm4je5.jpg"
    ],
    "seller_phone": "0917092830",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 39,
    "title": "16Gb sandisk Dual Drive",
    "price": 400,
    "description": "16Gb sandisk Dual Drive 32gb SanDisk dual drive",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136587/telegram_store_products/gkmiget26m9hvmfblxww.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 89,
    "title": "High quality dell speakers",
    "price": 400,
    "description": "High quality dell speakers",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136588/telegram_store_products/p6kouywy0csw4otuopwe.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7techno"
  },
  {
    "id": 99,
    "title": "Original Dell brand Usb Keyboard",
    "price": 500,
    "description": "Original Dell brand Usb Keyboard",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136589/telegram_store_products/ucclqop6spfk8goojxuc.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136589/telegram_store_products/u4lttleeyuh7f9wdhels.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 123,
    "title": "Product 123",
    "price": 0,
    "description": "",
    "category": "Electronics",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136590/telegram_store_products/ep7ccbg9n9pylztib7ij.jpg"
    ],
    "seller_phone": null,
    "telegram_username": null
  },
  {
    "id": 131,
    "title": "Class 10 Original micro sd memory card",
    "price": 100,
    "description": "Class 10 Original micro sd memory card 2gb 4gb 8gb 16gb 32gb 64gb 128gb",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136591/telegram_store_products/zbigb0p7oqmyjtvzaxtz.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 149,
    "title": "brand new Toshiba 500 GB 2.5&quot; Inch Laptop SAT",
    "price": 1700,
    "description": "brand new Toshiba 500 GB 2.5&quot; Inch Laptop SATA Internal Hard Disk Drive for laptop",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136591/telegram_store_products/e4uufvnewwksv3yzhuua.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 195,
    "title": "Wired Joystick for pc",
    "price": 500,
    "description": "Wired Joystick for pc Price or for",
    "category": "Electronics",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136592/telegram_store_products/mqycapkgivhiamcjayls.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 196,
    "title": "Wireless Keyboard Mouse Set",
    "price": 1500,
    "description": "Wireless Keyboard Mouse Set 2.4Ghz wireless technology compatible with desktop, laptop &amp; tablet price or join for more products",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136593/telegram_store_products/i98relbgdy0avbfqn1ry.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 228,
    "title": "VGA port) ለሌላቸው ላፕቶፖች ወይም ዴስክቶፖች HD",
    "price": 300,
    "description": "VGA port) ለሌላቸው ላፕቶፖች ወይም ዴስክቶፖች HDMI to VGA ... birr USB 3.0 to VGA",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136593/telegram_store_products/etv3yi094pthhrookvz1.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 261,
    "title": "Tp link M7200 4G router",
    "price": 4200,
    "description": "Tp link M7200 4G router Go anywhere connect everywhere 8 hours battery life price",
    "category": "Networking",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136594/telegram_store_products/oymjhgqccjlaez1xeeqt.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 266,
    "title": "Tp-link adsl2 + Modem router",
    "price": 3200,
    "description": "Tp-link adsl2 + Modem router upto 300 Mbps 2 antennas",
    "category": "Networking",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136595/telegram_store_products/iiodho8prhfwxorzoeva.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136595/telegram_store_products/pcoocbjpsbi7ft4ejbjg.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 273,
    "title": "Original Sony PS3 Dualshock3 Wireless Controller",
    "price": 500,
    "description": "Original Sony PS3 Dualshock3 Wireless Controller Discount available if you buy more than one",
    "category": "Gaming",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136596/telegram_store_products/kw3ukfy0wxxno47fnbca.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136597/telegram_store_products/ttdk7ygbmh74tbbsug71.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 276,
    "title": "Flexible USB keyboard to save space when carrying",
    "price": 400,
    "description": "Flexible USB keyboard to save space when carrying around Price",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136597/telegram_store_products/ils0y237oe9bujhucg4w.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 286,
    "title": "Hard disk Enclosure USB 3.0 supports upto 3.0TB",
    "price": 400,
    "description": "Hard disk Enclosure USB 3.0 supports upto 3.0TB",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136598/telegram_store_products/r6kchc97v7tutqoohagd.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 292,
    "title": "Original sandisk flash drive",
    "price": 300,
    "description": "Original sandisk flash drive 16Gb 32 GB 64GB 128GB",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136599/telegram_store_products/amwjgpbdosfowydxede9.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 318,
    "title": "Wired Joystick for ps2",
    "price": 300,
    "description": "Wired Joystick for ps2 Wireless joystick for PS2",
    "category": "Electronics",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136599/telegram_store_products/bw2iagxk19ppogjvkcbr.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 324,
    "title": "Sony PS4 Dual shock Wireless Controller",
    "price": 2000,
    "description": "Sony PS4 Dual shock Wireless Controller",
    "category": "Gaming",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136600/telegram_store_products/q3mcl4l19rpceijpk7xl.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 338,
    "title": "Transcend Store jet 2 tera External hard disk",
    "price": 7200,
    "description": "Transcend Store jet 2 tera External hard disk",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136600/telegram_store_products/mwxd06thuuuwyzn5c3k9.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technlogies"
  },
  {
    "id": 345,
    "title": "External case for internal hard disk USB 2.0",
    "price": 400,
    "description": "External case for internal hard disk USB 2.0 name A7",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136601/telegram_store_products/ghqdomzwodna8ylhmkvu.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 346,
    "title": "1 tera transcend external hard disk",
    "price": 5000,
    "description": "1 tera transcend external hard disk price discount if you buy more than one",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136602/telegram_store_products/swz0ms5in9lghnqnohc0.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 354,
    "title": "mini USB to type C converter........... When you f",
    "price": 50,
    "description": "mini USB to type C converter........... When you forget your c type charger you can use the old samsung with this to charge your phone (our is A7) Join us",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136602/telegram_store_products/yysefvy1eyptwienssac.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 379,
    "title": "Wireless mouse Mofii",
    "price": 600,
    "description": "Wireless mouse Mofii An excellent brand",
    "category": "Computer Accessories",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136603/telegram_store_products/dwfpb7o1iefufn2niqpq.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 393,
    "title": "Wireless bluetooth headset",
    "price": 300,
    "description": "Wireless bluetooth headset",
    "category": "Audio",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136604/telegram_store_products/zbo1uyffsjlmsqmlxtmq.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technolgies"
  },
  {
    "id": 428,
    "title": "Original Chargers for Hp, Dell and Toshiba",
    "price": 1500,
    "description": "Original Chargers for Hp, Dell and Toshiba",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136604/telegram_store_products/fqejyxu2zlxvkez7bhhf.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 444,
    "title": "Excellent sound desktop speakers USB 2.1",
    "price": 2.1,
    "description": "Excellent sound desktop speakers USB 2.1 Brand name: Kisonli Model T-008 USB 2.1 Price Model T-006 USB 2.0 price model K-100 USB 2.0 price Join our channel",
    "category": "Audio",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136605/telegram_store_products/bp3wwjoo4p5ux72bnqdf.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136606/telegram_store_products/catzn8mskhdcyewqzrl0.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136607/telegram_store_products/hghfaliuttxgkmpfveog.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 461,
    "title": "Network cables cat 6",
    "price": 500,
    "description": "Network cables cat 6 Manufacture: Enet 10 metres price 5 metres price 3 metres price 1 metre price",
    "category": "Computer Accessories",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136608/telegram_store_products/e37vgcfh56oq0kew2xcc.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 491,
    "title": "Internal hard disk for laptop 1 TB price 3",
    "price": 3000,
    "description": "Internal hard disk for laptop 1 TB price",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136608/telegram_store_products/xd8jwetfxouirza4tlkb.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136609/telegram_store_products/xpo6a7ctrfvfirjajwh5.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 501,
    "title": "Hard disk Enclosure USB 2.0/3.0",
    "price": 700,
    "description": "Hard disk Enclosure USB 2.0/3.0 External hard disk case from WD price",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136610/telegram_store_products/xdw7ax5kopwoiefrjzcn.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 574,
    "title": "Wired Controller -Desktop/ Laptop 500 bir",
    "price": 500,
    "description": "Wired Controller -Desktop/ Laptop Wired Controller-Playstation 2 (PS2) Wired Controller for PC (2 in 1) Wireless Controller-Playstation 2 Wireless Controller-Playstation 3 join for more for or",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136610/telegram_store_products/et54cx2gqntoixp1mci4.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136611/telegram_store_products/tpqfzlk2pucwmr2icb5d.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 580,
    "title": "1 tera transcend external hard disk",
    "price": 6000,
    "description": "1 tera transcend external hard disk price",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136612/telegram_store_products/q0wkwwn9pnfqlc5sqhyc.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 587,
    "title": "Wireless Keyboard Mouse Set",
    "price": 1500,
    "description": "Wireless Keyboard Mouse Set 2.4Ghz wireless technology compatible with desktop, laptop &amp; tablet price or join for more products",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136612/telegram_store_products/xvqqbahtpsubjhghr6g5.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 599,
    "title": "Right time to buy router and enjoy broadband inter",
    "price": 3200,
    "description": "Right time to buy router and enjoy broadband internet Tp-link adsl2 + Modem router upto 300 Mbps 2 antennas",
    "category": "Wearables",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136613/telegram_store_products/hok6alsdtl9axdnxha2o.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 602,
    "title": "External hard disk",
    "price": 6000,
    "description": "External hard disk ሲፈልጉ ወደ A7 technologies ይምጡ ወይም ይደውሉ 1 Tera Transcend 2 Tera Transcend. ያሉበት ድረስ እንደ ርቀቱ በተመጣጣኝ ተጨማሪ ክፍያ እናደርሳለን ለሌሎች አመሳሳይ እቃዎች ቴሌግራም ቻናል ይቀላቀሉ ( ) አድራሻ መገናኛ፥ መተባበር ህንጻ 2",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136613/telegram_store_products/j3f4izmrhcv02hd7tjzj.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 603,
    "title": "Wireless Keyboard Mouse Set",
    "price": 1500,
    "description": "Wireless Keyboard Mouse Set 2.4Ghz wireless technology compatible with desktop, laptop &amp; tablet price or join for more products",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136614/telegram_store_products/ry1fipii7cfxagkoedlm.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 604,
    "title": "Wired Controller-Playstation 2 (PS2) 300 bi",
    "price": 300,
    "description": "Wired Controller-Playstation 2 (PS2) Wired Controller -Desktop/ Laptop Wired Controller for PC (2 in 1) Wireless Controller-Playstation 2 Wireless Controller-Playstation 3 join for more for or",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136615/telegram_store_products/nxccpxdtojnsxdy7lsm9.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136615/telegram_store_products/wnu4hpw5y8lcf14b1llw.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 608,
    "title": "A7 Technologies",
    "price": 0,
    "description": "A7 Technologies አዲስና ያገለገሉ ላፕቶፖችን እንገዛለን External Hard Disks PlayStation Controllers Computer Accessories New and Used Laptops Smartphones ያሉበት ድረስ በተመጣጣኝ ክፍያ እናደርሳለን የቴሌግራም ቻናላችንን ይቀላቀሉ ለቴሌግራም አጭር መልዕክት አድራሻ፦ መገናኛ መተባበር ህንጻ 2",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136616/telegram_store_products/ovjhrbdsfavffmr8oqje.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 611,
    "title": "Flexible USB keyboard to save space when carrying",
    "price": 400,
    "description": "Flexible USB keyboard to save space when carrying around Price",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136616/telegram_store_products/zvckw9z59kl7oaissxvo.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 612,
    "title": "Original Dell brand Usb Keyboard",
    "price": 500,
    "description": "Original Dell brand Usb Keyboard",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136617/telegram_store_products/iq1hfwldtoqyotq8ppfr.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 613,
    "title": "Hard disk Enclosure USB 2.0/3.0",
    "price": 700,
    "description": "Hard disk Enclosure USB 2.0/3.0 External hard disk case from WD price",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136618/telegram_store_products/nt85o9mglcabfokzvooo.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 619,
    "title": "External hard disk",
    "price": 6000,
    "description": "External hard disk ሲፈልጉ ወደ A7 technologies ይምጡ ወይም ይደውሉ Holiday discount 1 Tera Transcend discount for resellers ቴሌግራም ቻናል ይቀላቀሉ አድራሻ መገናኛ፥ መተባበር ህንጻ 2",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136618/telegram_store_products/uxjsepuedzreoev3rlgw.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136619/telegram_store_products/zlexjjuqpyidhyvnynwt.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 621,
    "title": "Wired controller / Joystick for pc",
    "price": 500,
    "description": "Wired controller / Joystick for pc Price or for",
    "category": "Gaming",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136619/telegram_store_products/qg3v3bfhmfz05cie5gdg.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 632,
    "title": "Wired Controller-Playstation 2 (PS2) 300 bi",
    "price": 300,
    "description": "Wired Controller-Playstation 2 (PS2) Wired Controller -Desktop/ Laptop Wired Controller for PC (2 in 1) Wireless Controller-Playstation 2 Wireless Controller-Playstation 3 join for more for or",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136620/telegram_store_products/uatmcismhtgikxwbmupw.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136621/telegram_store_products/cnv55rtxxxatmuxh7rbq.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 640,
    "title": "Wired Controller-Playstation 2 (PS2) 300 bi",
    "price": 300,
    "description": "Wired Controller-Playstation 2 (PS2) Wired Controller -Desktop/ Laptop Wired Controller for PC (2 in 1) Wireless Controller-Playstation 2 Wireless Controller-Playstation 3 join for more for or",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136623/telegram_store_products/ruosgkrjpujcwnevmg5q.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136623/telegram_store_products/c51u3gnv4xqjhiontrnk.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@a7technologies"
  },
  {
    "id": 649,
    "title": "External hard disk 1 TB",
    "price": 6000,
    "description": "External hard disk 1 TB 1 Tera Transcend join for more or",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136624/telegram_store_products/qa4ockcakxahlnczacgm.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@fetanecommerce"
  },
  {
    "id": 669,
    "title": "External hard disk 1 TB",
    "price": 5800,
    "description": "External hard disk 1 TB 1 Tera Transcend join for more or",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136624/telegram_store_products/fi5qt4jhgmmqzbpbvtsa.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@fetanecommerce"
  },
  {
    "id": 676,
    "title": "2 in 1 USB joystick for pc",
    "price": 700,
    "description": "2 in 1 USB joystick for pc Brand name: UCOM Price or join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136625/telegram_store_products/odtavalkqukz09qkghrm.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 694,
    "title": "Wireless Keyboard Mouse Set",
    "price": 1500,
    "description": "Wireless Keyboard Mouse Set 2.4Ghz wireless technology compatible with desktop, laptop &amp; tablet price or join for more products",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136625/telegram_store_products/ostkqdrcym8ys25op3fi.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 697,
    "title": "External case for internal hard disk USB 2.0",
    "price": 450,
    "description": "External case for internal hard disk USB 2.0 Convert your internal hard disks to external hard disks Price or join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136626/telegram_store_products/r5iefeqhoeo7n5of5yvz.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 699,
    "title": "Wired controller / Joystick for pc",
    "price": 500,
    "description": "Wired controller / Joystick for pc Price or for Join for more",
    "category": "Gaming",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136626/telegram_store_products/kpdkp03exndxeqxgxu2e.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 724,
    "title": "Original Huawei Sapphire Crystal 316 Smart Watch",
    "price": 10000,
    "description": "Original Huawei Sapphire Crystal 316 Smart Watch Battery Status Excellent Price- Or",
    "category": "Wearables",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136627/telegram_store_products/gugsswlliah9ro1badly.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 725,
    "title": "Rechargeable Electrical Wine Opener",
    "price": 2200,
    "description": "Rechargeable Electrical Wine Opener በቻርጅ የሚሰራ Price Or Join for more",
    "category": "Electronics",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136627/telegram_store_products/zutyn7e4bxiuulnyfzqi.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 726,
    "title": "Automatic cup washer",
    "price": 1000,
    "description": "Automatic cup washer Suitable for various cup mouth from 1.18 - 3.88in Price Or Join for more",
    "category": "Electronics",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136628/telegram_store_products/ymak3qd3rjjo5rsitizl.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 727,
    "title": "Hp pavilion 4 gb nvidia graphi s card( slightly us",
    "price": 29900,
    "description": "Hp pavilion 4 gb nvidia graphi s card( slightly used) Suitable for editing Core i5-7th genaration 2.7 ghz processoe speed 1000 gb hdd 8 gb ram 15.6&quot; screen size excellent battery life Price Or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136629/telegram_store_products/hdveznoqajt2fdplnqop.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 728,
    "title": "Orginal Samsung S10",
    "price": 23500,
    "description": "Orginal Samsung S10 Storage 128gb 8gb Ram Price Or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136629/telegram_store_products/wjp3xvtpv56p3h5etoep.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 729,
    "title": "Samsung S22 ULTRA 5G",
    "price": 75000,
    "description": "Samsung S22 ULTRA 5G 256GB 12GB RAM ALMOST NEW PRICE Or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136630/telegram_store_products/wmuapahahow0hqvbhbai.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 730,
    "title": "SAMSUNG NOTE 20 ULTRA 5G",
    "price": 45000,
    "description": "SAMSUNG NOTE 20 ULTRA 5G 256GB 12GB RAM ALMOST NEW PRICE Exchange possible or Or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136631/telegram_store_products/jb6vts7yxz5jqvmzspsz.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 732,
    "title": "Macbook pro corei5 2020 Retina",
    "price": 76000,
    "description": "Macbook pro corei5 2020 Retina Storage 512ssd 16gb Ram Touch bar Price Or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136631/telegram_store_products/xhxmxbjaku3dtbwon0eo.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 733,
    "title": "Original MI Note 8",
    "price": 16000,
    "description": "Original MI Note 8 Device Storage 128 Gb Ram 4 Gb Colour Moonlight White Battery Status Excellent ■lAlmost New Price Or Join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136632/telegram_store_products/rkaue7ghr4llzgdtzcfr.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 734,
    "title": "Geemy Professional Hair Clipper",
    "price": 2600,
    "description": "Geemy Professional Hair Clipper High Performance Stainless Steel Blade Adjustable Taper Control Cutting Length LCD Display Show Battery Capacity Percent Built In 2000mA Battery Charge Time 3-4 Hours Working Hours 4-5 Hours 3,6,10,13 mm Spacing Comb Oil Bottle Cleaning Brush Charging Adapter Stainless Steel chrome plate Segment Taper Lever Multi-cut clipper Ultimate power motor Special safety power supply cord price Or Join for more",
    "category": "Computer Accessories",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136632/telegram_store_products/j3qjzfgdblbdnkcyfjoy.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 735,
    "title": "Nova Hair Curling Iron",
    "price": 1500,
    "description": "Nova Hair Curling Iron 2 position Switch on/off Built In Stand Safety Pilot Light No tangle Swivel Cord safety cool Tip Slip Proof Grip price or Join for more",
    "category": "Networking",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136633/telegram_store_products/tjhxotgvfk9zsg7pfgau.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 737,
    "title": "hp Notebook",
    "price": 25000,
    "description": "hp Notebook 9𝙩𝙝 𝙜𝙚𝙣𝙚𝙧𝙖𝙩𝙞𝙤n AMD A10 4 Logical processors 10 Compute Cores HDD 1000🅖🅑 (1TB) Ram 8🅖🅑 procesor speed 2.6Ghrz 4GB RADION GRAPHICS CARD Screen size 15.6&quot; Slightly used Price: ☎️ Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136633/telegram_store_products/unlqts4um4i8glrxrnpt.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 738,
    "title": "New iPad 8th genaration",
    "price": 27500,
    "description": "New iPad 8th genaration 32 gb storage 10.1 Excellent battery life Super fast wifi Price Or Join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136634/telegram_store_products/c6hiltsbmkhskhldwx52.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 739,
    "title": "Nova Professional Hair Dryer",
    "price": 1700,
    "description": "Nova Professional Hair Dryer 3 Temperature Settings 2 Speed Settings Air Intake filter Hanging Loop Cool Shot 1800 W price or Join for more",
    "category": "Electronics",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136634/telegram_store_products/owh9tos2png9posu35ih.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 740,
    "title": "Lenovo Tinkpad",
    "price": 16000,
    "description": "Lenovo Tinkpad 4𝙩𝙝 𝙜𝙚𝙣𝙚𝙧𝙖𝙩𝙞𝙤n Core i5 4 Logical processors HDD 500🅖🅑 Ram 4🅖🅑 procesor speed 2.6Ghrz Screen size 15.6&quot; Slightly Ｕｓｅｄ Ｌａｐｔｏｐ Price: ☎️ Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136635/telegram_store_products/rtq1yk3lq4frnkjuztwd.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 741,
    "title": "Samsung Galaxy A53 5G",
    "price": 27000,
    "description": "Samsung Galaxy A53 5G Brand New Original/2022 model Android version 12 Dual Sim/Support 5G Network Camera:Quad/64MP Selfie:32MP 6 GB RAM 128 GB storage on screen mounted fingerprint sensor 5,000 mAh Battery capacity Price: or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136636/telegram_store_products/eyzpoivgor4uxp4hxuff.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 742,
    "title": "Samsung Galaxy A13",
    "price": 13,
    "description": "Samsung Galaxy A13 Brand New Original/2022 model Packed Android version 12 Dual Sim Camera:Quad/50Mp 4 GB RAM 64 GB storage Side mounted fingerprint sensor 5,000 mAh Battery Price: or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136636/telegram_store_products/c1npb41yncsxa9unt2ty.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 743,
    "title": "IPhone 11",
    "price": 0,
    "description": "IPhone 11 64GB Brand new 100% battery Price : 39,000 Exchange also possible Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136637/telegram_store_products/vgx3qqyx4jotvealgfpb.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 744,
    "title": "BM Satellite Waffle Maker",
    "price": 2600,
    "description": "BM Satellite Waffle Maker Non-stick Coating Warm up and ready indicator light Thermostatic Controlled Easy Cleaning Cool Touch Exterior AC220V - 240V 750W Price or Join for more",
    "category": "Electronics",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136638/telegram_store_products/pbmwjzooeedocmgkiguc.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 745,
    "title": "2 in 1 USB controller / joystick for pc (desktop a",
    "price": 700,
    "description": "2 in 1 USB controller / joystick for pc (desktop and laptop) Brand name: UCOM Price or join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136639/telegram_store_products/uzt9q4xq7uhvbluvrqwv.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 746,
    "title": "Update November 10",
    "price": 27500,
    "description": "Update November 10 Best student laptop -CORE I5 -Ram 8 -Storage 1 Tera -Generation 6th -(5 hours) battery life -Stereo speakers yes -Screen size 14.1 -webcam yes -VGA Yes -HDMI Yes -fingerprint Yes -clock speed 2.50 -microphone yes -headphone yes -Bluetooth yes -with white led backlight keyboard price Or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136639/telegram_store_products/bwdrfjbrwuojsqh9spnz.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 747,
    "title": "airpods pro",
    "price": 2200,
    "description": "airpods pro Wireless earbuds With wireless charging case black and white colors available up to 4.5 hours of listening time up to 3.5 hours of talk time on a single charge. Price or join for more",
    "category": "Audio",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136640/telegram_store_products/vbrmcf9qacgvlauftuaa.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 748,
    "title": "IPhone X",
    "price": 31500,
    "description": "IPhone X 256GB Brand new 100% battery Price : or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136640/telegram_store_products/dfgbx8e3fykfnwpgwjx1.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 749,
    "title": "Sink Slide box",
    "price": 0,
    "description": "Sink Slide box አትክልትና ፍራፍሬ ማጠብያ የታጠቡ ዕቃወች ማስቀመጫ Bearing weight Max 10kG Adjustment the length according to the slider&apos;s Fix clip to rim of sink Sliding from 37.5cm to 60cm ዋጋ፦ 1500 ብር Or Join for more",
    "category": "Electronics",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136641/telegram_store_products/go9latax1e8zeku98yve.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 750,
    "title": "Wireless Keyboard Mouse Set",
    "price": 1500,
    "description": "Wireless Keyboard Mouse Set 2.4Ghz wireless technology compatible with desktop, laptop &amp; tablet price or join for more products",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136641/telegram_store_products/aa658dkzpjl9ctgfyxs4.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 751,
    "title": "Electric Kitchen Water Heater Tap Instant Hot Wate",
    "price": 3000,
    "description": "Electric Kitchen Water Heater Tap Instant Hot Water Faucet የኪችንዎ እቃ ማጠቢያ ላይ በቀላሉ በመግጠም በቀላሉ ሙቅና ቀዝቃዛ ውሀ የሚያገኙበት በ 3 ሰከንድ ውስጥ የሚያሞቅ የሙቀጥ መጠኑን የሚያሳይ ስክሪን ያለው እስከ 60°C ድረስ የሚያሞቅ የሙቀት መጠኑን መቆጣጠር የሚያስችል ቀዝቃዛም ሙቅም መጠቀም የምንችልበት Feature - 3 seconds quick heat. Double isolation of water and electricity to ensure safe use. Hot and cold dual use. Temperature display screen available. Easy to use, ready to use. Water temperature can be adjusted at will (30~60°C). more durable and lasting. Convenient, simple, and easy to install, It can be used in kitchen. Price Free delivery or Join for more",
    "category": "Computer Accessories",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136643/telegram_store_products/odmpmzbbsind8hbhbbkq.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 752,
    "title": "Memory card 512GB",
    "price": 2800,
    "description": "Memory card 512GB Brand-LENOVO Reading speed: 100MB/s Writing speed: 50MB/s Applicable devices support TF card: smart phone, digital camera, surveillance camera, tablet PC, laptop, etc. 100% original Memory card adapter is included Price- Or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136645/telegram_store_products/vnwvr9b782xjn6xqzdgx.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 753,
    "title": "Iphone 12promax",
    "price": 80000,
    "description": "Iphone 12promax Storage 256gb Btry 97 Price or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136645/telegram_store_products/dj8illkz2dzlqxmvgiqq.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 754,
    "title": "IPhone X 256 gb",
    "price": 24000,
    "description": "IPhone X 256 gb Slightly Used Battery Status Excellent Colour Black Icloud Free Price or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136646/telegram_store_products/uxyc4eqnav5hffny2ofq.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 755,
    "title": "External case for internal hard disk USB 2.0",
    "price": 500,
    "description": "External case for internal hard disk USB 2.0 Convert your internal hard disks to external hard disks Price or join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136646/telegram_store_products/bujh91misbulbkwvklkn.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 756,
    "title": "Ipad 8thbgeneration",
    "price": 24000,
    "description": "Ipad 8thbgeneration Storage 32gb Wifi Price or Or Join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136647/telegram_store_products/bi3u9dxrelnwvrtwalk4.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 757,
    "title": "Samsung Galaxy A13",
    "price": 13,
    "description": "Samsung Galaxy A13 Brand New Original/2022 model Packed Android version 12 Dual Sim Camera:Quad/50Mp 4 GB RAM 64 GB storage Side mounted fingerprint sensor 5,000 mAh Battery Price: or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136648/telegram_store_products/akknmydllswfejlqurbx.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 758,
    "title": "Samsung Galaxy Note 9",
    "price": 9,
    "description": "Samsung Galaxy Note 9 Brand new and Original Carrier Verizon Made in Vietnam Android version 11 Camera:Dual 12MP+12MP Selfie:8MP+2MP(iris scanner) 6 GB RAM 128 GB storage 4,000 mAh Battery Price To or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136649/telegram_store_products/cdyebw4qosrcxybvszbq.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 759,
    "title": "Iphone Xs Max",
    "price": 33000,
    "description": "Iphone Xs Max Storage 64gb Btry 87 Price To or Or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136649/telegram_store_products/t8gu1wfaoq1c6u887mfy.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 760,
    "title": "Samsung Galaxy S10 5G 256GB",
    "price": 27500,
    "description": "Samsung Galaxy S10 5G 256GB Brand New Original Korean phone Supports 5G Network Android version 12 Camera:Triple 12Mp+12Mp+16Mp 8 GB RAM 256 GB storage 4,500 mAh Birr Price To or Or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136650/telegram_store_products/kbya7zoovd8k41wo1ujm.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 761,
    "title": "Samsung Galaxy S9",
    "price": 9,
    "description": "Samsung Galaxy S9 Brand New 100% Original Korean phone Android version 12 4G LTE Network Camera:12MP 4 GB RAM 64 GB storage 3,000 mAh Battery capacity Price: To or Or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136650/telegram_store_products/sojrtjkmyrixajygrdmn.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 762,
    "title": "Iphone x 256 GB",
    "price": 30000,
    "description": "Iphone x 256 GB As good as new Battery health 100 % Price To or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136651/telegram_store_products/nttp9n6kgwh8byorgl7d.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 763,
    "title": "Brand New Hp Elitebook X360 Convertible",
    "price": 47500,
    "description": "Brand New Hp Elitebook X360 Convertible core i5-7th generation Screen size :14nch full HD (1920x1080) screen display Touch screen Storage: 512SSD Ram : 16GB DDR4 9hrs hours battery life White keyboard light Price To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136652/telegram_store_products/ig4moldz1l5fke38zekm.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 764,
    "title": "Lenovo yoga almost new,360 degree touch screen",
    "price": 34500,
    "description": "Lenovo yoga almost new,360 degree touch screen full hd core i5-7th genaration 2.7 ghz procesor speed 1000 gb hdd,plus has SSD slot 8 gb ram has keyboard light excellent battery life(above 8hrs) with one year warranty price To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136653/telegram_store_products/zqqnmmtsrp7apkouwtss.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 765,
    "title": "Iphone 8",
    "price": 15500,
    "description": "Iphone 8 Storage 64gb Price To or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136654/telegram_store_products/gvgb9wcs6x2uverssbc0.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 766,
    "title": "Samsung Galaxy A13",
    "price": 13,
    "description": "Samsung Galaxy A13 Brand New Original/2022 model Packed Android version 12 Dual Sim Camera:Quad/50Mp 4 GB RAM 64 GB storage Side mounted fingerprint sensor 5,000 mAh Battery Discount price for fetan ecommerce subscribers Price: or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136654/telegram_store_products/ot71smgcam44nbjblkrj.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 767,
    "title": "Lenovo yoga",
    "price": 33500,
    "description": "Lenovo yoga stylish design laptop battery above 8rs touch screen and X360 Intel(R) Core(TM) i5 - 6th 512GB SSD STORAGE 8 GB RAM Keyboard backlight Ultra slim 14 inch FULL HD with pen PRICE To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136655/telegram_store_products/txwzzxb73xkv5aevtzyl.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 768,
    "title": "Lenovo IdeaPad",
    "price": 22000,
    "description": "Lenovo IdeaPad 4𝙩𝙝 𝙜𝙚𝙣𝙚𝙧𝙖𝙩𝙞𝙤n Core i7 4 Logical processors HDD 1000 GB Ram 8 GB procesor speed 2.6Ghrz Screen size 14.1&quot; Slightly used laptop Price: To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136655/telegram_store_products/y9vcppk5fbmq0zvuajbi.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 769,
    "title": "MacBook Pro 2022",
    "price": 175000,
    "description": "MacBook Pro 2022 Factory Sealed Packed M2 Chip -2022 256GB SSD Storage 8GB unified memory 13.3-inch (diagonal) Resolution display 2560 by 1600 pixels. 8 Core CPU &amp; 10 Core GPU Price To or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136656/telegram_store_products/sp2trjyg2mueq8qr6tjv.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 770,
    "title": "Samsung Galaxy A13",
    "price": 13,
    "description": "Samsung Galaxy A13 Brand New Original/2022 model Packed Android version 12 Dual Sim Camera:Quad/50Mp 4 GB RAM 64 GB storage Side mounted fingerprint sensor 5,000 mAh Battery Price: or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136656/telegram_store_products/ezypuyidtaya8do9vlfu.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 771,
    "title": "hp Probook",
    "price": 23000,
    "description": "hp Probook 4𝙩𝙝 𝙜𝙚𝙣𝙚𝙧𝙖𝙩𝙞𝙤n Core i5 4 Logical processors HDD 1000 GB Ram 8 GB procesor speed 2.6 Ghz Screen size 14.1&quot; Slightly used laptop Price: To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136657/telegram_store_products/jme70yyhumkvcw2g4ww8.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 772,
    "title": "Hp slim probook",
    "price": 35500,
    "description": "Hp slim probook i16gb DDR4 RAM Core i7 6th generation Processor 2.6ghz up to 3.40 Condition: NEW Screen :14.1 inch 1080p FHD Storage : 512 SSD GRAPHICS: intel UHD Graphics 5hr.+ hours battery life White keyboard backlit B&amp;O HD Sound system Price : To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136658/telegram_store_products/a20un626kwr2bziw22mv.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 773,
    "title": "airpods pro",
    "price": 2200,
    "description": "airpods pro Wireless earbuds With wireless charging case black and white colors available up to 4.5 hours of listening time Price or join for more",
    "category": "Audio",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136658/telegram_store_products/rd0hk9mbd5ttyyqygfvb.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 774,
    "title": "Hp core i5-7th genaration",
    "price": 24500,
    "description": "Hp core i5-7th genaration touch screen with orginal charger 1000 gb hdd 8gb ram excellent battery life 15.6 screen size Price To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136659/telegram_store_products/jt8c1tqyx7jom8pg8nir.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 775,
    "title": "External case for internal hard disk USB 2.0",
    "price": 500,
    "description": "External case for internal hard disk USB 2.0 Convert your internal hard disks to external hard disks Price or join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136660/telegram_store_products/ubio9cvcoe5vppuklkop.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 776,
    "title": "Redmi Note 11 pro+ 5G",
    "price": 29500,
    "description": "Redmi Note 11 pro+ 5G Brand New Original/2022 model/ Android version 12 Dual Sim/5G Network technology Quad camera:1O8MP 8+3 GB RAM 256 ⒼⒷ storage 4,500 mAh Battery 67 Watt Fast charger 30 Minutes for full charge Price To or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136660/telegram_store_products/t6mivu5mxnebfdvpho0n.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 777,
    "title": "Flexible USB keyboard",
    "price": 400,
    "description": "Flexible USB keyboard Saves space when carrying around Price To or or sellers can us to get products posted join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136661/telegram_store_products/tkmopy7plvkbkxvvp8vq.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 778,
    "title": "Toshiba TECRA",
    "price": 14000,
    "description": "Toshiba TECRA Core i5 4 Logical processors HDD 500 GB Ram 4 GB procesor speed 2.7 Ghz Screen size 14.1&quot; Price: To or Join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136662/telegram_store_products/i0ba3ny8mxckkdjztakv.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 779,
    "title": "2 in 1 USB controller / joystick for pc (desktop a",
    "price": 700,
    "description": "2 in 1 USB controller / joystick for pc (desktop and laptop) Brand name: UCOM Price or join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136663/telegram_store_products/okngnlg7l6jer9kyttyf.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 780,
    "title": "Brand New Dell Precision Xps 15",
    "price": 79999,
    "description": "Brand New Dell Precision Xps 15 Intel Core I7-8th Generation FHD Screen Resolution 512GB SSD storage 16GB RAM DDR4 Memory Full HD 1920x1080 15.6 inch Screen size White Keyboard light 6-cores 12- logical processor Above 12 Hours Battery life Nvidia Quadro P2000(Better than GTX 1650) 4GB dedicated graphics PRICE To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136664/telegram_store_products/tukb9wrajmpcrwse25ix.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 781,
    "title": "Samsung Galaxy A13",
    "price": 13,
    "description": "Samsung Galaxy A13 Brand New 2022 model packed Android version 12 Dual Sim Camera:Quad/50Mp 4 GB RAM 64 GB storage Side mounted fingerprint sensor 5,000 mAh Battery Price: or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136664/telegram_store_products/gzftptskhrkn1h7k6z8a.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 782,
    "title": "BRAND NEW HP ENVY X360",
    "price": 79500,
    "description": "BRAND NEW HP ENVY X360° Intel Core i7-10700U (4 Core 8 Logical Processor ) 10th Generation 2.5 Ghz Processor Speed Turbo Boost up to 5.0 Ghz 512GB SSD 12GB DDR4 Ram Long Last Battery Life, 15.6&quot; Screen Size Price To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136665/telegram_store_products/o7glfrx54z7tpimt2ngh.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 783,
    "title": "Macbook air 2020",
    "price": 59500,
    "description": "Macbook air 2020 8 gb ram 256 gb ssd 13.3 inch screen Price To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136665/telegram_store_products/hjdhmwd07pdpi2anoewi.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 784,
    "title": "Galaxy watch 5 pro",
    "price": 43000,
    "description": "Galaxy watch 5 pro Price To or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136666/telegram_store_products/vfup4a4vog9rkgied398.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 785,
    "title": "Iphone 11 pro Max",
    "price": 58000,
    "description": "Iphone 11 pro Max Storage 256gb Dual sim Battery health 83 Price To or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136667/telegram_store_products/fffldj2vu60szx1dsfg0.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 786,
    "title": "WD elements external hard disk",
    "price": 4200,
    "description": "WD elements external hard disk 1 tera byte (1TB) Price To or Join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136667/telegram_store_products/y3ykawxghj9oir410s59.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 787,
    "title": "Apple Watch Series 3",
    "price": 9000,
    "description": "Apple Watch Series 3 Size - 44MM PRICE - To or Join for more",
    "category": "Wearables",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136668/telegram_store_products/vl0kdp9bgipnhtbsyueg.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 788,
    "title": "New iPad 8th genaration",
    "price": 26500,
    "description": "New iPad 8th genaration 32 gb storage 10.1 inch screen excellent battery life Price To or Join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136668/telegram_store_products/rihtmxetqtihp51gfavt.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 789,
    "title": "Hp elitebook g3",
    "price": 29000,
    "description": "Hp elitebook g3 Core i5 6th generation Ram 8 GB Storage 1 TB Price To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136669/telegram_store_products/tsqkz5jkgse9w1g3imeg.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 790,
    "title": "Hp elitebook g1",
    "price": 24000,
    "description": "Hp elitebook g1 Core i5 4th generation Ram 4 GB Storage 500 GB Price To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136670/telegram_store_products/n5fpttnc6gx49lg35wkd.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 791,
    "title": "2 in 1 USB controller / joystick for pc (desktop a",
    "price": 700,
    "description": "2 in 1 USB controller / joystick for pc (desktop and laptop) Brand name: UCOM Price or join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136671/telegram_store_products/p3wxlsidyewqb4otbwj8.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 792,
    "title": "Samsung Galaxy Note 8",
    "price": 8,
    "description": "Samsung Galaxy Note 8 Brand new Made in Korea Android version 9/Upgradable Camera:Dual 12MP+12MP Selfie:8MP+2MP(iris scanner) 6 GB RAM 64 GB storage 3,300 mAh Battery Price To or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136672/telegram_store_products/vkpqg5mdotubx7j5pc3n.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 793,
    "title": "lenovo thinkpad",
    "price": 28500,
    "description": "lenovo thinkpad 9 hours+ real battery life Core i5 7th generation Intel® Core™ i5-7200U Processor (6M Cache, up to 3.10 GHz) Model : thinkpad Condition: New Screen :14.1 inch FHD Storage : 1TB HDD + ssd slot Ram : 8gb DDR4 GRAPHICS: intel® UHD 9hr.+ hours battery life Slim &amp; Lightweight HD Sound system white keyboard backlit Price : To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136672/telegram_store_products/myjcj93kymzvqcgwva7t.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 794,
    "title": "Wireless Keyboard Mouse Set",
    "price": 1500,
    "description": "Wireless Keyboard Mouse Set 2.4Ghz wireless technology compatible with desktop, laptop &amp; tablet price or join for more products",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136673/telegram_store_products/vcjqi7cpm9209i0vtnse.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 795,
    "title": "Flexible USB keyboard",
    "price": 400,
    "description": "Flexible USB keyboard Saves space when carrying around Price To or or join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136674/telegram_store_products/cdtojnue42jmhslahioz.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 796,
    "title": "Samsung _S22 ultra ( 256 GB",
    "price": 97000,
    "description": "Samsung _S22 ultra ( 256 GB ) New Orignal single Sim Camera: 108Mp(ultrawide) + 10Mp+ 12Mp Front(selfie) : 40 Mp (4k video) video: 8k/60fps 12 GB Ram Storage :- 256 GB 5,000 mAh Battery Price: To or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136674/telegram_store_products/wqv0emwvf4ydixzhvsiv.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@30"
  },
  {
    "id": 797,
    "title": "Lenovo yoga laptop",
    "price": 33500,
    "description": "Lenovo yoga laptop battery above 8rs touch screen and X360 Intel(R) Core(TM) i5 - 6th 512GB SSD STORAGE 8 GB RAM Keyboard backlight Ultra slim 14 inch FULL HD with pen PRICE To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136675/telegram_store_products/thuex4tjnjprdw0bo9ss.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 798,
    "title": "Iphone 12",
    "price": 52000,
    "description": "Iphone 12 Storage 128gb Battery heakth 89 percent Price To or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136675/telegram_store_products/kaobmdpjouhpral7vax3.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 799,
    "title": "Samsung Galaxy A13",
    "price": 13,
    "description": "Samsung Galaxy A13 Brand New 2022 model packed Android version 12 Dual Sim Camera:Quad/50Mp 4 GB RAM 64 GB storage Side mounted fingerprint sensor 5,000 mAh Battery Price: or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136676/telegram_store_products/qaadoh8p2fueuc4nxm6r.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 800,
    "title": "Hp elitebook i5 8th generation",
    "price": 42500,
    "description": "Hp elitebook i5 8th generation Processor - Intel core i5 Generation - 8th gen Storage - 512gb SSD Ram - 8gb DDR4 Screen - 14 inch Full HD Graphics - intel hd graphics Aluminum body Infinity screen Keyboard backlit Battery - 7hrs and above Status - Brand new Price - To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136677/telegram_store_products/gs9wxtgcr11hlf2qswxq.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 801,
    "title": "Samsung Z Flip 3 5g",
    "price": 63000,
    "description": "Samsung Z Flip 3 5g Storage 256gb 8gb Ram Price To or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136677/telegram_store_products/idpeqzkchyeogfhw3jvx.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 802,
    "title": "LENOVO Idealpad",
    "price": 15000,
    "description": "LENOVO Idealpad 5th 𝙜𝙚𝙣𝙚𝙧𝙖𝙩𝙞𝙤n Core i3 4 Logical processors HDD 750 GB Ram 6 GB processor speed 2.6 Ghz Screen size 15.1&apos;&apos; 2 GB RADEON GRAPHICS CARD Status Used Price: To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136678/telegram_store_products/bjr9bm0gsiizldl3k12y.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 803,
    "title": "hp Notebook",
    "price": 20000,
    "description": "hp Notebook 4𝙩𝙝 𝙜𝙚𝙣𝙚𝙧𝙖𝙩𝙞𝙤n Core i5 4 Logical processors HDD 500 GB Ram 4 GB procesor speed 2.4Ghz 2 gb NVIDIA GFORCE Graphics Card Screen size 15.6&quot; Used laptop Price: To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136678/telegram_store_products/k83hd4p2ipbwxhdlos4n.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 804,
    "title": "Wired controller / Joystick for pc",
    "price": 500,
    "description": "Wired controller / Joystick for pc Price or for Join for more",
    "category": "Gaming",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136679/telegram_store_products/eaxo3kljplgxzinxs4o6.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 805,
    "title": "IPad Pro 11inch 2018",
    "price": 45000,
    "description": "IPad Pro 11inch 2018 Storage 64gb Sim+Wi-Fi Price To or Join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136679/telegram_store_products/sev3tlcepkf1twtu8ohf.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 806,
    "title": "Samsung M33_5G /2022/ (128 GB",
    "price": 20500,
    "description": "Samsung M33_5G /2022/ (128 GB) New Orignal dual sim Camera: 50Mp(ultrawide) + 5Mp+ 2Mp+ 2Mp Front(selfie) : 8 Mp 6 GB Ram Storage :- 128 GB 6000 mAh Battery price: To or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136680/telegram_store_products/lrunko32v42cbtq7ijlp.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 808,
    "title": "2 in 1 USB controller / joystick for pc (desktop a",
    "price": 700,
    "description": "2 in 1 USB controller / joystick for pc (desktop and laptop) Brand name: UCOM Price or join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136681/telegram_store_products/ugsumxh1rf7ndjuyr6qa.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 809,
    "title": "Lenovo idealpad",
    "price": 28000,
    "description": "Lenovo idealpad 7𝙩𝙝 𝙜𝙚𝙣𝙚𝙧𝙖𝙩𝙞𝙤n Core i5 4 logical processors HDD 1 TB Ram 8 GB procesor speed 2.7Ghz 4 gb NVIDIA GFORCE Graphics Card Screen size 15.6&quot; Used laptop Price: To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136682/telegram_store_products/vqmxthoxbfbcq3uxy4rk.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 810,
    "title": "Wireless Keyboard Mouse Set",
    "price": 1500,
    "description": "Wireless Keyboard Mouse Set 2.4Ghz wireless technology compatible with desktop, laptop &amp; tablet price or join for more products",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136683/telegram_store_products/azkg90lowjs0nmwplxu4.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 811,
    "title": "Original Play Station 5",
    "price": 65000,
    "description": "Original Play Station 5 With Fifa 23 Almost New 1 Tb Internal Storage With 1 Original Controller Price To or Join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136683/telegram_store_products/hrib3ifw1r0grrzhhbh3.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 812,
    "title": "HP Pavillion Gaming laptop",
    "price": 60000,
    "description": "HP Pavillion Gaming laptop intel core i5 10th generation Ram 8GB Storage 256GB SSD Screen size 15.6 inch full HD Graphics NVIDIA Geforce GTX 1650 4GB price To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136683/telegram_store_products/nilnttn6l6bux3mgx4z6.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 813,
    "title": "Flexible USB keyboard",
    "price": 400,
    "description": "Flexible USB keyboard Saves space when carrying around Price To or or join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136684/telegram_store_products/k4tx87sqxqibys8idkk6.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 814,
    "title": "Brand New Hp Envy core i7",
    "price": 75000,
    "description": "Brand New Hp Envy core i7 11th Generation 512GB SSD 12 GB RAM Iris graphics card X360 touch 15.6” 4K screen Price : To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136685/telegram_store_products/pdpxyxs4nmc0ifqds2km.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 815,
    "title": "Wireless Controller for Playstation 3",
    "price": 3,
    "description": "Wireless Controller for Playstation 3 brand new and packed charger not included in the package Price join for more for or",
    "category": "Computer Accessories",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136685/telegram_store_products/vpabozxw83hghltlyitj.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@fetanecommerce"
  },
  {
    "id": 816,
    "title": "iPhone 11 pro",
    "price": 43000,
    "description": "iPhone 11 pro slightly used single sim Camera: 12mp + 12Mp + 12Mp video: 4k Front : 12MP front video: 4k storage: 64 GB Battery health : 86% color: midnight green Price: To or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136686/telegram_store_products/qdstcxh5nu5dd2oep8yf.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 817,
    "title": "Hp Elitebook core i5",
    "price": 27000,
    "description": "Hp Elitebook core i5 14 inch screen 6th Generation 256GB SSD 8GB RAM Price : To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136687/telegram_store_products/s33zswhsibddv08p0fhl.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 818,
    "title": "Samsung Galaxy A13",
    "price": 13,
    "description": "Samsung Galaxy A13 Brand New 2022 model packed Android version 12 Dual Sim Camera:Quad/50Mp 4 GB RAM 64 GB storage Side mounted fingerprint sensor 5,000 mAh Battery Price: or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136687/telegram_store_products/la8lbdhgznxctgpdgznk.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 819,
    "title": "Ring fill light with Tripod Stand for Tiktok, Vide",
    "price": 3800,
    "description": "Ring fill light with Tripod Stand for Tiktok, Video Lovers 26 cm 10″ Ring Light features 3 light colors (Warm, Cool White, Daylight) and 11 levels brightness in each color, 33 options in total. You can choose any option in between if there’s a perfect setting. 【Adjustable &amp; Stable Tripod】:- Extending from 16″ to 50″, and tripod legs unfold up to 30″ wide, the stable tripod can be adjusted to any height within as needed, short enough to stand on tabletop, tall enough to fit your height. Price To or Join for more",
    "category": "Cameras",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136688/telegram_store_products/huv7qz8nceugtjwubouf.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 820,
    "title": "lenevo thinkpad",
    "price": 32500,
    "description": "lenevo thinkpad Slim Core i5 6th Generation 3.0 ghz processor Model :thinkpad T470 GRAPHICS: intel HD graphics 520 Screen :14.1inch 1080p FHD Storage : 1TB HDD AND 256SSD Ram : 8gb DDR4 5hr.+ hours battery life white keyboard backlit finger print support HD Sound system Price : To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136688/telegram_store_products/qfe9sype6rreiccrnqe0.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 821,
    "title": "Hp Core i5",
    "price": 31500,
    "description": "Hp Core i5 -Generation 7th -Ram 8 -Storage 1000 GB -processor clock speed 2.90 -Full HD Display -Screen size 14.1 inch - Backlight keybord Price To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136689/telegram_store_products/qjrhdbo8kfd2836onc9z.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 822,
    "title": "Iphone 11",
    "price": 40000,
    "description": "Iphone 11 Storage 128gb Dual sim Battery 85 percent Price To or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136690/telegram_store_products/dht2ln1p2yeixlcdm2xp.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 823,
    "title": "hp Probook 650 G3",
    "price": 26000,
    "description": "hp Probook 650 G3 Core i5 6th Generation 4 Logical processors HDD 1000 GB Ram 8 GB procesor speed 2.8 Ghz Screen size 15.6&apos;&apos; Touch Screen Price: To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136690/telegram_store_products/wtx0fyh29ejxqqwwofyt.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 824,
    "title": "Microsoft Surface pro 6",
    "price": 38000,
    "description": "Microsoft Surface pro 6 Corei5 8th generation Storage 128gb ssd 8gb Ram Touch and Detachble Price To or Join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136691/telegram_store_products/yg8hlpbmb2tmmvjt3sak.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 825,
    "title": "Wired controller / Joystick for pc",
    "price": 500,
    "description": "Wired controller / Joystick for pc Price or for Join for more",
    "category": "Gaming",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136691/telegram_store_products/uidw5rk6lwfdrr7i8jjk.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 826,
    "title": "Play Station 5",
    "price": 65000,
    "description": "Play Station 5 With Fifa 23 Almost New 1 Tb Internal Storage With 1 Original Controller Price To or Join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136692/telegram_store_products/alvhvjycry7szoj0s2pa.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 827,
    "title": "Sony PlayStation 4",
    "price": 23000,
    "description": "Sony PlayStation 4 Status used Internal storage-500Gb one original joystick Including, Fifa 2023 Gta 5 fifa 2017 Price To or Join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136693/telegram_store_products/lbk3cxrojgwdkaovlxwy.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 828,
    "title": "IPhone 11",
    "price": 40500,
    "description": "IPhone 11 64GB Brand new 100% battery Price : Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136693/telegram_store_products/du3ynjwiy70gvxmp08ta.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 829,
    "title": "Samsung _M32 /2021/ (128 GB",
    "price": 18500,
    "description": "Samsung _M32 /2021/ (128 GB) dual sim Camera: 64Mp(ultrawide) + 8Mp+ 2Mp+ 2Mp Front(selfie) : 20 Mp 6 GB Ram Storage :- 128 GB 6,000 mAh Battery price: To or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136694/telegram_store_products/h7fpjah30kmmexuvqzle.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 830,
    "title": "Hp CORE I5",
    "price": 27500,
    "description": "Hp CORE I5 -Ram 8 -Storage 1 Tera -Generation 6th -Screen size 14.1 inch -clock speed 2.50 Ghz -with white led backlight keyboard price To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136695/telegram_store_products/bnpuzqe1trwqyppudmih.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 831,
    "title": "Macbook pro (Retina, 13.3- inch, 2015",
    "price": 42000,
    "description": "Macbook pro (Retina, 13.3- inch, 2015) Processor: 2.7 GHz, intel Core i5 256GB SSD Storage 8GB RAM very excellent condition also have box With intel iris Graphics card Retina display with True Tone with 13- inch Screen in size 488 cycle count battery above 7:00 hours it has warranty Price To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136695/telegram_store_products/hh1ty9gthss3u2mdkj7g.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 832,
    "title": "MSI with box,RTX 3060,6 gb nvidia graphics card",
    "price": 112000,
    "description": "MSI with box,RTX 3060,6 gb nvidia graphics card for gamers, for editing,rendering, architects 16 gb ram 512 gb ssd,plus has hdd slot Full HD 15.6&quot; screen size Price To or Join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136696/telegram_store_products/xa60qhpmevieneeumhny.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 833,
    "title": "Iphone 12 pro Max",
    "price": 82000,
    "description": "Iphone 12 pro Max Storage 256gb Battery 100 Price To or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136697/telegram_store_products/ikfcimlxofjmlxnbjtnp.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 835,
    "title": "lenevo thinkpad",
    "price": 32500,
    "description": "lenevo thinkpad Slim Core i5 6th Generation 3.0 ghz processor Model :thinkpad T470 GRAPHICS: intel HD graphics 520 Screen :14.1inch 1080p FHD Storage : 1TB HDD AND 256SSD Ram : 8gb DDR4 5hr.+ hours battery life white keyboard backlit finger print support HD Sound system Price : To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136697/telegram_store_products/wbmmedch4wi3xwh3ywk4.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 836,
    "title": "Samsung _A71_5G ( 128 GB",
    "price": 21500,
    "description": "Samsung _A71_5G ( 128 GB ) single Sim /5G network Camera: 64Mp(ultrawide) + 12Mp+ 5Mp+5Mp Front(selfie) : 32 Mp (4k video) video: 4k, 1080p 8 GB Ram Storage :- 128 GB 4500 mAh Battery Price: To or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136698/telegram_store_products/eyxfmwt2qtngccg2klhn.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@30fps"
  },
  {
    "id": 839,
    "title": "Hp CORE I5",
    "price": 27000,
    "description": "Hp CORE I5 Ram 8 Storage 1 Tera Generation 6th 5 hours battery life clock speed 2.50 Ghz With led backlight keyboard price To or Join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136699/telegram_store_products/s0alx0tadieltqilgrrr.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 840,
    "title": "Flexible USB keyboard",
    "price": 600,
    "description": "Flexible USB keyboard Saves space when carrying around Price To or or join for more",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136700/telegram_store_products/woidi7xhwyoixush8uav.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 841,
    "title": "Samsung Galaxy A13",
    "price": 13,
    "description": "Samsung Galaxy A13 Brand New 2022 model packed Android version 12 Dual Sim Camera:Quad/50Mp 4 GB RAM 64 GB storage 5,000 mAh Battery Price: or Join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136700/telegram_store_products/nrbsgmhgckhl456zmz8c.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 844,
    "title": "Wireless Keyboard Mouse Set",
    "price": 1500,
    "description": "Wireless Keyboard Mouse Set 2.4Ghz wireless technology compatible with desktop, laptop &amp; tablet price or join for more products",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136701/telegram_store_products/pvwoc338r2cdcyvb7jyu.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 845,
    "title": "airpods pro",
    "price": 2200,
    "description": "airpods pro For fed up of wired earphones ? Wireless earbuds With wireless charging case black and white colors available up to 4.5 hours of listening time Price or join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136701/telegram_store_products/mp55wgt2yfywd8fferas.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 846,
    "title": "Wireless Keyboard Mouse Set",
    "price": 1500,
    "description": "Wireless Keyboard Mouse Set 2.4Ghz wireless technology compatible with desktop, laptop &amp; tablet price or join for more products",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136702/telegram_store_products/lx5hacgc2luk3jg8c66c.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 847,
    "title": "Hp elitebook 840 G3",
    "price": 25500,
    "description": "Hp elitebook 840 G3 Price To see more details and other products visit the website below",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136702/telegram_store_products/me9exh36vvtdlsucosva.jpg"
    ],
    "seller_phone": null,
    "telegram_username": null
  },
  {
    "id": 848,
    "title": "SAMSUNG Galaxy Note 9",
    "price": 19500,
    "description": "SAMSUNG Galaxy Note 9 Original slightly used 128GB/6GB Price New: Phone number",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136703/telegram_store_products/tqpbdmlbzifggua1oucg.jpg"
    ],
    "seller_phone": "0913393937",
    "telegram_username": null
  },
  {
    "id": 850,
    "title": "Wireless Controller for Playstation 3",
    "price": 3,
    "description": "Wireless Controller for Playstation 3 brand new and packed charger not included in the package Price Free delivery included Order on ishururu.com to get discount Phone number",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136703/telegram_store_products/q8i6oam2auobhvtkjcis.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": null
  },
  {
    "id": 851,
    "title": "Sign up on ishururu.com and post anything you want",
    "price": 0,
    "description": "Sign up on ishururu.com and post anything you want to sell. It is linked to telegram group with more than 15000 members",
    "category": "Electronics",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136704/telegram_store_products/msra54sfeyq27xkhcbrs.jpg"
    ],
    "seller_phone": null,
    "telegram_username": null
  },
  {
    "id": 853,
    "title": "Hisense washing machine",
    "price": 50000,
    "description": "Hisense washing machine Washing capacity 14 kg Status almost new Price 24 Phone number",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136705/telegram_store_products/sfkroqux0zqpzasnghwh.jpg"
    ],
    "seller_phone": "0909541699",
    "telegram_username": null
  },
  {
    "id": 854,
    "title": "Sign up on ishururu.com and post anything you want",
    "price": 0,
    "description": "Sign up on ishururu.com and post anything you want to sell. It is linked to telegram group with more than 15000 members Also available as channel",
    "category": "Electronics",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136705/telegram_store_products/rsmskguznhi9tokf2l6q.jpg"
    ],
    "seller_phone": null,
    "telegram_username": "@ishururu"
  },
  {
    "id": 857,
    "title": "Wired controller / Joystick",
    "price": 600,
    "description": "Wired controller / Joystick For laptop or desktop games Brand UCOM Cable length 1.8m Price or for Join telegram channel or visit ishururu.com for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136706/telegram_store_products/iii03cs0utmnzwyelcmy.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 858,
    "title": "Our round giveaway is here. It stays for 2",
    "price": 0,
    "description": "Our round giveaway is here. It stays for 2 days. To participate visit ishururu.com and send screenshot with last three digits of your phone number to . You must be subscriber of telegram channel. Participators of last give away will be given two chances. You can invite your friends to participate in the give away. Just make sure they subscribe to our telegram channel first. We will increase the prize when participators increase. Good luck to you all",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136707/telegram_store_products/v2hfchln9hd9iichkyw8.jpg"
    ],
    "seller_phone": null,
    "telegram_username": "@bkbk92"
  },
  {
    "id": 860,
    "title": "airpods pro",
    "price": 2200,
    "description": "airpods pro fed up of repetitively purchasing wired earphones when they get damaged? Wireless earbuds With wireless charging case black and white colors available up to 4.5 hours of listening time By using left or right a time you can get 9 hours of playback Including free delivery Price or join for more",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136707/telegram_store_products/iqdozpt9zefqx9niesyw.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 861,
    "title": "Wireless Keyboard Mouse Set",
    "price": 1500,
    "description": "Wireless Keyboard Mouse Set 2.4Ghz wireless technology compatible with desktop, laptop &amp; tablet price To order Join for more products",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136708/telegram_store_products/hduzzhpnd0p4fs0byme3.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@ishururu"
  },
  {
    "id": 862,
    "title": "Logitech Wireless Keyboard and mouse Combo",
    "price": 1700,
    "description": "Logitech Wireless Keyboard and mouse Combo Full sized keyboard with media keys, a number pad and precise cursor control Price Free delivery included to order join for more",
    "category": "Computer Accessories",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136708/telegram_store_products/whjgsxbjdy3utbqd37zy.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@ishururu"
  },
  {
    "id": 864,
    "title": "Transcend External hard disk 2 terabyte 2 TB",
    "price": 9800,
    "description": "Transcend External hard disk 2 terabyte 2 TB Usb 3.1 portable hard drive Store jet 25m3 Price Free delivery included Phone number",
    "category": "Phones",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136709/telegram_store_products/kgcganarovh3yzw2jnw9.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": null
  },
  {
    "id": 866,
    "title": "Transcend 2TB hard disk",
    "price": 10000,
    "description": "Transcend 2TB hard disk USB 3.1 Gen 1 portable hard drive Store jet 25M3 price",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136709/telegram_store_products/khral4cgvpx4s9gsvily.jpg"
    ],
    "seller_phone": "0934512207",
    "telegram_username": null
  },
  {
    "id": 867,
    "title": "External Hard Disk",
    "price": 945542690,
    "description": "External Hard Disk Price 8,000 ☎️ Brand: Seagate Type: Hard disk Condition: Brand New Storage: 2TB",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136710/telegram_store_products/v5kseqntc4qkiw1rsy76.jpg"
    ],
    "seller_phone": "0945542690",
    "telegram_username": null
  },
  {
    "id": 868,
    "title": "Wired controller / Joystick",
    "price": 600,
    "description": "Wired controller / Joystick For laptop or desktop games Brand UCOM Cable length 1.8m Price or for Join telegram channel or visit ishururu.com for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136711/telegram_store_products/hxlpptg91zwxgnpgp0mo.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136711/telegram_store_products/rwzqjns10vtvuzut7otk.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136712/telegram_store_products/f19m3fkbulx6wn8zxiwd.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@bkbk92"
  },
  {
    "id": 869,
    "title": "Product 869",
    "price": 0,
    "description": "",
    "category": "Electronics",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136712/telegram_store_products/jmh0z55wkw1eecl1bvm4.jpg"
    ],
    "seller_phone": null,
    "telegram_username": null
  },
  {
    "id": 871,
    "title": "Laptop HP EliteBook 840 G3",
    "price": 0,
    "description": "Laptop HP EliteBook 840 G3 Price 26,000 ☎️ RAM: 8 GB Processor: Intel Core i5 6th generation Storage Capacity: 1 TB Storage Type: HDD Display Size: 14″ Operating System: Windows 11 join for more",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136715/telegram_store_products/yuphj5cza6lchvnrznxm.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": "@ishururu"
  },
  {
    "id": 872,
    "title": "Urgent",
    "price": 0,
    "description": "Urgent TOYOTA HILUX (DOUBLE CAB) 2021/12 Make:Toyota Hilux Double Cob Model: 2021/12 TM: Automatic Type: Diesel Turbo Fuel Injection Size (cc): 2800cc, 2.8L Induction: Diesel Turbo 4 Cylinder engine Fuel Type: diesel DT: Four-wheel drive/4-WD Number of Doors: 4 Seats: 5 Mileage: 1500 Car condition: Almost new Plate: Code 2, C42...... AA /የራሱ ከ ተላላፍ/ Price: 9.5 million (negotiable) : Sami Broker Buy &amp; Sale: Vehicles, Equipment, House &amp; Others",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136715/telegram_store_products/zjhrr0enzwcupcgkelka.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136716/telegram_store_products/z4doszkxzghsms5xdqge.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136717/telegram_store_products/kwumfshkrmwbcixp0nwq.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136717/telegram_store_products/citguxloybmcjcmfpdfl.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136718/telegram_store_products/mtv5aqu7jm7cpulhwqx3.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136718/telegram_store_products/cpez1ebbcbftjektxkl1.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136718/telegram_store_products/g0fh5qbjpxe6iq9wnvcc.jpg",
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136719/telegram_store_products/pzrzamlp4p1rfvmxlrqe.jpg"
    ],
    "seller_phone": "0911842021",
    "telegram_username": null
  },
  {
    "id": 882,
    "title": "Sandisk 1 terabytes ( 1 tb) external ssd that can",
    "price": 0,
    "description": "Sandisk 1 terabytes ( 1 tb) external ssd that can fit in your pocket. Faster and much lighter than hard disk. Price 14000 to order",
    "category": "Storage",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136720/telegram_store_products/zbbbryufrjdro7fdpowq.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": null
  },
  {
    "id": 883,
    "title": "HP elitebook folio 1040 G1",
    "price": 0,
    "description": "HP elitebook folio 1040 G1 14 inch screen slim laptop Ram 8gb storage 256 gb SSD Price 25000 to buy or for additional information",
    "category": "Laptops",
    "department": "Electronics",
    "variations": [],
    "images": [
      "https://res.cloudinary.com/dpoa35zuq/image/upload/v1769136720/telegram_store_products/gdm5ybscdh3g5podowdu.jpg"
    ],
    "seller_phone": "0964472626",
    "telegram_username": null
  }
]
```

</details>
