var _ = require('lodash');
var Promise = require('bluebird');

var constants = require('./constants.js');

function getSettings(properties) {
  var settings = {
    path: null,
    type: null,
    formatting: null,
    nested: null,
    defaultValue: undefined,
    required: true,
  };

  if (_.isString(properties)) {
    var path = properties;
    properties = {};
    properties[constants.PATH] = path;
  }

  for (var property in properties) {
    if (properties.hasOwnProperty(property)) {
      var value = properties[property];

      switch (property.toLowerCase()) {
      case constants.PATH:
        if (!_.isString(value)) {
          throw new Error('Invalid path: path is not a String');
        }
        settings.path = value.split(constants.PATH_DELIMITER);
        break;
      case constants.TYPE:
        if (value !== null && typeof value !== 'undefined') {
          if (!_.includes(constants.TYPES, value)) {
            throw new Error('Invalid type ' + typeof value);
          }
          settings.type = value;
        }
        break;
      case constants.FORMATTING:
        if (value !== null && typeof value !== 'undefined') {
          if (!_.isFunction(value) || _.includes(constants.TYPES, value)) {
            throw new Error('Error formatting is not a function');
          }
          settings.formatting = value;
        }
        break;
      case constants.NESTED:
        if (value !== null && typeof value !== 'undefined') {
          if (!_.isPlainObject(value)) {
            throw new Error('Error nested is not a object');
          }
          settings.nested = value;
        }
        break;
      case constants.REQUIRED:
        if (value !== null && typeof value !== 'undefined') {
          if (!_.isBoolean(value)) {
            throw new Error('Error required is not a boolean');
          }
          settings.required = value;
        }
        break;
      case constants.DEFAULT_VALUE:
        if (value !== null && typeof value !== 'undefined') {
          settings.defaultValue = value;
        }
        break;
      default:
        throw new Error('Invalid property ' + property);
      }
    }
    else {
      throw new Error('Invalid property ' + property);
    }
  }

  if (settings.path === null) {
    throw new Error('Path can\'t null');
  }

  if (settings.type !== null && settings.nested !== null && !_.includes([constants.ARRAY, constants.OBJECT], settings.type)) {
    throw new Error('Type must be an Array or an Object when nested property is filled');
  }

  return settings;
}

function getValue(from, settings, root) {
  var value = from;

  if ((!_.isObject(from) && !_.isArray(from)) || !_.isPlainObject(settings)) return undefined;

  if (settings.path.length === 1 && settings.path[0].toUpperCase() === constants.KEY_WORD.EMPTY) {
    return value;
  }

  if (settings.path.length > 0 && settings.path[0].toUpperCase() === constants.KEY_WORD.ROOT) {
    return parseProperties(root, {
      path: settings.path.slice(1).join(constants.PATH_DELIMITER),
      type: settings.type,
      formatting: settings.formatting,
      nested: settings.nested,
      required: settings.required,
    }, root);
  }

  for (var i = 0; i !== settings.path.length; i++) {
    if (settings.path[i].toUpperCase() === constants.KEY_WORD.ITEM) {
      // skip this iteration
    }
    else if (_.has(value, settings.path[i]) || (_.isObject(value) && !_.isUndefined(_.get(value, settings.path[i])))) {
      value = value[settings.path[i]];
    }
    else if (_.isArray(value)) {
      var result = [];
      for (var j = 0; j !== value.length; j++) {
        var toto = (i === 0 && settings.path.length > 1) ? settings.path.slice(1).join(constants.PATH_DELIMITER) : settings.path.slice(i).join(constants.PATH_DELIMITER);
        var tmp = parseProperties(value[j], {
          path: toto,
          type: settings.type,
          formatting: settings.formatting,
          nested: settings.nested,
          required: settings.required,
        }, root, j);
        result = result.concat(tmp);
      }
      /**
       * nested and formatting fields have been solved in the recursivity
       */
      settings.nested = null;
      settings.formatting = null;
      return result;
    }
    else if (!_.isUndefined(settings.defaultValue)) {
      return settings.defaultValue;
    }
    else if (settings.required === false) {
      return undefined;
    }
    else {
      throw new Error('Invalid path ' + settings.path.join(constants.PATH_DELIMITER) + ' (' + settings.path[i] + ')');
    }
  }
  return value;
}

function parseProperties(from, properties, root, index) {
  var settings = getSettings(properties);

  var value = getValue(from, settings, root);

  if (!_.isUndefined(value) && settings.nested !== null) {
    value = main(value, settings.nested, true, root);
  }

  /**
   * TODO: manage type
   */

  if (settings.formatting !== null && !(value instanceof Promise)) {
    value = settings.formatting(value, index);
  }

  if (_.isUndefined(value)) return undefined;
  if (_.isArray(value)) return Promise.all(value);
  return Promise.resolve(value);
}

function main(from, template, isRecursive, root) {
  root = root || from;
  var to = {};
  var ret;

  if (typeof from === 'undefined' || from === null
    || typeof template === 'undefined' || template === null) {
    return to;
  }
  if (_.isArray(from)) {
    to = [];
    for (var i = 0; i !== from.length; i++) {
      var tmp = {};
      for (var fieldName in template) {
        if (template.hasOwnProperty(fieldName)) {
          ret = parseProperties(from[i], template[fieldName], root, i);
          if (!_.isUndefined(ret)) {
            tmp[fieldName] = ret;
          }
        }
      }
      if (!_.isEmpty(tmp)) {
        to.push(Promise.props(tmp));
      }
    }
    return Promise.all(to);
  }
  else {
    for (var fieldName in template) {
      if (template.hasOwnProperty(fieldName)) {
        ret = parseProperties(from, template[fieldName], root);
        if (!_.isUndefined(ret)) {
          to[fieldName] = ret;
        }
      }
    }
    if (!_.isEmpty(to)) {
      return Promise.props(to);
    }
  }
  return (isRecursive) ? undefined : Promise.resolve({});
}

/**
 * Convert a json object into a new json object formatted by a template
 *
 * @param {Object} json
 * @param {Object} template
 *   @property {Object} [newFieldName1]
 *     @property {String} path
 *     @property {Function} [formatting]
 *       @return {Mixed|Promise} value Return value or Promise fulfilled with value
 *     @property {NativeType} [type] Type of the returned value
 *     @property {Object} [nested] Nested object
 *       @property {Object} [newNestedFieldName1]
 *         @property {String} path
 *         @property {Function} [formatting]
 *           @return {Mixed|Promise} value Return value or Promise fulfilled with value
 *         @property {NativeType} [type] Type of the returned value
 *         @property {Object} [nested] Nested object
 *           ...
 *   @property {Object} [newFieldName2]
 *   ...
 * @return {Promise} promise Return Promise fulfilled with formatted json
 */
function jsonMapper(from, template) {
  return main(from, template);
}

module.exports = jsonMapper;
