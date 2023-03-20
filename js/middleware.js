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

//verifies if current user is admin
function user_isAdmin() {
    return function(req, res, next) {
        if(req.session.role == 'admin'){
           next();
        }else{
            res.setHeader('Content-type','text/html')
            res.send("Unauthorize Access...<a href='/fill-up'>Go back</a>");
        }
    }
}

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
