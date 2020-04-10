var viewer;

// @urn the model to show
// @viewablesId which viewables to show, applies to BIM 360 Plans folder
function launchViewer(urn, viewableId, multiple) {
  var options = {
    env: 'AutodeskProduction',
    getAccessToken: getForgeToken,
    api: 'derivativeV2' + (atob(urn.replace('_', '/')).indexOf('emea') > -1 ? '_EU' : '') // handle BIM 360 US and EU regions
  }

  var documentId = 'urn:' + urn;
  if (multiple && (viewer !== undefined)) {  // load additional models
    loadDocument(documentId); 
  }
  else { // start viewer and load first model
    Autodesk.Viewing.Initializer(options, () => {
      viewer = new Autodesk.Viewing.GuiViewer3D(document.getElementById('forgeViewer'), { extensions: ['Autodesk.DocumentBrowser', 'Autodesk.VisualClusters'] });
      viewer.start();
      loadDocument(documentId);
    });
  }

  function loadDocument(documentId) {
    Autodesk.Viewing.Document.load(documentId, onDocumentLoadSuccess, onDocumentLoadFailure);
  }

  function onDocumentLoadSuccess(doc) {
    //note, with guid of metadata, we need to use its parent(which is viewerable)
    var viewables = (viewableId ? doc.getRoot().findByGuid(viewableId).parent : doc.getRoot().getDefaultGeometry());
    viewer.loadDocumentNode(doc, viewables, { keepCurrentModels: multiple }).then(i => {
      // any additional action here?
    });
  }

  function onDocumentLoadFailure(viewerErrorCode) {
    console.error('onDocumentLoadFailure() - errorCode:' + viewerErrorCode);
  }
}

function getForgeToken(callback) {
  fetch('/api/forge/oauth/token').then(res => {
    res.json().then(data => {
      callback(data.access_token, data.expires_in);
    });
  });
}
