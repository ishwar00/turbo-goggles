# turbo-goggles

Clone the repo

```bash
git clone git@github.com:ishwar00/turbo-goggles.git
cd turbo-goggles
```

## Running using docker:

Make sure to add env variables in `Dockerfile`.

```bash
docker build -t <name> . && docker run --rm -dp 8000:8000 <name>
```

example:

```bash
docker build -t carbon-cell . && docker run --rm -dp 8000:8000 carbon-cell
```

To check or interact hit `http://localhost:8000`

## How to run locally:

Make sure you have `Nodejs`(20 was the version it is developed on.)

```bash
npm install
```

Build the project.

```bash
npm run build
```

Run the project.

```bash
npm start
```

## Environment variables.

```bash
NODE_ENV=production
JWT_TOKEN_SECRET_KEY='<secret key>'
JWT_TOKEN_EXPIRY=1200
APP_HOST=127.0.0.1
APP_PORT=8000
BCRYPT_SALT='<bcryptjs salt>'
DATABASE_URL="<mongodb Connection string>"
```
