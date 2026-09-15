/**
 * generate-jwt-secret.js
 * ──────────────────────
 * Generates a cryptographically secure JWT secret key.
 * Run:  node generate-jwt-secret.js
 */

const crypto = require('crypto');

console.log('\n🔐  JWT Secret Generator for EventHub');
console.log('─'.repeat(50));

// Generate 3 options of different lengths
const secret64  = crypto.randomBytes(64).toString('hex');   // 128 chars — strongest
const secret48  = crypto.randomBytes(48).toString('hex');   // 96 chars  — strong
const secret32  = crypto.randomBytes(32).toString('hex');   // 64 chars  — minimum recommended

console.log('\n✅  Option 1 (Recommended — 128 chars):');
console.log(`    ${secret64}`);

console.log('\n✅  Option 2 (Strong — 96 chars):');
console.log(`    ${secret48}`);

console.log('\n✅  Option 3 (Minimum — 64 chars):');
console.log(`    ${secret32}`);

console.log('\n📋  Copy any ONE of the above values and paste it into server/.env:');
console.log('    JWT_SECRET=<paste_here>');
console.log('');
console.log('⚠️   RULES:');
console.log('    • Never commit .env to GitHub');
console.log('    • Use a different secret for production vs development');
console.log('    • If you change JWT_SECRET, ALL users will be logged out');
console.log('    • Keep it secret — anyone with this can forge login tokens!');
console.log('');
