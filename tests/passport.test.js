/*var User, app, mongoose, request, server, should, user, agent;

should   = require("should");
app      = require("../server");
mongoose = require("mongoose");
User     = mongoose.model("User");
request  = require("supertest");
agent = request.agent(app)

describe('User', function () {
  before(function(done) {
      user = new User({
        email    : "user@user.com",
        firstName: "Full Name",
        lastName : "Last Name",
        password : "pass11"
      });
      user.save(done)
    });
  describe('Login test', function () {
      it('should redirect to /', function (done) {
        agent
        .post('/users/session')
        .field('email', 'user@user.com')
        .field('password', 'pass11')
        .expect('Location','/')
        .end(done)
      })

  after(function(done) {
      User.remove().exec();
      return done();
    });

})
})*/


/*var User, app, mongoose, request, server, should, user;

should   = require("should");
app      = require("../server");
mongoose = require("mongoose");
User     = mongoose.model("User");
request  = require("supertest");
server   = request.agent("http://localhost:3000");

describe("<Unit Test>", function() {
  return describe("API User:", function() {
    before(function(done) {
      user = new User({
        email    : "user@user.com",
        firstName: "Full Name",
        lastName : "Last Name",
        password : "pass11"
      });
      user.save();
      return done();
    });
    describe("Authentication", function() {
      return it("Local login", function(done) {
        return server.post("/users/session").send({
          email   : "user@user.com",
          password: "pass11"
        }).end(function(err, res) {
          res.headers.location.should.have.equal("/");
          return done();
        });
      });
    });
    return after(function(done) {
      User.remove().exec();
      return done();
    });
  });
});
*/