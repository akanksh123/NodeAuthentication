

exports.getLogin = (req, res, next) => {
    res.render('../views/login.ejs');
}


exports.getRegister = (req, res, next) => {
    res.render('../views/register.ejs');
}