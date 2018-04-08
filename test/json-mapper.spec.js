const _ = require('lodash');
const rewire = require('rewire');
const expect = require('chai').expect;
const Promise = require('bluebird');
const mongoose = require('mongoose');

const ObjectId = require('bson').ObjectID;

const JsonMapper = rewire('../lib/json-mapper.js');
const getSettings = JsonMapper.__get__('getSettings');
const getValue = JsonMapper.__get__('getValue');
const parseProperties = JsonMapper.__get__('parseProperties');
const jsonMapper = JsonMapper.__get__('jsonMapper');

const ModelSchema = new mongoose.Schema({
  field1: String,
  field2: {
    type: String,
    required: true,
  },
  field3: {
    type: String,
    required: false,
  },
  nested_field1: {
    nested_field2: {
      nested_field3: String,
    }
  },
  array1: [{
    field: String,
  }],
  array2: [{
    field: [String],
  }],
  array3: [{
    field: [{
      type: String
    }],
  }],
});

const Model = mongoose.model('model', ModelSchema);

function unitTestForJsonMapper(fct) {
  it('should be a function', () => {
    expect(fct).to.be.a('function');
  });
  it('should return empty an object', () => {
    expect(fct()).to.be.an('object').and.be.empty;
    expect(fct(undefined)).to.be.an('object').and.be.empty;
    expect(fct(null)).to.be.an('object').and.be.empty;
    expect(fct(undefined, undefined)).to.be.an('object').and.be.empty;
    expect(fct(undefined, null)).to.be.an('object').and.be.empty;
    expect(fct(null, undefined)).to.be.an('object').and.be.empty;
    expect(fct(null, null)).to.be.an('object').and.be.empty;
  });

  it('should throw `Invalid property name`', (done) => {
    try {
      fct({}, {
        field: {
          property: 'invalid',
        },
      });
      done(new Error('Not suppose to succes'));
    }
    catch (err) {
      expect(err).to.be.an.instanceof(Error)
        .and.have.property('message', 'Invalid property property');
      done();
    }
  });

  it('should throw `Invalid type`', (done) => {
    try {
      fct({}, {
        field: {
          type: 'invalid',
        },
      });
      done(new Error('Not suppose to succes'));
    }
    catch (err) {
      expect(err).to.be.an.instanceof(Error)
        .and.have.property('message', 'Invalid type string');
      done();
    }
  });

  it('should throw `Error formatting is not a function`', (done) => {
    try {
      fct({}, {
        field: {
          formatting: 'invalid',
        },
      });
      done(new Error('Not suppose to succes'));
    }
    catch (err) {
      expect(err).to.be.an.instanceof(Error)
        .and.have.property('message', 'Error formatting is not a function');
      done();
    }
  });

  it('should throw `Error nested is not a object`', (done) => {
    try {
      fct({}, {
        field: {
          nested: 'invalid',
        },
      });
      done(new Error('Not suppose to succes'));
    }
    catch (err) {
      expect(err).to.be.an.instanceof(Error)
        .and.have.property('message', 'Error nested is not a object');
      done();
    }
  });

  it('should throw `Error nested is not a boolean`', (done) => {
    try {
      fct({}, {
        field: {
          required: 'invalid',
        },
      });
      done(new Error('Not suppose to succes'));
    }
    catch (err) {
      expect(err).to.be.an.instanceof(Error)
        .and.have.property('message', 'Error required is not a boolean');
      done();
    }
  });

  it('should throw `Path can\'t null`', (done) => {
    try {
      fct({}, {
        field: {
        },
      });
      done(new Error('Not suppose to succes'));
    }
    catch (err) {
      expect(err).to.be.an.instanceof(Error)
        .and.have.property('message', 'Path can\'t null');
      done();
    }
  });

  it('should throw `Path can\'t null`', (done) => {
    try {
      fct({}, {
        field: {
          type: String,
          nested: {},
        },
      });
      done(new Error('Not suppose to succes'));
    }
    catch (err) {
      expect(err).to.be.an.instanceof(Error)
        .and.have.property('message', 'Path can\'t null');
      done();
    }
  });

  it('should throw `Invalid path field (field)`', (done) => {
    try {
      fct({}, {
        field: {
          path: 'field',
        },
      });
      done(new Error('Not suppose to succes'));
    }
    catch (err) {
      expect(err).to.be.an.instanceof(Error)
        .and.have.property('message', 'Invalid path field (field)');
      done();
    }
  });

  it('should throw `Invalid path field (field)` using syntactic sugar', (done) => {
    try {
      fct({}, {
        field: 'field',
      });
      done(new Error('Not suppose to succes'));
    }
    catch (err) {
      expect(err).to.be.an.instanceof(Error)
        .and.have.property('message', 'Invalid path field (field)');
      done();
    }
  });

  it('should throw `Invalid path field (field)` because required `false`', (done) => {
    fct({}, {
      field: {
        path: 'field',
        required: false,
      },
    }).then((result) => {
      expect(result).to.an('object').and.be.empty;
      done();
    });
  });

  it('basic 1/4', (done) => {
    fct({
      field: 'value',
    }, {
      'new_field': {
        path: 'field',
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 'value'});
      done();
    });
  });
  it('basic 2/4', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field2.field3',
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 'value'});
      done();
    });
  });
  it('basic 3/4', (done) => {
    fct({
      field: 0,
    }, {
      'new_field': {
        path: 'field',
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 0});
      done();
    });
  });
  it('basic 4/4', (done) => {
    fct({
      field: false,
    }, {
      'new_field': {
        path: 'field',
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': false});
      done();
    });
  });
  it('basic with key word `$root` 1/4', (done) => {
    fct({
      field: 'value',
    }, {
      'new_field': {
        path: '$root.field',
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 'value'});
      done();
    });
  });
  it('basic with key word `$root` 2/4', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: '$root.field1.field2.field3',
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 'value'});
      done();
    });
  });
  it('basic with key word `$root` 3/4', (done) => {
    fct({
      field: 0,
    }, {
      'new_field': {
        path: '$root.field',
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 0});
      done();
    });
  });
  it('basic with key word `$root` 4/4', (done) => {
    fct({
      field: false,
    }, {
      'new_field': {
        path: '$root.field',
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': false});
      done();
    });
  });
  it('basic with key word `$item` 1/4', (done) => {
    fct({
      field: 'value',
    }, {
      'new_field': {
        path: '$item.field',
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 'value'});
      done();
    });
  });
  it('basic with key word `$item` 2/4', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: 'field1.$item.field2.field3',
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 'value'});
      done();
    });
  });
  it('basic with key word `$item` 3/4', (done) => {
    fct({
      field: 0,
    }, {
      'new_field': {
        path: '$item.field',
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 0});
      done();
    });
  });
  it('basic with key word `$item` 4/4', (done) => {
    fct({
      field: false,
    }, {
      'new_field': {
        path: '$item.field',
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': false});
      done();
    });
  });
  it('basic with key word `$empty`', (done) => {
    fct({
      field1: {
        field2: {
          field3: 0
        }
      }
    }, {
      'new_field1': {
        path: 'field1',
        nested: {
          'new_field2': {
            path: '$empty',
            nested: {
              new_field3: {
                path: 'field2.field3'
              }
            }
          }
        }
      }
    }).then((result) => {
      expect(result).to.eql({
        new_field1: {
          new_field2: {
            new_field3: 0
          }
        }
      });
      done();
    });
  });
  it('basic using syntactic sugar 1/2', (done) => {
    fct({
      field: 'value',
    }, {
      'new_field': 'field',
    }).then((result) => {
      expect(result).to.eql({'new_field': 'value'});
      done();
    });
  });
  it('basic using syntactic sugar 2/2', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': 'field1.field2.field3',
    }).then((result) => {
      expect(result).to.eql({'new_field': 'value'});
      done();
    });
  });
  it('basic with required `false`', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field.field3',
        required: false,
      },
    }).then((result) => {
      expect(result).to.an('object').and.be.empty;
      done();
    });
  });
  it('basic with defaultValue', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field.field3',
        defaultValue: 'default_value',
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 'default_value'});
      done();
    });
  });
  it('basic with defaultValue and required `false`', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field.field3',
        defaultValue: 'default_value',
        required: false,
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 'default_value'});
      done();
    });
  });
  it('basic with nested 1/2', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field2',
        nested: {
          'nested_field': {
            path: 'field3',
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': {'nested_field': 'value'}});
      done();
    });
  });
  it('basic with nested 2/2', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
          field4: 'value4',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field2',
        nested: {
          'nested_field1': {
            path: 'field3',
          },
          'nested_field2': {
            path: 'field4',
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql({
        'new_field': {
          'nested_field1': 'value',
          'nested_field2': 'value4',
        },
      });
      done();
    });
  });
  it('basic with nested and key word `$root` 1/2', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field2',
        nested: {
          'nested_field': {
            path: '$root.field1.field2.field3',
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': {'nested_field': 'value'}});
      done();
    });
  });
  it('basic with nested and key word `$root` 2/2', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
          field4: 'value4',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field2',
        nested: {
          'nested_field1': {
            path: 'field3',
          },
          'nested_field2': {
            path: '$root.field1.field2.field4',
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql({
        'new_field': {
          'nested_field1': 'value',
          'nested_field2': 'value4',
        },
      });
      done();
    });
  });
  it('basic with nested and required `false` 1/2', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
          field4: 'value4',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field2',
        nested: {
          'nested_field1': {
            path: 'field',
            required: false,
          },
          'nested_field2': {
            path: 'field4',
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql({
        'new_field': {
          'nested_field2': 'value4',
        },
      });
      done();
    }).catch((err) => {done(err);});
  });
  it('basic with nested and required `false` 2/2', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
          field4: 'value4',
        },
      },
    }, {
      'new_field1': {
        path: 'field1.field2',
        required: false,
        nested: {
          'nested_field': {
            path: 'field3',
            required: true,
          },
        },
      },
      'new_field2': {
        path: 'field1.field2',
        required: false,
        nested: {
          'nested_field': {
            path: 'field',
            required: false,
          },
        },
      },
      'new_field3': {
        path: 'field1.field2',
        required: true,
        nested: {
          'nested_field': {
            path: 'field4',
            required: false,
          },
        },
      },
      'new_field4': {
        path: 'field1.field2',
        required: true,
        nested: {
          'nested_field': {
            path: 'field',
            required: false,
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql({
        'new_field1': {
          'nested_field': 'value',
        },
        'new_field3': {
          'nested_field': 'value4',
        },
      });
      done();
    }).catch((err) => {done(err);});
  });
  it('basic with nested and key word `$item` 1/2', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field2',
        nested: {
          'nested_field': {
            path: '$item.field3',
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': {'nested_field': 'value'}});
      done();
    });
  });
  it('basic with nested and key word `$item` 2/2', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
          field4: 'value4',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field2',
        nested: {
          'nested_field1': {
            path: 'field3',
          },
          'nested_field2': {
            path: '$item.field4',
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql({
        'new_field': {
          'nested_field1': 'value',
          'nested_field2': 'value4',
        },
      });
      done();
    });
  });
  it('basic with nested and key word `$empty`', (done) => {
    fct({
      field1: {
        field2: {
          field3: 0
        },
        field4: {
          field5: ['value1', 'value2'],
        },
      },
    }, {
      'new_field1': {
        path: 'field1',
        nested: {
          'new_field2': {
            path: '$empty',
            nested: {
              new_field3: {
                path: 'field2.field3'
              },
              new_field4: {
                path: 'field4.field5',
              },
            },
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql({
        new_field1: {
          new_field2: {
            new_field3: 0,
            new_field4: ['value1', 'value2'],
          },
        },
      });
      done();
    });
  });
  it('basic with syntactic sugar nested 1/2', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field2',
        nested: {
          'nested_field': 'field3',
        },
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': {'nested_field': 'value'}});
      done();
    });
  });
  it('basic with syntactic sugar nested 2/2', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
          field4: 'value4',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field2',
        nested: {
          'nested_field1': 'field3',
          'nested_field2': 'field4',
        },
      },
    }).then((result) => {
      expect(result).to.eql({
        'new_field': {
          'nested_field1': 'value',
          'nested_field2': 'value4',
        },
      });
      done();
    });
  });
  it('basic with formatting', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field2.field3',
        formatting: (value) => {return value + '_formatted';},
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 'value_formatted'});
      done();
    });
  });
  it('basic with formatting and key word `$root`', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: '$root.field1.field2.field3',
        formatting: (value) => {return value + '_formatted';},
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 'value_formatted'});
      done();
    });
  });
  it('basic with formatting and key word `$item`', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: 'field1.$item.field2.field3',
        formatting: (value) => {return value + '_formatted';},
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 'value_formatted'});
      done();
    });
  });
  it('basic with formatting and required `false` 1/2', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field.field3',
        required: false,
        formatting: (value) => {return _.isUndefined(value) ? 'not_formatted' : (value + '_formatted');},
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 'not_formatted'});
      done();
    });
  });
  it('basic with formatting and required `false` 2/2', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field.field3',
        required: false,
        formatting: (value) => {return _.isUndefined(value) ? value : (value + '_formatted');},
      },
    }).then((result) => {
      expect(result).to.be.an('object').and.be.empty;
      done();
    });
  });
  it('basic with formatting and defaultValue 1/2', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field.field3',
        defaultValue: 'default_value',
        formatting: (value) => {return _.isUndefined(value) ? 'not_formatted' : (value + '_formatted');},
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 'default_value_formatted'});
      done();
    });
  });
  it('basic with formatting and defaultValue 2/2', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field.field3',
        defaultValue: 'default_value',
        formatting: (value) => {return _.isUndefined(value) ? value : (value + '_formatted');},
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 'default_value_formatted'});
      done();
    });
  });
  it('basic with formatting and defaultValue and required `false` 1/2', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field.field3',
        defaultValue: 'default_value',
        required: false,
        formatting: (value) => {return _.isUndefined(value) ? 'not_formatted' : (value + '_formatted');},
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 'default_value_formatted'});
      done();
    });
  });
  it('basic with formatting and defaultValue and required `false` 2/2', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
        },
      },
    }, {
      'new_field': {
        path: 'field1.field.field3',
        defaultValue: 'default_value',
        required: false,
        formatting: (value) => {return _.isUndefined(value) ? value : (value + '_formatted');},
      },
    }).then((result) => {
      expect(result).to.eql({'new_field': 'default_value_formatted'});
      done();
    });
  });
  it('basic with formatting and nested and required `false`', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
          field4: 'value4',
        },
      },
    }, {
      'new_field1': {
        path: 'field1.field2',
        required: false,
        nested: {
          'nested_field': {
            path: 'field3',
            required: true,
            formatting: (value) => {return _.isUndefined(value) ? value : (value + '_formatted');},
          },
        },
      },
      'new_field2': {
        path: 'field1.field2',
        required: false,
        nested: {
          'nested_field': {
            path: 'field',
            required: false,
          },
        },
        formatting: (value) => {return _.isUndefined(value) ? 'not_formatted' : (value + '_formatted');},
      },
      'new_field3': {
        path: 'field1.field2',
        required: true,
        nested: {
          'nested_field': {
            path: 'field4',
            required: false,
            formatting: (value) => {return _.isUndefined(value) ? value : (value + '_formatted');},
          },
        },
      },
      'new_field4': {
        path: 'field1.field2',
        required: true,
        nested: {
          'nested_field': {
            path: 'field',
            required: false,
            formatting: (value) => {return _.isUndefined(value) ? 'not_formatted' : (value + '_formatted');},
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql({
        'new_field1': {
          'nested_field': 'value_formatted',
        },
        'new_field2': 'not_formatted',
        'new_field3': {
          'nested_field': 'value4_formatted',
        },
        'new_field4': {
          'nested_field': 'not_formatted',
        },
      });
      done();
    }).catch((err) => {done(err);});
  });
  it('basic with formatting and nested and defaultValue', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
          field4: 'value4',
        },
      },
    }, {
      'new_field1': {
        path: 'field1.field2',
        defaultValue: 'default_value1',
        nested: {
          'nested_field': {
            path: 'field3',
            formatting: (value) => {return _.isUndefined(value) ? value : (value + '_formatted');},
          },
        },
      },
      'new_field2': {
        path: 'field1.field2',
        defaultValue: 'default_value2',
        nested: {
          'nested_field': {
            path: 'field',
            defaultValue: 'default_value3',
          },
        },
        formatting: (value) => {return _.isUndefined(value) ? 'not_formatted' : (value + '_formatted');},
      },
      'new_field3': {
        path: 'field1.field2',
        nested: {
          'nested_field': {
            path: 'field4',
            defaultValue: 'default_value4',
            formatting: (value) => {return _.isUndefined(value) ? value : (value + '_formatted');},
          },
        },
      },
      'new_field4': {
        path: 'field1.field2',
        nested: {
          'nested_field': {
            path: 'field',
            defaultValue: 'default_value5',
            formatting: (value) => {return _.isUndefined(value) ? 'not_formatted' : (value + '_formatted');},
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql({
        'new_field1': {
          'nested_field': 'value_formatted',
        },
        'new_field2': {
          nested_field: 'default_value3',
        },
        'new_field3': {
          'nested_field': 'value4_formatted',
        },
        'new_field4': {
          'nested_field': 'default_value5_formatted',
        },
      });
      done();
    }).catch((err) => {done(err);});
  });
  it('basic with formatting and nested and defaultValue and required `false`', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
          field4: 'value4',
        },
      },
    }, {
      'new_field1': {
        path: 'field1.field2',
        defaultValue: 'default_value1',
        required: false,
        nested: {
          'nested_field': {
            path: 'field3',
            required: true,
            formatting: (value) => {return _.isUndefined(value) ? value : (value + '_formatted');},
          },
        },
      },
      'new_field2': {
        path: 'field1.field2',
        defaultValue: 'default_value2',
        required: false,
        nested: {
          'nested_field': {
            path: 'field',
            defaultValue: 'default_value3',
            required: false,
          },
        },
        formatting: (value) => {return _.isUndefined(value) ? 'not_formatted' : (value + '_formatted');},
      },
      'new_field3': {
        path: 'field1.field2',
        required: true,
        nested: {
          'nested_field': {
            path: 'field4',
            defaultValue: 'default_value4',
            required: false,
            formatting: (value) => {return _.isUndefined(value) ? value : (value + '_formatted');},
          },
        },
      },
      'new_field4': {
        path: 'field1.field2',
        required: true,
        nested: {
          'nested_field': {
            path: 'field',
            defaultValue: 'default_value5',
            required: false,
            formatting: (value) => {return _.isUndefined(value) ? 'not_formatted' : (value + '_formatted');},
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql({
        'new_field1': {
          'nested_field': 'value_formatted',
        },
        'new_field2': {
          nested_field: 'default_value3',
        },
        'new_field3': {
          'nested_field': 'value4_formatted',
        },
        'new_field4': {
          'nested_field': 'default_value5_formatted',
        },
      });
      done();
    }).catch((err) => {done(err);});
  });
  it('basic with formatting and nested Promise', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value',
          field4: 'value4',
        },
      },
    }, {
      'new_field1': {
        path: 'field1.field2',
        nested: {
          'nested_field': {
            path: 'field3',
            required: true,
            formatting: (value) => {return Promise.resolve(_.isUndefined(value) ? value : (value + '_formatted'));},
          },
        },
      },
      'new_field2': {
        path: 'field1.field2',
        required: true,
        nested: {
          'nested_field': {
            path: 'field4',
            required: false,
            formatting: (value) => {return Promise.resolve(_.isUndefined(value) ? value : (value + '_formatted'));},
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql({
        'new_field1': {
          'nested_field': 'value_formatted',
        },
        'new_field2': {
          'nested_field': 'value4_formatted',
        },
      });
      done();
    }).catch((err) => {done(err);});
  });
  it('basic with formatting that return object with nested Promise', (done) => {
    fct({
      field1: {
        field2: {
          field3: 'value3',
          field4: 'value4',
        },
      },
    }, {
      'new_field1': {
        path: 'field1.field2',
        nested: {
          'nested_field': {
            path: 'field3',
            required: true,
            formatting: (value) => {
              return Promise.props({
                'label': value,
                'promise': Promise.resolve(value + '_formatted'),
              });
            },
          },
        },
      },
      'new_field2': {
        path: 'field1.field2',
        required: true,
        nested: {
          'nested_field': {
            path: 'field4',
            required: false,
            formatting: (value) => {
              return Promise.props({
                'label': value,
                'promise': Promise.resolve(value + '_formatted'),
              });
            },
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql({
        'new_field1': {
          'nested_field': {
            label: 'value3',
            promise: 'value3_formatted',
          }
        },
        'new_field2': {
          'nested_field': {
            label: 'value4',
            promise: 'value4_formatted',
          },
        },
      });
      done();
    }).catch((err) => {done(err);});
  });
  it('array', (done) => {
    fct([{
      field: 'value1',
    }, {
      field: 'value2',
    }, {
      field: 'value3',
    },
    ], {
      'new_field': {
        path: 'field',
      },
    }).then((result) => {
      expect(result).to.eql([{'new_field': 'value1'}, {'new_field': 'value2'}, {'new_field': 'value3'}]);
      done();
    });
  });
  it('array with key word `$item`', (done) => {
    fct([{
      field: 'value1',
    }, {
      field: 'value2',
    }, {
      field: 'value3',
    },
    ], {
      'new_field': {
        path: '$item.field',
      },
    }).then((result) => {
      expect(result).to.eql([{'new_field': 'value1'}, {'new_field': 'value2'}, {'new_field': 'value3'}]);
      done();
    });
  });
  it('array with required `false`', (done) => {
    fct([{
      field: 'value1',
    }, {
      field1: 'value2',
    }, {
      field: 'value3',
    },
    ], {
      'new_field': {
        path: 'field',
        required: false,
      },
    }).then((result) => {
      expect(result).to.eql([{'new_field': 'value1'}, {'new_field': 'value3'}]);
      done();
    }).catch((err) => {done(err);});
  });
  it('array with defaultValue', (done) => {
    fct([{
      field: 'value1',
    }, {
      field1: 'value2',
    }, {
      field: 'value3',
    },
    ], {
      'new_field': {
        path: 'field',
        defaultValue: 'default_value',
      },
    }).then((result) => {
      expect(result).to.eql([{'new_field': 'value1'}, {'new_field': 'default_value'}, {'new_field': 'value3'}]);
      done();
    }).catch((err) => {done(err);});
  });
  it('array with defaultValue and required `false`', (done) => {
    fct([{
      field: 'value1',
    }, {
      field1: 'value2',
    }, {
      field: 'value3',
    },
    ], {
      'new_field': {
        path: 'field',
        defaultValue: 'default_value',
        required: false,
      },
    }).then((result) => {
      expect(result).to.eql([{'new_field': 'value1'}, {'new_field': 'default_value'}, {'new_field': 'value3'}]);
      done();
    }).catch((err) => {done(err);});
  });
  it('array using syntactic sugar', (done) => {
    fct([{
      field: 'value1',
    }, {
      field: 'value2',
    }, {
      field: 'value3',
    },
    ], {
      'new_field': 'field',
    }).then((result) => {
      expect(result).to.eql([{'new_field': 'value1'}, {'new_field': 'value2'}, {'new_field': 'value3'}]);
      done();
    });
  });
  it('array with nested', (done) => {
    fct([{
      field: {'nested_field': 'value1'},
    }, {
      field: {'nested_field': 'value2'},
    }, {
      field: {'nested_field': 'value3'},
    },
    ], {
      'new_field': {
        path: 'field',
        nested: {
          'new_nested_field': {
            path: 'nested_field',
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql([{'new_field': {'new_nested_field': 'value1'}}, {'new_field': {'new_nested_field': 'value2'}}, {'new_field': {'new_nested_field': 'value3'}}]);
      done();
    });
  });
  it('array with nested and key word `$item`', (done) => {
    fct({
      array: [{
        field1: 'value11',
        field2: 'value21',
        field3: 'value31',
      }, {
        field1: 'value12',
        field2: 'value22',
        field3: 'value32',
      }, {
        field1: 'value13',
        field2: 'value23',
        field3: 'value33',
      }],
    }, {
      'new_field': {
        path: 'array',
        nested: {
          'new_field1': {
            path: 'field1',
          },
          'new_field2': {
            path: '$item',
            nested: {
              'item1': 'field1',
              'item2': 'field2',
              'item3': 'field3',
            },
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql({
        new_field: [{
          new_field1: 'value11',
          new_field2: {
            item1: 'value11',
            item2: 'value21',
            item3: 'value31',
          },
        }, {
          new_field1: 'value12',
          new_field2: {
            item1: 'value12',
            item2: 'value22',
            item3: 'value32',
          },
        }, {
          new_field1: 'value13',
          new_field2: {
            item1: 'value13',
            item2: 'value23',
            item3: 'value33',
          },
        }]
      });
      done();
    });
  });
  it('array with nested and required `false`', (done) => {
    fct([{
      field: {'nested_field': 'value1'},
    }, {
      field: {'nested_field1': 'value2'},
    }, {
      field: {'nested_field': 'value3'},
    },
    ], {
      'new_field': {
        path: 'field',
        required: true,
        nested: {
          'new_nested_field': {
            path: 'nested_field',
            required: false,
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql([{'new_field': {'new_nested_field': 'value1'}}, {'new_field': {'new_nested_field': 'value3'}}]);
      done();
    });
  });
  it('array with nested using syntactic sugar', (done) => {
    fct([{
      field: {'nested_field': 'value1'},
    }, {
      field: {'nested_field': 'value2'},
    }, {
      field: {'nested_field': 'value3'},
    },
    ], {
      'new_field': {
        path: 'field',
        nested: {
          'new_nested_field': 'nested_field',
        },
      },
    }).then((result) => {
      expect(result).to.eql([{'new_field': {'new_nested_field': 'value1'}}, {'new_field': {'new_nested_field': 'value2'}}, {'new_field': {'new_nested_field': 'value3'}}]);
      done();
    });
  });
  it('array with formatting', (done) => {
    fct([{
      field: 'value1',
    }, {
      field: 'value2',
    }, {
      field: 'value3',
    },
    ], {
      'new_field': {
        path: 'field',
        formatting: (value, index) => (`${value}_formatted_${index}`),
      },
    }).then((result) => {
      expect(result).to.eql([{'new_field': 'value1_formatted_0'}, {'new_field': 'value2_formatted_1'}, {'new_field': 'value3_formatted_2'}]);
      done();
    }).catch((err) => {return done(err);});
  });
  it('array with formatting and key word `$item` 1/2', (done) => {
    fct({
      array: [{
        field1: 'value11',
        field2: 'value21',
        field3: 'value31',
      }, {
        field1: 'value12',
        field2: 'value22',
        field3: 'value32',
      }, {
        field1: 'value13',
        field2: 'value23',
        field3: 'value33',
      }],
    }, {
      'new_field': {
        path: 'array',
        nested: {
          'new_field1': {
            path: 'field1',
          },
          'new_field2': {
            path: '$item',
            formatting: (value, index) => (`${value.field2}/${value.field3}/${index}`),
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql({
        new_field: [{
          new_field1: 'value11',
          new_field2: 'value21/value31/0'
        }, {
          new_field1: 'value12',
          new_field2: 'value22/value32/1'
        }, {
          new_field1: 'value13',
          new_field2: 'value23/value33/2'
        }]
      });
      done();
    });
  });
  it('array with formatting and key word `$item` 2/2', (done) => {
    fct({  
      hits: {
        total: 1,
        hits: [{
          _index: 'some_index',
          _type: 'some_type',
          _id: '123456',
          _score: 1,
          _source: {
            id: 123456
          },
        }],
      },
    }, {
      hits: {
        path: 'hits.hits',
        nested: {
          id: '_source.id',
          type: {
            path: '$item',
            formatting: (value, index) => (`${value._index}/${value._type}/${index}`),
          },
        },
      },
    }).then((result) => {
      expect(result).to.eql({ hits: [{ id: 123456, type: 'some_index/some_type/0' }] });
      done();
    });
  });
  it('complex test with key word `$root`', (done) => {
    fct({
        'content': {
          'result': [
            {
              'courseStatisticsDto': {
                'times': 3,
                'persons': 1,
                'courseCode': '',
              },
              'courseAddressDto': {},
              'endDate': 1460590552000,
              'startDate': 1460590552000,
              'name': 'Example Course',
            },
          ],
          'type': 'offline',
        },
      }, {
      data: {
        path: 'content.result',
        nested: {
          name: 'name',
          code: 'courseStatisticsDto.courseCode',
          type: '$root.content.type',
        },
      },
    }).then((result) => {
      expect(result).to.eql({
        'data': [{
          'name': 'Example Course',
          'code': '',
          'type': 'offline',
        }],
      });
      done();
    });
  });
}

describe('jsonMapper', () => {
  describe('getSettings', () => {
    it('should be a function', () => {
      expect(getSettings).to.be.a('function');
    });
    it('should not validate property `invalid`', (done) => {
      try {
        getSettings({invalid: 'path'});
        done(new Error('Not suppose to succes'));
      }
      catch (err) {
        expect(err).to.be.an.instanceof(Error)
          .and.have.property('message', 'Invalid property invalid');
        done();
      }
    });
    describe('Path', () => {
      it('should throw `Path can\'t null` Error 1/2', (done) => {
        try {
          getSettings(undefined);
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Path can\'t null');
          done();
        }
      });
      it('should throw `Path can\'t null` Error 2/2', (done) => {
        try {
          getSettings({});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Path can\'t null');
          done();
        }
      });
      it('should validate path keyword case 1/3', () => {
        expect(getSettings({path: 'path'})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate path keyword case 2/3', () => {
        expect(getSettings({Path: 'path'})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate path keyword case 3/3', () => {
        expect(getSettings({PATH: 'path'})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate path using syntactic sugar', () => {
        expect(getSettings('path')).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate path has `.` character', () => {
        expect(getSettings({PATH: 'path1.path2.path3'})).to.eql({
          formatting: null,
          nested: null,
          path: ['path1', 'path2', 'path3'],
          type: null,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate path has `.` character using syntactic sugar', () => {
        expect(getSettings('path1.path2.path3')).to.eql({
          formatting: null,
          nested: null,
          path: ['path1', 'path2', 'path3'],
          type: null,
          defaultValue: null,
          required: true,
        });
      });
      it('should not validate invalid path type 1/3', (done) => {
        try {
          getSettings({path: true});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Invalid path: path is not a String');
          done();
        }
      });
      it('should not validate invalid path type 2/3', (done) => {
        try {
          getSettings({path: []});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Invalid path: path is not a String');
          done();
        }
      });
      it('should not validate invalid path type 3/3', (done) => {
        try {
          getSettings({path: {}});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Invalid path: path is not a String');
          done();
        }
      });
    });
    describe('Type', () => {
      it('should validate type keyword case 1/3', () => {
        expect(getSettings({path: 'path', type: String})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: String,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate type keyword case 2/3', () => {
        expect(getSettings({path: 'path', Type: String})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: String,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate type keyword case 3/3', () => {
        expect(getSettings({path: 'path', TYPE: String})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: String,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate type `Boolean`', () => {
        expect(getSettings({path: 'path', type: Boolean})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: Boolean,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate type `String`', () => {
        expect(getSettings({path: 'path', type: String})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: String,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate type `Number`', () => {
        expect(getSettings({path: 'path', type: Number})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: Number,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate type `Date`', () => {
        expect(getSettings({path: 'path', type: Date})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: Date,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate type `Array`', () => {
        expect(getSettings({path: 'path', type: Array})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: Array,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate type `Object`', () => {
        expect(getSettings({path: 'path', type: Object})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: Object,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate type `ObjectId`', () => {
        expect(getSettings({path: 'path', type: ObjectId})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: ObjectId,
          defaultValue: null,
          required: true,
        });
      });
      it('should not validate a function', (done) => {
        try {
          getSettings({path: 'path', type: () => {}});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Invalid type function');
          done();
        }
      });
      it('should not validate String instance', (done) => {
        try {
          getSettings({path: 'path', type: 'string'});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Invalid type string');
          done();
        }
      });
      it('should not validate Number instance', (done) => {
        try {
          getSettings({path: 'path', type: 42.21});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Invalid type number');
          done();
        }
      });
      it('should not validate Boolean instance 1/2', (done) => {
        try {
          getSettings({path: 'path', type: true});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Invalid type boolean');
          done();
        }
      });
      it('should not validate Boolean instance 2/2', (done) => {
        try {
          getSettings({path: 'path', type: false});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Invalid type boolean');
          done();
        }
      });
      it('should not validate Date instance', (done) => {
        try {
          getSettings({path: 'path', type: new Date()});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Invalid type object');
          done();
        }
      });
      it('should not validate Array instance', (done) => {
        try {
          getSettings({path: 'path', type: []});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Invalid type object');
          done();
        }
      });
      it('should not validate Object instance', (done) => {
        try {
          getSettings({path: 'path', type: new Error()});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Invalid type object');
          done();
        }
      });
    });
    describe('Formatting', () => {
      it('should not validate invalid formatting type 1/3', (done) => {
        try {
          getSettings({path: 'path', formatting: String});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Error formatting is not a function');
          done();
        }
      });
      it('should not validate invalid formatting type 1/3', (done) => {
        try {
          getSettings({path: 'path', formatting: 'String'});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Error formatting is not a function');
          done();
        }
      });
      it('should not validate invalid formatting type 2/3', (done) => {
        try {
          getSettings({path: 'path', formatting: 42.21});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Error formatting is not a function');
          done();
        }
      });
      it('should not validate invalid formatting type 3/3', (done) => {
        try {
          getSettings({path: 'path', formatting: false});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Error formatting is not a function');
          done();
        }
      });
      it('should validate formatting keyword case 1/3', () => {
        const ret = getSettings({path: 'path', formatting: () => {}});
        expect(ret).to.be.an('object');
        expect((_.keys(ret)).length).to.eql(6);
        expect(typeof ret.formatting).to.eql('function');
        expect(ret.nested).to.eql(null);
        expect(ret.path).to.eql(['path']);
        expect(ret.type).to.eql(null);
        expect(ret.defaultValue).to.eql(null);
        expect(ret.required).to.eql(true);
      });
      it('should validate formatting keyword case 2/3', () => {
        const ret = getSettings({path: 'path', Formatting: () => {}});
        expect(ret).to.be.an('object');
        expect((_.keys(ret)).length).to.eql(6);
        expect(typeof ret.formatting).to.eql('function');
        expect(ret.nested).to.eql(null);
        expect(ret.path).to.eql(['path']);
        expect(ret.type).to.eql(null);
        expect(ret.defaultValue).to.eql(null);
        expect(ret.required).to.eql(true);
      });
      it('should validate formatting keyword case 3/3', () => {
        const ret = getSettings({path: 'path', FORMATTING: () => {}});
        expect(ret).to.be.an('object');
        expect((_.keys(ret)).length).to.eql(6);
        expect(typeof ret.formatting).to.eql('function');
        expect(ret.nested).to.eql(null);
        expect(ret.path).to.eql(['path']);
        expect(ret.type).to.eql(null);
        expect(ret.defaultValue).to.eql(null);
        expect(ret.required).to.eql(true);
      });
    });
    describe('Nested', () => {
      it('should validate nested keyword case 1/3', () => {
        expect(getSettings({path: 'path', nested: {}})).to.eql({
          formatting: null,
          nested: {},
          path: ['path'],
          type: null,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate nested keyword case 2/3', () => {
        expect(getSettings({path: 'path', Nested: {}})).to.eql({
          formatting: null,
          nested: {},
          path: ['path'],
          type: null,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate nested keyword case 3/3', () => {
        expect(getSettings({path: 'path', NESTED: {}})).to.eql({
          formatting: null,
          nested: {},
          path: ['path'],
          type: null,
          defaultValue: null,
          required: true,
        });
      });
      it('should not validate nested when eql `String`', (done) => {
        try {
          getSettings({path: 'path', nested: String});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error);
          done();
        }
      });
      it('should not validate nested when is Object instance', (done) => {
        try {
          getSettings({path: 'path', nested: new Error()});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error);
          done();
        }
      });
      it('should not validate nested when is String instance', (done) => {
        try {
          getSettings({path: 'path', nested: 'String'});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Error nested is not a object');
          done();
        }
      });
      it('should not validate nested when is Number instance', (done) => {
        try {
          getSettings({path: 'path', nested: 42.21});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Error nested is not a object');
          done();
        }
      });
      it('should not validate nested when type is `String`', (done) => {
        try {
          getSettings({path: 'path', nested: {}, type: String});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Type must be an Array or an Object when nested property is filled');
          done();
        }
      });
      it('should not validate nested when type is `Number`', (done) => {
        try {
          getSettings({path: 'path', nested: {}, type: Number});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Type must be an Array or an Object when nested property is filled');
          done();
        }
      });
      it('should not validate nested when type is `Boolean`', (done) => {
        try {
          getSettings({path: 'path', nested: {}, type: Boolean});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Type must be an Array or an Object when nested property is filled');
          done();
        }
      });
      it('should not validate nested when type is `ObjectId`', (done) => {
        try {
          getSettings({path: 'path', nested: {}, type: ObjectId});
          done(new Error('Not suppose to succes'));
        }
        catch (err) {
          expect(err).to.be.an.instanceof(Error)
            .and.have.property('message', 'Type must be an Array or an Object when nested property is filled');
          done();
        }
      });
      it('should validate nested when type is `Object`', () => {
        expect(getSettings({path: 'path', nested: {}, type: Object})).to.eql({
          formatting: null,
          nested: {},
          path: ['path'],
          type: Object,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate nested when type is `Array`', () => {
        expect(getSettings({path: 'path', nested: {}, type: Array})).to.eql({
          formatting: null,
          nested: {},
          path: ['path'],
          type: Array,
          defaultValue: null,
          required: true,
        });
      });
    });
    describe('DefaultValue', () => {
      it('should validate defaultValue keyword case 1/3', () => {
        expect(getSettings({path: 'path', defaultvalue: 'value'})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
          defaultValue: 'value',
          required: true,
        });
      });
      it('should validate required keyword case 2/3', () => {
        expect(getSettings({path: 'path', DefaultValue: 'value'})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
          defaultValue: 'value',
          required: true,
        });
      });
      it('should validate required keyword case 3/3', () => {
        expect(getSettings({path: 'path', DEFAULTVALUE: 'value'})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
          defaultValue: 'value',
          required: true,
        });
      });
      it('should validate when no defaultValue', () => {
        expect(getSettings({path: 'path'})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate when defaultValue is `null`', () => {
        expect(getSettings({path: 'path'})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate when defaultValue is `undefined`', () => {
        expect(getSettings({path: 'path'})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
          defaultValue: null,
          required: true,
        });
      });
    });
    describe('Required', () => {
      it('should validate required keyword case 1/3', () => {
        expect(getSettings({path: 'path', required: true})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate required keyword case 2/3', () => {
        expect(getSettings({path: 'path', Required: true})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate required keyword case 3/3', () => {
        expect(getSettings({path: 'path', REQUIRED: true})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate required `true`', () => {
        expect(getSettings({path: 'path'})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate required `true`', () => {
        expect(getSettings({path: 'path', required: true})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate required `true` using syntactic sugar', () => {
        expect(getSettings('path')).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
          defaultValue: null,
          required: true,
        });
      });
      it('should validate required `false`', () => {
        expect(getSettings({path: 'path', required: false})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
          defaultValue: null,
          required: false,
        });
      });
    });
  });
  describe('getValue', () => {
    it('should be a function', () => {
      expect(getValue).to.be.a('function');
    });
    it('should return `undefined`', () => {
      expect(getValue()).to.eql(undefined);
      expect(getValue(undefined)).to.eql(undefined);
      expect(getValue(true)).to.eql(undefined);
      expect(getValue('string')).to.eql(undefined);
      expect(getValue(41.21)).to.eql(undefined);
      expect(getValue({})).to.eql(undefined);
      expect(getValue([])).to.eql(undefined);
      expect(getValue({}, undefined)).to.eql(undefined);
      expect(getValue({}, true)).to.eql(undefined);
      expect(getValue({}, 'string')).to.eql(undefined);
      expect(getValue({}, 41.21)).to.eql(undefined);
      expect(getValue(new Model(), undefined)).to.eql(undefined);
      expect(getValue(new Model(), true)).to.eql(undefined);
      expect(getValue(new Model(), 'string')).to.eql(undefined);
      expect(getValue(new Model(), 41.21)).to.eql(undefined);
    });
    it('basic 1/2', () => {
      expect(getValue({
        field: 'value',
      }, {
        path: ['field'],
      })).to.eql('value');
    });
    it('basic 2/2', () => {
      expect(getValue({
        field1: {
          field2: {
            field3: 'value',
          },
        },
      }, {
        path: ['field1', 'field2', 'field3'],
      })).to.eql('value');
    });
    it('[mongoose] basic 1/2', () => {
      expect(getValue(new Model({
        field1: 'value1',
      }), {
        path: ['field1'],
      })).to.eql('value1');
    });
    it('[mongoose] basic 2/3', () => {
      expect(getValue(new Model({
        field2: 'value2',
      }), {
        path: ['field2'],
      })).to.eql('value2');
    });
    it('[mongoose] basic 3/3', () => {
      expect(getValue(new Model({
        field3: 'value3',
      }), {
        path: ['field3'],
      })).to.eql('value3');
    });
    it('[mongoose] basic nested', () => {
      expect(getValue(new Model({
        nested_field1: {
          nested_field2: {
            nested_field3: 'value',
          },
        },
      }), {
        path: ['nested_field1', 'nested_field2', 'nested_field3'],
      })).to.eql('value');
    });
    it('basic with required `false` 1/2', () => {
      expect(getValue({
        field: 'value',
      }, {
        path: ['field1'],
        required: false,
      })).to.eql(undefined);
    });
    it('basic with required `false` 2/2', () => {
      expect(getValue({
        field1: {
          field2: {
            field3: 'value',
          },
        },
      }, {
        path: ['field1', 'field', 'field3'],
        required: false,
      })).to.eql(undefined);
    });
    it('basic with defaultValue 1/2', () => {
      expect(getValue({
        field: 'value',
      }, {
        path: ['field1'],
        defaultValue: 'default_value',
      })).to.eql('default_value');
    });
    it('basic with defaultValue 2/2', () => {
      expect(getValue({
        field1: {
          field2: {
            field3: 'value',
          },
        },
      }, {
        path: ['field1', 'field', 'field3'],
        defaultValue: 'default_value',
      })).to.eql('default_value');
    });
    it('basic with defaultValue and required `false` 1/2', () => {
      expect(getValue({
        field: 'value',
      }, {
        path: ['field1'],
        defaultValue: 'default_value',
        required: false,
      })).to.eql('default_value');
    });
    it('basic with defaultValue and required `false` 2/2', () => {
      expect(getValue({
        field1: {
          field2: {
            field3: 'value',
          },
        },
      }, {
        path: ['field1', 'field', 'field3'],
        defaultValue: 'default_value',
        required: false,
      })).to.eql('default_value');
    });
    it('basic with defaultValue Object', () => {
      expect(getValue({
        field1: {
          field2: {
            field3: 'value',
          },
        },
      }, {
        path: ['field1', 'field', 'field3'],
        defaultValue: { field: 'default_value' },
        required: false,
      })).to.eql({ field: 'default_value' });
    });
    it('[mongoose] basic with required `false` 1/2', () => {
      expect(getValue(new Model({
        field1: 'value',
      }), {
        path: ['field'],
        required: false,
      })).to.eql(undefined);
    });
    it('[mongoose] basic with required `false` 2/2', () => {
      expect(getValue(new Model({
        nested_field1: {
          nested_field2: {
            nested_field3: 'value',
          },
        },
      }), {
        path: ['nested_field1', 'field', 'nested_field3'],
        required: false,
      })).to.eql(undefined);
    });
    it('array 1/3', (done) => {
      Promise.all(getValue([{
        field: 'value1',
      }, {
        field: 'value2',
      }, {
        field: 'value3',
      },
      ], {
        path: ['field'],
      })).then((result) => {
        expect(result).to.eql(['value1', 'value2', 'value3']);
        done();
      });
    });
    it('array 2/3', (done) => {
      Promise.all(getValue([{
        field: ['value1_1', 'value1_2', 'value1_3'],
      }, {
        field: ['value2'],
      }, {
        field: ['value3_1', 'value3_2'],
      },
      ], {
        path: ['field'],
      })).then((result) => {
        expect(result).to.eql([
          ['value1_1', 'value1_2', 'value1_3'],
          ['value2'],
          ['value3_1', 'value3_2'],
        ]);
        done();
      });
    });
    it('array 3/3', (done) => {
      Promise.all(getValue([{
        field: ['value1_1', 'value1_2', 'value1_3'],
      }, {
        field: 'value2',
      }, {
        field: undefined,
      },
      ], {
        path: ['field'],
      })).then((result) => {
        expect(result).to.eql([
          ['value1_1', 'value1_2', 'value1_3'],
          'value2',
          undefined,
        ]);
        done();
      });
    });
    it('[mongoose] array 1/4', (done) => {
      Promise.all(getValue(new Model({
        array1: [{
          field: 'value1',
        }, {
          field: 'value2',
        }, {
          field: 'value3',
        },
        ],
      }), {
        path: ['array1', 'field'],
      })).then((result) => {
        expect(result).to.eql(['value1', 'value2', 'value3']);
        done();
      });
    });
    it('[mongoose] array 2/4', (done) => {
      Promise.all(getValue(new Model({
        array2: [{
          field: ['value1_1', 'value1_2', 'value1_3'],
        }, {
          field: ['value2'],
        }, {
          field: ['value3_1', 'value3_2'],
        },
        ],
      }), {
        path: ['array2', 'field'],
      })).then((result) => {
        expect(result).to.eql([
          ['value1_1', 'value1_2', 'value1_3'],
          ['value2'],
          ['value3_1', 'value3_2'],
        ]);
        done();
      });
    });
    it('[mongoose] array 3/4', (done) => {
      Promise.all(getValue(new Model({
        array2: [{
          field: ['value1_1', 'value1_2', 'value1_3'],
        }, {
          field: 'value2',
        }, {
          field: undefined,
        },
        ],
      }), {
        path: ['array2', 'field'],
      })).then((result) => {
        expect(result).to.eql([
          ['value1_1', 'value1_2', 'value1_3'],
          ['value2'],
          [],
        ]);
        done();
      });
    });
    it('[mongoose] array 4/4', (done) => {
      Promise.all(getValue(new Model({
        array3: [{
          field: ['value1_1', 'value1_2', 'value1_3'],
        }, {
          field: 'value2',
        }, {
          field: undefined,
        },
        ],
      }), {
        path: ['array3', 'field'],
      })).then((result) => {
        expect(result).to.eql([
          ['value1_1', 'value1_2', 'value1_3'],
          ['value2'],
          [],
        ]);
        done();
      });
    });
    it('array with required `false` 1/3', (done) => {
      Promise.all(getValue([{
        field: 'value1',
      }, {
        field1: 'value2',
      }, {
        field: 'value3',
      },
      ], {
        path: ['field'],
        required: false,
      })).then((result) => {
        expect(result).to.eql(['value1', undefined, 'value3']);
        done();
      }).catch((err) => {done(err);});
    });
    it('array with required `false` 2/3', (done) => {
      Promise.all(getValue([{
        field: ['value1_1', 'value1_2', 'value1_3'],
      }, {
        field: ['value2'],
      }, {
        field1: ['value3_1', 'value3_2'],
      },
      ], {
        path: ['field'],
        required: false,
      })).then((result) => {
        expect(result).to.eql([
          ['value1_1', 'value1_2', 'value1_3'],
          ['value2'],
          undefined,
        ]);
        done();
      }).catch((err) => {done(err);});
    });
    it('array with required `false` 3/3', (done) => {
      Promise.all(getValue([{
        field1: ['value1_1', 'value1_2', 'value1_3'],
      }, {
        field: 'value2',
      }, {
        field: undefined,
      },
      ], {
        path: ['field'],
        required: false,
      })).then((result) => {
        expect(result).to.eql([
          undefined,
          'value2',
          undefined,
        ]);
        done();
      }).catch((err) => {done(err);});
    });
    it('[mongoose] array with required `false` 1/3', (done) => {
      Promise.all(getValue(new Model({
        array1: [{
          field: 'value1',
        }, {
          field1: 'value2',
        }, {
          field: 'value3',
        },
        ],
      }), {
        path: ['array1', 'field'],
        required: false,
      })).then((result) => {
        expect(result).to.eql(['value1', undefined, 'value3']);
        done();
      }).catch((err) => {done(err);});
    });
    it('[mongoose] array with required `false` 2/3', (done) => {
      Promise.all(getValue(new Model({
        array2: [{
          field: ['value1_1', 'value1_2', 'value1_3'],
        }, {
          field: ['value2'],
        }, {
          field1: ['value3_1', 'value3_2'],
        },
        ],
      }), {
        path: ['array2', 'field'],
        required: false,
      })).then((result) => {
        expect(result).to.eql([
          ['value1_1', 'value1_2', 'value1_3'],
          ['value2'],
          [],
        ]);
        done();
      }).catch((err) => {done(err);});
    });
    it('[mongoose] array with required `false` 3/3', (done) => {
      Promise.all(getValue(new Model({
        array3: [{
          field1: ['value1_1', 'value1_2', 'value1_3'],
        }, {
          field: 'value2',
        }, {
          field: undefined,
        },
        ],
      }), {
        path: ['array3', 'field'],
        required: false,
      })).then((result) => {
        expect(result).to.eql([
          [],
          ['value2'],
          [],
        ]);
        done();
      }).catch((err) => {done(err);});
    });
    it('should throw `Invalid path` Error 1/2', (done) => {
      try {
        getValue({
          field1: {
            field2: {
              field3: 'value',
            },
          },
        }, {
          path: ['field1', 'field4', 'field3'],
        });
        done(new Error('Not suppose to succes'));
      }
      catch (err) {
        expect(err).to.be.an.instanceof(Error)
          .and.have.property('message', 'Invalid path field1.field4.field3 (field4)');
        done();
      }
    });
    it('should throw `Invalid path` Error 2/2', (done) => {
      try {
        getValue([{
          field: 'value1',
        }, {
          field1: 'value2',
        }, {
          field: 'value3',
        },
        ], {
          path: ['field'],
        });
        done(new Error('Not suppose to succes'));
      }
      catch (err) {
        expect(err).to.be.an.instanceof(Error)
          .and.have.property('message', 'Invalid path field (field)');
        done();
      }
    });
    it('[mongoose] should throw `Invalid path` Error 1/2', (done) => {
      try {
        getValue(new Model({
          nested_field1: {
            nested_field2: {
              nested_field3: 'value',
            },
          },
        }), {
          path: ['nested_field1', 'nested_field4', 'nested_field3'],
        });
        done(new Error('Not suppose to succes'));
      }
      catch (err) {
        expect(err).to.be.an.instanceof(Error)
          .and.have.property('message', 'Invalid path nested_field1.nested_field4.nested_field3 (nested_field4)');
        done();
      }
    });
    it('[mongoose] should throw `Invalid path` Error 2/2', (done) => {
      try {
        getValue(new Model({
          array1: [{
            field: 'value1',
          }, {
            field: 'value2',
          }, {
            field: 'value3',
          },
          ],
        }), {
          path: ['array1', 'field1'],
        });
        done(new Error('Not suppose to succes'));
      }
      catch (err) {
        expect(err).to.be.an.instanceof(Error)
          .and.have.property('message', 'Invalid path field1 (field1)');
        done();
      }
    });
  });
  describe('parseProperties', () => {
    it('should be a function', () => {
      expect(parseProperties).to.be.a('function');
    });
    it('basic 1/2', (done) => {
      parseProperties({
        field: 'value',
      }, {
        path: 'field',
      }).then((result) => {
        expect(result).to.eql('value');
        done();
      });
    });
    it('basic 2/2', (done) => {
      parseProperties({
        field1: {
          field2: {
            field3: 'value',
          },
        },
      }, {
        path: 'field1.field2.field3',
      }).then((result) => {
        expect(result).to.eql('value');
        done();
      });
    });
    it('basic using syntactic sugar 1/2', (done) => {
      parseProperties({
        field: 'value',
      }, 'field').then((result) => {
        expect(result).to.eql('value');
        done();
      });
    });
    it('basic using syntactic sugar 2/2', (done) => {
      parseProperties({
        field1: {
          field2: {
            field3: 'value',
          },
        },
      }, 'field1.field2.field3').then((result) => {
        expect(result).to.eql('value');
        done();
      });
    });
    it('basic with formatting', (done) => {
      parseProperties({
        field1: {
          field2: {
            field3: 'value',
          },
        },
      }, {
        path: 'field1.field2.field3',
        formatting: (value) => {return value + '_formatted';},
      }).then((result) => {
        expect(result).to.eql('value_formatted');
        done();
      });
    });
    it('basic with required `false`', () => {
      expect(parseProperties({
        field1: {
          field2: {
            field3: 'value',
          },
        },
      }, {
        path: 'field1.field.field3',
        required: false,
      })).to.eql(undefined);
    });
    it('basic with required `false` and formatting', (done) => {
      parseProperties({
        field1: {
          field2: {
            field3: 'value',
          },
        },
      }, {
        path: 'field1.field.field3',
        formatting: (value) => {return _.isUndefined(value) ? 'not_formatted' : (value + '_formatted');},
        required: false,
      }).then((result) => {
        expect(result).to.eql('not_formatted');
        done();
      });
    });
    it('array', (done) => {
      parseProperties([{
        field: 'value1',
      }, {
        field: 'value2',
      }, {
        field: 'value3',
      },
      ], {
        path: 'field',
      }).then((result) => {
        expect(result).to.eql(['value1', 'value2', 'value3']);
        done();
      });
    });
    it('array using syntactic sugar', (done) => {
      parseProperties([{
        field: 'value1',
      }, {
        field: 'value2',
      }, {
        field: 'value3',
      },
      ], 'field').then((result) => {
        expect(result).to.eql(['value1', 'value2', 'value3']);
        done();
      });
    });
    it('array with formatting', (done) => {
      parseProperties([{
        field: 'value1',
      }, {
        field: 'value2',
      }, {
        field: 'value3',
      },
      ], {
        path: 'field',
        formatting: (value, index) => (`${value}_formatted_${index}`),
      }).then((result) => {
        expect(result).to.eql(['value1_formatted_0', 'value2_formatted_1', 'value3_formatted_2']);
        done();
      }).catch((err) => {return done(err);});
    });
    it('array with required `false`', (done) => {
      parseProperties([{
        field: 'value1',
      }, {
        field1: 'value2',
      }, {
        field: 'value3',
      },
      ], {
        path: 'field',
        required: false,
      }).then((result) => {
        expect(result).to.eql(['value1', undefined, 'value3']);
        done();
      }).catch((err) => {return done(err);});
    });
    it('array with required `false` and formatting', (done) => {
      parseProperties([{
        field: 'value1',
      }, {
        field1: 'value2',
      }, {
        field: 'value3',
      },
      ], {
        path: 'field',
        formatting: (value, index) => (_.isUndefined(value) ? `not_formatted_${index}` : (`${value}_formatted_${index}`)),
        required: false,
      }).then((result) => {
        expect(result).to.eql(['value1_formatted_0', 'not_formatted_1', 'value3_formatted_2']);
        done();
      }).catch((err) => {return done(err);});
    });
    it('should throw `Invalid path` Error 1/2', (done) => {
      try {
        parseProperties({
          field1: {
            field2: {
              field3: 'value',
            },
          },
        }, {
          path: 'field1.field4.field3',
        });
        done(new Error('Not suppose to succes'));
      }
      catch (err) {
        expect(err).to.be.an.instanceof(Error)
          .and.have.property('message', 'Invalid path field1.field4.field3 (field4)');
        done();
      }
    });
    it('should throw `Invalid path` Error 2/2', (done) => {
      try {
        parseProperties([{
          field: 'value1',
        }, {
          field1: 'value2',
        }, {
          field: 'value3',
        },
        ], {
          path: 'field',
        });
        done(new Error('Not suppose to succes'));
      }
      catch (err) {
        expect(err).to.be.an.instanceof(Error)
          .and.have.property('message', 'Invalid path field (field)');
        done();
      }
    });
    it('should throw `Invalid path` Error using syntactic sugar 1/2', (done) => {
      try {
        parseProperties({
          field1: {
            field2: {
              field3: 'value',
            },
          },
        }, 'field1.field4.field3');
        done(new Error('Not suppose to succes'));
      }
      catch (err) {
        expect(err).to.be.an.instanceof(Error)
          .and.have.property('message', 'Invalid path field1.field4.field3 (field4)');
        done();
      }
    });
    it('should throw `Invalid path` Error using syntactic sugar 2/2', (done) => {
      try {
        parseProperties([{
          field: 'value1',
        }, {
          field1: 'value2',
        }, {
          field: 'value3',
        },
        ], 'field');
        done(new Error('Not suppose to succes'));
      }
      catch (err) {
        expect(err).to.be.an.instanceof(Error)
          .and.have.property('message', 'Invalid path field (field)');
        done();
      }
    });
  });
  describe('jsonMapper', () => {
    unitTestForJsonMapper(jsonMapper);
  });
  describe('JsonMapper', () => {
    unitTestForJsonMapper(JsonMapper);
  });
});
