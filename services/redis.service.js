const { promisify } = require("util");
const client = require("../databases/init.redis");

const redis_hset = (key, field, value) => client.hSet(key, field, value);
const redis_hget = (key, field) => client.hGet(key, field);
const redis_hdel = (key, field) => client.hDel(key, field);
const redis_hincreby = (key, field, increment) =>
  client.hIncrBy(key, field, increment);
const redis_setnx = (key, value) => client.setNX(key, value);
const redis_exists = (key) => client.exists(key);
const redis_hgetall = (key) => client.hGetAll(key);
const redis_lrange = (key, start, stop) => client.lrange(key, start, stop);
const redis_increby = (key, increment) => client.incrBy(key, increment);
const redis_get = (key) => client.get(key);
const redis_set = (key, value) => client.set(key, value);
const expire = (key, ttl) => client.expire(key, ttl);
module.exports = {
  expire,
  redis_lrange,
  redis_get,
  redis_set,
  redis_hset,
  redis_hdel,
  redis_exists,
  redis_hgetall,
  redis_setnx,
  redis_increby,
  redis_hget,
  redis_hincreby,
  // cách thủ công để chuyển từ 1 hàm callback-style -> promise style
  // setPromise: async ({ key, value }) => {
  //   return new Promise((isOk, isError) => {
  //     client.set(key, value, (err, rs) => {
  //       return !err ? isOk(rs) : isError(err);
  //     });
  //   });
  // },
};
// cách mới để chuyển từ 1 hàm callback-style -> promise style
// const redis_hset = promisify(client.hSet).bind(client);
// const redis_hget = promisify(client.hGet).bind(client);
// const redis_hincreby = promisify(client.hIncrBy).bind(client);
// const redis_setnx = promisify(client.setNX).bind(client);
// const redis_exists = promisify(client.exists).bind(client);
// const redis_hgetall = promisify(client.hGetAll).bind(client);
// const redis_increby = promisify(client.incrBy).bind(client);
// const redis_get = promisify(client.get).bind(client);
// const redis_set = promisify(client.set).bind(client);
// const redis_lrange = promisify(client.lRange).bind(client);
