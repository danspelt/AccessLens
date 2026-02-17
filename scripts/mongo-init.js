// MongoDB initialization script
// Creates the accesslens database and a non-root user

db = db.getSiblingDB('accesslens');

db.createUser({
  user: 'accesslens',
  pwd: 'accesslens_dev_password',
  roles: [
    {
      role: 'readWrite',
      db: 'accesslens',
    },
  ],
});

// Create collections
db.createCollection('users');
db.createCollection('places');
db.createCollection('reviews');

// Create indexes
db.users.createIndex({ email: 1 }, { unique: true });
db.places.createIndex({ city: 1, category: 1 });
db.places.createIndex({ createdAt: -1 });
db.reviews.createIndex({ placeId: 1, createdAt: -1 });

print('AccessLens database initialized successfully');
