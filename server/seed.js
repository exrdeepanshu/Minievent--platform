/**
 * ═══════════════════════════════════════════════════════════════
 *  EventHub – Database Seeder
 *  Populates MongoDB with realistic sample users, events & RSVPs
 *
 *  Usage:
 *    node seed.js            → seed (auto-detects local vs Atlas)
 *    node seed.js --clear    → wipe all data, no re-seed
 *    node seed.js --local    → force use of localhost MongoDB
 *    node seed.js --uri mongodb://... → use a specific URI
 * ═══════════════════════════════════════════════════════════════
 */

require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

// ── Resolve the best available MongoDB URI ────────────────────────────────────

const args        = process.argv.slice(2);
const forcedUri   = args.find((a) => a.startsWith('--uri='))?.split('=')[1];
const forceLocal  = args.includes('--local');
const clearOnly   = args.includes('--clear');

const PLACEHOLDER_PATTERNS = ['xxxxx', '<username>', '<password>', 'your_'];

function isPlaceholder(uri = '') {
  return !uri || PLACEHOLDER_PATTERNS.some((p) => uri.includes(p));
}

function resolveUri() {
  if (forcedUri)  return { uri: forcedUri, label: 'custom URI' };
  if (forceLocal) return { uri: 'mongodb://localhost:27017/eventhub', label: 'Local MongoDB' };

  const envUri = process.env.MONGO_URI || '';
  if (!isPlaceholder(envUri)) return { uri: envUri, label: 'MongoDB Atlas (from .env)' };

  // Fallback: try local MongoDB
  console.log('\n⚠️   MONGO_URI in .env still has placeholder values.');
  console.log('    Falling back to local MongoDB: mongodb://localhost:27017/eventhub');
  console.log('    (Make sure MongoDB is running locally, or set a real Atlas URI in server/.env)\n');
  return { uri: 'mongodb://localhost:27017/eventhub', label: 'Local MongoDB (fallback)' };
}

// ── Inline Models ─────────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    name: String,
    email: { type: String, unique: true },
    password: String,
    avatar: String,
    bio: String,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);
userSchema.virtual('avatarUrl').get(function () {
  return this.avatar ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(this.name)}&background=7C3AED&color=fff&bold=true&size=128`;
});

const eventSchema = new mongoose.Schema(
  {
    title: String, description: String, date: Date, location: String,
    capacity: Number, attendeeCount: { type: Number, default: 0 },
    attendees: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    imageUrl: String, category: String,
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    tags: [String], isOnline: Boolean, meetingLink: String,
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Use existing models if already registered (prevents OverwriteModelError)
const User  = mongoose.models.User  || mongoose.model('User',  userSchema);
const Event = mongoose.models.Event || mongoose.model('Event', eventSchema);

// ── Sample Users ──────────────────────────────────────────────────────────────

const SAMPLE_USERS = [
  {
    name: 'Demo User',
    email: 'demo@eventhub.com',
    password: 'demo1234',
    bio: 'Just here to explore EventHub!',
    avatar: 'https://ui-avatars.com/api/?name=Demo+User&background=6D28D9&color=fff&bold=true&size=128',
  },
  {
    name: 'Alex Johnson',
    email: 'alex@eventhub.com',
    password: 'password123',
    bio: 'Tech enthusiast & full-stack developer. Love organising hackathons.',
    avatar: 'https://ui-avatars.com/api/?name=Alex+Johnson&background=7C3AED&color=fff&bold=true&size=128',
  },
  {
    name: 'Priya Sharma',
    email: 'priya@eventhub.com',
    password: 'password123',
    bio: 'Music lover and event organiser. Bringing people together through live performances.',
    avatar: 'https://ui-avatars.com/api/?name=Priya+Sharma&background=EC4899&color=fff&bold=true&size=128',
  },
  {
    name: 'Marcus Williams',
    email: 'marcus@eventhub.com',
    password: 'password123',
    bio: 'Sports coach and fitness advocate. Organising community fitness events.',
    avatar: 'https://ui-avatars.com/api/?name=Marcus+Williams&background=10B981&color=fff&bold=true&size=128',
  },
  {
    name: 'Sophie Chen',
    email: 'sophie@eventhub.com',
    password: 'password123',
    bio: 'UX Designer passionate about creative workshops and art events.',
    avatar: 'https://ui-avatars.com/api/?name=Sophie+Chen&background=F59E0B&color=fff&bold=true&size=128',
  },
  {
    name: 'Rahul Patel',
    email: 'rahul@eventhub.com',
    password: 'password123',
    bio: 'Startup founder. Love connecting people through business events.',
    avatar: 'https://ui-avatars.com/api/?name=Rahul+Patel&background=3B82F6&color=fff&bold=true&size=128',
  },
];

// ── Event Templates ───────────────────────────────────────────────────────────

const future = (days, hour = 18) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d;
};

const makeEvents = (users) => [
  // ── Technology ────────────────────────────────────────────────────────────
  {
    title: 'React & Node.js Hackathon 2026',
    description: 'Join us for a 24-hour hackathon where developers of all levels build innovative web apps using React and Node.js!\n\nMentors from top tech companies, prizes worth ₹1,00,000, and epic networking await. Team formation happens on arrival.',
    date: future(5, 9), location: 'Tech Hub, Connaught Place, New Delhi',
    capacity: 200, category: 'Technology', createdBy: users[1]._id,
    imageUrl: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1200&h=630&fit=crop',
    tags: ['react', 'nodejs', 'hackathon', 'webdev', 'prizes'], isOnline: false,
  },
  {
    title: 'AI & Machine Learning Summit',
    description: 'A full-day conference exploring the latest in Artificial Intelligence and Machine Learning.\n\nSpeakers from Google, Microsoft, and leading AI startups present on LLMs, Computer Vision, AI ethics, and career opportunities. Hands-on workshops + networking dinner included.',
    date: future(12, 10), location: 'IIT Delhi, Hauz Khas, New Delhi',
    capacity: 500, category: 'Technology', createdBy: users[1]._id,
    imageUrl: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=1200&h=630&fit=crop',
    tags: ['ai', 'machinelearning', 'llm', 'conference'], isOnline: false,
  },
  {
    title: 'Web3 & Blockchain Workshop (Online)',
    description: 'Learn blockchain development from scratch! Topics: Solidity smart contracts, DApps with Ethers.js, NFT creation, and DeFi protocols.\n\nAll participants receive a certificate and access to our private Discord community.',
    date: future(3, 19), location: 'Online (Zoom)',
    capacity: 150, category: 'Technology', createdBy: users[5]._id,
    imageUrl: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=1200&h=630&fit=crop',
    tags: ['blockchain', 'web3', 'solidity', 'nft', 'online'],
    isOnline: true, meetingLink: 'https://zoom.us/j/example123',
  },
  // ── Music ─────────────────────────────────────────────────────────────────
  {
    title: 'Indie Music Night – Local Artists Showcase',
    description: 'An enchanting evening celebrating local indie artists! 6 bands performing across two stages.\n\nCraft cocktails, food stalls, merch tables. Doors open 6:30 PM, first act 7:30 PM. 18+ only.',
    date: future(7, 19), location: 'Blue Frog, Lower Parel, Mumbai',
    capacity: 300, category: 'Music', createdBy: users[2]._id,
    imageUrl: 'https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=1200&h=630&fit=crop',
    tags: ['indie', 'livemusic', 'localartists', 'mumbai'], isOnline: false,
  },
  {
    title: 'Classical Carnatic Music Concert',
    description: 'A sublime evening of Carnatic classical music in a beautifully restored heritage hall.\n\nPerfect for music lovers, students, and families. Tea and snacks served during the interval.',
    date: future(20, 18), location: 'Chowdiah Memorial Hall, Bengaluru',
    capacity: 400, category: 'Music', createdBy: users[2]._id,
    imageUrl: 'https://images.unsplash.com/photo-1514320291840-2e0a9bf2a9ae?w=1200&h=630&fit=crop',
    tags: ['classical', 'carnatic', 'heritage', 'bangalore'], isOnline: false,
  },
  // ── Sports ────────────────────────────────────────────────────────────────
  {
    title: '5K Fun Run – Charity for Education',
    description: 'Join 500+ runners for our annual 5K charity run! All proceeds go to the Vidya Foundation.\n\nRoute covers scenic lakeside paths — walkers welcome! Every participant gets a race bib, finisher medal, T-shirt, and breakfast.',
    date: future(10, 6), location: 'Cubbon Park, Bengaluru',
    capacity: 500, category: 'Sports', createdBy: users[3]._id,
    imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=1200&h=630&fit=crop',
    tags: ['5k', 'running', 'charity', 'fitness', 'community'], isOnline: false,
  },
  {
    title: 'Community Cricket Tournament',
    description: 'A weekend T20 cricket tournament for corporate teams and community groups!\n\nFormat: Knockout rounds over 2 days. Prize pool ₹50,000 + trophies. Includes professional umpires, live scores, and closing BBQ dinner.',
    date: future(14, 8), location: 'DDA Sports Complex, Dwarka, Delhi',
    capacity: 88, category: 'Sports', createdBy: users[3]._id,
    imageUrl: 'https://images.unsplash.com/photo-1540747913346-19212a4de087?w=1200&h=630&fit=crop',
    tags: ['cricket', 't20', 'tournament', 'corporate', 'sports'], isOnline: false,
  },
  // ── Art ───────────────────────────────────────────────────────────────────
  {
    title: 'Modern Art Exhibition – "Fragments of Tomorrow"',
    description: '25 emerging Indian artists exploring urbanisation, identity, and digital culture.\n\nMedia: oil paintings, digital installations, sculpture, photography, AR experiences. Curator-led tours on weekends. RSVP for opening night — complimentary wine and canapés!',
    date: future(2, 17), location: 'National Gallery of Modern Art, Mumbai',
    capacity: 250, category: 'Art', createdBy: users[4]._id,
    imageUrl: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?w=1200&h=630&fit=crop',
    tags: ['modernart', 'exhibition', 'gallery', 'contemporary'], isOnline: false,
  },
  {
    title: 'Pottery & Ceramics Workshop for Beginners',
    description: 'Get your hands dirty! Our expert potter guides you through centring clay, throwing a bowl, hand-building, and glazing.\n\nAll materials included. Take home 2 pieces! Max 15 people for personalised attention. Tea, coffee, and snacks provided.',
    date: future(8, 11), location: 'The Clay Studio, Hauz Khas Village, Delhi',
    capacity: 15, category: 'Art', createdBy: users[4]._id,
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=1200&h=630&fit=crop',
    tags: ['pottery', 'ceramics', 'workshop', 'beginner', 'creative'], isOnline: false,
  },
  // ── Food ──────────────────────────────────────────────────────────────────
  {
    title: 'Street Food Festival 2026',
    description: '80+ vendors from across India! Biryani cook-off, chaat paradise, dessert village, craft beer & mocktail bars, celebrity chef demos.\n\nFree entry — bring your appetite! Pet-friendly.',
    date: future(6, 11), location: 'JN Stadium Grounds, New Delhi',
    capacity: 5000, category: 'Food', createdBy: users[2]._id,
    imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=630&fit=crop',
    tags: ['streetfood', 'festival', 'foodie', 'biryani', 'free'], isOnline: false,
  },
  // ── Business ──────────────────────────────────────────────────────────────
  {
    title: 'Startup Pitch Night – Delhi Edition',
    description: '10 startups pitch to top VCs and angel investors. 5-min pitch + Q&A each. Audience vote for People\'s Choice Award + networking cocktail hour.\n\nPrevious alumni have raised ₹50Cr+ combined. Anyone can attend as audience.',
    date: future(9, 18), location: 'WeWork, BKC, Mumbai',
    capacity: 200, category: 'Business', createdBy: users[5]._id,
    imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200&h=630&fit=crop',
    tags: ['startup', 'pitch', 'vc', 'funding', 'entrepreneurship'], isOnline: false,
  },
  {
    title: 'LinkedIn Masterclass – Build Your Personal Brand (Online)',
    description: 'Turn LinkedIn into a powerful engine for career growth and business leads.\n\nLearn: profile optimisation, content strategy, growing to 10K followers, DM templates, Creator Mode.\n\nLimited to 50 for live Q&A. Recording sent to all attendees.',
    date: future(4, 20), location: 'Online (Google Meet)',
    capacity: 50, category: 'Business', createdBy: users[5]._id,
    imageUrl: 'https://images.unsplash.com/photo-1611944212129-29977ae1398c?w=1200&h=630&fit=crop',
    tags: ['linkedin', 'personalbrand', 'online', 'career', 'marketing'],
    isOnline: true, meetingLink: 'https://meet.google.com/example-link',
  },
  // ── Health ────────────────────────────────────────────────────────────────
  {
    title: 'Sunrise Yoga & Meditation in the Park',
    description: 'Start your Sunday right with a 90-min outdoor yoga session at sunrise.\n\nFlow: warm-up → Sun Salutations → Asana practice → guided meditation. All levels welcome. Bring your mat & water. Free herbal tea after. Make this your Sunday ritual!',
    date: future(4, 6), location: 'Lodhi Garden, New Delhi',
    capacity: 80, category: 'Health', createdBy: users[3]._id,
    imageUrl: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1200&h=630&fit=crop',
    tags: ['yoga', 'meditation', 'wellness', 'sunrise', 'outdoor'], isOnline: false,
  },
  // ── Education ─────────────────────────────────────────────────────────────
  {
    title: 'UPSC Prelims Strategy Bootcamp (Online)',
    description: 'A 2-day focused bootcamp to crack UPSC Prelims 2027, by IAS officers and top educators.\n\nDay 1: GS Paper I. Day 2: CSAT. Includes recorded sessions, PDF notes, 3 mock tests, and 15-min doubt sessions. Previous students reported 40% score improvement!',
    date: future(15, 9), location: 'Online (Zoom + Recorded)',
    capacity: 300, category: 'Education', createdBy: users[1]._id,
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b6f5e?w=1200&h=630&fit=crop',
    tags: ['upsc', 'ias', 'competitive', 'education', 'online'],
    isOnline: true, meetingLink: 'https://zoom.us/j/bootcamp-upsc',
  },
  // ── Entertainment ─────────────────────────────────────────────────────────
  {
    title: 'Open Mic Comedy Night',
    description: 'The funniest night of your week — 20+ comedians from newcomers to seasoned performers.\n\nSign up for a 5-min slot or just come to laugh! Every Thursday. Two drink minimum. Bar snacks available.',
    date: future(2, 20), location: 'Canvas Laugh Club, Khan Market, Delhi',
    capacity: 120, category: 'Entertainment', createdBy: users[4]._id,
    imageUrl: 'https://images.unsplash.com/photo-1527224857830-43a7acc85260?w=1200&h=630&fit=crop',
    tags: ['comedy', 'openmic', 'standup', 'nightlife', 'delhi'], isOnline: false,
  },
  {
    title: 'Bollywood Dance Workshop',
    description: 'Learn high-energy Bollywood dance moves in this fun 2-hour workshop led by a choreographer from India\'s Got Talent!\n\nNo experience needed. We cover iconic moves, sequences, and finish with a group performance. Great for parties, weddings, or just plain fun!',
    date: future(11, 17), location: 'Dance Xpressions Studio, Koramangala, Bengaluru',
    capacity: 40, category: 'Entertainment', createdBy: users[4]._id,
    imageUrl: 'https://images.unsplash.com/photo-1547153760-18fc86324498?w=1200&h=630&fit=crop',
    tags: ['bollywood', 'dance', 'workshop', 'fitness', 'fun'], isOnline: false,
  },
];

// ── Helper: Print Table ───────────────────────────────────────────────────────

function printTable(rows, headers) {
  const widths = headers.map((h, i) => Math.max(h.length, ...rows.map((r) => String(r[i]).length)));
  const line   = '┼' + widths.map((w) => '─'.repeat(w + 2)).join('┼') + '┼';
  const row    = (cells) => '│' + cells.map((c, i) => ` ${String(c).padEnd(widths[i])} `).join('│') + '│';

  console.log('    ┌' + widths.map((w) => '─'.repeat(w + 2)).join('┬') + '┐');
  console.log('    ' + row(headers));
  console.log('    ' + line.replace(/┼/g, (_, i) => (i === 0 ? '├' : i === line.length - 1 ? '┤' : '┼')));
  rows.forEach((r) => console.log('    ' + row(r)));
  console.log('    └' + widths.map((w) => '─'.repeat(w + 2)).join('┴') + '┘');
}

// ── Main Seed Function ────────────────────────────────────────────────────────

async function seed() {
  const { uri, label } = resolveUri();

  console.log('\n🌱  EventHub Database Seeder');
  console.log('━'.repeat(48));

  // Connect
  console.log(`\n📡  Connecting to ${label}…`);
  console.log(`    URI: ${uri.replace(/:\/\/([^:]+):([^@]+)@/, '://<user>:<pass>@')}`);

  try {
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 12000 });
  } catch (connErr) {
    const msg = connErr.message || '';
    console.error('\n❌  Connection failed!\n');
    console.error('    Error:', msg);
    console.log('\n' + '─'.repeat(55));

    if (msg.includes('Authentication failed') || msg.includes('bad auth') || msg.includes('SCRAM')) {
      console.log('\n🔑  FIX: Wrong username or password in MONGO_URI');
      console.log('    The password still has < > brackets, OR the password is wrong.');
      console.log('');
      console.log('    ✗ Wrong:   ::<Ram123>@cluster');
      console.log('    ✓ Correct: ::Ram123@cluster   ← no angle brackets!');
      console.log('');
      console.log('    Open server/.env and fix MONGO_URI — remove ALL < > characters.');

    } else if (msg.includes('ENOTFOUND') || msg.includes('querySrv') || msg.includes('DNS')) {
      console.log('\n🌐  FIX: DNS error — likely a placeholder URI');
      console.log('    1. Go to cloud.mongodb.com → cluster → Connect → Drivers');
      console.log('    2. Copy the full connection string');
      console.log('    3. Replace <password> with your actual password (no < > brackets)');
      console.log('    4. Paste into server/.env as MONGO_URI=...');

    } else if (msg.includes('IP') || msg.includes('whitelist') || msg.includes('not allowed')) {
      console.log('\n🛡️  FIX: Your IP is not whitelisted in Atlas');
      console.log('    1. Go to cloud.mongodb.com');
      console.log('    2. Sidebar → Network Access → + ADD IP ADDRESS');
      console.log('    3. Click "Allow Access From Anywhere" (0.0.0.0/0)');
      console.log('    4. Confirm → wait 30 sec → retry');

    } else if (msg.includes('ETIMEDOUT') || msg.includes('timed out')) {
      console.log('\n⏱️  FIX: Connection timed out');
      console.log('    1. Atlas → Network Access → Add IP 0.0.0.0/0');
      console.log('    2. Check firewall/antivirus is not blocking port 27017');
      console.log('    3. Atlas → check cluster is not paused → Resume if needed');

    } else {
      console.log('\n💡  General fixes to try:');
      console.log('    1. Remove < > from MONGO_URI password in server/.env');
      console.log('    2. Atlas → Network Access → Allow 0.0.0.0/0');
      console.log('    3. Atlas → Database Access → user has readWriteAnyDatabase');
      console.log('    4. Run with local MongoDB: node seed.js --local');
    }

    console.log('\n' + '─'.repeat(55) + '\n');
    process.exit(1);
  }

  console.log(`✅  Connected to: ${mongoose.connection.host}`);

  // Clear existing data
  console.log('\n🗑️   Clearing existing data…');
  await Event.deleteMany({});
  await User.deleteMany({});
  console.log('    ✓ Collections cleared');

  if (clearOnly) {
    console.log('\n✅  Database cleared.\n');
    await mongoose.disconnect();
    return;
  }

  // ── Seed Users ────────────────────────────────────────────────────────────
  console.log('\n👤  Creating users…');
  const hashed = await Promise.all(
    SAMPLE_USERS.map(async (u) => ({ ...u, password: await bcrypt.hash(u.password, 12) }))
  );
  const createdUsers = await User.insertMany(hashed);
  console.log(`    ✓ ${createdUsers.length} users created`);

  // ── Seed Events ───────────────────────────────────────────────────────────
  console.log('\n🎪  Creating events…');
  const eventDocs = makeEvents(createdUsers).map((e, i) => ({
    ...e,
    attendeeCount: 0,
    attendees:     [],
    // Rotate organiser if createdBy wasn't explicitly mapped
    createdBy: e.createdBy || createdUsers[i % createdUsers.length]._id,
  }));
  const createdEvents = await Event.insertMany(eventDocs);
  console.log(`    ✓ ${createdEvents.length} events created`);

  // ── Seed RSVPs (random attendees per event) ────────────────────────────────
  console.log('\n🎟️   Creating RSVPs…');
  let totalRsvps = 0;
  for (const event of createdEvents) {
    const shuffled    = [...createdUsers].sort(() => Math.random() - 0.5);
    const maxAttend   = Math.max(1, Math.floor(shuffled.length * (0.3 + Math.random() * 0.5)));
    const attendees   = shuffled
      .slice(0, maxAttend)
      .map((u) => u._id)
      .filter((id) => id.toString() !== event.createdBy.toString());

    await Event.findByIdAndUpdate(event._id, {
      attendees,
      attendeeCount: attendees.length,
    });
    totalRsvps += attendees.length;
  }
  console.log(`    ✓ ${totalRsvps} RSVPs created`);

  // ── Summary ────────────────────────────────────────────────────────────────
  console.log('\n' + '━'.repeat(48));
  console.log('🎉  Seeding complete!\n');
  console.log(`    📦  Database  : ${mongoose.connection.name}`);
  console.log(`    👤  Users     : ${createdUsers.length}`);
  console.log(`    🎪  Events    : ${createdEvents.length}`);
  console.log(`    🎟️   RSVPs     : ${totalRsvps}`);

  // ── Login Credentials Table ────────────────────────────────────────────────
  console.log('\n🔑  Demo Login Credentials:\n');
  printTable(
    SAMPLE_USERS.map((u) => [u.email, u.password, u.name]),
    ['Email', 'Password', 'Name']
  );

  console.log('\n🚀  Next steps:');
  console.log('    1. Start backend:  npm run dev  (in server/)');
  console.log('    2. Start frontend: npm run dev  (in client/)');
  console.log('    3. Open browser:   http://localhost:5173');
  console.log('    4. Log in with any email from the table above\n');

  await mongoose.disconnect();
}

// ── Run ───────────────────────────────────────────────────────────────────────
seed().catch((err) => {
  console.error('\n❌  Seeder failed:', err.message);
  if (err.message.includes('ENOTFOUND') || err.message.includes('querySrv')) {
    console.log('\n💡  This looks like a DNS error — your MONGO_URI is still a placeholder.');
    console.log('    Run with local MongoDB instead: node seed.js --local');
    console.log('    Or set a real Atlas URI in server/.env first.\n');
  }
  process.exit(1);
});
