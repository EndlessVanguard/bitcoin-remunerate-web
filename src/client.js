/* global localStorage:false, XMLHttpRequest:false */
function remunerate (contentId) {
  var contentResolved = false

  var storage = (function () {
    var prefix = 'remunerate:content:'

    function storageId (contentId) {
      return prefix + contentId
    }

    return {
      getAddress: function (contentId) {
        return localStorage.getItem(storageId(contentId))
      },
      setAddress: function (contentId, address) {
        localStorage.setItem(storageId(contentId), address)
      }
    }
  })()

  var view = (function () {
    var lastPromptAddress = null

    function render (html, domID) {
      domID = domID || 'remunerate-content'

      document.getElementById(domID).innerHTML = html
    }

    function displayPrompt (paymentData) {
      // tracking lastPromptAddress to prevent flashing of QR code image
      if (paymentData.address === lastPromptAddress) return
      lastPromptAddress = paymentData.address

      var bitcoinURL = 'bitcoin:' + (paymentData.address) + '?amount=' + (paymentData.satoshis / 1e8) + '&label=' + encodeURI('Momona: ' + paymentData.label) + ' ' + (paymentData.address)
      var string = 'Please pay ' + (paymentData.satoshis / 1e8) + ' bitcoin to ' + (paymentData.address)
      var qrCodeString = '<img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=' + bitcoinURL + '" alt="qr code"></img>'
      return render('<a href="' + bitcoinURL + '">' + string + qrCodeString + '</a>')
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
    function apiUrl (contentId, address) {
      var apiVersion = 0
      var url = 'https://api.getmomona.com/' + apiVersion + '/content/' + contentId

      if (address !== null) {
        url += '?address=' + address
      }

      return url
    }

    function get (contentId, address, cb) {
      var req = new XMLHttpRequest()

      req.onreadystatechange = function () {
        // If we've received the data
        if (req.readyState === 4) {
          cb(req.status, req.responseText)
        }
      }

      req.open('GET', apiUrl(contentId, address))
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
    var address = storage.getAddress(contentId)

    // ask api for content
    api.get(contentId, address, function (resStatus, resData) {
      if (resStatus === 200) {
        contentResolved = true
        view.displayContent(resData)
      } else if (resStatus === 402) {
        var jsonData = JSON.parse(resData)

        storage.setAddress(contentId, jsonData.address)
        view.displayPrompt(jsonData)

        setTimeout(getContent, 2000) // TODO: better mechanism to do long polling
      } else {
        console.log('bad tings mon')
      }
    })
  }
  var getContent = unboundGetContent.bind(this)

  getContent()
}
