function getCurrentPosition() {
  PhoneGap.exec(geoNameSuccess, geoNameFailure, "NearMePlugin", "startNearMeActivity", []);
}

function geoNameSuccess(result) {
  console.log(result);
}

function geoNameFailure(error) {
  console.log(error);
}
