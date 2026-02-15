export const tours = [
  {
    id: 'shimla-001',
    name: 'Shimla Special',
    destination: 'Shimla',
    image: 'https://images.unsplash.com/photo-1581791534721-e599df4417f7?w=800&q=80',
    pricePerGuest: 3500,
    viewing: 154,
    origin: 'Delhi',
    departureDate: '2026-02-14',
    endDate: '2026-02-18',
    offer: 'Budget Deal'
  },
  {
    id: 'kashmir-002',
    name: 'Kashmir Paradise',
    destination: 'Kashmir',
    image: 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=800&q=80',
    pricePerGuest: 4200,
    viewing: 210,
    origin: 'Srinagar',
    departureDate: '2026-03-01',
    endDate: '2026-03-06'
  },
  {
    id: 'manali-003',
    name: 'Manali Adventure',
    destination: 'Manali',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
    pricePerGuest: 3800,
    viewing: 89,
    origin: 'Delhi',
    departureDate: '2026-02-20',
    endDate: '2026-02-23'
  },
  {
    id: 'ladakh-004',
    name: 'Ladakh Bike Trip',
    destination: 'Ladakh',
    image:'https://images.unsplash.com/photo-1536295243470-d7cba4efab7b?w=800&q=80',
    pricePerGuest: 7500,
    viewing: 45,
    origin: 'Leh',
    departureDate: '2026-06-10',
    endDate: '2026-06-17'
  },
  {
    id: 'leh-005',
    name: 'Auli Snow Trip',
    destination: 'Auli',
    image: 'https://images.unsplash.com/photo-1464243875140-f8f83262bd1a?q=80&w=1331&auto=format&fit=crop',
    pricePerGuest: 5500,
    viewing: 67,
    origin: 'Dehradun',
    departureDate: '2026-05-15',
    endDate: '2026-05-20'
  },
  {
    id: 'switzerland-006',
    name: 'Swiss Alps',
    destination: 'Switzerland',
    image: 'https://images.unsplash.com/photo-1521292270410-a8c4d716d518?w=800&q=80',
    pricePerGuest: 45000,
    viewing: 312,
    origin: 'Zurich',
    departureDate: '2026-10-10',
    endDate: '2026-10-16'
  },
  {
    id: 'gulmarg-007',
    name: 'Gulmarg Skiing',
    destination: 'Gulmarg',
    image: 'https://images.unsplash.com/photo-1544085311-11a028465b03?w=800&q=80',
    pricePerGuest: 4999,
    viewing: 120,
    origin: 'Srinagar',
    departureDate: '2026-12-20',
    endDate: '2026-12-24'
  },
  {
    id: 'iceland-008',
    name: 'Iceland Lights',
    destination: 'Iceland',
    image: 'https://images.unsplash.com/photo-1476610182048-b716b8518aae?w=800&q=80',
    pricePerGuest: 52000,
    viewing: 88,
    origin: 'Reykjavik',
    departureDate: '2026-11-05',
    endDate: '2026-11-10'
  },
  {
    id: 'goa-009',
    name: 'Goa Beaches',
    destination: 'Goa',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=800&q=80',
    pricePerGuest: 3200,
    viewing: 235,
    origin: 'Mumbai',
    departureDate: '2026-03-15',
    endDate: '2026-03-20'
  }
];

// Ensure this line is exactly like this at the bottom:
export const getTourById = (id) => tours.find(tour => tour.id === id);