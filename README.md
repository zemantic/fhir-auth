![image](https://user-images.githubusercontent.com/2173259/209614345-8a492e66-d195-458f-8f4d-f356bce54692.png)


# FHIR Auth - a SMART on FHIR compatible FHIR authentication server
[![AGPL License](https://img.shields.io/badge/license-AGPL-blue.svg?style=flat-square)](http://www.gnu.org/licenses/agpl-3.0)
[![GitHub issues](https://img.shields.io/github/issues/zemantic/fhir-auth?style=flat-square)](https://github.com/zemantic/fhir-auth)
![GitHub Repo stars](https://img.shields.io/github/stars/zemantic/fhir-auth?style=flat-square)
[![Documentation](https://img.shields.io/badge/Documentation-wip-critical?style=flat-square)](https://zemantic.co/docs/fhir-auth)

FHIR Auth is a SMART on FHIR compatible FHIR authentication and authorization server. A FHIR authorization server validates incoming requests from clients and grant access to the FHIR server according to allocated privilages.

FHIR Auth currently support server to server authentication (backend authentication) and it is compatible with HAPI FHIR and many popular FHIR servers.

## Incoporate FHIR Auth to your FHIR server or institution 

<a href="https://zemantic.co/contact-us"><img src="https://user-images.githubusercontent.com/2173259/209616744-d599016f-9f01-4bc0-bc70-8a881feb1153.png" width="128" /></a>

## Features

- Follows SMART on FHIR security standards
- FHIR Auth works with all popular FHIR servers, including HAPI FHIR
- oAuth authentication flow
- Manage multiple FHIR servers in a single endpoint
- Registration and managing clients
- Grant resrouce level privilages


## Documentation

The documentation is still work in progress. Read the full documentation for FHIR Auth - https://zemantic.co/docs/fhir-auth

Help documentation by contributing to [documentation repository](https://github.com/zemantic/fhir-auth-docs)

## Installation

Installing FHIR Auth on your developer environment

#### Clone the respository and install dependencies

```bash
git clone https://github.com/zemantic/FHIR-auth-server
npm Install
```

#### Setting up environment variables
Change the values of `env_example`. And rename the file as `.env`

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


