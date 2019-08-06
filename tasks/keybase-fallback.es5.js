"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.lookupId = lookupId;

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

/* istanbul ignore file */
// not production script
var axios = require("axios");

var fs = require("fs");

var path = require("path");

var baseUrl = "https://keybase.io/_/api/1.0/user/lookup.json";
var fieldsQuery = "fields=pictures,basics";

async function lookupId(state, keybaseId) {
  var fullUrl = "".concat(baseUrl, "?key_suffix=").concat(keybaseId, "&").concat(fieldsQuery);
  return query(state, fullUrl, keybaseId);
}

async function query(state, url, keybaseId) {
  try {
    var res = await state.externals.axios(url);
    return getKeybaseProfileFromResponse(keybaseId, res);
  } catch (error) {
    return {
      keybaseId: keybaseId
    };
  }
}

function getKeybaseProfileFromResponse(keybaseId, _ref) {
  var data = _ref.data;

  if (data.status.name === "OK" && data.them[0]) {
    var user = data.them[0];
    return {
      keybaseId: keybaseId,
      avatarUrl: user.pictures && user.pictures.primary ? user.pictures.primary.url : undefined,
      userName: user.basics.username,
      profileUrl: "https://keybase.io/" + user.basics.username,
      lastUpdated: new Date(Date.now()).toUTCString()
    };
  }
}

function getValidators() {
  return Promise.all([axios("https://stargate.lunie.io/staking/validators?status=unbonding").then(function (res) {
    return res.data;
  }), axios("https://stargate.lunie.io/staking/validators?status=bonded").then(function (res) {
    return res.data;
  }), axios("https://stargate.lunie.io/staking/validators?status=unbonded").then(function (res) {
    return res.data;
  })]).then(function (validatorGroups) {
    var _ref2;

    return (_ref2 = []).concat.apply(_ref2, _toConsumableArray(validatorGroups));
  });
} // This function creates a file with keybase profiles of all validators (as a fallback cache)
// This should be created on every build


async function main() {
  var validators = await getValidators();
  var cache = {};
  await Promise.all(validators.map(async function (validator) {
    var keybaseId = validator.description.identity;
    var trys = 10;

    while (trys > 0) {
      try {
        var identity = await lookupId({
          externals: {
            axios: axios
          }
        }, keybaseId);

        if (identity) {
          cache[identity.keybaseId] = identity;
        }

        console.log("got ".concat(Object.keys(cache).length, " of ").concat(validators.length, " keybase identities"));
        break;
      } catch (err) {
        await new Promise(function (resolve) {
          return setTimeout(resolve, 2000);
        });
        trys--;
      }
    }
  }));

  if (Object.keys(validators).length === 0) {
    throw new Error("Keybase cache creation failed");
  }

  fs.writeFileSync(path.join(__dirname, "../src/keybase-cache.json"), JSON.stringify(cache), "utf8");
}

main();