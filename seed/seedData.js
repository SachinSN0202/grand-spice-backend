/**
 * Database Seeder
 * Run: npm run seed
 * Populates menu items + 15 tables
 */
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const Table = require('../models/Table');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/grand-spice';

const menuItems = [
  // ── South Indian ──────────────────────────────────────────────────────────
  { name: 'Masala Dosa', nameTranslations: { hi: 'मसाला डोसा', kn: 'ಮಸಾಲ ದೋಸೆ', ta: 'மசாலா தோசை', te: 'మసాలా దోస' }, price: 80, category: 'South Indian', counter: 'South Indian', isVeg: true, spiceLevel: 'medium', preparationTime: 12, emoji: '🫓', description: 'Crispy rice crepe filled with spiced potato masala' },
  { name: 'Plain Dosa', nameTranslations: { hi: 'सादा डोसा', kn: 'ಸಾದಾ ದೋಸೆ', ta: 'சாதா தோசை', te: 'సాదా దోస' }, price: 60, category: 'South Indian', counter: 'South Indian', isVeg: true, spiceLevel: 'mild', preparationTime: 10, emoji: '🫓', description: 'Classic thin crispy dosa served with chutney & sambar' },
  { name: 'Idli (2 pcs)', nameTranslations: { hi: 'इडली', kn: 'ಇಡ್ಲಿ', ta: 'இட்லி', te: 'ఇడ్లీ' }, price: 50, category: 'South Indian', counter: 'South Indian', isVeg: true, spiceLevel: 'mild', preparationTime: 8, emoji: '🍚', description: 'Soft steamed rice cakes with coconut chutney & sambar' },
  { name: 'Medu Vada', nameTranslations: { hi: 'मेदु वड़ा', kn: 'ಮೇದು ವಡೆ', ta: 'மேது வடை', te: 'మేదు వడ' }, price: 50, category: 'South Indian', counter: 'South Indian', isVeg: true, spiceLevel: 'mild', preparationTime: 10, emoji: '🍩', description: 'Crispy fried lentil donuts with coconut chutney' },
  { name: 'Uttapam', nameTranslations: { hi: 'उत्तपम', kn: 'ಉತ್ತಪ್ಪ', ta: 'உத்தப்பம்', te: 'ఉత్తప్పం' }, price: 70, category: 'South Indian', counter: 'South Indian', isVeg: true, spiceLevel: 'mild', preparationTime: 12, emoji: '🥞', description: 'Thick rice pancake topped with vegetables' },
  { name: 'Ven Pongal', nameTranslations: { hi: 'पोंगल', kn: 'ಪೊಂಗಲ್', ta: 'வெண் பொங்கல்', te: 'పొంగల్' }, price: 60, category: 'South Indian', counter: 'South Indian', isVeg: true, spiceLevel: 'mild', preparationTime: 10, emoji: '🥣', description: 'Comforting rice & lentil porridge with ghee and pepper' },
  { name: 'Rava Dosa', nameTranslations: { hi: 'रवा डोसा', kn: 'ರವಾ ದೋಸೆ', ta: 'ரவா தோசை', te: 'రవ్వ దోస' }, price: 90, category: 'South Indian', counter: 'South Indian', isVeg: true, spiceLevel: 'mild', preparationTime: 12, emoji: '🫓', description: 'Lacy, crispy semolina dosa - a South Indian specialty' },
  { name: 'Mini Tiffin Set', nameTranslations: { hi: 'मिनी टिफिन', kn: 'ಮಿನಿ ಟಿಫಿನ್', ta: 'மினி டிஃபின்', te: 'మిని టిఫిన్' }, price: 120, category: 'South Indian', counter: 'South Indian', isVeg: true, spiceLevel: 'mild', preparationTime: 15, emoji: '🍱', description: 'Idli + Vada + Dosa combo with full accompaniments' },

  // ── North Indian ──────────────────────────────────────────────────────────
  { name: 'Butter Naan', nameTranslations: { hi: 'बटर नान', kn: 'ಬಟರ್ ನಾನ್', ta: 'பட்டர் நான்', te: 'బటర్ నాన్' }, price: 40, category: 'North Indian', counter: 'North Indian', isVeg: true, spiceLevel: 'mild', preparationTime: 8, emoji: '🫓', description: 'Soft leavened bread from tandoor, brushed with butter' },
  { name: 'Paneer Butter Masala', nameTranslations: { hi: 'पनीर बटर मसाला', kn: 'ಪನೀರ್ ಬಟರ್ ಮಸಾಲ', ta: 'பனீர் பட்டர் மசாலா', te: 'పనీర్ బటర్ మసాల' }, price: 180, category: 'North Indian', counter: 'North Indian', isVeg: true, spiceLevel: 'medium', preparationTime: 18, emoji: '🍛', description: 'Cottage cheese in rich, creamy tomato-butter gravy' },
  { name: 'Dal Makhani', nameTranslations: { hi: 'दाल मखनी', kn: 'ದಾಲ್ ಮಖನಿ', ta: 'தால் மக்கனி', te: 'దాల్ మఖని' }, price: 160, category: 'North Indian', counter: 'North Indian', isVeg: true, spiceLevel: 'medium', preparationTime: 15, emoji: '🥣', description: 'Slow-cooked black lentils in creamy buttery sauce' },
  { name: 'Veg Biryani', nameTranslations: { hi: 'वेज बिरयानी', kn: 'ವೆಜ್ ಬಿರಿಯಾನಿ', ta: 'வெஜ் பிரியாணி', te: 'వెజ్ బిర్యాని' }, price: 180, category: 'North Indian', counter: 'North Indian', isVeg: true, spiceLevel: 'hot', preparationTime: 20, emoji: '🍚', description: 'Fragrant basmati rice with vegetables and whole spices' },
  { name: 'Palak Paneer', nameTranslations: { hi: 'पालक पनीर', kn: 'ಪಾಲಕ್ ಪನೀರ್', ta: 'பாலக் பனீர்', te: 'పాలక్ పనీర్' }, price: 170, category: 'North Indian', counter: 'North Indian', isVeg: true, spiceLevel: 'medium', preparationTime: 15, emoji: '🥬', description: 'Cottage cheese in velvety spinach gravy with spices' },
  { name: 'Chole Bhature', nameTranslations: { hi: 'छोले भटूरे', kn: 'ಛೋಲೆ ಭಟೂರೆ', ta: 'சோலே பட்டூரே', te: 'ఛోలే భటూరే' }, price: 120, category: 'North Indian', counter: 'North Indian', isVeg: true, spiceLevel: 'hot', preparationTime: 12, emoji: '🍽️', description: 'Spiced chickpea curry with fluffy fried bread' },
  { name: 'Aloo Paratha', nameTranslations: { hi: 'आलू पराठा', kn: 'ಆಲೂ ಪರಾಠ', ta: 'ஆலூ பராட்டா', te: 'ఆలూ పరాఠ' }, price: 80, category: 'North Indian', counter: 'North Indian', isVeg: true, spiceLevel: 'medium', preparationTime: 12, emoji: '🫓', description: 'Whole wheat flatbread stuffed with spiced potato filling' },

  // ── Chinese ───────────────────────────────────────────────────────────────
  { name: 'Gobi Manchurian', nameTranslations: { hi: 'गोबी मंचूरियन', kn: 'ಗೋಬಿ ಮಂಚೂರಿಯನ್', ta: 'காளிஃபிளவர் மஞ்சூரியன்', te: 'గోబీ మంచూరియన్' }, price: 150, category: 'Chinese', counter: 'Chinese', isVeg: true, spiceLevel: 'hot', preparationTime: 15, emoji: '🥦', description: 'Crispy cauliflower florets in Indo-Chinese spicy sauce' },
  { name: 'Veg Fried Rice', nameTranslations: { hi: 'वेज फ्राइड राइस', kn: 'ವೆಜ್ ಫ್ರೈಡ್ ರೈಸ್', ta: 'வெஜ் ஃப்ரைட் ரைஸ்', te: 'వెజ్ ఫ్రైడ్ రైస్' }, price: 140, category: 'Chinese', counter: 'Chinese', isVeg: true, spiceLevel: 'mild', preparationTime: 12, emoji: '🍚', description: 'Wok-tossed rice with fresh vegetables and soy sauce' },
  { name: 'Hakka Noodles', nameTranslations: { hi: 'हक्का नूडल्स', kn: 'ಹಕ್ಕಾ ನೂಡಲ್ಸ್', ta: 'ஹக்கா நூடுல்ஸ்', te: 'హక్కా నూడిల్స్' }, price: 140, category: 'Chinese', counter: 'Chinese', isVeg: true, spiceLevel: 'medium', preparationTime: 12, emoji: '🍜', description: 'Stir-fried noodles with vegetables in a savory sauce' },
  { name: 'Spring Rolls', nameTranslations: { hi: 'स्प्रिंग रोल्स', kn: 'ಸ್ಪ್ರಿಂಗ್ ರೋಲ್ಸ್', ta: 'ஸ்பிரிங் ரோல்ஸ்', te: 'స్ప్రింగ్ రోల్స్' }, price: 120, category: 'Chinese', counter: 'Chinese', isVeg: true, spiceLevel: 'mild', preparationTime: 14, emoji: '🥟', description: 'Crispy rolls stuffed with seasoned vegetables' },
  { name: 'Chilli Paneer', nameTranslations: { hi: 'चिल्ली पनीर', kn: 'ಚಿಲ್ಲಿ ಪನೀರ್', ta: 'சில்லி பனீர்', te: 'చిల్లీ పనీర్' }, price: 170, category: 'Chinese', counter: 'Chinese', isVeg: true, spiceLevel: 'hot', preparationTime: 15, emoji: '🫑', description: 'Crispy paneer tossed with peppers in a spicy sauce' },
  { name: 'Manchow Soup', nameTranslations: { hi: 'मंचाव सूप', kn: 'ಮಂಚೌ ಸೂಪ್', ta: 'மஞ்சோ சூப்', te: 'మంచో సూప్' }, price: 100, category: 'Chinese', counter: 'Chinese', isVeg: true, spiceLevel: 'medium', preparationTime: 10, emoji: '🥣', description: 'Hot and flavorful thick soup with crispy noodle topping' },

  // ── Chats ─────────────────────────────────────────────────────────────────
  { name: 'Pani Puri', nameTranslations: { hi: 'पानी पूरी', kn: 'ಪಾನಿ ಪೂರಿ', ta: 'பானி பூரி', te: 'పానీ పూరీ' }, price: 50, category: 'Chats', counter: 'Chats', isVeg: true, spiceLevel: 'medium', preparationTime: 5, emoji: '🫧', description: 'Hollow crispy puris filled with tangy spiced water' },
  { name: 'Bhel Puri', nameTranslations: { hi: 'भेल पूरी', kn: 'ಭೇಲ್ ಪೂರಿ', ta: 'பேல் பூரி', te: 'భేల్ పూరి' }, price: 60, category: 'Chats', counter: 'Chats', isVeg: true, spiceLevel: 'medium', preparationTime: 5, emoji: '🍿', description: 'Puffed rice with chutneys, onions, and sev' },
  { name: 'Sev Puri', nameTranslations: { hi: 'सेव पूरी', kn: 'ಸೇವ್ ಪೂರಿ', ta: 'சேவ் பூரி', te: 'సేవ్ పూరి' }, price: 60, category: 'Chats', counter: 'Chats', isVeg: true, spiceLevel: 'medium', preparationTime: 5, emoji: '🫓', description: 'Flat puris topped with potatoes, chutneys, and crispy sev' },
  { name: 'Aloo Tikki', nameTranslations: { hi: 'आलू टिक्की', kn: 'ಆಲೂ ಟಿಕ್ಕಿ', ta: 'ஆலூ டிக்கி', te: 'ఆలూ టిక్కి' }, price: 70, category: 'Chats', counter: 'Chats', isVeg: true, spiceLevel: 'medium', preparationTime: 8, emoji: '🥔', description: 'Crispy spiced potato patties with yogurt and chutneys' },
  { name: 'Dahi Puri', nameTranslations: { hi: 'दही पूरी', kn: 'ದಹಿ ಪೂರಿ', ta: 'தயிர் பூரி', te: 'దహి పూరి' }, price: 80, category: 'Chats', counter: 'Chats', isVeg: true, spiceLevel: 'mild', preparationTime: 5, emoji: '🫧', description: 'Puris filled with yogurt, chutneys, and pomegranate' },
  { name: 'Pav Bhaji', nameTranslations: { hi: 'पाव भाजी', kn: 'ಪಾವ್ ಭಾಜಿ', ta: 'பாவ் பாஜி', te: 'పావ్ భాజీ' }, price: 120, category: 'Chats', counter: 'Chats', isVeg: true, spiceLevel: 'medium', preparationTime: 10, emoji: '🥖', description: 'Buttery spiced vegetable mash with toasted bread rolls' },

  // ── Juice ─────────────────────────────────────────────────────────────────
  { name: 'Orange Juice', nameTranslations: { hi: 'संतरे का रस', kn: 'ಕಿತ್ತಳೆ ರಸ', ta: 'ஆரஞ்சு ஜூஸ்', te: 'నారింజ జ్యూస్' }, price: 80, category: 'Juice', counter: 'Juice', isVeg: true, spiceLevel: 'mild', preparationTime: 5, emoji: '🍊', description: 'Freshly squeezed orange juice, chilled' },
  { name: 'Watermelon Juice', nameTranslations: { hi: 'तरबूज का रस', kn: 'ಕಲ್ಲಂಗಡಿ ರಸ', ta: 'தர்பூசணி ஜூஸ்', te: 'పుచ్చకాయ జ్యూస్' }, price: 70, category: 'Juice', counter: 'Juice', isVeg: true, spiceLevel: 'mild', preparationTime: 5, emoji: '🍉', description: 'Refreshing watermelon juice with a hint of mint' },
  { name: 'Mango Juice', nameTranslations: { hi: 'आम का रस', kn: 'ಮಾವಿನ ರಸ', ta: 'மாம்பழ ஜூஸ்', te: 'మామిడి జ్యూస్' }, price: 90, category: 'Juice', counter: 'Juice', isVeg: true, spiceLevel: 'mild', preparationTime: 5, emoji: '🥭', description: 'Thick, rich Alphonso mango pulp drink' },
  { name: 'Mixed Fruit Juice', nameTranslations: { hi: 'मिक्स फ्रूट जूस', kn: 'ಮಿಶ್ರ ಹಣ್ಣಿನ ರಸ', ta: 'கலவை பழ ஜூஸ்', te: 'మిక్స్ ఫ్రూట్ జ్యూస్' }, price: 100, category: 'Juice', counter: 'Juice', isVeg: true, spiceLevel: 'mild', preparationTime: 7, emoji: '🍹', description: 'Seasonal fruit blend packed with vitamins' },
  { name: 'Sugarcane Juice', nameTranslations: { hi: 'गन्ने का रस', kn: 'ಕಬ್ಬಿನ ರಸ', ta: 'கரும்பு சாறு', te: 'చెరుకు రసం' }, price: 50, category: 'Juice', counter: 'Juice', isVeg: true, spiceLevel: 'mild', preparationTime: 5, emoji: '🌿', description: 'Fresh sugarcane juice with ginger and lemon' },
  { name: 'Pomegranate Juice', nameTranslations: { hi: 'अनार का रस', kn: 'ದಾಳಿಂಬೆ ರಸ', ta: 'மாதுளை ஜூஸ்', te: 'దానిమ్మ జ్యూస్' }, price: 120, category: 'Juice', counter: 'Juice', isVeg: true, spiceLevel: 'mild', preparationTime: 7, emoji: '🫐', description: 'Pure pomegranate juice — antioxidant powerhouse' },

  // ── Tea & Coffee ──────────────────────────────────────────────────────────
  { name: 'Masala Chai', nameTranslations: { hi: 'मसाला चाय', kn: 'ಮಸಾಲ ಚಹಾ', ta: 'மசாலா சாய்', te: 'మసాలా చాయ్' }, price: 30, category: 'Tea', counter: 'Tea', isVeg: true, spiceLevel: 'medium', preparationTime: 5, emoji: '🫖', description: 'Aromatic spiced milk tea with ginger, cardamom, and cloves' },
  { name: 'Filter Coffee', nameTranslations: { hi: 'फिल्टर कॉफी', kn: 'ಫಿಲ್ಟರ್ ಕಾಫಿ', ta: 'ஃபில்டர் காபி', te: 'ఫిల్టర్ కాఫీ' }, price: 40, category: 'Tea', counter: 'Tea', isVeg: true, spiceLevel: 'mild', preparationTime: 5, emoji: '☕', description: 'South Indian drip coffee with milk — frothy and strong' },
  { name: 'Green Tea', nameTranslations: { hi: 'ग्रीन टी', kn: 'ಹಸಿರು ಚಹಾ', ta: 'கிரீன் டீ', te: 'గ్రీన్ టీ' }, price: 40, category: 'Tea', counter: 'Tea', isVeg: true, spiceLevel: 'mild', preparationTime: 5, emoji: '🍵', description: 'Premium Japanese green tea, calming and refreshing' },
  { name: 'Cold Coffee', nameTranslations: { hi: 'कोल्ड कॉफी', kn: 'ಕೋಲ್ಡ್ ಕಾಫಿ', ta: 'கோல்ட் காபி', te: 'కోల్డ్ కాఫీ' }, price: 80, category: 'Tea', counter: 'Tea', isVeg: true, spiceLevel: 'mild', preparationTime: 7, emoji: '🧋', description: 'Chilled blended coffee with milk and ice cream' },
  { name: 'Lemon Tea', nameTranslations: { hi: 'लेमन टी', kn: 'ನಿಂಬೆ ಚಹಾ', ta: 'எலுமிச்சை டீ', te: 'నిమ్మ టీ' }, price: 30, category: 'Tea', counter: 'Tea', isVeg: true, spiceLevel: 'mild', preparationTime: 5, emoji: '🍋', description: 'Light tea with fresh lemon juice and honey' },
  { name: 'Ginger Tea', nameTranslations: { hi: 'अदरक की चाय', kn: 'ಶುಂಠಿ ಚಹಾ', ta: 'இஞ்சி டீ', te: 'అల్లం టీ' }, price: 35, category: 'Tea', counter: 'Tea', isVeg: true, spiceLevel: 'hot', preparationTime: 5, emoji: '🫚', description: 'Strong ginger-infused tea — warming and invigorating' },
];

const tables = Array.from({ length: 15 }, (_, i) => {
  const num = i + 1;
  return {
    tableId: `TABLE-${String(num).padStart(3, '0')}`,
    tableNumber: num,
    capacity: [4, 6, 2, 4, 3, 4, 5, 5, 6, 6, 4, 6, 2, 6, 3][i],
    status: 'available',
    qrCode: '',
    currentOrderId: null,
  };
});

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB connected');

    // Clear existing data
    await MenuItem.deleteMany({});
    await Table.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Insert menu items
    const insertedItems = await MenuItem.insertMany(menuItems);
    console.log(`🍽️  Inserted ${insertedItems.length} menu items`);

    // Insert tables
    const insertedTables = await Table.insertMany(tables);
    console.log(`🪑  Inserted ${insertedTables.length} tables`);

    console.log('\n✨ Seeding complete! Grand Spice database is ready.');
    console.log('📋 Categories seeded:');
    const categories = [...new Set(menuItems.map(i => i.category))];
    categories.forEach(cat => {
      const count = menuItems.filter(i => i.category === cat).length;
      console.log(`   ${cat}: ${count} items`);
    });

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();
