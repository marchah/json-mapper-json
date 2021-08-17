const expect = require('chai').expect;

const jsonMapper = require('../lib/json-mapper.js');


describe('Unit Testing', () => {
  require('./old.spec.js');
  require('./json-mapper.spec.js');
  require('./inttra.spec.js');


  it('should test issue #23 question', async () => {
    const res = await jsonMapper({ email: "a@example.com" },
      {
        "emails": {
          path: "email",
          formatting: (email) => {
              return [{ email }];
          },
      },
      });

      expect(res).to.eql({ emails: [ { email: "a@example.com" }] });
  });
});
