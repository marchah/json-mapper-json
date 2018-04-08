# json-mapper-json

Simple library to convert a json object into a new json object formatted by a template.

## Installation

Install via [npm](https://www.npmjs.com/):

```
$ npm install json-mapper-json
```

## Documentation


### Usage

```javascript
const jsonMapper = require('json-mapper-json');

jsonMapper(json<Object>, template<Object>) => Promise
```

### Template Syntax Explanations

```javascript
{
  newFieldName1: {
    path: <String>, // required
    required: <Boolean> // not required, default `true`
    formatting: <Function> // optional (ex: function(value) {return value + '_formatted';})
    defaultValue: <AnyType> // optional
    type: <NativeType> // optional (ex: String, Number, Boolean, ...) (not supported yet)
    nested: { <Object> // optional
      newNestedFieldName: <String>,
      required: <Boolean> // not required, default `true`
      formatting: <Function> // optional
      defaultValue: <AnyType> // optional
      type: <NativeType> // optional (ex: String, Number, Boolean, ...) (not supported yet)
      nested: { <Object> // optional
        ...
      },
    },
  },
  newFieldName2: <String> // (it's the path, syntactic sugar for {path: ''})
  ...
}
```

### Path Key Words
* `$root`: give possibility to access the root given object in a nested path.
* `$item`: give possibility to access of the all item of an array in a nested path.
* `$empty`: give possibility to create skip path, to create empty object to be able to merge paths (see example).

## Example

### Basic
```javascript
jsonMapper({
  field: 'value',
}, {
  'new_field': {
    path: 'field',
  },
}).then((result) => {
  /*
  result === {
    'new_field': 'value',
  }
  */
});
```

### Basic with `required`
```javascript
jsonMapper({
  field1: 'value1',
}, {
  'new_field1': {
    path: 'field1',
  },
  'new_field2': {
    path: 'field2',
    required: false,
  },
}).then((result) => {
  /*
  result === {
    'new_field1': 'value1',
  }
  */
});
```

### Basic with `defaultValue`
```javascript
jsonMapper({
  field1: 'value1',
}, {
  'new_field1': {
    path: 'field1',
  },
  'new_field2': {
    path: 'field2',
    defaultValue: 'default_value',
  },
}).then((result) => {
  /*
  result === {
    'new_field1': 'value1',
    'new_field2': 'default_value',
  }
  */
});
```

```javascript
jsonMapper({
  field1: 'value1',
  nested: {
    field3: 'value3',  
  },
}, {
  'new_field1': {
    path: 'field1',
  },
  'new_field2': {
    path: 'field2',
  },
}).then((result) => {
  /*
  throw Error: Invalid path nested.field2 (field2)
  */
});
```

### Basic with nested

```javascript
jsonMapper({
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
  /*
  result === {
    'new_field': {
      'nested_field1': 'value',
      'nested_field2': 'value4',
    }
  }
  */
});
```

### Basic with formatting

```javascript
jsonMapper({
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
  /*
  result === {
    'new_field': 'value_formatted',
  }
  */
});
```

### Array

```javascript
jsonMapper([{
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
  /*
  result === [
    {'new_field': 'value1'},
    {'new_field': 'value2'},
    {'new_field': 'value3'},
  ]
  */
});
```

### Array with formatting

```javascript
jsonMapper([{
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
  /*
  result === [
    {'new_field': 'value1_formatted_0'},
    {'new_field': 'value2_formatted_1'},
    {'new_field': 'value3_formatted_2'},
  ]
  */
});
```

### Usage of the syntactic sugar for `path`

```javascript
jsonMapper({
  field: 'value',
}, {
  'new_field': 'field',
}).then((result) => {
  /*
  result === {
    'new_field': 'value',
  }
  */
});
```
### Array with nested and `path` syntactic sugar

```javascript
jsonMapper([{
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
  /*
  result === [
    {'new_field': {'new_nested_field': 'value1'}},
    {'new_field': {'new_nested_field': 'value2'}},
    {'new_field': {'new_nested_field': 'value3'}},
  ]
  */
});
```

### Usage of the key word `$root` for `path`

```javascript
jsonMapper({
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
/*
  result === {
    'data': [{
      'name': 'Example Course',
      'code': '',
      'type': 'offline',
    }],
  }
*/
});
```

### Usage of the key word `$item` for `path`

```javascript
jsonMapper({
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
/*
  result === {
    'hits': [{
      'id': 123456,
      'type': 'some_index/some_type/0',
    }],
  }
*/
});
```

### Usage of the key word `$empty` for `path`

```javascript
jsonMapper({
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
  /*
  {
    new_field1: {
      new_field2: {
        new_field3: 0,
        new_field4: ['value1', 'value2'],
      },
    },
  }
  */
});

## Note

this library is very usefull when you have well design models and have to communicate with horrible webservices.

## TODO

* manage `type` property

## Contributing

This project is a work in progress and subject to API changes, please feel free to contribute
