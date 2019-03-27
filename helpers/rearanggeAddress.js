const PORT = process.env.PORT || 3000
const axios = require('axios')

async function putFurthestToLast(addresses) {
    let requests = []
    for (const address of addresses) {
        requests.push(axios({
            method: 'POST',
            url: `http://localhost:${PORT}/route/routeOptimizer`,
            data: {
                addresses: [addresses[0], address],
                routingType: 'AtoZ',
            }
        }))
    }
    let response = await Promise.all(requests)
    response.sort((a, b) => b.data.totalTime - a.data.totalTime)
    let furthest = response[0].data.route[1].addressSearchQuery
    let reorderedAddress = addresses.filter(e => e !== furthest)
    reorderedAddress.push(furthest)
    return reorderedAddress
}

module.exports = { putFurthestToLast }
