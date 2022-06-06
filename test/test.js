let chai = require("chai");
let chaiHttp = require("chai-http");
const expect = require('chai').expect;
//let server = require("../app/routes.js"); 
const app = require("../app");
const request = require('supertest');

/*from django.test import Client
csrf_client = Client(enforce_csrf_checks=True)*/

//csrf_token = '%s' % response.context['csrf_token']

chai.should();

chai.use(chaiHttp);

const agent = chai.request.agent(app) //

describe("Test", () => {

    describe("GET /", () => {
        it("It should GET /", (done) => {
            chai.request(app)
                .get("/")
                .end((err, response) => {
                    response.should.have.status(200);
                done();
                });    
        });
    });

    describe("GET /login", () => {
        it("It should GET /login", (done) => {
            chai.request(app)
                .get("/login")
                .end((err, response) => {
                    response.should.have.status(200);
                done();
                });    
        });
    });

    describe("GET /signup", () => {
        it("It should GET /signup", (done) => {
            chai.request(app)
                .get("/signup")
                .end((err, response) => {
                    response.should.have.status(200);
                done();
                });    
        });
    });

    describe("GET /home", () => {
        it("It should NOT GET /home", (done) => {
            chai.request(app)
                .get("/home")
                .end((err, response) => {
                    response.should.have.status(404);
                done();
                });    
        });
    });


    /*describe("POST /login", () => {
        it("It should NOT POST /login", (done) => {
            const user = {
                    email: "achille@gmail.com",
                    password: "123"
            };
            chai.request(app)
                .post("/login")
                //.set('CSRF-Token', _csrf)
                //.set('Accept', 'application/json') //
                //.set('Content-Type', 'application/json') //
                .type("form") //
                .send(user)
                //.expect(200) //
                //.expect('Content-Type', /json/) //
                /*.expect(function(response) { //
                    expect(response.body).not.to.be.empty; //
                    expect(response.body).to.be.an('object'); //
                 })
                .end(done); / //
                .end((err, response) => {
                    response.should.have.status(403);
                    //response.body.should.be.eql(user);
                    expect(response.body).to.deep.equal({});
                    //response.body.should.have.property('email').eq("achille@gmail.com");
                    //response.body.should.have.property('password').eq("123");
                done();
                });  
        });
    });*/

    /*describe("POST /login", () => {
        it("It should POST /login", (done) => {
            const user = {
                    email: "kev@gmail.com",
                    password: "kev"
            };
            chai.request(app)
                .post("/login")
                //.set('CSRF-Token', _csrf)
                .type("form")
                .send({ email: "kev@gmail.com", password: "kev"})
                //.send(user)
                .end((err, response) => {
                    response.should.have.status(200);
                    //expect(response.body).to.deep.equal({});
                done();
                });  
        });
    });*/

    request.get("/login").end(function(err, res) { 
        var csrfToken = extractCsrfToken(res);
        request
        .post("/users/loginauth") // this controller validates the authentication information provided is correct
        .send({
            email: 'kev@gmail.com',
            password: 'kev',
            _csrf: csrfToken // let's take the CSRF token we retrieved
        })
        .end(function(error, response){
        done();
        });
    });

    /*describe("POST /signup", () => {
        it("It should POST /signup", (done) => {
            const user = {
                    email: "rick@gmail.com",
                    password: "123"
            };
            chai.request(app)
                .post("/signup")
                .set('CSRF-Token', _csrf)
                .type("form")
                .send(user)
                .end((err, response) => {
                    response.should.have.status(201);
                done();
                });  
        });
    });*/

});


/*agent.get('/signup').end((err, res) => {
    // do some tests and get the token
    // ...
    // the agent will use the cookie from the previous request
    // so you only need to set the CSRF-Token header 
    agent.post('/signup')
      .set('CSRF-Token', _csrf)
      .send({ email: 'me@gmail.com', password: '123' })
      .end((err, res) => {
         // handle the post response 
         response.should.have.status(201);
      })
  })
  
  agent.close()*/

//const agent = chai.request.agent(app)
/*agent
  .post('/login')
  .send({ email: 'kev@gmail.com', password: 'kev' })
  .then((response) => {
    expect(response).to.have.cookie('sessionid');
    // The `agent` now has the sessionid cookie saved, and will send it
    // back to the server in the next request:
    return agent.get('/user/kev@gmail.com')
      .then((response) => {
         expect(response).to.have.status(200);
      });
  });*/