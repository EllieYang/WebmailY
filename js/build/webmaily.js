/*
 * $Id: base64.js,v 2.15 2014/04/05 12:58:57 dankogai Exp dankogai $
 *
 *  Licensed under the MIT license.
 *    http://opensource.org/licenses/mit-license
 *
 *  References:
 *    http://en.wikipedia.org/wiki/Base64
 */

(function(global) {
    'use strict';
    // existing version for noConflict()
    var _Base64 = global.Base64;
    var version = "2.1.7";
    // if node.js, we use Buffer
    var buffer;
    if (typeof module !== 'undefined' && module.exports) {
        buffer = require('buffer').Buffer;
    }
    // constants
    var b64chars
        = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
    var b64tab = function(bin) {
        var t = {};
        for (var i = 0, l = bin.length; i < l; i++) t[bin.charAt(i)] = i;
        return t;
    }(b64chars);
    var fromCharCode = String.fromCharCode;
    // encoder stuff
    var cb_utob = function(c) {
        if (c.length < 2) {
            var cc = c.charCodeAt(0);
            return cc < 0x80 ? c
                : cc < 0x800 ? (fromCharCode(0xc0 | (cc >>> 6))
                                + fromCharCode(0x80 | (cc & 0x3f)))
                : (fromCharCode(0xe0 | ((cc >>> 12) & 0x0f))
                   + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                   + fromCharCode(0x80 | ( cc         & 0x3f)));
        } else {
            var cc = 0x10000
                + (c.charCodeAt(0) - 0xD800) * 0x400
                + (c.charCodeAt(1) - 0xDC00);
            return (fromCharCode(0xf0 | ((cc >>> 18) & 0x07))
                    + fromCharCode(0x80 | ((cc >>> 12) & 0x3f))
                    + fromCharCode(0x80 | ((cc >>>  6) & 0x3f))
                    + fromCharCode(0x80 | ( cc         & 0x3f)));
        }
    };
    var re_utob = /[\uD800-\uDBFF][\uDC00-\uDFFFF]|[^\x00-\x7F]/g;
    var utob = function(u) {
        return u.replace(re_utob, cb_utob);
    };
    var cb_encode = function(ccc) {
        var padlen = [0, 2, 1][ccc.length % 3],
        ord = ccc.charCodeAt(0) << 16
            | ((ccc.length > 1 ? ccc.charCodeAt(1) : 0) << 8)
            | ((ccc.length > 2 ? ccc.charCodeAt(2) : 0)),
        chars = [
            b64chars.charAt( ord >>> 18),
            b64chars.charAt((ord >>> 12) & 63),
            padlen >= 2 ? '=' : b64chars.charAt((ord >>> 6) & 63),
            padlen >= 1 ? '=' : b64chars.charAt(ord & 63)
        ];
        return chars.join('');
    };
    var btoa = global.btoa ? function(b) {
        return global.btoa(b);
    } : function(b) {
        return b.replace(/[\s\S]{1,3}/g, cb_encode);
    };
    var _encode = buffer ? function (u) {
        return (u.constructor === buffer.constructor ? u : new buffer(u))
        .toString('base64') 
    } 
    : function (u) { return btoa(utob(u)) }
    ;
    var encode = function(u, urisafe) {
        return !urisafe 
            ? _encode(String(u))
            : _encode(String(u)).replace(/[+\/]/g, function(m0) {
                return m0 == '+' ? '-' : '_';
            }).replace(/=/g, '');
    };
    var encodeURI = function(u) { return encode(u, true) };
    // decoder stuff
    var re_btou = new RegExp([
        '[\xC0-\xDF][\x80-\xBF]',
        '[\xE0-\xEF][\x80-\xBF]{2}',
        '[\xF0-\xF7][\x80-\xBF]{3}'
    ].join('|'), 'g');
    var cb_btou = function(cccc) {
        switch(cccc.length) {
        case 4:
            var cp = ((0x07 & cccc.charCodeAt(0)) << 18)
                |    ((0x3f & cccc.charCodeAt(1)) << 12)
                |    ((0x3f & cccc.charCodeAt(2)) <<  6)
                |     (0x3f & cccc.charCodeAt(3)),
            offset = cp - 0x10000;
            return (fromCharCode((offset  >>> 10) + 0xD800)
                    + fromCharCode((offset & 0x3FF) + 0xDC00));
        case 3:
            return fromCharCode(
                ((0x0f & cccc.charCodeAt(0)) << 12)
                    | ((0x3f & cccc.charCodeAt(1)) << 6)
                    |  (0x3f & cccc.charCodeAt(2))
            );
        default:
            return  fromCharCode(
                ((0x1f & cccc.charCodeAt(0)) << 6)
                    |  (0x3f & cccc.charCodeAt(1))
            );
        }
    };
    var btou = function(b) {
        return b.replace(re_btou, cb_btou);
    };
    var cb_decode = function(cccc) {
        var len = cccc.length,
        padlen = len % 4,
        n = (len > 0 ? b64tab[cccc.charAt(0)] << 18 : 0)
            | (len > 1 ? b64tab[cccc.charAt(1)] << 12 : 0)
            | (len > 2 ? b64tab[cccc.charAt(2)] <<  6 : 0)
            | (len > 3 ? b64tab[cccc.charAt(3)]       : 0),
        chars = [
            fromCharCode( n >>> 16),
            fromCharCode((n >>>  8) & 0xff),
            fromCharCode( n         & 0xff)
        ];
        chars.length -= [0, 0, 2, 1][padlen];
        return chars.join('');
    };
    var atob = global.atob ? function(a) {
        return global.atob(a);
    } : function(a){
        return a.replace(/[\s\S]{1,4}/g, cb_decode);
    };
    var _decode = buffer ? function(a) {
        return (a.constructor === buffer.constructor
                ? a : new buffer(a, 'base64')).toString();
    }
    : function(a) { return btou(atob(a)) };
    var decode = function(a){
        return _decode(
            String(a).replace(/[-_]/g, function(m0) { return m0 == '-' ? '+' : '/' })
                .replace(/[^A-Za-z0-9\+\/]/g, '')
        );
    };
    var noConflict = function() {
        var Base64 = global.Base64;
        global.Base64 = _Base64;
        return Base64;
    };
    // export Base64
    global.Base64 = {
        VERSION: version,
        atob: atob,
        btoa: btoa,
        fromBase64: decode,
        toBase64: encode,
        utob: utob,
        encode: encode,
        encodeURI: encodeURI,
        btou: btou,
        decode: decode,
        noConflict: noConflict
    };
    // if ES5 is available, make Base64.extendString() available
    if (typeof Object.defineProperty === 'function') {
        var noEnum = function(v){
            return {value:v,enumerable:false,writable:true,configurable:true};
        };
        global.Base64.extendString = function () {
            Object.defineProperty(
                String.prototype, 'fromBase64', noEnum(function () {
                    return decode(this)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64', noEnum(function (urisafe) {
                    return encode(this, urisafe)
                }));
            Object.defineProperty(
                String.prototype, 'toBase64URI', noEnum(function () {
                    return encode(this, true)
                }));
        };
    }
    // that's it!
})(this);

if (this['Meteor']) {
    Base64 = global.Base64; // for normal export in Meteor.js
}
  
  //Setting up Google Authorization
  var clientId = '130554426228-5n2t4fcm2k9g977mvodfh9vo9591u69t.apps.googleusercontent.com';
  var apiKey = 'AIzaSyCeE7WUuVzyOQUlQuRuSZ5O_h_cw4MLn2k';
  var scopes = 'https://www.googleapis.com/auth/gmail.readonly';
  // Use a button to handle authentication the first time.
  function handleClientLoad() {
    gapi.client.setApiKey(apiKey);
    window.setTimeout(checkAuth,1);
  }

  function checkAuth() {
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: true}, handleAuthResult);
  }

  //Set values inside an Angular scope.
  function change(name,value) {  
    var scope = angular.element($("#controllerTag")).scope();
    scope.$apply(function(){
        scope[name] = value;
    })
  }

  function handleAuthResult(authResult) {
    var authorizeButton = document.getElementById('authorize-button');
    if (authResult && !authResult.error) {
      authorizeButton.style.visibility = 'hidden';
      change("googleApi","lalalalalla");
      makeApiCall();
    } else {
      authorizeButton.style.visibility = '';
      authorizeButton.onclick = handleAuthClick;
    }
  }

  function handleAuthClick(event) {
    gapi.auth.authorize({client_id: clientId, scope: scopes, immediate: false}, handleAuthResult);
    return false;
  }

  // Load the API and make an API call.  Display the results on the screen.
  function makeApiCall() {
      
      gapi.client.load('gmail','v1',function(){
        
        //Get User Profile
        var userProfileReq = gapi.client.gmail.users.getProfile({
            'userId':'me'
        }); 
          
        userProfileReq.execute(function(resp){
            var logInfo = document.getElementById('logInfo');
            logInfo.innerHTML = 'Welcome, '+resp.emailAddress+'<br/>';
        });
        
        //Get labels
        var userLabelReq = gapi.client.gmail.users.labels.list({
            'userId':'me'
        }); 
          
        userLabelReq.execute(function(resp){
            var labels = resp.labels;
            showLabels(labels);
        });

          
        //Get Email Messages
        var request = gapi.client.gmail.users.messages.list({
            'userId':'me'
        });
        request.execute(function(resp){
          
            resp.messages.forEach(function(message){
                var messageDiv = document.createElement('div');
                messageDiv.className = 'messageDiv';
                var headerDiv = document.createElement('div');
                headerDiv.className = 'headerDiv';
                var snippetDiv = document.createElement('p');
                snippetDiv.className = 'snippetDiv';
                var senderDiv = document.createElement('p');
                var subjectDiv = document.createElement('p');
                
                            
                var emailMessage = gapi.client.gmail.users.messages.get({'userId':'me','id':message.id});
                emailMessage.execute(function(content){
                    if(content.payload == null){
                        console.log("payload null");
                    }else {
                        content.payload.headers.forEach(function(header){
                            if(header.name == "Subject"){
                               // console.log(header.value);
                                subjectDiv.innerHTML += '<label>Subject:</label> '+ header.value;
                            }
                        }); 
                        content.payload.headers.forEach(function(header){
                            if(header.name == "From"){
                                //console.log(header.value);
                                senderDiv.innerHTML += '<label>From:</label> '+ header.value;
                            }
                        });
                        var snippetval;
                        if (content.snippet){
                            snippetval = content.snippet;
                           // console.log(snippetval);
                            snippetDiv.innerHTML += snippetval + '...';   
                        }else{
                            snippetDiv.innerHTML += 'This message has no content';  
                        }
                      //console.log (content);
                        /*var bodyVal;
                        if (content.payload.mimeType == 'text/html' || content.payload.mimeType == 'text/plain'){
                            bodyVal = Base64.decode(content.payload.body.data.replace(/\-/g, '+').replace(/\_/g, '/'));
                            
                        }else if(content.payload.mimeType == 'multipart/alternative'){
                            bodyVal = Base64.decode(content.payload.parts[1].body.data.replace(/\-/g, '+').replace(/\_/g, '/'));
                            
                        }
                        bodyData.innerHTML += bodyVal;*/
                    }
                    
                });
                messageDiv.appendChild(headerDiv);
                messageDiv.appendChild(snippetDiv);
                headerDiv.appendChild(senderDiv);
                headerDiv.appendChild(subjectDiv);
               
                document.getElementById("content").appendChild(messageDiv);
                //document.getElementById("content").innerHTML += '<hr/>' + messageDiv;
            });
            //document.getElementById("content").appendChild(textNode);
        });
      });
  }
function showLabels(labels){
    labels.forEach(function(label){
        
        if(label.type == 'user'){
            var labelDiv = document.createElement('span');
            labelDiv.className = 'labelDiv';
            labelDiv.innerHTML += label.name;
            document.getElementById('labelContainer').appendChild(labelDiv);
        }
    });
    labels.forEach(function(label){
        
        if (label.id == 'INBOX'){
            var labelDiv = document.createElement('div');
            labelDiv.className = 'labelDivINBOX';
            labelDiv.innerHTML += 'Show all messages in inbox';
            document.getElementById('labelContainer').appendChild(labelDiv);
        }
    });
}