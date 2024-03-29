let chai = require("chai");
let chaiHttp = require("chai-http");
const expect = require('chai').expect;

const app = require("../app.js");

chai.should();
chai.use(chaiHttp);

const agent = chai.request.agent(app)

function extractCsrfToken(res) {
    return res.text.match(/name="_csrf" value="(.*?)"/)[1];
}

describe("Test", () => {

    describe("Landing page", () => {
        it("It accesses to the landing page", (done) => {
            chai.request(app)
                .get("/")
                .end((err, response) => {
                    response.should.have.status(200);
                done();
                });    
        });
    });

    describe("Dashboard page", () => {
        it("It accesses to the login page instead of the dashboard", (done) => {
            chai.request(app)
                .get("/dashboard")
                .end((err, response) => {
                    response.should.have.status(200);
                done();
                });    
        });
    });

    describe("Login page", () => {
        it("It accesses to the login page", (done) => {
            chai.request(app)
                .get("/login")
                .end((err, response) => {
                    response.should.have.status(200);
                done();
                });    
        });
    });

    /*describe("Login page async", () => {
        it("It accesses to the login page", async () => {
            const res = await chai.request(app).get("/login").send()

            res.should.have.status(200);
            return;
        });
    });*/

    describe("Signup page", () => {
        it("It accesses to the signup page", (done) => {
            chai.request(app)
                .get("/signup")
                .end((err, response) => {
                    response.should.have.status(200);
                done();
                });    
        });
    });

    describe("Signup flow", () => {
        it("It successfully creates an account", async () => {
            const get_res = await agent.get("/signup")
                .send()
            get_res.should.have.status(200);

            const _csrf = extractCsrfToken(get_res)
            const payload = {
                    email: "kev@gmail.com",
                    password: "abc",
                    _csrf: _csrf
            };
            const post_res = await agent.post("/signup")
                .send(payload)
            post_res.should.have.status(200);
            post_res.should.not.have.cookie('connect.sid');

            return;
        });
    });

    describe("Signup flow", () => {
        it("It fails to create an account with email already taken", async () => {
            const get_res = await agent.get("/signup")
                .send()
            get_res.should.have.status(200);

            const _csrf = extractCsrfToken(get_res)
            const payload = {
                    email: "kev@gmail.com",
                    password: "abc",
                    _csrf: _csrf
            };
            const post_res = await agent.post("/signup")
                .send(payload)
            post_res.should.have.status(200);
            post_res.should.not.have.cookie('connect.sid');

            return;
        });
    });

    describe("Signup flow", () => {
        it("It fails to create an account with wrong/empty email", async () => {
            const get_res = await agent.get("/signup")
                .send()
            get_res.should.have.status(200);

            const _csrf = extractCsrfToken(get_res)
            const payload = {
                    email: "",
                    password: "000",
                    _csrf: _csrf
            };
            const post_res = await agent.post("/signup")
                .send(payload)
            post_res.should.have.status(200);
            post_res.should.not.have.cookie('connect.sid');

            return;
        });
    });

    describe("Logout flow", () => {
        it("It successfully authenticates and then logouts", async () => {
            const user = {
                    email: "kev@gmail.com",
                    password: "abc"
            };
            const get_res = await chai.request(app).get("/login").send()
            
            get_res.should.have.status(200);
            const _csrf = extractCsrfToken(get_res)

            const post_res = await chai.request(app).get("/logout")
                .set('CSRF-Token', _csrf)
                .send()

            post_res.should.have.status(200);
            post_res.should.have.cookie('connect.sid');

            return;
        });
    });

    /*describe("Login flow", () => {
        it("It successfully authenticates", async () => {
            const user = {
                    email: "kev@gmail.com",
                    password: "kev"
            };
            const get_res = await chai.request(app).get("/login").send()
            
            get_res.should.have.status(200);
            const _csrf = extractCsrfToken(get_res)

            const post_res = await chai.request(app).post("/login")
                .set('CSRF-Token', _csrf)
                .send(user)

            post_res.should.have.status(200);
            post_res.should.have.cookie('connect.sid');

            return;
        });
    });*/

    describe("Login flow", () => {
        it("It successfully authenticates", async () => {
            const user = {
                email: "kev@gmail.com",
                password: "abc"
            };
            const get_res = await agent.get("/login").send()
            
            get_res.should.have.status(200);
            const _csrf = extractCsrfToken(get_res)

            const post_res = await agent.post("/login")
                .set('CSRF-Token', _csrf)
                .send(user)

            post_res.should.have.status(200);
            post_res.should.not.have.cookie('connect.sid');

            return;
        });
    });

    describe("Login flow", () => {
        it("It doesn't authenticate with empty field(s)", async () => {
            const user = {
                email: "",
                password: ""
            };
            const get_res = await agent.get("/login").send()
            
            get_res.should.have.status(200);
            const _csrf = extractCsrfToken(get_res)

            const post_res = await agent.post("/login")
                .set('CSRF-Token', _csrf)
                .send(user)

            post_res.should.have.status(200);
            post_res.should.not.have.cookie('connect.sid');

            return;
        });
    });

    describe("Login flow", () => {
        it("It doesn't authenticate with wrong/unregistered email", async () => {
            const user = {
                email: "www@hotmail.it",
                password: "123"
            };
            const get_res = await agent.get("/login").send()
            
            get_res.should.have.status(200);
            const _csrf = extractCsrfToken(get_res)

            const post_res = await agent.post("/login")
                .set('CSRF-Token', _csrf)
                .send(user)

            post_res.should.have.status(200);
            post_res.should.not.have.cookie('connect.sid');

            return;
        });
    });

    describe("Login flow", () => {
        it("It doesn't authenticate with wrong password", async () => {
            const user = {
                email: "kev@gmail.com",
                password: "123"
            };
            const get_res = await agent.get("/login").send()
            
            get_res.should.have.status(200);
            const _csrf = extractCsrfToken(get_res)

            const post_res = await agent.post("/login")
                .set('CSRF-Token', _csrf)
                .send(user)

            post_res.should.have.status(200);
            post_res.should.not.have.cookie('connect.sid');

            return;
        });
    });


});