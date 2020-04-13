const Redis = require('ioredis'); // eslint-disable-line import/no-unresolved
const isEmpty = require('lodash/isEmpty');

console.log('on redisAdapter.js');
const client = new Redis(process.env.REDIS_URL, { keyPrefix: 'rptest:' });

function jsonToKeyVal(obj){
    var arr = [];

    for(var i in obj){
        arr.push(i.toString());
        arr.push(obj[i].toString());
    }
    return arr;
}

function emailKeyFor(email) {
  return `email:${email}`;
}

class RedisAdapter {
    //name shold be the name of the collection
  constructor(name) {
    this.name = name;
  }

  async hupsert(id, payload) {
     var vals = jsonToKeyVal(payload);
     console.log(vals);
     console.log(...vals);
     console.log('this.key(id)',this.key(id));
     client.hmset(this.key(id),vals);
     console.log('emailKeyFor(payload.email)',emailKeyFor(payload.email));
     client.set(emailKeyFor(payload.email),this.key(id));

  }

  async upsert(id, payload) {
    client.set(this.key(id),payload);

  }

  async find(id) {
    // const data = await client.get(this.key(id));
    const data = await client.hgetall(id);
    console.log('find - data',data );
    if (isEmpty(data))
        return undefined;
    else
        return data;
  }

  async findByEmail(email) {
    const id = await client.get(emailKeyFor(email));
    console.log('findByEmail - id',id);
    if (isEmpty(id))
        return undefined;
    else
        return await this.find(id);
  }

  async destroy(id) {
    await client.del(this.key(id));
  }

  key(id) {
    return `${this.name}:${id}`;
  }
}


module.exports = RedisAdapter;
