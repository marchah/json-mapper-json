var _ = require('lodash');
var Promise = require('bluebird');

var constants = require('./constants.js');

function getSettings(properties) {
  var settings = {
    path: null,
    type: null,
    formatting: null,
    nested: null,
  };

  if (_.isString(properties)) {
    const path = properties;
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

  if (settings.type !== null && settings.nested !== null && !_.contains([constants.ARRAY, constants.OBJECT], settings.type)) {
    throw new Error('Type must be an Array or an Object when nested property is filled');
  }

  return settings;
}

function getValue(from, settings) {
  var value = from;

  if ((!_.isPlainObject(from) && !_.isArray(from)) || !_.isPlainObject(settings)) return undefined;

  for (var i = 0; i !== settings.path.length; i++) {
    if (value.hasOwnProperty(settings.path[i])) {
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
        });
        result = result.concat(tmp);
      }
      /**
       * nested and formatting fields have been solved in the recursivity
       */
      settings.nested = null;
      settings.formatting = null;
      return result;
    }
    else {
      throw new Error('Invalid path ' + settings.path.join(constants.PATH_DELIMITER) + ' (' + settings.path[i] + ')');
    }
  }
  return value;
}

function parseProperties(from, properties) {
  var settings = getSettings(properties);

  var value = getValue(from, settings);

  if (settings.nested !== null) {
    value = jsonMapper(value, settings.nested);
  }

  /**
   * TODO: manage type
   */

  if (settings.formatting !== null) {
    value = settings.formatting(value);
  }

  if (_.isArray(value)) {
    return Promise.all(value);
  }
  return Promise.resolve(value);
}

function jsonMapper(from, template) {
  var to = {};

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
          tmp[fieldName] = parseProperties(from[i], template[fieldName]);
        }
      }
      to.push(Promise.props(tmp));
    }
    return Promise.all(to);
  }
  else {
    for (var fieldName in template) {
      if (template.hasOwnProperty(fieldName)) {
        to[fieldName] = parseProperties(from, template[fieldName]);
      }
    }
    return Promise.props(to);
  }
  return to;
}

module.exports = jsonMapper;
