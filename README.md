# json-mapper-json

Note
----
this lib is very usefull when you have well design models and have to communicate with horrible webservices.

Usage
-----
````javascript
const jsonMapper = require('json-mapper-json');

jsonMapper(data<Object>, template<Object>) => Promise
````
Template Syntax
----------------
````javascript
{
  newFieldName1: {
    path: <String>, // required
    formatting: <Function> // optional (ex: function(value) {return value + '_formatted';})
    type: <NativeType> // optional (ex: String, Number, Boolean, ...) (not supported yet)
    nested: { <Object> // optional
      newNestedFieldName: <String>,
      formatting: <Function> // optional
      type: <NativeType> // optional (ex: String, Number, Boolean, ...) (not supported yet)
      nested: { <Object> // optional
        ...
      },
    },
  },
  newFieldName2: <String> // (it's the path, syntactic sugar for {path: ''})
  ...
}
````

Exemple
=======

Basic
-----
```javascript
jsonMapper({
  field: 'value',
}, {
  'new_field': {
    path: 'field',
  },
}).then((result) => {
  /*
  result: {
    'new_field': 'value',
  }
  */
});
```
Basic with nested
---------------------
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
  result: {
    'new_field': {
      'nested_field1': 'value',
      'nested_field2': 'value4',
    }
  }
  */
});
```
Basic with formatting
---------------------
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
  result: {
    'new_field': 'value_formatted',
  }
  */
});
```
Array
-----
````javascript
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
  result: [
    {'new_field': 'value1'},
    {'new_field': 'value2'},
    {'new_field': 'value3'},
  ]
  */
});
````

Array with formatting
---------------------
````javascript
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
    formatting: (value) => {return value + '_formatted';},
  },
}).then((result) => {
  /*
  result: [
    {'new_field': 'value1_formatted'},
    {'new_field': 'value2_formatted'},
    {'new_field': 'value3_formatted'},
  ]
  */
});
````

Usage of the syntactic sugar for `path`
---------------------------------------
```javascript
jsonMapper({
  field: 'value',
}, {
  'new_field': 'field',
}).then((result) => {
  /*
  result: {
    'new_field': 'value',
  }
  */
});
```
Array with nested and `path` syntactic sugar
--------------------------------------------
````javascript
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
  result: [
    {'new_field': {'new_nested_field': 'value1'}},
    {'new_field': {'new_nested_field': 'value2'}},
    {'new_field': {'new_nested_field': 'value3'}},
  ]
  */
});
````

TODO
----
* manage `type` property
