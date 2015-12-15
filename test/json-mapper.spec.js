const _ = require('lodash');
const rewire = require('rewire');
const expect = require('chai').expect;
const Promise = require('bluebird');

const ObjectId = require('mongoose').Schema.ObjectId;

const JsonMapper = rewire('../lib/json-mapper.js');
const getSettings = JsonMapper.__get__('getSettings');
const getValue = JsonMapper.__get__('getValue');
const parseProperties = JsonMapper.__get__('parseProperties');
const jsonMapper = JsonMapper.__get__('jsonMapper');

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

  it('basic 1/2', (done) => {
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
  it('basic 2/2', (done) => {
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
        formatting: (value) => {return value + '_formatted';},
      },
    }).then((result) => {
      expect(result).to.eql([{'new_field': 'value1_formatted'}, {'new_field': 'value2_formatted'}, {'new_field': 'value3_formatted'}]);
      done();
    }).catch((err) => {return done(err);});
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
      it('should validate path writting 1/3', () => {
        expect(getSettings({path: 'path'})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
        });
      });
      it('should validate path writting 2/3', () => {
        expect(getSettings({Path: 'path'})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
        });
      });
      it('should validate path writting 3/3', () => {
        expect(getSettings({PATH: 'path'})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: null,
        });
      });
      it('should validate path has `.` character 3/3', () => {
        expect(getSettings({PATH: 'path1.path2.path3'})).to.eql({
          formatting: null,
          nested: null,
          path: ['path1', 'path2', 'path3'],
          type: null,
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
      it('should validate type writting 1/3', () => {
        expect(getSettings({path: 'path', type: String})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: String,
        });
      });
      it('should validate type writting 2/3', () => {
        expect(getSettings({path: 'path', Type: String})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: String,
        });
      });
      it('should validate type writting 3/3', () => {
        expect(getSettings({path: 'path', TYPE: String})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: String,
        });
      });
      it('should validate type `Boolean`', () => {
        expect(getSettings({path: 'path', type: Boolean})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: Boolean,
        });
      });
      it('should validate type `String`', () => {
        expect(getSettings({path: 'path', type: String})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: String,
        });
      });
      it('should validate type `Number`', () => {
        expect(getSettings({path: 'path', type: Number})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: Number,
        });
      });
      it('should validate type `Date`', () => {
        expect(getSettings({path: 'path', type: Date})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: Date,
        });
      });
      it('should validate type `Array`', () => {
        expect(getSettings({path: 'path', type: Array})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: Array,
        });
      });
      it('should validate type `Object`', () => {
        expect(getSettings({path: 'path', type: Object})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: Object,
        });
      });
      it('should validate type `ObjectId`', () => {
        expect(getSettings({path: 'path', type: ObjectId})).to.eql({
          formatting: null,
          nested: null,
          path: ['path'],
          type: ObjectId,
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
      it('should validate formatting writting 1/3', () => {
        const ret = getSettings({path: 'path', formatting: () => {}});
        expect(ret).to.be.an('object');
        expect((_.keys(ret)).length).to.eql(4);
        expect(typeof ret.formatting).to.eql('function');
        expect(ret.nested).to.eql(null);
        expect(ret.path).to.eql(['path']);
        expect(ret.type).to.eql(null);
      });
      it('should validate formatting writting 2/3', () => {
        const ret = getSettings({path: 'path', Formatting: () => {}});
        expect(ret).to.be.an('object');
        expect((_.keys(ret)).length).to.eql(4);
        expect(typeof ret.formatting).to.eql('function');
        expect(ret.nested).to.eql(null);
        expect(ret.path).to.eql(['path']);
        expect(ret.type).to.eql(null);
      });
      it('should validate formatting writting 3/3', () => {
        const ret = getSettings({path: 'path', FORMATTING: () => {}});
        expect(ret).to.be.an('object');
        expect((_.keys(ret)).length).to.eql(4);
        expect(typeof ret.formatting).to.eql('function');
        expect(ret.nested).to.eql(null);
        expect(ret.path).to.eql(['path']);
        expect(ret.type).to.eql(null);
      });
    });
    describe('Nested', () => {
      it('should validate nested writting 1/3', () => {
        expect(getSettings({path: 'path', nested: {}})).to.eql({
          formatting: null,
          nested: {},
          path: ['path'],
          type: null,
        });
      });
      it('should validate nested writting 2/3', () => {
        expect(getSettings({path: 'path', Nested: {}})).to.eql({
          formatting: null,
          nested: {},
          path: ['path'],
          type: null,
        });
      });
      it('should validate nested writting 3/3', () => {
        expect(getSettings({path: 'path', NESTED: {}})).to.eql({
          formatting: null,
          nested: {},
          path: ['path'],
          type: null,
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
        });
      });
      it('should validate nested when type is `Array`', () => {
        expect(getSettings({path: 'path', nested: {}, type: Array})).to.eql({
          formatting: null,
          nested: {},
          path: ['path'],
          type: Array,
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
        formatting: (value) => {return value + '_formatted';},
      }).then((result) => {
        expect(result).to.eql(['value1_formatted', 'value2_formatted', 'value3_formatted']);
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
  });
  describe('jsonMapper', () => {
    unitTestForJsonMapper(jsonMapper);
  });
  describe('JsonMapper', () => {
    unitTestForJsonMapper(JsonMapper);
  });
});
