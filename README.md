# GitHub Action - Action Name Here
This GitHub action ...

![Github JavaScript Actions CI/CD](https://github.com/dolittle/repository-here/workflows/Github%20JavaScript%20Actions%20CI/CD/badge.svg)

### Pre requisites
Create a workflow `.yml` file in your `.github/workflows` directory. An [example workflow](#example-workflow) is available below.

For more information, reference the GitHub Help Documentation for [Creating a workflow file](https://help.github.com/en/articles/configuring-a-workflow#creating-a-workflow-file)

### Inputs
- `some-input`: Description here

### Outputs
- `some-output`: Description here

### Example Workflow
```yaml
on:
  push:
    branches:
    - '**'
  pull_request:
    types: [closed]

name: GitHub action workflow name

jobs:
  context:
    name: Job name
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Name here
        uses: dolittle/action-repository-here@tag-to-use
        
```
## Contributing
We're always open for contributions and bug fixes!

### Pre requisites
node <= 12
yarn
git
