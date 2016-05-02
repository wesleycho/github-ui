window.Firebase = function(url) {
  this.url = url;
};

window.Firebase.prototype.authWithOAuthPopup = jasmine.createSpy('authWithOAuthPopup');
window.Firebase.prototype.unauth = jasmine.createSpy('unauth');
