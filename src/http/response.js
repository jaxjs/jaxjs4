/**
 * http/response.js
 */
(function(window){
    /** Function to parse a response */
    window.jax.http.parseResponse = function(response, type, async, trace, fields) {
        var obj;
        var delim;

        // Detect application type
        if (type == null) {
            // Try from response object content type header
            if (response.headers != undefined) {
                var contentType = null;
                if (response.headers['Content-Type'] != undefined) {
                    contentType = response.headers['Content-Type'];
                } else if (response.headers['Content-type'] != undefined) {
                    contentType = response.headers['Content-type'];
                } else if (response.headers['content-type'] != undefined) {
                    contentType = response.headers['content-type'];
                }
                if (null !== contentType) {
                    if (contentType.toLowerCase().indexOf('text/plain') != -1) {
                        type = 'txt';
                    } else if (contentType.toLowerCase().indexOf('json') != -1) {
                        type = 'json';
                    } else if (contentType.toLowerCase().indexOf('xml') != -1) {
                        type = 'xml';
                    } else if (contentType.toLowerCase().indexOf('csv') != -1) {
                        type = 'csv';
                        delim = ',';
                    } else if (contentType.toLowerCase().indexOf('tsv') != -1) {
                        type = 'tsv';
                        delim = "\t";
                    }
                }
            // Else, if string, try to detect from string
            } else if (typeof response == 'string') {
                if (response.substr(0, 5) == '<?xml') {
                    type = 'xml';
                } else if (response.substr(0, 1) == '{') {
                    type = 'json';
                } else {
                    var validCsv = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*(?:,\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^,'"\s\\]*(?:\s+[^,'"\s\\]+)*)\s*)*$/;
                    var validTsv = /^\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^\t'"\s\\]*(?:\s+[^\t'"\s\\]+)*)\s*(?:\t\s*(?:'[^'\\]*(?:\\[\S\s][^'\\]*)*'|"[^"\\]*(?:\\[\S\s][^"\\]*)*"|[^\t'"\s\\]*(?:\s+[^\t'"\s\\]+)*)\s*)*$/;
                    if (validCsv.test(response)) {
                        type = 'csv';
                        delim = ',';
                    } else if (validTsv.test(response)) {
                        type = 'tsv';
                        delim = "\t";
                    }
                }
            }
        }

        switch (type) {
            // Parse TXT response
            case 'txt':
                obj = response.text.toString();
                break;
            // Parse JSON response
            case 'json':
                try {
                    obj = JSON.parse(decodeURIComponent(response.text));
                } catch (e) {
                    obj = JSON.parse(response.text);
                }
                break;

            // Parse XML response
            case 'xml':
                // Get XML doc from string if doesn't exist
                if (!response.xml) {
                    var str = (response.text != undefined) ? response.text : response.toString();
                    if ("ActiveXObject" in window) {
                        var xDoc = new ActiveXObject('Microsoft.XMLDOM');
                        xDoc.async = (async != undefined) ? async : true;
                        xDoc.loadXML(str);
                    } else {
                        var parser = new DOMParser();
                        var xDoc = parser.parseFromString(str, 'text/xml');
                    }
                // Else, get XML doc
                } else {
                    var xDoc = response.xml;
                }

                var docObj = 'var xml = ';

                function traverse(tree, objStr) {
                    var attribs = [];
                    var attribStr = '';
                    if (tree.attributes != undefined) {
                        for (var j = 0; j < tree.attributes.length; j++) {
                            var nodeValue = tree.attributes[j].nodeValue
                                .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                                .replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\(/g, '&#40;')
                                .replace(/\)/g, '&#41;').replace(/\//g, '&#47;')
                                .replace(/:/g, '&#58;').replace(/\[/g, '&#91;').replace(/\]/g, '&#93;')
                                .replace(/\\/g, '&#92;').replace(/{/g, '&#123;').replace(/}/g, '&#125;')
                                .replace(/\"/g, '\\"').replace(/\n/g, '\\n');
                            attribs.push(tree.attributes[j].nodeName + ' : "' + nodeValue + '"');
                        }
                    }
                    if (tree.hasChildNodes()) {
                        var regex = /^\s*$/;
                        var nValue = '';
                        for (var i = 0; i < tree.childNodes.length; i++) {
                            if ((tree.childNodes[i].nodeType == 3) && (!regex.test(tree.childNodes[i].nodeValue))) {
                                nValue += tree.childNodes[i].nodeValue;
                            }
                        }
                        nValue = nValue.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
                            .replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/\(/g, '&#40;')
                            .replace(/\)/g, '&#41;').replace(/\//g, '&#47;')
                            .replace(/:/g, '&#58;').replace(/\[/g, '&#91;').replace(/\]/g, '&#93;')
                            .replace(/\\/g, '&#92;').replace(/{/g, '&#123;').replace(/}/g, '&#125;')
                            .replace(/\"/g, '\\"').replace(/\n/g, '\\n');
                        attribs.push('nodeValue : "' + nValue + '"');
                        if (attribs.length > 0) {
                            attribStr = '{' + attribs.join(', ');
                        }
                        objStr += '{' + tree.tagName + ' : ' + attribStr + ', nodes : [';
                        for (var i = 0; i < tree.childNodes.length; i++) {
                            objStr += traverse(tree.childNodes[i], '');
                        }
                        objStr += ']}},';
                    } else {
                        if (tree.nodeValue == null) {
                            attribs.push('nodeValue : ""');
                            if (attribs.length > 0) {
                                attribStr = '{' + attribs.join(', ') + '}';
                            }
                            objStr += '{' + tree.tagName + ' : ' + attribStr + '}';
                        }
                    }
                    return objStr;
                }

                if (xDoc.childNodes.length > 0) {
                    if ("ActiveXObject" in window) {
                        docObj += traverse(xDoc.documentElement, '');
                    } else {
                        if (xDoc.childNodes[0].nodeType == 10) {
                            docObj += traverse(xDoc.childNodes[1], '');
                        } else {
                            docObj += traverse(xDoc.childNodes[0], '');
                        }
                    }
                } else {
                    docObj += '{}';
                }

                // Some clean up on the docObj string.
                if (docObj.charAt(docObj.length - 1) == ',') {
                    docObj = docObj.substring(0, (docObj.length - 1));
                }

                eval(docObj);
                obj = xml;
                break;

            // Parse CSV or TSV response
            case 'csv':
            case 'tsv':
                var start = 0;
                var csvDoc = (response.text != undefined) ? response.text : response.toString();
                var csvObj = 'var csv = ';
                var csvRows = [];

                var csvAry = csvDoc.replace(/\r/g, "").split("\n");

                if (fields) {
                    var csvFields = csvAry[0].split(delim);
                    var start = 1;
                }

                var csvAryLen = csvAry.length;
                for (var k = start; k < csvAryLen; k++) {
                    if (csvAry[k] != '') {
                        if (csvAry[k].indexOf('"') != -1) {
                            var matches = csvAry[k].match(/"([^"]*)"/g);
                            var filtered = [];
                            if (matches.length > 0) {
                                var matlen = matches.length;
                                for (var m = 0; m < matlen; m++) {
                                    var filt = matches[m].replace(/,/g, '[{c}]');
                                    filt = filt.replace(/"/g, '');
                                    filtered.push(filt);
                                    csvAry[k] = csvAry[k].replace(matches[m], filtered[m]);
                                }
                            }
                            var csvRowFiltered = csvAry[k];
                        } else {
                            var csvRowFiltered = csvAry[k];
                        }

                        var csvRow = csvRowFiltered.split(delim);
                        var cRw = [];

                        var csvRowLen = csvRow.length;
                        for (var l = 0; l < csvRowLen; l++) {
                            if (csvRow[l].indexOf('[{c}]') != -1) {
                                csvRow[l] = csvRow[l].replace(/\[{c}\]/g, ',');
                            }
                            if (fields) {
                                cRw.push(csvFields[l] + ' : "' + csvRow[l] + '"');
                            } else {
                                cRw.push('"' + csvRow[l] + '"');
                            }
                        }

                        if (fields) {
                            csvRows.push('{' + cRw.join(', ') + '}');
                        } else {
                            csvRows.push('[' + cRw.join(', ') + ']');
                        }
                    }
                }

                if (fields) {
                    csvObj += '[' + csvRows.join(', ') + ']';
                } else {
                    csvObj += '[' + csvRows.join(', ') + ']';
                }

                eval(csvObj);
                obj = csv;
                break;

            // Else just return plain text response
            default:
                obj = response.text;
        }

        if (trace != null) {
            trace.apply(undefined, [response]);
        }
        return obj;
    };

    /** Function to process a response */
    window.jax.http.processResponse = function(index) {
        var response = {};

        if (window.jax.http.requests[index] != undefined) {
            response = {
                headers    : {},
                url        : '',
                status     : 0,
                statusText : '',
                timeout    : 0,
                body       : '',
                text       : '',
                xml        : ''
            };
            var h = window.jax.http.requests[index].getAllResponseHeaders();
            if ((h != null) && (h != '')) {
                h = h.split("\n");
                for (var i = 0; i < h.length; i++) {
                    var head = h[i].substring(0, h[i].indexOf(':')).trim();
                    var val  = h[i].substring(h[i].indexOf(':') + 1).trim();
                    if (head != '') {
                        response.headers[head] = val;
                    }
                }
            }
            response.url        = (typeof window.jax.http.requests[index].responseURL != 'undefined')  ? window.jax.http.requests[index].responseURL : '';
            response.status     = window.jax.http.requests[index].status;
            response.statusText = window.jax.http.requests[index].statusText;
            response.timeout    = window.jax.http.requests[index].timeout;
            response.body       = (typeof window.jax.http.requests[index].response != 'undefined')     ? window.jax.http.requests[index].response : '';
            response.text       = (typeof window.jax.http.requests[index].responseText != 'undefined') ? window.jax.http.requests[index].responseText : '';
            response.xml        = (typeof window.jax.http.requests[index].responseXML != 'undefined')  ? window.jax.http.requests[index].responseXML : '';
        }

        window.jax.http.response = response;
        return window.jax.http.response;
    };
})(window);
