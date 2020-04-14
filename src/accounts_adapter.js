const Redis = require('ioredis'); // eslint-disable-line import/no-unresolved
const isEmpty = require('lodash/isEmpty');

const client = new Redis(process.env.REDIS_URL, { keyPrefix: 'rptest:' });

function jsonToKeyVal(obj){
    var arr = [];

    for(var i in obj){
        arr.push(i.toString());
        arr.push(obj[i].toString());
    }
    return arr;
}

class AccountsAdapter {
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
     console.log('emailKeyFor(payload.email)',this.emailKeyFor(payload.email));
     client.set(emailKeyFor(payload.email),this.key(id));

  }

  async upsert(id, payload) {
    client.set(this.key(id),JSON.stringify(payload));
    client.set(this.emailKeyFor(payload.email),this.key(id));

  }

  async find(id) {
    const data = await client.get(this.key(id));
    if (isEmpty(data))
        return undefined;
    else
        return JSON.parse(data);
  }

  async findByEmail(email) {
    const id = await client.get(this.emailKeyFor(email));
    if (isEmpty(id))
        return undefined;
    else
        return await this.find(id);
  }

  async destroy(id) {
    await client.del(this.key(id));
  }

  key(id) {
      if (id.indexOf(this.name) == 0){
          return id;
      }
      else {
          return `${this.name}:${id}`;
      }
  }

  emailKeyFor(email) {
    if (email.indexOf('email:') == 0){
        return email;
    }
    else {
        return `email:${email}`;
    }
  }

}

module.exports = AccountsAdapter;
