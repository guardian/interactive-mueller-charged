var request = require('sync-request');
var fs = require('fs-extra');
var gsjson = require('google-spreadsheet-to-json');
var deasync = require('deasync');
var config = require('../config.json');
var userHome = require('user-home');
var keys = require(userHome + '/.gu/interactives.json');

var data;

function fetchData(callback) {
    gsjson({
        spreadsheetId: config.data.id,
        allWorksheets: true,
        credentials: keys.google
    })
    .then(function(result) {
        callback(result);
    })
    .then(function(err) {
        if (err) {
            console.log(err);
        }
    });
}

function sortResults(data) {
    var groups = {
        'Convicted': {people: []},
        'Pled guilty': {people: []},
        'Charged': {people: []},
        'Person of interest': {people: []}
    };

    for (var i in data[0]) {
        var person = data[0][i];

        groups[person.state].people.push(person);
    }

    return {
        groups: groups
    }
}

module.exports = function getData() {
    var isDone = false;

    fetchData(function(result) {
        data = result;
        data = sortResults(data);

        isDone = true;
    });

    deasync.loopWhile(function() {
        return !isDone;
    });

    return data;
};
