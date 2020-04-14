const low = require('lowdb');
// const Memory = require('lowdb/adapters/Memory');
const accountsAdapter = require('./accounts_adapter.js');

var accAdp = new accountsAdapter('account');

const assert = require('assert');


var default_users =   {users: [
    {
      id: 'acc10',
      email: 'foo@example.com',
      email_verified: true,
      name:'foo name',
      middle_name: 'middle f name',

    },
    {
      id: 'acc11',
      email: 'bar@example.com',
      email_verified: false,
      name:'bar name',
      middle_name: 'middle b name',

    },
    ]
};
console.log(default_users.users[0]);
console.log(default_users.users[1]);

accAdp.upsert(default_users.users[0].id,default_users.users[0]);
console.log('user0 added');
accAdp.upsert(default_users.users[1].id,default_users.users[1]);
console.log('user1 added');

class Account {
  // This interface is required by oidc-provider
  static async findAccount(ctx, id) {
    // This would ideally be just a check whether the account is still in your storage
    const account = await accAdp.find(id);
    if (!account) {
      return undefined;
    }

    return {
      accountId: id,
      // and this claims() method would actually query to retrieve the account claims
      async claims() {
        return {
          sub: id,
          email: account.email,
          email_verified: account.email_verified,
          name:account.name,
          middle_name:account.middle_name,
        };
      },
    };
  }

  // This can be anything you need to authenticate a user
  static async authenticate(email, password) {
    try {
      assert(password, 'password must be provided');
      assert(email, 'email must be provided');
      const lowercased = String(email).toLowerCase();
      // const account = db.get('users').find({ email: lowercased }).value();
      const account = await accAdp.findByEmail(lowercased);
      assert(account, 'invalid credentials provided');

      return account.id;
    } catch (err) {
      return undefined;
    }
  }
}

module.exports = Account;
