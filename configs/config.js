module.exports = {
    'producerPort': '8082',
    'producerIsGetMethodEnabled': false,
    'producerBasicAuthCredentials': {
        "producer-username": "producer-password"
    },
    'kafkaClientId': 'cicd-producer-sample',
    'kafkaBrokers': 'my-brokers',
    'kafkaAuthenticationTimeout': 9000, // 1000
    'kafkaReauthenticationThreshold': 90000, // 10000
    'kafkaConnectionTimeout': 9000, // 1000
    'kafkaRequestTimeout': 25000, // 30000
    'kafkaMechanism': 'scram-sha-256', // scram-sha-256 | scram-sha-512
    'kafkaUsername': 'my-kafka-user',
    'kafkaPassword': 'my-kafka-password',
    'kafkaTopic': 'my-cicd-topic'
};