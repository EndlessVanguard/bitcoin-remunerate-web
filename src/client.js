/* global localStorage:false, XMLHttpRequest:false */

function remunerate (apiToken, contentId) {
  var contentResolved = false

  var storage = (function () {
    var prefix = 'remunerate:content:'

    function storageId (contentId) {
      return prefix + contentId
    }

    return {
      getKey: function (contentId) {
        return localStorage.getItem(storageId(contentId))
      },
      setKey: function (contentId, key) {
        localStorage.setItem(storageId(contentId), key)
      }
    }
  })()

  var view = (function () {
    function render (html, domID) {
      domID = domID || 'remunerate-content'

      document.getElementById(domID).innerHTML = html
    }

    function displayPrompt (key) {
      return render('Please pay 1 satoshi to ' + key +
                    '<a href="bitcoin:' + key + '">click me to pay</a>')
    }

    function displayContent (content) {
      return render(content)
    }

    return {
      displayPrompt: displayPrompt,
      displayContent: displayContent
    }
  })()

  var api = (function () {
    function apiUrl (contentId, key) {
      var url = 'http://localhost:3000/' + contentId

      if (key !== null) {
        url += '?key=' + key
      }

      return url
    }

    function get (apiToken, contentId, key, cb) {
      var req = new XMLHttpRequest()

      req.onreadystatechange = function () {
        // If we've received the data
        if (req.readyState === 4) {
          cb(req.status, req.responseText)
        }
      }

      req.open('GET', apiUrl(contentId, key))
      req.send()
    }

    return {
      get: get
    }
  })()

  var unboundGetContent = function () {
    if (contentResolved) {
      return
    }

    // check localStorage for address
    var key = storage.getKey(contentId)

    // ask api for content
    api.get(apiToken, contentId, key, function (resStatus, resData) {
      if (resStatus === 200) {
        contentResolved = true
        view.displayContent(resData)
      } else if (resStatus === 402) {
        var jsonData = JSON.parse(resData)

        storage.setKey(contentId, jsonData.key)
        view.displayPrompt(jsonData.display, jsonData.key)

        // TODO: better mechanism to do long polling
        setTimeout(getContent, 2000)
      } else {
        console.log('bad tings mon')
      }
    })
  }
  var getContent = unboundGetContent.bind(this)

  getContent()
}

window.remunerate = remunerate
