function remunerate(apiToken, contentId) {
  var contentResolved = false;

  var storage = (function() {
    var prefix = 'remunerate:content:';

    function storageId(contentId) {
      return prefix+contentId;
    }

    return {
      getKey: function(contentId) {
        return localStorage.getItem(storageId(contentId));
      },
      setKey: function(contentId, key) {
        localStorage.setItem(storageId(contentId), key);
      },
    };
  })();

  var view = (function() {
    function render(html, domID) {
      domID = domID || 'remunerate-content';

      // TODO: we should create DOM nodes
      document.getElementById(domID).innerHTML(html);
    }

    function displayPrompt (key) {
      return render("Please pay 1 satoshi to " + key +
      "\n<a href='bitcoin:"
      + key + "'>click me to pay</a>");
    }

    function displayContent(content) {
      return render(content);
    }

    return {
      displayPrompt: displayPrompt,
      displayContent: displayContent,
    };
  })();

  var getContent = function() {
    if(contentResolved) {
      return;
    }

    // check localStorage for address
    var key = storage.get(contentId);

    // ask api for content
    api.get(apiToken, contentId, key)
      .then(function(res) {
        if(res.data.content) {
          contentResolved = true;
          view.displayContent(res.data.content);
        } else {
          storage.setKey(contentId, res.data.key);
          view.displayPrompt(res.data.display, res.data.key);

          setTimeout(getContent, 2000);
        }
      });
  }.bind(this);

  // return {
  //   getContent: getContent,
  // };
  getContent();
}
