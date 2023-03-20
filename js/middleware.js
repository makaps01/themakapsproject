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
        if(req.session.role == 'student'){
           next();
        }else{
           res.redirect("/dashboard")
        }
    }
}

module.exports = {
    user_isAdmin,
};
