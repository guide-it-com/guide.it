# backend

## Development

### Installing dependencies

```bash
yarn
```

### Configure environment variables

Create a `.env` file in the root of the project with the variables from `.template.env` and fill in the values.

### Running the functions locally during development

```bash
yarn dev
```

### Calling the functions locally

```bash
curl -X POST http://localhost:3003/dev/<function> -d '{"payload": "JSON"}'
```

### Deploying a function

First, make sure you have the AWS CLI installed and configured with the right credentials.

Alternatively, you can create an access key (https://docs.aws.amazon.com/IAM/latest/UserGuide/access-key-self-managed.html#Using_CreateAccessKey) and register it on the serverless framework with this command:

```bash
npx serverless config credentials -o --provider aws --key <ACCESS_KEY> --secret <SECRET_KEY>
```

Then, run the following command to deploy all changed functions:

```bash
yarn deploy
```

### Verifying the package being deployed for each function

The command below will create a zip file for each function inside the `.serverless` directory:

```bash
yarn package
```
