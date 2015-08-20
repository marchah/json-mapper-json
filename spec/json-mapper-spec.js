const jsonMapper = require('../lib/json-mapper.js');

describe('Arguments checks', () => {
  it('Basic test no deep', () => {
    expect(jsonMapper({
      carrier: 'value',
    },
      {
        carrier: {
          path: 'carrier',
        },
      })).toEqual({
        carrier: 'value',
      });
  });

  it('Basic test with deep', () => {
    expect(jsonMapper({
      deep0: {
        deep1: {
          carrier: 'value',
        },
      },
    },
      {
        carrier: {
          path: 'deep0.deep1.carrier',
        },
      })).toEqual({
        carrier: 'value',
      });
  });

  it('Basic test using formatting', () => {
    expect(jsonMapper({
      carrier: 'value',
    },
      {
        carrier: {
          path: 'carrier',
          formatting: (value) => { return 'fomatted: ' + value; },
        },
      })).toEqual({
        carrier: 'fomatted: value',
      });
  });

  it('Basic test with last field an array', () => {
    expect(jsonMapper({
      deep0: {
        deep1: {
          carrier: [1, 2, 3, 4],
        },
      },
    },
      {
        carrier: {
          path: 'deep0.deep1.carrier',
        },
      })).toEqual({
        carrier: [1, 2, 3, 4],
      });
  });

  it('Middle test with array in path', () => {
    expect(jsonMapper({
      deep0: [
        {
          deep1: {
            carrier: 1,
          },
        },
        {
          deep1: {
            carrier: 2,
          },
        },
        {
          deep1: {
            carrier: 3,
          },
        },
        {
          deep1: {
            carrier: 4,
          },
        },
      ],
    },
      {
        carrier: {
          path: 'deep0.deep1.carrier',
        },
      })).toEqual({
        carrier: [1, 2, 3, 4],
      });
  });

  it('Basic test with nested', () => {
    expect(jsonMapper({
      deep0: {
        deep1: {
          carrier: 1,
        },
      },
    },
      {
        deep: {
          path: 'deep0.deep1',
          nested: {
            carrier: {
              path: 'carrier',
            },
          },
        },
      })).toEqual({
        deep: {carrier: 1},
      });
  });

  it('Middle test with nested', () => {
    expect(jsonMapper({
      deep0: {
        deep1: {
          deep2: {
            carrier: 1,
            vessel: 'test',
          },
        },
      },
    },
      {
        deep: {
          path: 'deep0.deep1',
          nested: {
            carrier: {
              path: 'deep2.carrier',
            },
            vessel: {
              path: 'deep2.vessel',
            },
          },
        },
      })).toEqual({
        deep: {carrier: 1, vessel: 'test'},
      });
  });

  it('Middle test with nested and nested of nested', () => {
    expect(jsonMapper({
      deep0: {
        deep1: {
          deep2: {
            carrier: 1,
            vessel: {
              infos: {
                id: 42,
                name: 'test',
              },
            },
          },
        },
      },
    },
      {
        deep: {
          path: 'deep0.deep1',
          nested: {
            carrier: {
              path: 'deep2.carrier',
            },
            vessel: {
              path: 'deep2.vessel',
              nested: {
                id: {
                  path: 'infos.id',
                },
                name: {
                  path: 'infos.name',
                },
              },
            },
          },
        },
      })).toEqual({
        deep: {carrier: 1, vessel: {id: 42, name: 'test'}},
      });
  });

  it('Middle test with nested array and nested of nested 1/3', () => {
    expect(jsonMapper({
      deep0: {
        deep1: {
          deep2: [
            {
              carrier: 1,
              vessel: {
                infos: {
                  id: 41,
                  name: 'test1',
                },
              },
            },
            {
              carrier: 2,
              vessel: {
                infos: {
                  id: 42,
                  name: 'test2',
                },
              },
            },
            {
              carrier: 3,
              vessel: {
                infos: {
                  id: 43,
                  name: 'test3',
                },
              },
            },
          ],
        },
      },
    },
      {
        deep: {
          path: 'deep0.deep1',
          nested: {
            carrier: {
              path: 'deep2.carrier',
            },
            vessel: {
              path: 'deep2.vessel',
              nested: {
                id: {
                  path: 'infos.id',
                },
                name: {
                  path: 'infos.name',
                },
              },
            },
          },
        },
      })).toEqual({
        deep: {
          carrier: [1, 2, 3],
          vessel: [{id: 41, name: 'test1'}, {id: 42, name: 'test2'}, {id: 43, name: 'test3'}],
        },
      });
  });

  it('Middle test with nested array and nested of nested 2/3', () => {
    expect(jsonMapper({
      deep0: {
        deep1: {
          deep2: [
            {
              carrier: 1,
              vessel: {
                infos: {
                  id: 41,
                  name: 'test1',
                },
              },
            },
            {
              carrier: 2,
              vessel: {
                infos: {
                  id: 42,
                  name: 'test2',
                },
              },
            },
            {
              carrier: 3,
              vessel: {
                infos: {
                  id: 43,
                  name: 'test3',
                },
              },
            },
          ],
        },
      },
    },
      {
        deep: {
          path: 'deep0.deep1.deep2',
          nested: {
            carrier: {
              path: 'carrier',
            },
            vessel: {
              path: 'vessel',
              nested: {
                id: {
                  path: 'infos.id',
                },
                name: {
                  path: 'infos.name',
                },
              },
            },
          },
        },
      })).toEqual({
        deep: [
          {carrier: 1, vessel: {id: 41, name: 'test1'}},
          {carrier: 2, vessel: {id: 42, name: 'test2'}},
          {carrier: 3, vessel: {id: 43, name: 'test3'}},
        ],
      });
  });


  it('Middle test with nested array and nested of nested 3/3', () => {
    expect(jsonMapper({
      deep0: {
        deep1: {
          deep2: [
            {
              carrier: 1,
            },
            {
              carrier: 2,
            },
            {
              carrier: 3,
            },
          ],
          vessel: {
            infos: {
              id: 41,
              name: 'test1',
            },
          },
        },
      },
    },
      {
        deep: {
          path: 'deep0.deep1',
          nested: {
            carrier: {
              path: 'deep2.carrier',
            },
            vessel: {
              path: 'vessel',
              nested: {
                id: {
                  path: 'infos.id',
                },
                name: {
                  path: 'infos.name',
                },
              },
            },
          },
        },
      })).toEqual({
        deep: {
          carrier: [1, 2, 3],
          vessel: {id: 41, name: 'test1'},
        },
      });
  });


  it('Advance test with arrays in path', () => {
    expect(jsonMapper({
      deep0: [
        {
          deep1: [
            {
              carrier: 1,
            },
            {
              carrier: 11,
            },
            {
              carrier: 111,
            },
          ],
        },
        {
          deep1: [
            {
              carrier: 2,
            },
            {
              carrier: 22,
            },
            {
              carrier: 222,
            },
          ],
        },
        {
          deep1: [
            {
              carrier: 3,
            },
            {
              carrier: 33,
            },
            {
              carrier: 333,
            },
          ],
        },
        {
          deep1: [
            {
              carrier: 4,
            },
            {
              carrier: 44,
            },
            {
              carrier: 444,
            },
          ],
        },
      ],
    },
      {
        carrier: {
          path: 'deep0.deep1.carrier',
        },
      })).toEqual({
        carrier: [[1, 11, 111], [2, 22, 222], [3, 33, 333], [4, 44, 444]],
      });
  });

  it('Advance test with arrays in path and with last field an array', () => {
    expect(jsonMapper({
      deep0: [
        {
          deep1: [
            {
              carrier: [1, 1, 1],
            },
            {
              carrier: [11, 11, 11],
            },
            {
              carrier: [111, 111, 111],
            },
          ],
        },
        {
          deep1: [
            {
              carrier: 2,
            },
            {
              carrier: 22,
            },
            {
              carrier: 222,
            },
          ],
        },
        {
          deep1: [
            {
              carrier: {t: 3},
            },
            {
              carrier: {t: 33},
            },
            {
              carrier: {t: 333},
            },
          ],
        },
        {
          deep1: [
            {
              carrier: '4',
            },
            {
              carrier: '44',
            },
            {
              carrier: '444',
            },
          ],
        },
      ],
    },
      {
        carrier: {
          path: 'deep0.deep1.carrier',
        },
      })).toEqual({
        carrier: [
          [
            [1, 1, 1],
            [11, 11, 11],
            [111, 111, 111],
          ],
          [
            2, 22, 222,
          ],
          [
            {t: 3}, {t: 33}, {t: 333},
          ],
          [
            '4', '44', '444',
          ],
        ],
      });
  });

 

  it('Undefined from', () => {
    expect(jsonMapper(undefined, {})).toEqual({});
  });

  it('Undefined template', () => {
    expect(jsonMapper({}, undefined)).toEqual({});
  });

  it('Undefined from and template', () => {
    expect(jsonMapper(undefined, undefined)).toEqual({});
  });

  it('Null from', () => {
    expect(jsonMapper(null, {})).toEqual({});
  });

  it('Null template', () => {
    expect(jsonMapper({}, null)).toEqual({});
  });

  it('Null from and template', () => {
    expect(jsonMapper(null, null)).toEqual({});
  });

  /*it('Invalid property name', () => {
    expect(jsonMapper({}, {
      field: {
        property: 'invalid',
      },
    })).toThrow();//toThrowError(Error, 'Invalid property property');//toThrowError('Invalid property property');
  });

  it('Invalid property type', () => {
    expect(jsonMapper({}, {
      field: {
        type: 'invalid',
      },
    })).toThrow();
  });

  it('Invalid property formatting', () => {
    expect(jsonMapper({}, {
      field: {
        formatting: 'invalid',
      },
    })).toThrow();
  });

  it('Invalid property nested', () => {
    expect(jsonMapper({}, {
      field: {
        nested: 'invalid',
      },
    })).toThrow();
  });

  it('Null property path', () => {
    expect(jsonMapper({}, {
      field: {
      },
    })).toThrow();
  });

it('Invalid property type when nested filled', () => {
    expect(jsonMapper({}, {
      field: {
        type: String,
        nested: {},
      },
    })).toThrow();
  });

it('Invalid property path', () => {
    expect(jsonMapper({}, {
      field: {
        path: 'field',
      },
    })).toThrow();
  });

*/


});
