// verifies if the user is logged-in || security purposes
// sample : isLoggedIn
function user_isLoggedIn() {
    return function (req, res, next) {
        if (req.session.user_isLoggedIn) {
            next();
        } else{
            res.redirect("/login")
        }
    };
}

//  If admin go next, else unauthorized (restricts other roles except admin)
function user_isAdmin() {
    return function(req, res, next) {
        if(req.session.role == 'admin'){
           next();
        }else{
            res.setHeader('Content-type','text/html') //convert res.send to type html
            res.send("Unauthorize Access...<a href='/fill-up'>Go back</a>");
        }
    }
}

//  If admin redirects, else go next (catches admins only else next)
function role_client() {
    return function(req, res, next) {
        if(req.session.role == "admin"){
            res.redirect("/dashboard")
        }
        else
        {
           next();
        }
    }
}

module.exports = {
    user_isAdmin,
    role_client
};
