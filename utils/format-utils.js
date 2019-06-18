module.exports.pythonizeParams = (params) => {
    return params.replace( /([A-Z]{1})/, function(v) { return '_' + v.toLowerCase(); })
}