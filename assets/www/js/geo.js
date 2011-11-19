function getCurrentPosition() {
  PhoneGap.exec(geoNameSuccess, geoNameFailure, "NearMePlugin", "startNearMeActivity", []);
}

function geoNameSuccess(wikipediaUrl) {
    if(wikipediaUrl) {
      $('#search').addClass('inProgress');
      $.ajax({url: "http://en.m.wikipedia.org",
              success: function(data) {
                if(data) {
                  $('#main').attr('src', 'http://'+wikipediaUrl);
                } else {
                  noConnectionMsg();
                  navigator.app.exitApp();
                }
              },
              error: function(xhr) {
                noConnectionMsg();
              },
              timeout: 3000
           });
    }
}

function geoNameFailure(error) {
  console.log(error);
  alert('Google Maps service is not available on this device.');
}
