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


function role_client() {
    return function(req, res, next) {
        if(req.session.role == "admin"){
            next();
        }else if (req.session.role == "student"){
           res.redirect("/fill-up")
        }
    }
}

module.exports = {
    user_isLoggedIn,
    user_isAdmin,
    role_client
};
