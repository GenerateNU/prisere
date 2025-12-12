# Lambda

This is where our code for building our Lambda function lives. 

## Table of Contents

1. [File Structure](#file-structure)
2. [Tutorial](#tutorial)

### File-Structure

The template repository is laid out as follows below.

```bash
├── email-processor
│   ├── emails
│       └── email-template.tsx # the template for the disaster email. created using react-email
│   └── lambda-src
│       └── index.ts
│       └── ses-client.ts
│   └── build.sh # Run this to re-create lambda files
├── README.md
```

### Tutorial

The logic for the lambda function resides in `lambda-src/index.ts`. Once 
you edit this you can rebuild the `layer.zip` and `function.zip` using 
`build.sh`. 

Then you can either re-deploy this using out terraform functions or edit
these straight from the aws console. If you would like to do this using
terraform please refer to the README in `./terraform`