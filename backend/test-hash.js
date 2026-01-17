const bcrypt = require('bcrypt');

const hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy';
const password = 'password123';

console.log('Testing hash validation...');
console.log('Password:', password);
console.log('Hash:', hash);
console.log('');

bcrypt.compare(password, hash).then(result => {
    console.log('Does hash match password123?', result);

    if (!result) {
        console.log('\n❌ Hash does NOT match! Generating correct hash...\n');
        bcrypt.hash(password, 10).then(newHash => {
            console.log('✅ CORRECT HASH for password123:');
            console.log(newHash);
            console.log('\nUse this hash in database/init.sql');
        });
    } else {
        console.log('\n✅ Hash is correct!');
    }
}).catch(err => {
    console.error('Error:', err);
});
