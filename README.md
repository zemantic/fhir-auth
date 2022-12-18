[<img src="https://i.imgur.com/BI0QS2z.png" height="256" width="256" />](https://i.imgur.com/BI0QS2z.png)

# FHIR Auth - a SMART on FHIR compatible FHIR authentication server
[![AGPL License](https://img.shields.io/badge/license-AGPL-blue.svg?style=flat-square)](http://www.gnu.org/licenses/agpl-3.0)
![GitHub issues](https://img.shields.io/github/issues/zemantic/FHIR-auth-server?style=flat-square)

FHIR Auth is a SMART on FHIR compatible FHIR authentication server following all the standards described on the SMART on FHIR authentication documentation. 

FHIT Auth currently support server to server authentication (backend authentication) and it is compatible with HAPI FHIR and many popular FHIR servers.



## Features

- Follows SMART on FHIR standards
- FHIR Auth works with all popular FHIR servers, including HAPI FHIR
- oAuth authentication flow
- Resrouce level privilages


## Installation

Installing FHIR Auth on your developer environment

#### Clone the respository and install dependencies
```bash
git clone https://github.com/zemantic/FHIR-auth-server
npm Install
```

#### Setting up environment variables
Change the values of `env_example` as desired. And rename the file as `.env`

#### Creating tables 

``` bash
npx prisma generate
npx prisma migrate dev --name init
```

#### Run

```bash 
npm run serve
```

#### Build server after making changes 

```bash
npm run build
```
## Documentation

Documentation is still work in progress, feel free to check our documentation page and contribute.

[Documentation](https://linktodocumentation)


## Issues

Please create issues that you came across while using FHIR Auth on GitHub.

You are welcome to create a pull request with any solutions that you were able to fix on FHIR Auth. Pull requests will be merged after review by the authors.
## Authors

- [@rukshn](https://www.github.com/rukshn)


## FAQ

#### What is FHIR?

Fast Healthcare Interoperability Resources is a standard that includes a messaging structure (Resources) and a REST API structure that helps to achieve interoperability in healthcare data exchange between systems.

#### Does FHIR Auth store any health data?

No FHIR Auth does not store any incoming FHIR data, nor it process or modify the data. FHIR Auth only handles authentication of the incoming requests based on user privilages.


