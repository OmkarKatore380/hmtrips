/**
 * Comprehensive Destination Database
 * Contains tourism data, climate info, peak/off seasons, and logistics for all destinations
 */

export const destinations = {
  // North India
  shimla: {
    id: 'shimla',
    name: 'Shimla',
    state: 'Himachal Pradesh',
    country: 'India',
    type: 'hill-station',
    climate: {
      type: 'temperate',
      summer: { temp: '15°C - 30°C', months: 'Mar-Jun' },
      winter: { temp: '-2°C - 8°C', months: 'Nov-Feb' },
      monsoon: { temp: '12°C - 20°C', months: 'Jul-Sep' }
    },
    bestMonths: ['March', 'April', 'May', 'June', 'September', 'October', 'November'],
    peakSeason: { months: ['April', 'May', 'June', 'December', 'January'], multiplier: 1.4 },
    offSeason: { months: ['July', 'August', 'February'], multiplier: 0.75 },
    images: {
      hero: 'shimla mountains colonial architecture',
      activities: 'shimla mall road toy train kufri'
    },
    nearby: ['Manali', 'Kufri', 'Chail', 'Kasauli'],
    attractions: ['Mall Road', 'Christ Church', 'Jakhoo Temple', 'Kufri', 'Toy Train'],
    activities: ['Shopping', 'Trekking', 'Ice Skating', 'Toy Train Ride'],
    logistics: {
      nearestAirport: 'Chandigarh (115km)',
      nearestRailway: 'Kalka (90km)',
      roadConnectivity: 'Excellent - NH5',
      passportRequired: false,
      visaRequired: false
    },
    description: 'The Queen of Hills with colonial charm and snow-capped peaks'
  },
  
  manali: {
    id: 'manali',
    name: 'Manali',
    state: 'Himachal Pradesh',
    country: 'India',
    type: 'hill-station',
    climate: {
      type: 'alpine',
      summer: { temp: '10°C - 25°C', months: 'Mar-Jun' },
      winter: { temp: '-5°C - 10°C', months: 'Nov-Feb' },
      monsoon: { temp: '10°C - 20°C', months: 'Jul-Sep' }
    },
    bestMonths: ['March', 'April', 'May', 'June', 'September', 'October'],
    peakSeason: { months: ['May', 'June', 'December', 'January'], multiplier: 1.5 },
    offSeason: { months: ['July', 'August'], multiplier: 0.7 },
    images: {
      hero: 'manali snow mountains river beas rohtang',
      activities: 'manali paragliding river rafting solang valley'
    },
    nearby: ['Kullu', 'Kasol', 'Manikaran', 'Rohtang Pass'],
    attractions: ['Hadimba Temple', 'Solang Valley', 'Rohtang Pass', 'Old Manali', 'Vashisht Hot Springs'],
    activities: ['Paragliding', 'River Rafting', 'Skiing', 'Trekking', 'Camping'],
    logistics: {
      nearestAirport: 'Bhuntar (50km)',
      nearestRailway: 'Chandigarh (310km)',
      roadConnectivity: 'Good - NH3',
      passportRequired: false,
      visaRequired: false
    },
    description: 'Adventure capital of India with breathtaking valleys'
  },
  
  ladakh: {
    id: 'ladakh',
    name: 'Ladakh',
    state: 'Ladakh',
    country: 'India',
    type: 'high-altitude-desert',
    climate: {
      type: 'cold-desert',
      summer: { temp: '5°C - 25°C', months: 'Jun-Sep' },
      winter: { temp: '-20°C - 5°C', months: 'Oct-May' },
      monsoon: { temp: 'N/A', months: 'N/A' }
    },
    bestMonths: ['June', 'July', 'August', 'September'],
    peakSeason: { months: ['June', 'July', 'August'], multiplier: 1.6 },
    offSeason: { months: ['November', 'December', 'January', 'February', 'March'], multiplier: 0.5 },
    images: {
      hero: 'ladakh pangong lake mountains buddhist monastery',
      activities: 'ladakh bike trip nubra valley camel'
    },
    nearby: ['Leh', 'Nubra Valley', 'Pangong Lake', 'Tso Moriri'],
    attractions: ['Pangong Lake', 'Nubra Valley', 'Magnetic Hill', 'Thiksey Monastery', 'Khardung La'],
    activities: ['Bike Trip', 'Camping', 'Stargazing', 'River Rafting', 'Monastery Tours'],
    logistics: {
      nearestAirport: 'Leh Kushok Bakula (3km)',
      nearestRailway: 'Jammu Tawi (700km)',
      roadConnectivity: 'Manali-Leh Highway (Jun-Sep), Srinagar-Leh Highway (May-Oct)',
      passportRequired: false,
      visaRequired: false,
      specialPermits: 'Inner Line Permit required for certain areas'
    },
    description: 'Land of High Passes with surreal landscapes'
  },
  
  kashmir: {
    id: 'kashmir',
    name: 'Kashmir',
    state: 'Jammu & Kashmir',
    country: 'India',
    type: 'valley',
    climate: {
      type: 'temperate',
      summer: { temp: '15°C - 30°C', months: 'Mar-Jun' },
      winter: { temp: '-5°C - 10°C', months: 'Nov-Feb' },
      monsoon: { temp: '13°C - 25°C', months: 'Jul-Sep' }
    },
    bestMonths: ['April', 'May', 'June', 'September', 'October'],
    peakSeason: { months: ['April', 'May', 'June', 'December', 'January'], multiplier: 1.5 },
    offSeason: { months: ['July', 'August'], multiplier: 0.8 },
    images: {
      hero: 'kashmir dal lake shikara houseboat mountains',
      activities: 'kashmir gulmarg skiing pahalgam'
    },
    nearby: ['Srinagar', 'Gulmarg', 'Pahalgam', 'Sonamarg'],
    attractions: ['Dal Lake', 'Gulmarg', 'Pahalgam', 'Mughal Gardens', 'Shankaracharya Temple'],
    activities: ['Shikara Ride', 'Houseboat Stay', 'Skiing', 'Gondola Ride', 'Trekking'],
    logistics: {
      nearestAirport: 'Srinagar International (12km)',
      nearestRailway: 'Jammu Tawi (300km)',
      roadConnectivity: 'Excellent - NH44',
      passportRequired: false,
      visaRequired: false
    },
    description: 'Paradise on Earth with pristine lakes and meadows'
  },
  
  auli: {
    id: 'auli',
    name: 'Auli',
    state: 'Uttarakhand',
    country: 'India',
    type: 'ski-resort',
    climate: {
      type: 'alpine',
      summer: { temp: '10°C - 20°C', months: 'Apr-Jun' },
      winter: { temp: '-4°C - 7°C', months: 'Nov-Mar' },
      monsoon: { temp: '10°C - 18°C', months: 'Jul-Sep' }
    },
    bestMonths: ['December', 'January', 'February', 'March'],
    peakSeason: { months: ['December', 'January', 'February'], multiplier: 1.7 },
    offSeason: { months: ['April', 'May', 'June', 'July', 'August'], multiplier: 0.6 },
    images: {
      hero: 'auli skiing snow mountains chair lift',
      activities: 'auli ski resort uttarakhand winter'
    },
    nearby: ['Joshimath', 'Badrinath', 'Valley of Flowers', 'Hemkund Sahib'],
    attractions: ['Auli Ski Resort', 'Gurso Bugyal', 'Chenab Lake', 'Joshimath', 'Auli Ropeway'],
    activities: ['Skiing', 'Snowboarding', 'Trekking', 'Cable Car Ride', 'Camping'],
    logistics: {
      nearestAirport: 'Dehradun Jolly Grant (280km)',
      nearestRailway: 'Haridwar (270km)',
      roadConnectivity: 'Good - Connected via Joshimath',
      passportRequired: false,
      visaRequired: false
    },
    description: 'India\'s premier skiing destination with Himalayan views'
  },
  
  // Rajasthan
  jaipur: {
    id: 'jaipur',
    name: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    type: 'heritage-city',
    climate: {
      type: 'semi-arid',
      summer: { temp: '25°C - 45°C', months: 'Apr-Jun' },
      winter: { temp: '8°C - 22°C', months: 'Nov-Feb' },
      monsoon: { temp: '20°C - 35°C', months: 'Jul-Sep' }
    },
    bestMonths: ['October', 'November', 'December', 'January', 'February', 'March'],
    peakSeason: { months: ['October', 'November', 'December', 'January', 'February'], multiplier: 1.3 },
    offSeason: { months: ['April', 'May', 'June'], multiplier: 0.7 },
    images: {
      hero: 'jaipur hawa mahal pink city palace',
      activities: 'jaipur amer fort jal mahal heritage'
    },
    nearby: ['Ajmer', 'Pushkar', 'Ranthambore', 'Bharatpur'],
    attractions: ['Hawa Mahal', 'Amer Fort', 'City Palace', 'Jantar Mantar', 'Jal Mahal'],
    activities: ['Heritage Walk', 'Elephant Ride', 'Shopping', 'Hot Air Balloon', 'Cultural Shows'],
    logistics: {
      nearestAirport: 'Jaipur International (13km)',
      nearestRailway: 'Jaipur Junction (2km)',
      roadConnectivity: 'Excellent - NH48, NH52',
      passportRequired: false,
      visaRequired: false
    },
    description: 'The Pink City with royal palaces and forts'
  },
  
  udaipur: {
    id: 'udaipur',
    name: 'Udaipur',
    state: 'Rajasthan',
    country: 'India',
    type: 'lake-city',
    climate: {
      type: 'semi-arid',
      summer: { temp: '23°C - 38°C', months: 'Mar-Jun' },
      winter: { temp: '10°C - 25°C', months: 'Nov-Feb' },
      monsoon: { temp: '20°C - 32°C', months: 'Jul-Sep' }
    },
    bestMonths: ['September', 'October', 'November', 'December', 'January', 'February', 'March'],
    peakSeason: { months: ['October', 'November', 'December', 'January', 'February'], multiplier: 1.4 },
    offSeason: { months: ['April', 'May', 'June'], multiplier: 0.75 },
    images: {
      hero: 'udaipur lake palace city palace pichola lake',
      activities: 'udaipur boat ride heritage hotel rajasthan'
    },
    nearby: ['Chittorgarh', 'Kumbhalgarh', 'Ranakpur', 'Mount Abu'],
    attractions: ['City Palace', 'Lake Pichola', 'Jag Mandir', 'Saheliyon Ki Bari', 'Sajjangarh Monsoon Palace'],
    activities: ['Boat Ride', 'Heritage Walk', 'Sunset View', 'Cultural Shows', 'Shopping'],
    logistics: {
      nearestAirport: 'Maharana Pratap Udaipur (22km)',
      nearestRailway: 'Udaipur City Railway Station (3km)',
      roadConnectivity: 'Excellent - NH48, NH27',
      passportRequired: false,
      visaRequired: false
    },
    description: 'City of Lakes with romantic palaces and lakes'
  },
  
  jaisalmer: {
    id: 'jaisalmer',
    name: 'Jaisalmer',
    state: 'Rajasthan',
    country: 'India',
    type: 'desert-city',
    climate: {
      type: 'arid',
      summer: { temp: '25°C - 42°C', months: 'Apr-Jun' },
      winter: { temp: '7°C - 24°C', months: 'Nov-Feb' },
      monsoon: { temp: '20°C - 35°C', months: 'Jul-Sep' }
    },
    bestMonths: ['October', 'November', 'December', 'January', 'February', 'March'],
    peakSeason: { months: ['October', 'November', 'December', 'January', 'February'], multiplier: 1.5 },
    offSeason: { months: ['April', 'May', 'June'], multiplier: 0.6 },
    images: {
      hero: 'jaisalmer golden fort desert sand dunes',
      activities: 'jaisalmer camel safari desert camp rajasthan'
    },
    nearby: ['Sam Sand Dunes', 'Khuri', 'Kuldhara', 'Desert National Park'],
    attractions: ['Jaisalmer Fort', 'Patwon Ki Haveli', 'Sam Sand Dunes', 'Gadisar Lake', 'Desert Culture Centre'],
    activities: ['Camel Safari', 'Desert Camping', 'Jeep Safari', 'Folk Dance', 'Sunset View'],
    logistics: {
      nearestAirport: 'Jaisalmer Airport (5km) - Limited flights',
      nearestRailway: 'Jaisalmer Railway Station (2km)',
      roadConnectivity: 'Good - NH11, NH15',
      passportRequired: false,
      visaRequired: false
    },
    description: 'The Golden City with living fort and desert charm'
  },
  
  // South India
  goa: {
    id: 'goa',
    name: 'Goa',
    state: 'Goa',
    country: 'India',
    type: 'beach-destination',
    climate: {
      type: 'tropical',
      summer: { temp: '25°C - 35°C', months: 'Mar-May' },
      winter: { temp: '20°C - 32°C', months: 'Nov-Feb' },
      monsoon: { temp: '24°C - 30°C', months: 'Jun-Sep' }
    },
    bestMonths: ['November', 'December', 'January', 'February', 'March'],
    peakSeason: { months: ['December', 'January', 'February'], multiplier: 1.8 },
    offSeason: { months: ['June', 'July', 'August', 'September'], multiplier: 0.6 },
    images: {
      hero: 'goa beach sunset palm trees ocean',
      activities: 'goa water sports party cruise'
    },
    nearby: ['Dudhsagar Falls', 'Gokarna', 'Karwar', 'Amboli Ghat'],
    attractions: ['Baga Beach', 'Calangute Beach', 'Basilica of Bom Jesus', 'Dudhsagar Falls', 'Fort Aguada'],
    activities: ['Beach Hopping', 'Water Sports', 'Nightlife', 'Cruise', 'Dolphin Watching'],
    logistics: {
      nearestAirport: 'Goa Dabolim (25km), Goa Mopa (35km)',
      nearestRailway: 'Madgaon (35km), Thivim (20km)',
      roadConnectivity: 'Excellent - NH66',
      passportRequired: false,
      visaRequired: false
    },
    description: 'Beach paradise with vibrant nightlife and Portuguese heritage'
  },
  
  kerala: {
    id: 'kerala',
    name: 'Kerala',
    state: 'Kerala',
    country: 'India',
    type: 'backwater-destination',
    climate: {
      type: 'tropical',
      summer: { temp: '25°C - 35°C', months: 'Mar-May' },
      winter: { temp: '20°C - 32°C', months: 'Nov-Feb' },
      monsoon: { temp: '22°C - 30°C', months: 'Jun-Sep' }
    },
    bestMonths: ['September', 'October', 'November', 'December', 'January', 'February', 'March'],
    peakSeason: { months: ['November', 'December', 'January', 'February'], multiplier: 1.5 },
    offSeason: { months: ['June', 'July', 'August'], multiplier: 0.7 },
    images: {
      hero: 'kerala backwaters houseboat alleppey coconut trees',
      activities: 'kerala ayurveda massage tea plantation munnar'
    },
    nearby: ['Munnar', 'Alleppey', 'Thekkady', 'Kochi', 'Kovalam'],
    attractions: ['Backwaters', 'Munnar Tea Gardens', 'Periyar Wildlife Sanctuary', 'Kovalam Beach', 'Kathakali Centre'],
    activities: ['Houseboat Stay', 'Ayurveda Spa', 'Tea Plantation Visit', 'Wildlife Safari', 'Kathakali Show'],
    logistics: {
      nearestAirport: 'Kochi (75km), Trivandrum (150km)',
      nearestRailway: 'Ernakulam Junction, Alleppey',
      roadConnectivity: 'Excellent - NH66',
      passportRequired: false,
      visaRequired: false
    },
    description: 'God\'s Own Country with serene backwaters and greenery'
  },
  
  // International
  switzerland: {
    id: 'switzerland',
    name: 'Switzerland',
    state: null,
    country: 'Switzerland',
    type: 'alpine-country',
    climate: {
      type: 'alpine',
      summer: { temp: '15°C - 25°C', months: 'Jun-Sep' },
      winter: { temp: '-5°C - 5°C', months: 'Dec-Mar' },
      monsoon: { temp: 'N/A', months: 'N/A' }
    },
    bestMonths: ['June', 'July', 'August', 'September', 'December', 'January', 'February'],
    peakSeason: { months: ['June', 'July', 'August', 'December'], multiplier: 1.6 },
    offSeason: { months: ['April', 'May', 'October', 'November'], multiplier: 0.85 },
    images: {
      hero: 'switzerland alps mountains lake zurich geneva',
      activities: 'switzerland train scenic beauty skiing'
    },
    nearby: ['Zurich', 'Geneva', 'Interlaken', 'Lucerne', 'Zermatt'],
    attractions: ['Matterhorn', 'Jungfraujoch', 'Lake Geneva', 'Chapel Bridge', 'Swiss National Park'],
    activities: ['Scenic Train Rides', 'Skiing', 'Chocolate Tasting', 'Lake Cruises', 'Mountain Hiking'],
    logistics: {
      nearestAirport: 'Zurich (ZRH), Geneva (GVA)',
      nearestRailway: 'Swiss Rail Network - Excellent',
      roadConnectivity: 'Excellent - Swiss Autobahn',
      passportRequired: true,
      visaRequired: true,
      visaType: 'Schengen Visa',
      currency: 'Swiss Franc (CHF)'
    },
    description: 'Alpine wonderland with pristine lakes and mountains'
  },
  
  iceland: {
    id: 'iceland',
    name: 'Iceland',
    state: null,
    country: 'Iceland',
    type: 'nordic-island',
    climate: {
      type: 'subpolar-oceanic',
      summer: { temp: '10°C - 15°C', months: 'Jun-Aug' },
      winter: { temp: '-5°C - 5°C', months: 'Nov-Mar' },
      monsoon: { temp: 'N/A', months: 'N/A' }
    },
    bestMonths: ['June', 'July', 'August', 'September', 'February', 'March'],
    peakSeason: { months: ['June', 'July', 'August'], multiplier: 1.5 },
    offSeason: { months: ['November', 'December', 'January'], multiplier: 0.8 },
    images: {
      hero: 'iceland northern lights aurora borealis landscape',
      activities: 'iceland blue lagoon geothermal waterfall'
    },
    nearby: ['Reykjavik', 'Golden Circle', 'South Coast', 'Snaefellsnes Peninsula'],
    attractions: ['Blue Lagoon', 'Golden Circle', 'Northern Lights', 'Skógafoss Waterfall', 'Black Sand Beach'],
    activities: ['Northern Lights Hunt', 'Geothermal Spa', 'Glacier Hiking', 'Whale Watching', 'Ice Caves'],
    logistics: {
      nearestAirport: 'Keflavik International (50km from Reykjavik)',
      nearestRailway: 'No railway system',
      roadConnectivity: 'Good - Ring Road (Route 1)',
      passportRequired: true,
      visaRequired: true,
      visaType: 'Schengen Visa',
      currency: 'Icelandic Króna (ISK)'
    },
    description: 'Land of Fire and Ice with dramatic landscapes'
  },
  
  dubai: {
    id: 'dubai',
    name: 'Dubai',
    state: 'Dubai',
    country: 'UAE',
    type: 'modern-city',
    climate: {
      type: 'desert',
      summer: { temp: '30°C - 45°C', months: 'May-Sep' },
      winter: { temp: '15°C - 28°C', months: 'Nov-Mar' },
      monsoon: { temp: 'N/A', months: 'N/A' }
    },
    bestMonths: ['November', 'December', 'January', 'February', 'March'],
    peakSeason: { months: ['November', 'December', 'January', 'February'], multiplier: 1.4 },
    offSeason: { months: ['June', 'July', 'August', 'September'], multiplier: 0.6 },
    images: {
      hero: 'dubai skyline burj khalifa modern architecture',
      activities: 'dubai desert safari luxury shopping'
    },
    nearby: ['Abu Dhabi', 'Sharjah', 'Fujairah', 'Ras Al Khaimah'],
    attractions: ['Burj Khalifa', 'Dubai Mall', 'Palm Jumeirah', 'Dubai Frame', 'Global Village'],
    activities: ['Desert Safari', 'Dhow Cruise', 'Skydiving', 'Shopping', 'Theme Parks'],
    logistics: {
      nearestAirport: 'Dubai International (DXB)',
      nearestRailway: 'Dubai Metro',
      roadConnectivity: 'Excellent - Sheikh Zayed Road',
      passportRequired: true,
      visaRequired: true,
      visaType: 'UAE Tourist Visa',
      currency: 'UAE Dirham (AED)'
    },
    description: 'Ultra-modern city with luxury and adventure'
  },
  
  maldives: {
    id: 'maldives',
    name: 'Maldives',
    state: null,
    country: 'Maldives',
    type: 'island-nation',
    climate: {
      type: 'tropical',
      summer: { temp: '28°C - 32°C', months: 'Jan-Apr' },
      winter: { temp: '25°C - 30°C', months: 'May-Dec' },
      monsoon: { temp: '25°C - 30°C', months: 'May-Oct' }
    },
    bestMonths: ['November', 'December', 'January', 'February', 'March', 'April'],
    peakSeason: { months: ['December', 'January', 'February', 'March'], multiplier: 1.7 },
    offSeason: { months: ['May', 'June', 'July', 'August', 'September'], multiplier: 0.7 },
    images: {
      hero: 'maldives overwater bungalow turquoise water beach',
      activities: 'maldives snorkeling diving underwater'
    },
    nearby: ['Male', 'Maafushi', 'Baa Atoll', 'Ari Atoll'],
    attractions: ['Overwater Villas', 'Coral Reefs', 'Bioluminescent Beach', 'Male City', 'Artificial Beach'],
    activities: ['Snorkeling', 'Scuba Diving', 'Sunset Cruise', 'Spa Treatment', 'Island Hopping'],
    logistics: {
      nearestAirport: 'Velana International (Male)',
      nearestRailway: 'N/A',
      roadConnectivity: 'N/A - Sea Plane/Speedboat transfers',
      passportRequired: true,
      visaRequired: true,
      visaType: 'Free Visa on Arrival (30 days)',
      currency: 'Maldivian Rufiyaa (MVR)'
    },
    description: 'Tropical paradise with crystal clear waters'
  },
  
  thailand: {
    id: 'thailand',
    name: 'Thailand',
    state: null,
    country: 'Thailand',
    type: 'tropical-destination',
    climate: {
      type: 'tropical',
      summer: { temp: '28°C - 35°C', months: 'Mar-May' },
      winter: { temp: '20°C - 30°C', months: 'Nov-Feb' },
      monsoon: { temp: '25°C - 32°C', months: 'Jun-Oct' }
    },
    bestMonths: ['November', 'December', 'January', 'February', 'March'],
    peakSeason: { months: ['November', 'December', 'January', 'February'], multiplier: 1.4 },
    offSeason: { months: ['April', 'May', 'June', 'July', 'August', 'September'], multiplier: 0.75 },
    images: {
      hero: 'thailand bangkok temple beach phuket',
      activities: 'thailand phi phi island floating market'
    },
    nearby: ['Bangkok', 'Phuket', 'Chiang Mai', 'Krabi', 'Pattaya'],
    attractions: ['Grand Palace', 'Phi Phi Islands', 'Wat Arun', 'Floating Markets', 'Ayutthaya'],
    activities: ['Island Hopping', 'Temple Tours', 'Street Food Tour', 'Thai Massage', 'Nightlife'],
    logistics: {
      nearestAirport: 'Bangkok Suvarnabhumi (BKK), Phuket (HKT)',
      nearestRailway: 'Bangkok Railway Station',
      roadConnectivity: 'Good - Highway network',
      passportRequired: true,
      visaRequired: true,
      visaType: 'Visa on Arrival / E-Visa',
      currency: 'Thai Baht (THB)'
    },
    description: 'Land of Smiles with beaches, temples, and vibrant culture'
  },
  
  bali: {
    id: 'bali',
    name: 'Bali',
    state: 'Bali',
    country: 'Indonesia',
    type: 'island-destination',
    climate: {
      type: 'tropical',
      summer: { temp: '26°C - 30°C', months: 'Apr-Oct' },
      winter: { temp: '24°C - 28°C', months: 'Nov-Mar' },
      monsoon: { temp: '24°C - 29°C', months: 'Nov-Mar' }
    },
    bestMonths: ['April', 'May', 'June', 'July', 'August', 'September', 'October'],
    peakSeason: { months: ['July', 'August', 'December'], multiplier: 1.5 },
    offSeason: { months: ['January', 'February', 'March'], multiplier: 0.75 },
    images: {
      hero: 'bali rice terraces temple ubud beach',
      activities: 'bali swing yoga retreat sunset'
    },
    nearby: ['Ubud', 'Seminyak', 'Uluwatu', 'Nusa Dua', 'Kuta'],
    attractions: ['Uluwatu Temple', 'Tegallalang Rice Terraces', 'Sacred Monkey Forest', 'Tanah Lot', 'Mount Batur'],
    activities: ['Surfing', 'Yoga Retreat', 'Rice Terrace Trek', 'Sunset Dinner', 'Spa Treatment'],
    logistics: {
      nearestAirport: 'Ngurah Rai International (DPS)',
      nearestRailway: 'N/A',
      roadConnectivity: 'Good - Main roads only',
      passportRequired: true,
      visaRequired: true,
      visaType: 'Visa on Arrival / E-VOA',
      currency: 'Indonesian Rupiah (IDR)'
    },
    description: 'Island of Gods with spiritual vibes and natural beauty'
  },
  
  singapore: {
    id: 'singapore',
    name: 'Singapore',
    state: null,
    country: 'Singapore',
    type: 'modern-city-state',
    climate: {
      type: 'tropical-rainforest',
      summer: { temp: '25°C - 32°C', months: 'Year-round' },
      winter: { temp: '25°C - 32°C', months: 'Year-round' },
      monsoon: { temp: '25°C - 32°C', months: 'Nov-Jan' }
    },
    bestMonths: ['February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October'],
    peakSeason: { months: ['June', 'July', 'December'], multiplier: 1.3 },
    offSeason: { months: ['November', 'January'], multiplier: 0.9 },
    images: {
      hero: 'singapore marina bay sands gardens by the bay',
      activities: 'singapore sentosa universal studios night safari'
    },
    nearby: ['Sentosa Island', 'Johor Bahru (Malaysia)'],
    attractions: ['Marina Bay Sands', 'Gardens by the Bay', 'Sentosa', 'Universal Studios', 'Singapore Zoo'],
    activities: ['Night Safari', 'Shopping', 'Food Tour', 'Gardens Tour', 'River Cruise'],
    logistics: {
      nearestAirport: 'Changi Airport (SIN)',
      nearestRailway: 'MRT - Excellent connectivity',
      roadConnectivity: 'Excellent - City-wide network',
      passportRequired: true,
      visaRequired: true,
      visaType: 'E-Visa / Visa Free for some countries',
      currency: 'Singapore Dollar (SGD)'
    },
    description: 'Garden City with world-class attractions and cuisine'
  },
  
  vietnam: {
    id: 'vietnam',
    name: 'Vietnam',
    state: null,
    country: 'Vietnam',
    type: 'cultural-destination',
    climate: {
      type: 'tropical-monsoon',
      summer: { temp: '25°C - 35°C', months: 'May-Aug' },
      winter: { temp: '15°C - 25°C', months: 'Nov-Mar' },
      monsoon: { temp: '25°C - 32°C', months: 'May-Oct' }
    },
    bestMonths: ['February', 'March', 'April', 'September', 'October', 'November'],
    peakSeason: { months: ['December', 'January', 'February'], multiplier: 1.3 },
    offSeason: { months: ['June', 'July', 'August', 'September'], multiplier: 0.75 },
    images: {
      hero: 'vietnam ha long bay limestone karst boat',
      activities: 'vietnam hoi an lanterns street food'
    },
    nearby: ['Hanoi', 'Ho Chi Minh City', 'Da Nang', 'Hoi An', 'Ha Long Bay'],
    attractions: ['Ha Long Bay', 'Hoi An Ancient Town', 'Cu Chi Tunnels', 'Mekong Delta', 'Phong Nha Caves'],
    activities: ['Cruise', 'Street Food Tour', 'Motorbike Tour', 'Cooking Class', 'Cave Exploration'],
    logistics: {
      nearestAirport: 'Hanoi (HAN), Ho Chi Minh City (SGN), Da Nang (DAD)',
      nearestRailway: 'Reunification Express',
      roadConnectivity: 'Good - Highway network',
      passportRequired: true,
      visaRequired: true,
      visaType: 'E-Visa',
      currency: 'Vietnamese Dong (VND)'
    },
    description: 'Land of ascending dragon with rich history and landscapes'
  }
};

// State-wise package mappings
export const statePackages = {
  'Himachal Pradesh': {
    destinations: ['shimla', 'manali', 'kasauli', 'dharamshala', 'dalhousie'],
    suggestedRoute: ['shimla', 'manali'],
    duration: { min: 4, max: 8 },
    description: 'Land of snow-capped peaks and serene valleys'
  },
  'Rajasthan': {
    destinations: ['jaipur', 'udaipur', 'jaisalmer', 'jodhpur', 'pushkar', 'bikaner'],
    suggestedRoute: ['jaipur', 'udaipur', 'jaisalmer'],
    duration: { min: 5, max: 10 },
    description: 'Royal heritage and golden deserts'
  },
  'Kerala': {
    destinations: ['kochi', 'munnar', 'alleppey', 'thekkady', 'kovalam', 'wayanad'],
    suggestedRoute: ['kochi', 'munnar', 'alleppey'],
    duration: { min: 4, max: 7 },
    description: 'God\'s Own Country with backwaters and tea gardens'
  },
  'Goa': {
    destinations: ['north-goa', 'south-goa', 'panjim'],
    suggestedRoute: ['north-goa', 'south-goa'],
    duration: { min: 3, max: 5 },
    description: 'Beaches, parties, and Portuguese heritage'
  },
  'Uttarakhand': {
    destinations: ['auli', 'nainital', 'mussoorie', 'rishikesh', 'haridwar'],
    suggestedRoute: ['rishikesh', 'auli', 'nainital'],
    duration: { min: 4, max: 8 },
    description: 'Devbhoomi with spiritual and adventure experiences'
  },
  'Jammu & Kashmir': {
    destinations: ['srinagar', 'gulmarg', 'pahalgam', 'sonamarg', 'leh'],
    suggestedRoute: ['srinagar', 'gulmarg', 'pahalgam'],
    duration: { min: 5, max: 9 },
    description: 'Paradise on Earth with pristine beauty'
  }
};

// Helper functions
export const getDestinationById = (id) => destinations[id] || null;

export const getDestinationsByState = (state) => {
  return Object.values(destinations).filter(d => d.state === state);
};

export const getAllStates = () => {
  const states = new Set();
  Object.values(destinations).forEach(d => {
    if (d.state) states.add(d.state);
  });
  return Array.from(states);
};

export const getSeasonalMultiplier = (destinationId, month) => {
  const dest = destinations[destinationId];
  if (!dest) return 1;
  
  const monthName = new Date(2024, month - 1).toLocaleString('en-US', { month: 'long' });
  
  if (dest.peakSeason.months.includes(monthName)) return dest.peakSeason.multiplier;
  if (dest.offSeason.months.includes(monthName)) return dest.offSeason.multiplier;
  return 1;
};

export const getAllDestinations = () => Object.values(destinations);

export default destinations;
