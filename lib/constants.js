const ObjectId = require('bson').ObjectID;

/**
 * Properties
 */

const PATH = 'path';
const TYPE = 'type';
const FORMATTING = 'formatting';
const NESTED = 'nested';
const DEFAULT_VALUE = 'defaultvalue';
const REQUIRED = 'required';

/**
 * Types
 */

const BOOLEAN = Boolean;
const STRING = String;
const NUMBER = Number;
const DATE = Date;
const ARRAY = Array;
const OBJECT = Object;
const OBJECT_ID = ObjectId;

/**
 * Key Words
 */

const KEY_WORD_ROOT = '$ROOT';
const KEY_WORD_ITEM = '$ITEM';
const KEY_WORD_EMPTY = '$EMPTY';

/**
 * Conf
 */
const PATH_DELIMITER = '.';

module.exports = {
  PATH: PATH,
  TYPE: TYPE,
  FORMATTING: FORMATTING,
  NESTED: NESTED,
  DEFAULT_VALUE: DEFAULT_VALUE,
  REQUIRED: REQUIRED,
  PROPERTIES: [PATH, TYPE, FORMATTING, NESTED, DEFAULT_VALUE, REQUIRED],
  STRING: STRING,
  NUMBER: NUMBER,
  DATE: DATE,
  ARRAY: ARRAY,
  OBJECT: OBJECT,
  OBJECT_ID: OBJECT_ID,
  TYPES: [BOOLEAN, STRING, NUMBER, DATE, ARRAY, OBJECT, OBJECT_ID],
  PATH_DELIMITER: PATH_DELIMITER,
  KEY_WORD: {
    ROOT: KEY_WORD_ROOT,
    ITEM: KEY_WORD_ITEM,
    EMPTY: KEY_WORD_EMPTY,
    ALL: [
      KEY_WORD_ROOT,
      KEY_WORD_ITEM,
      KEY_WORD_EMPTY,
    ],
  },
};
