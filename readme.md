# Models

## Code Initialization

To Install

```
> yarn Install
```

## Docker Mongo Aliases
alias mongo-start="docker run -it -d -p 27017:27017 --name mongo mongo:3.2.8 mongod --rest --httpinterface --smallfiles"
alias mongo-admin="docker run -d --link mongo:mongo -p 8081:8081 mongo-express"
alias mongo-stop="docker rm -f mongo"


## Environment Configuration

| Environment Var         | Required | Description                                                                |
| --------------------    | -------- | -----------                                                                |
| `MONGO_URL`             | N        | Full Mongo Database URL  (default: mongodb://localhost:27017/test)         |
| `MONGO_DB`              | N        | Mongo Database Name Override                                               |
| `MONGO_HOST`            | N        | Mongo Database Host Override                                               |
| `MONGO_PORT`            | N        | Mongo Database Port Override                                               |

__NOTE: Environment variables will automatically pull if a `.env` exists in the cwd.__


### Library Notes
The model is desgined to have 2 Methods that can be used easily and submit API results directly to it.

USER = response from /api/v2/users/me
```javascript
{ user.id = '30f1868d-7a22-6884-fd2d-b41121afb0cc'}
```

TOKEN = response from /oauth2/token/info
```javascript
{
  token: 'NDgzMTBiM2YtMTk2OC00NDc4LTlhMWItMDBiZDA0MTNkODk2',
  expires_in: 2592000,
  created_at: '2016-12-27T16:46:41.014392604Z'
}
```

### Profile Methods
Profile.init(USER, TOKEN)
Profile.refresh(USER, TOKEN)
Profile.byUser(USER)
Profile.byId(profile._id)