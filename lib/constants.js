const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.ObjectId;

/**
 * Properties
 */

const PATH = 'path';
const TYPE = 'type';
const FORMATTING = 'formatting';
const NESTED = 'nested';

/**
 * Types
 */

const STRING = String;
const NUMBER = Number;
const DATE = Date;
const ARRAY = Array;
const OBJECT = Object;
const OBJECT_ID = ObjectId;

/**
 * Conf
 */
const PATH_DELIMITER = '.';

module.exports = {
  PATH: PATH,
  TYPE: TYPE,
  FORMATTING: FORMATTING,
  NESTED: NESTED,
  PROPERTIES: [PATH, TYPE, FORMATTING, NESTED],
  STRING: STRING,
  NUMBER: NUMBER,
  DATE: DATE,
  ARRAY: ARRAY,
  OBJECT: OBJECT,
  OBJECT_ID: OBJECT_ID,
  TYPES: [STRING, NUMBER, DATE, ARRAY, OBJECT, OBJECT_ID],
  PATH_DELIMITER: PATH_DELIMITER,
};
