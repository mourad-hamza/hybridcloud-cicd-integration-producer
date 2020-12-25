console.log(`
██████╗ ██████╗  ██████╗ ██████╗ ██╗   ██╗ ██████╗███████╗██████╗ 
██╔══██╗██╔══██╗██╔═══██╗██╔══██╗██║   ██║██╔════╝██╔════╝██╔══██╗
██████╔╝██████╔╝██║   ██║██║  ██║██║   ██║██║     █████╗  ██████╔╝
██╔═══╝ ██╔══██╗██║   ██║██║  ██║██║   ██║██║     ██╔══╝  ██╔══██╗
██║     ██║  ██║╚██████╔╝██████╔╝╚██████╔╝╚██████╗███████╗██║  ██║
╚═╝     ╚═╝  ╚═╝ ╚═════╝ ╚═════╝  ╚═════╝  ╚═════╝╚══════╝╚═╝  ╚═╝
`);
/*#################################################################################
 Imports
###################################################################################*/
const config = require('./configs/config')
const appInfo = require('./package.json')
const bodyParser = require('body-parser')
const express = require('express')
const basicAuth = require('express-basic-auth')
const { Kafka, CompressionTypes, logLevel } = require('kafkajs')
/*#################################################################################
 Environements
###################################################################################*/
const PORT = process.env.PORT || config.producerPort
const PRODUCER_IS_GET_METHOD_ENABLED = process.env.PRODUCER_IS_GET_METHOD_ENABLED || config.producerIsGetMethodEnabled
var PRODUCER_BASIC_AUTH_CREDENTIALS = ''
if (process.env.PRODUCER_BASIC_AUTH_CREDENTIALS) {
  PRODUCER_BASIC_AUTH_CREDENTIALS = JSON.parse(process.env.PRODUCER_BASIC_AUTH_CREDENTIALS)
} else {
  PRODUCER_BASIC_AUTH_CREDENTIALS = config.producerBasicAuthCredentials
}
const KAFKA_CLIENT_ID = process.env.KAFKA_CLIENT_ID || config.kafkaClientId
const KAFKA_BROKERS = process.env.KAFKA_BROKERS || config.kafkaBrokers
const KAFKA_AUTHENTICATION_TIMEOUT = process.env.KAFKA_AUTHENTICATION_TIMEOUT || config.kafkaAuthenticationTimeout
const KAFKA_REAUTHENTICATION_THRESHOLD = process.env.KAFKA_REAUTHENTICATION_THRESHOLD || config.kafkaReauthenticationThreshold
const KAFKA_CONNECTION_TIMEOUT = process.env.KAFKA_CONNECTION_TIMEOUT || config.kafkaConnectionTimeout
const KAFKA_REQUEST_TIMEOUT = process.env.KAFKA_REQUEST_TIMEOUT || config.kafkaRequestTimeout
const KAFKA_MECHANISM = process.env.KAFKA_MECHANISM || config.kafkaMechanism
const KAFKA_USERNAME = process.env.KAFKA_USERNAME || config.kafkaUsername
const KAFKA_PASSWORD = process.env.KAFKA_PASSWORD || config.kafkaPassword
const KAFKA_TOPIC = process.env.KAFKA_TOPIC || config.kafkaTopic
/*#################################################################################
 Configuration
###################################################################################*/
const app = express()
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(basicAuth({
  users:  PRODUCER_BASIC_AUTH_CREDENTIALS,
  //users:  JSON.parse(PRODUCER_BASIC_AUTH_CREDENTIALS),
  challenge: true
}))
const kafka = new Kafka({
  clientId: KAFKA_CLIENT_ID,
  brokers: [KAFKA_BROKERS],
  authenticationTimeout: parseInt(KAFKA_AUTHENTICATION_TIMEOUT),
  reauthenticationThreshold: parseInt(KAFKA_REAUTHENTICATION_THRESHOLD),
  connectionTimeout: parseInt(KAFKA_CONNECTION_TIMEOUT),
  requestTimeout: parseInt(KAFKA_REQUEST_TIMEOUT),
  ssl: true,
  sasl: {
    mechanism: KAFKA_MECHANISM,
    username: KAFKA_USERNAME,
    password: KAFKA_PASSWORD
  },
})
const producer = kafka.producer()
// Enable logging
// Enable logging for Express http://expressjs.com/en/resources/middleware/morgan.html
var morgan = require('morgan');
app.use(morgan('[:date[iso]] :remote-addr - :remote-user ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'))
// Enable logging for all console.log
require('log-timestamp');
/*#################################################################################
 Kafka
###################################################################################*/
var sendMessage = async (url, req) => {
  await producer.connect()
  await producer.send({
    topic: KAFKA_TOPIC,
    messages: [
      { 
        key: url, value: JSON.stringify(req)
    }
    ],
  })
  await producer.disconnect()
}
/*#################################################################################
 API Calls
###################################################################################*/
app.use(function (req, res) {
  var contextPath = req.url.split("/")[1]
  if (req.method == "POST" || PRODUCER_IS_GET_METHOD_ENABLED) {
    switch (contextPath) {
      case "project":
      case "job":
      case "github-webhook":
        filtred_req = {}
        filtred_req.headers = req.headers
        // YOU MUST SET content-type: json the sender configuration
        // Github; https://github.com/YOUR-REPO/settings/hooks/[ID]
        // curl  -H "Content-Type: application/json" -H "x-github-event:push" -d@github-event.json -v -s -XPOST -u ****:**** http://localhost:8082/github-webhook/
        filtred_req.body = req.body
        console.log(req.body)
        console.log('Sending Message to Kafka')
        sendMessage(req.url, filtred_req)
        res.json({ status: "success" })
        break
      default:
        res.json({ message: 'This is the way' })
    }
  } else {
    res.sendStatus(401)
  }
  res.end()
});
/*#################################################################################
 App start
###################################################################################*/
app.listen(PORT, function () {
	console.log(appInfo.name+' v'+appInfo.version+' is running on port '+PORT)
});