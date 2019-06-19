module.exports.pythonizeParams = (params) => {
    if (!params) return
    var paramString = params.join(',')
    return paramString.replace( /([A-Z]{1})/, function(v) { return '_' + v.toLowerCase(); })
}

module.exports.extractContentRangeInfo = (contentRange) => {
    if (!contentRange) return
    var splittedContentRange = contentRange.split('/')
    var offsetLimit = splittedContentRange[0]
    var total = parseInt(splittedContentRange[1])
    var splittedOffsetLimit = offsetLimit.split('-')
    var offset = parseInt(splittedOffsetLimit[0])
    var limit = parseInt(splittedOffsetLimit[1]) - offset
    return ({offset, limit, total})
}