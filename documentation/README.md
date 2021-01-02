## Install

### Kubernetes
 ```yaml
apiVersion: v1
kind: Secret
metadata:
  name: hybridcloud-cicd-integration-producer
type: Opaque
stringData:
    PRODUCER_BASIC_AUTH_CREDENTIALS: '{ "producer-username": "producer-password" }'
    KAFKA_USERNAME: 'my-kafka-user'
    KAFKA_PASSWORD: 'my-kafka-password'
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: hybridcloud-cicd-integration-producer
spec:
  replicas: 1
  selector:
    matchLabels:
      app: hybridcloud-cicd
      type: producer
  template:
    metadata:
      labels:
        app: hybridcloud-cicd
        type: producer
    spec:
      containers:
      - image: docker.io/hamourad/hybridcloud-cicd-integration-producer:latest
        name: producer
        env:
          - name: PORT
            value: 8080
          - name: PRODUCER_IS_GET_METHOD_ENABLED
            value: false
          - name: PRODUCER_BASIC_AUTH_CREDENTIALS
            valueFrom:
              secretKeyRef:
                name: hybridcloud-cicd-integration-producer
                key: PRODUCER_BASIC_AUTH_CREDENTIALS
          - name: KAFKA_CLIENT_ID
            value: cicd-producer-sample
          - name: KAFKA_BROKERS
            value: my-brokers:port
          - name: KAFKA_AUTHENTICATION_TIMEOUT
            value: 1000
          - name: KAFKA_REAUTHENTICATION_THRESHOLD
            value: 10000
          - name: KAFKA_CONNECTION_TIMEOUT
            value: 1000
          - name: KAFKA_REQUEST_TIMEOUT          
            value: 30000
          - name: KAFKA_MECHANISM
            value: scram-sha-256
          - name: KAFKA_USERNAME
            valueFrom:
              secretKeyRef:
                name: hybridcloud-cicd-integration-producer
                key: KAFKA_USERNAME
          - name: KAFKA_PASSWORD
            valueFrom:
              secretKeyRef:
                name: hybridcloud-cicd-integration-producer
                key: KAFKA_PASSWORD
          - name: KAFKA_TOPIC
            value: my-cicd-topic
        ports:
        - containerPort: 8080
          protocol: TCP
```
### Heroku
```console
export HEROKU_APP=my-heroku-app
curl https://cli-assets.heroku.com/install.sh | sh
docker pull hamourad/hybridcloud-cicd-integration-producer:latest
docker tag hamourad/hybridcloud-cicd-integration-producer:latest registry.heroku.com/$HEROKU_APP/web
heroku login -i
heroku container:login
docker push registry.heroku.com/$HEROKU_APP/web
heroku container:release -a $HEROKU_APP web
```
## Variables

### API Access
| Environement variables | Config file varialbes | Description | Value sample            |
---------------------- | ---------------------- | ----------- | ------------
| `PORT` | `config.producerPort` | Node expose port | `8080` |
| `PRODUCER_IS_GET_METHOD_ENABLED` | `config.producerIsGetMethodEnabled` | Enable or disable GET Methode | `true` or `false` |
| `PRODUCER_BASIC_AUTH_CREDENTIALS` | `config.producerBasicAuthCredentials` | Producer Basic authentication credentials | `{ "producer-username": "producer-password" }` |

### Kafka variables
| Environement variables | Config file varialbes | Description | Value sample            |
---------------------- | ---------------------- | ----------- | ------------
| `KAFKA_CLIENT_ID` | `config.kafkaClientId` | Kafka client ID | `cicd-producer-sample` |
| `KAFKA_BROKERS` | `config.kafkaBrokers` | Kafka brokers URIs | `my-brokers:port` |
| `KAFKA_AUTHENTICATION_TIMEOUT` | `config.kafkaAuthenticationTimeout` | Kafka authentication timeout | `1000` |
| `KAFKA_REAUTHENTICATION_THRESHOLD` | `config.kafkaReauthenticationThreshold` | Kafka reuthntication threshold | `10000` |
| `KAFKA_CONNECTION_TIMEOUT` | `config.kafkaConnectionTimeout` | Kafka connection timout | `1000` |
| `KAFKA_REQUEST_TIMEOUT` | `config.kafkaRequestTimeout` | Kafka request timeout | `30000` |
| `KAFKA_MECHANISM` | `config.kafkaMechanism` | Kafka authentication mechanism | `scram-sha-256` or `scram-sha-512` |
| `KAFKA_USERNAME` | `config.kafkaUsername` | Kafka authentication username | `my-kafka-user` |
| `KAFKA_PASSWORD` | `config.kafkaPassword` | Kafka authentication password | `my-kafka-password` |
| `KAFKA_TOPIC` | `config.kafkaTopic` | Kafka topic | `my-cicd-topic` |
