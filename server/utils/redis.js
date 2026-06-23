const { createClient } = require('redis');
let client;
const getRedis = async () => { if (!client) { client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' }); client.on('error', (err) => console.log('Redis unavailable:', err.message)); try { await client.connect(); } catch (error) { console.log('Redis connect skipped:', error.message); } } return client; };
const getCache = async (key) => { try { const redis = await getRedis(); const value = await redis.get(key); return value ? JSON.parse(value) : null; } catch (error) { return null; } };
const setCache = async (key, value, ttl = 300) => { try { const redis = await getRedis(); await redis.setEx(key, ttl, JSON.stringify(value)); } catch (error) {} };
const delByPrefix = async (prefix) => { try { const redis = await getRedis(); for await (const key of redis.scanIterator({ MATCH: `${prefix}*` })) await redis.del(key); } catch (error) {} };
module.exports = { getRedis, getCache, setCache, delByPrefix };
