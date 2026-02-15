require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const bobaSpots = [
  { name: 'Gong Cha', address: 'Multiple locations' },
  { name: 'Tiger Sugar', address: 'Multiple locations' },
  { name: 'Kung Fu Tea', address: 'Multiple locations' },
  { name: 'ShareTea', address: 'Multiple locations' },
  { name: 'CoCo Fresh Tea & Juice', address: 'Multiple locations' },
  { name: 'Boba Guys', address: 'Multiple locations' },
  { name: 'The Alley', address: 'Multiple locations' },
  { name: 'Quickly', address: 'Multiple locations' },
  { name: 'Tastea', address: 'Multiple locations' },
  { name: 'Happy Lemon', address: 'Multiple locations' },
  { name: 'Ding Tea', address: 'Multiple locations' },
  { name: 'Vivi Bubble Tea', address: 'Multiple locations' },
  { name: 'Machi Machi', address: 'Multiple locations' },
  { name: 'Tea Top', address: 'Multiple locations' },
  { name: 'Boba Tea Company', address: 'Multiple locations' }
];

async function seed() {
  console.log('🌱 Starting to seed boba spots...');
  
  const { data, error } = await supabase
    .from('boba_spots')
    .insert(bobaSpots);
  
  if (error) {
    console.error('❌ Error:', error.message);
  } else {
    console.log(`✅ Successfully seeded ${bobaSpots.length} boba spots!`);
  }
  
  process.exit();
}

seed();