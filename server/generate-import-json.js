/**
 * generate-import-json.js
 * ───────────────────────
 * Generates users.json and events.json files that can be
 * imported directly into MongoDB Atlas via the web UI.
 *
 * Run: node generate-import-json.js
 * Output: server/data/users.json  and  server/data/events.json
 */

const bcrypt = require('bcryptjs');
const fs     = require('fs');
const path   = require('path');

// ── Pre-defined ObjectId strings (so createdBy references match exactly) ──────
const IDS = {
  demo:   '64a1b2c3d4e5f6a7b8c9d001',
  alex:   '64a1b2c3d4e5f6a7b8c9d002',
  priya:  '64a1b2c3d4e5f6a7b8c9d003',
  marcus: '64a1b2c3d4e5f6a7b8c9d004',
  sophie: '64a1b2c3d4e5f6a7b8c9d005',
  rahul:  '64a1b2c3d4e5f6a7b8c9d006',
};

const future = (days, hour = 18) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

async function generate() {
  console.log('\n🔧  EventHub – JSON Import File Generator');
  console.log('─'.repeat(45));

  // Output directory
  const outDir = path.join(__dirname, 'data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  // ── 1. Hash passwords ───────────────────────────────────────────────────
  console.log('\n🔒  Hashing passwords (this takes ~10 seconds)…');

  const [hash123, hashDemo] = await Promise.all([
    bcrypt.hash('password123', 12),
    bcrypt.hash('demo1234',    12),
  ]);

  console.log('    ✓ Passwords hashed');

  // ── 2. Build users array ────────────────────────────────────────────────
  const now = new Date().toISOString();

  const users = [
    {
      _id:       { $oid: IDS.demo },
      name:      'Demo User',
      email:     'demo@eventhub.com',
      password:  hashDemo,
      bio:       'Just here to explore EventHub!',
      avatar:    'https://ui-avatars.com/api/?name=Demo+User&background=6D28D9&color=fff&bold=true&size=128',
      createdAt: { $date: now },
      updatedAt: { $date: now },
    },
    {
      _id:       { $oid: IDS.alex },
      name:      'Alex Johnson',
      email:     'alex@eventhub.com',
      password:  hash123,
      bio:       'Tech enthusiast & full-stack developer. Love organising hackathons.',
      avatar:    'https://ui-avatars.com/api/?name=Alex+Johnson&background=7C3AED&color=fff&bold=true&size=128',
      createdAt: { $date: now },
      updatedAt: { $date: now },
    },
    {
      _id:       { $oid: IDS.priya },
      name:      'Priya Sharma',
      email:     'priya@eventhub.com',
      password:  hash123,
      bio:       'Music lover and event organiser.',
      avatar:    'https://ui-avatars.com/api/?name=Priya+Sharma&background=EC4899&color=fff&bold=true&size=128',
      createdAt: { $date: now },
      updatedAt: { $date: now },
    },
    {
      _id:       { $oid: IDS.marcus },
      name:      'Marcus Williams',
      email:     'marcus@eventhub.com',
      password:  hash123,
      bio:       'Sports coach and fitness advocate.',
      avatar:    'https://ui-avatars.com/api/?name=Marcus+Williams&background=10B981&color=fff&bold=true&size=128',
      createdAt: { $date: now },
      updatedAt: { $date: now },
    },
    {
      _id:       { $oid: IDS.sophie },
      name:      'Sophie Chen',
      email:     'sophie@eventhub.com',
      password:  hash123,
      bio:       'UX Designer passionate about creative workshops.',
      avatar:    'https://ui-avatars.com/api/?name=Sophie+Chen&background=F59E0B&color=fff&bold=true&size=128',
      createdAt: { $date: now },
      updatedAt: { $date: now },
    },
    {
      _id:       { $oid: IDS.rahul },
      name:      'Rahul Patel',
      email:     'rahul@eventhub.com',
      password:  hash123,
      bio:       'Startup founder. Love connecting people through business events.',
      avatar:    'https://ui-avatars.com/api/?name=Rahul+Patel&background=3B82F6&color=fff&bold=true&size=128',
      createdAt: { $date: now },
      updatedAt: { $date: now },
    },
  ];

  // ── 3. Build events array ───────────────────────────────────────────────
  const events = [
    {
      _id:          { $oid: '64a1b2c3d4e5f6a7b8c9e001' },
      title:        'React & Node.js Hackathon 2026',
      description:  'Join us for a 24-hour hackathon where developers of all levels build innovative web apps!\n\nMentors from top tech companies, prizes worth ₹1,00,000, and epic networking await.',
      date:         { $date: future(5, 9) },
      location:     'Tech Hub, Connaught Place, New Delhi',
      capacity:     200,
      attendeeCount: 3,
      attendees:    [{ $oid: IDS.demo }, { $oid: IDS.priya }, { $oid: IDS.marcus }],
      imageUrl:     'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=630&fit=crop',
      category:     'Technology',
      tags:         ['react', 'nodejs', 'hackathon', 'webdev', 'prizes'],
      isOnline:     false,
      createdBy:    { $oid: IDS.alex },
      createdAt:    { $date: now },
      updatedAt:    { $date: now },
    },
    {
      _id:          { $oid: '64a1b2c3d4e5f6a7b8c9e002' },
      title:        'AI & Machine Learning Summit',
      description:  'A full-day conference on AI and ML breakthroughs.\n\nSpeakers from Google, Microsoft, and top AI startups. Hands-on workshops + networking dinner included.',
      date:         { $date: future(12, 10) },
      location:     'IIT Delhi, Hauz Khas, New Delhi',
      capacity:     500,
      attendeeCount: 4,
      attendees:    [{ $oid: IDS.demo }, { $oid: IDS.priya }, { $oid: IDS.marcus }, { $oid: IDS.sophie }],
      imageUrl:     'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&h=630&fit=crop',
      category:     'Technology',
      tags:         ['ai', 'machinelearning', 'llm', 'conference'],
      isOnline:     false,
      createdBy:    { $oid: IDS.alex },
      createdAt:    { $date: now },
      updatedAt:    { $date: now },
    },
    {
      _id:          { $oid: '64a1b2c3d4e5f6a7b8c9e003' },
      title:        'Web3 & Blockchain Workshop (Online)',
      description:  'Learn blockchain from scratch! Solidity, DApps with Ethers.js, NFT creation, DeFi protocols.\n\nCertificate + private Discord community access for all participants.',
      date:         { $date: future(3, 19) },
      location:     'Online (Zoom)',
      capacity:     150,
      attendeeCount: 2,
      attendees:    [{ $oid: IDS.demo }, { $oid: IDS.alex }],
      imageUrl:     'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=630&fit=crop',
      category:     'Technology',
      tags:         ['blockchain', 'web3', 'solidity', 'nft', 'online'],
      isOnline:     true,
      meetingLink:  'https://zoom.us/j/example123',
      createdBy:    { $oid: IDS.rahul },
      createdAt:    { $date: now },
      updatedAt:    { $date: now },
    },
    {
      _id:          { $oid: '64a1b2c3d4e5f6a7b8c9e004' },
      title:        'Indie Music Night – Local Artists Showcase',
      description:  'An enchanting evening celebrating local indie artists! 6 bands across two stages.\n\nCraft cocktails, food stalls, merch tables. Doors 6:30 PM, first act 7:30 PM. 18+ only.',
      date:         { $date: future(7, 19) },
      location:     'Blue Frog, Lower Parel, Mumbai',
      capacity:     300,
      attendeeCount: 3,
      attendees:    [{ $oid: IDS.demo }, { $oid: IDS.alex }, { $oid: IDS.sophie }],
      imageUrl:     'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=630&fit=crop',
      category:     'Music',
      tags:         ['indie', 'livemusic', 'localartists', 'mumbai'],
      isOnline:     false,
      createdBy:    { $oid: IDS.priya },
      createdAt:    { $date: now },
      updatedAt:    { $date: now },
    },
    {
      _id:          { $oid: '64a1b2c3d4e5f6a7b8c9e005' },
      title:        'Classical Carnatic Music Concert',
      description:  'A sublime evening of Carnatic classical music in a beautifully restored heritage hall.\n\nTea and snacks served during the interval. Perfect for families.',
      date:         { $date: future(20, 18) },
      location:     'Chowdiah Memorial Hall, Bengaluru',
      capacity:     400,
      attendeeCount: 2,
      attendees:    [{ $oid: IDS.demo }, { $oid: IDS.marcus }],
      imageUrl:     'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&h=630&fit=crop',
      category:     'Music',
      tags:         ['classical', 'carnatic', 'heritage', 'bangalore'],
      isOnline:     false,
      createdBy:    { $oid: IDS.priya },
      createdAt:    { $date: now },
      updatedAt:    { $date: now },
    },
    {
      _id:          { $oid: '64a1b2c3d4e5f6a7b8c9e006' },
      title:        '5K Fun Run – Charity for Education',
      description:  'Join 500+ runners for our annual 5K charity run! All proceeds go to the Vidya Foundation.\n\nWalkers welcome. Race bib, finisher medal, T-shirt, and breakfast included.',
      date:         { $date: future(10, 6) },
      location:     'Cubbon Park, Bengaluru',
      capacity:     500,
      attendeeCount: 4,
      attendees:    [{ $oid: IDS.demo }, { $oid: IDS.alex }, { $oid: IDS.priya }, { $oid: IDS.sophie }],
      imageUrl:     'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&h=630&fit=crop',
      category:     'Sports',
      tags:         ['5k', 'running', 'charity', 'fitness', 'community'],
      isOnline:     false,
      createdBy:    { $oid: IDS.marcus },
      createdAt:    { $date: now },
      updatedAt:    { $date: now },
    },
    {
      _id:          { $oid: '64a1b2c3d4e5f6a7b8c9e007' },
      title:        'Community Cricket Tournament',
      description:  'Weekend T20 cricket tournament! Knockout rounds over 2 days.\n\nPrize pool ₹50,000 + trophies. Includes umpires, live scores, and closing BBQ dinner.',
      date:         { $date: future(14, 8) },
      location:     'DDA Sports Complex, Dwarka, Delhi',
      capacity:     88,
      attendeeCount: 2,
      attendees:    [{ $oid: IDS.demo }, { $oid: IDS.rahul }],
      imageUrl:     'https://images.unsplash.com/photo-1540747913346-19212a4de087?w=1200&h=630&fit=crop',
      category:     'Sports',
      tags:         ['cricket', 't20', 'tournament', 'corporate', 'sports'],
      isOnline:     false,
      createdBy:    { $oid: IDS.marcus },
      createdAt:    { $date: now },
      updatedAt:    { $date: now },
    },
    {
      _id:          { $oid: '64a1b2c3d4e5f6a7b8c9e008' },
      title:        'Modern Art Exhibition – "Fragments of Tomorrow"',
      description:  '25 emerging Indian artists exploring urbanisation, identity, and digital culture.\n\nMedia: oil paintings, digital installations, sculpture, AR experiences. Opening night includes complimentary wine and canapés!',
      date:         { $date: future(2, 17) },
      location:     'National Gallery of Modern Art, Mumbai',
      capacity:     250,
      attendeeCount: 3,
      attendees:    [{ $oid: IDS.demo }, { $oid: IDS.priya }, { $oid: IDS.marcus }],
      imageUrl:     'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&h=630&fit=crop',
      category:     'Art',
      tags:         ['modernart', 'exhibition', 'gallery', 'contemporary'],
      isOnline:     false,
      createdBy:    { $oid: IDS.sophie },
      createdAt:    { $date: now },
      updatedAt:    { $date: now },
    },
    {
      _id:          { $oid: '64a1b2c3d4e5f6a7b8c9e009' },
      title:        'Pottery & Ceramics Workshop for Beginners',
      description:  'Get your hands dirty! Guided by an expert potter.\n\nAll materials included. Take home 2 pieces! Max 15 people. Tea, coffee, and snacks provided.',
      date:         { $date: future(8, 11) },
      location:     'The Clay Studio, Hauz Khas Village, Delhi',
      capacity:     15,
      attendeeCount: 2,
      attendees:    [{ $oid: IDS.demo }, { $oid: IDS.alex }],
      imageUrl:     'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&h=630&fit=crop',
      category:     'Art',
      tags:         ['pottery', 'ceramics', 'workshop', 'beginner', 'creative'],
      isOnline:     false,
      createdBy:    { $oid: IDS.sophie },
      createdAt:    { $date: now },
      updatedAt:    { $date: now },
    },
    {
      _id:          { $oid: '64a1b2c3d4e5f6a7b8c9e010' },
      title:        'Street Food Festival 2026',
      description:  '80+ vendors from across India! Biryani cook-off, chaat paradise, dessert village, craft beer, celebrity chef demos.\n\nFree entry — bring your appetite! Pet-friendly.',
      date:         { $date: future(6, 11) },
      location:     'JN Stadium Grounds, New Delhi',
      capacity:     5000,
      attendeeCount: 5,
      attendees:    [
        { $oid: IDS.demo }, { $oid: IDS.alex }, { $oid: IDS.priya },
        { $oid: IDS.marcus }, { $oid: IDS.sophie }
      ],
      imageUrl:     'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=630&fit=crop',
      category:     'Food',
      tags:         ['streetfood', 'festival', 'foodie', 'biryani', 'free'],
      isOnline:     false,
      createdBy:    { $oid: IDS.priya },
      createdAt:    { $date: now },
      updatedAt:    { $date: now },
    },
    {
      _id:          { $oid: '64a1b2c3d4e5f6a7b8c9e011' },
      title:        'Startup Pitch Night – Delhi Edition',
      description:  '10 startups pitch to top VCs and angel investors. 5-min pitch + Q&A format.\n\nNetworking cocktail hour post-event. Previous alumni raised ₹50Cr+ combined.',
      date:         { $date: future(9, 18) },
      location:     'WeWork, BKC, Mumbai',
      capacity:     200,
      attendeeCount: 4,
      attendees:    [{ $oid: IDS.demo }, { $oid: IDS.alex }, { $oid: IDS.priya }, { $oid: IDS.marcus }],
      imageUrl:     'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=630&fit=crop',
      category:     'Business',
      tags:         ['startup', 'pitch', 'vc', 'funding', 'entrepreneurship'],
      isOnline:     false,
      createdBy:    { $oid: IDS.rahul },
      createdAt:    { $date: now },
      updatedAt:    { $date: now },
    },
    {
      _id:          { $oid: '64a1b2c3d4e5f6a7b8c9e012' },
      title:        'LinkedIn Masterclass – Build Your Personal Brand (Online)',
      description:  'Turn LinkedIn into a career and business engine.\n\nProfile optimisation, content strategy, growing to 10K followers, DM templates. Limited to 50 for live Q&A. Recording sent to all.',
      date:         { $date: future(4, 20) },
      location:     'Online (Google Meet)',
      capacity:     50,
      attendeeCount: 3,
      attendees:    [{ $oid: IDS.demo }, { $oid: IDS.alex }, { $oid: IDS.sophie }],
      imageUrl:     'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=1200&h=630&fit=crop',
      category:     'Business',
      tags:         ['linkedin', 'personalbrand', 'online', 'career', 'marketing'],
      isOnline:     true,
      meetingLink:  'https://meet.google.com/example-link',
      createdBy:    { $oid: IDS.rahul },
      createdAt:    { $date: now },
      updatedAt:    { $date: now },
    },
    {
      _id:          { $oid: '64a1b2c3d4e5f6a7b8c9e013' },
      title:        'Sunrise Yoga & Meditation in the Park',
      description:  'Rejuvenating 90-min outdoor yoga session at sunrise. All levels welcome.\n\nWarm-up → Sun Salutations → Asana → Guided Meditation. Bring mat & water. Free herbal tea after.',
      date:         { $date: future(4, 6) },
      location:     'Lodhi Garden, New Delhi',
      capacity:     80,
      attendeeCount: 3,
      attendees:    [{ $oid: IDS.demo }, { $oid: IDS.priya }, { $oid: IDS.sophie }],
      imageUrl:     'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=630&fit=crop',
      category:     'Health',
      tags:         ['yoga', 'meditation', 'wellness', 'sunrise', 'outdoor'],
      isOnline:     false,
      createdBy:    { $oid: IDS.marcus },
      createdAt:    { $date: now },
      updatedAt:    { $date: now },
    },
    {
      _id:          { $oid: '64a1b2c3d4e5f6a7b8c9e014' },
      title:        'UPSC Prelims Strategy Bootcamp (Online)',
      description:  '2-day bootcamp by IAS officers and top educators.\n\nDay 1: GS Paper I. Day 2: CSAT. Recorded sessions, PDF notes, 3 mock tests, doubt sessions. Previous students saw 40% score improvement!',
      date:         { $date: future(15, 9) },
      location:     'Online (Zoom + Recorded)',
      capacity:     300,
      attendeeCount: 2,
      attendees:    [{ $oid: IDS.demo }, { $oid: IDS.marcus }],
      imageUrl:     'https://images.unsplash.com/photo-1434030216411-0b793f4b6f5e?w=1200&h=630&fit=crop',
      category:     'Education',
      tags:         ['upsc', 'ias', 'competitive', 'education', 'online'],
      isOnline:     true,
      meetingLink:  'https://zoom.us/j/bootcamp-upsc',
      createdBy:    { $oid: IDS.alex },
      createdAt:    { $date: now },
      updatedAt:    { $date: now },
    },
    {
      _id:          { $oid: '64a1b2c3d4e5f6a7b8c9e015' },
      title:        'Open Mic Comedy Night',
      description:  'The funniest night of your week! 20+ comedians from newcomers to seasoned performers.\n\nSign up for a 5-min slot or just come to laugh. Every Thursday. Bar snacks available.',
      date:         { $date: future(2, 20) },
      location:     'Canvas Laugh Club, Khan Market, Delhi',
      capacity:     120,
      attendeeCount: 4,
      attendees:    [{ $oid: IDS.demo }, { $oid: IDS.alex }, { $oid: IDS.priya }, { $oid: IDS.rahul }],
      imageUrl:     'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=1200&h=630&fit=crop',
      category:     'Entertainment',
      tags:         ['comedy', 'openmic', 'standup', 'nightlife', 'delhi'],
      isOnline:     false,
      createdBy:    { $oid: IDS.sophie },
      createdAt:    { $date: now },
      updatedAt:    { $date: now },
    },
    {
      _id:          { $oid: '64a1b2c3d4e5f6a7b8c9e016' },
      title:        'Bollywood Dance Workshop',
      description:  'Learn high-energy Bollywood dance moves in this 2-hour workshop led by a choreographer from India\'s Got Talent!\n\nNo experience needed. Finish with a group performance. Great for weddings and parties!',
      date:         { $date: future(11, 17) },
      location:     'Dance Xpressions Studio, Koramangala, Bengaluru',
      capacity:     40,
      attendeeCount: 3,
      attendees:    [{ $oid: IDS.demo }, { $oid: IDS.priya }, { $oid: IDS.marcus }],
      imageUrl:     'https://images.unsplash.com/photo-1547153760-18fc86324498?w=1200&h=630&fit=crop',
      category:     'Entertainment',
      tags:         ['bollywood', 'dance', 'workshop', 'fitness', 'fun'],
      isOnline:     false,
      createdBy:    { $oid: IDS.sophie },
      createdAt:    { $date: now },
      updatedAt:    { $date: now },
    },
  ];

  // ── 4. Write JSON files ─────────────────────────────────────────────────
  const usersPath  = path.join(outDir, 'users.json');
  const eventsPath = path.join(outDir, 'events.json');

  fs.writeFileSync(usersPath,  JSON.stringify(users,  null, 2));
  fs.writeFileSync(eventsPath, JSON.stringify(events, null, 2));

  console.log('\n✅  JSON files generated successfully!\n');
  console.log(`    📄  Users  (${users.length} documents):   ${usersPath}`);
  console.log(`    📄  Events (${events.length} documents): ${eventsPath}`);

  console.log('\n📥  How to import these into MongoDB Atlas:');
  console.log('─'.repeat(45));
  console.log('  1. Go to https://cloud.mongodb.com → your cluster');
  console.log('  2. Click "Browse Collections"');
  console.log('  3. Click "Add My Own Data" → Database: eventhub');
  console.log('  4. Create collection "users" → Import from JSON → pick users.json');
  console.log('  5. Create collection "events" → Import from JSON → pick events.json');
  console.log('');
  console.log('  OR use mongoimport (CLI):');
  console.log('  mongoimport --uri "YOUR_ATLAS_URI" --collection users  --file server/data/users.json  --jsonArray');
  console.log('  mongoimport --uri "YOUR_ATLAS_URI" --collection events --file server/data/events.json --jsonArray');
  console.log('');
  console.log('🔑  Login credentials:');
  console.log('    demo@eventhub.com   →  demo1234');
  console.log('    alex@eventhub.com   →  password123');
  console.log('    priya@eventhub.com  →  password123  (and all others)\n');
}

generate().catch((err) => {
  console.error('❌ Failed:', err.message);
  process.exit(1);
});
