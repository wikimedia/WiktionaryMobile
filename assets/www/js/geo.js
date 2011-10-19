function getCurrentPosition() {
  PhoneGap.exec(null, null, "NearMePlugin", "startNearMeActivity", []);
}