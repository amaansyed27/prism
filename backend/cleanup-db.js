const { MongoClient } = require('mongodb');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://rohitisgr8:rohitisgr8@cluster0dawnofcode.g7gvk.mongodb.net/prism?retryWrites=true&w=majority&appName=Cluster0DawnOfCode';

async function cleanDatabase() {
  const client = new MongoClient(MONGODB_URI);
  
  try {
    await client.connect();
    console.log('🔗 Connected to MongoDB Atlas');
    
    const db = client.db('prism');
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('📁 Found collections:', collections.map(c => c.name));
    
    // Clean all user-related data
    const deleteResults = await Promise.all([
      db.collection('users').deleteMany({}),
      db.collection('teams').deleteMany({}),
      db.collection('projects').deleteMany({}),
      db.collection('tasks').deleteMany({}),
      db.collection('sessions').deleteMany({})
    ]);
    
    console.log('🧹 Database cleaned:');
    console.log(`  - Users deleted: ${deleteResults[0].deletedCount}`);
    console.log(`  - Teams deleted: ${deleteResults[1].deletedCount}`);
    console.log(`  - Projects deleted: ${deleteResults[2].deletedCount}`);
    console.log(`  - Tasks deleted: ${deleteResults[3].deletedCount}`);
    console.log(`  - Sessions deleted: ${deleteResults[4].deletedCount}`);
    
    console.log('✅ Database cleanup complete!');
    
  } catch (error) {
    console.error('❌ Database cleanup failed:', error);
  } finally {
    await client.close();
    console.log('🔌 Database connection closed');
  }
}

cleanDatabase();