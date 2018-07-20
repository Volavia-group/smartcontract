/*require('babel-register')({
  ignore: /node_modules\/(?!zeppelin-solidity)/
});*/

require('babel-polyfill');
module.exports = {
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  } ,
networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*", // Match any network id
      gas: 4700000
    },
     ropsten:  { 
     network_id: "3",
     host: "localhost",
     port:  8545,
     gas: 6900979,
     from: "0x8ed2b88ea6bc5ec50f2cab357d3d9ca605e4dcec"
    },
    kovan: {
      host: "localhost",
      port: 8545,
      network_id: "42",
      from: "0x007510BdDAF1144E4C6c29cD4bC3c0af0ea381a8",
      gas: 6900979
    },
    rinkeby: {
      host: "localhost",
      port: 8545,
      network_id: "4",
      from: "0xf962407c9a49934a5768a58e86cb93bcfce2c0c1",
      gas: 4612388
    },
    coverage: {
      host: "localhost",
      network_id: "*",
      port: 8555,         // <-- If you change this, also set the port option in .solcover.js.
      gas: 0xfffffffffff, // <-- Use this high gas value
      gasPrice: 0x01      // <-- Use this low gas price
    }
},

rpc: {
     host: 'localhost',
     port:8080
     }
};
