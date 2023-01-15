# SVSU Course Scheduler

Welcome to the SVSU Course Scheduler.

## Stack

This project is built using:

- NextJS
- Prisma
- TypeScript
- tRPC
- Tailwind
- DaisyUI React

With extra additional libraires:

- React Hook Forms
- Zod
- React Tabler Icons
- Classnames

## Requirements

- NodeJS (18)
- yarn
- MySQL

## Running Locally

1. Modify the `.env` file by creating a copy from the `.env.example` file.
2. Have a MySQL database installed with the configuration ready in `.env`
3. Now refresh the project with `yarn refresh`
   - This will install all needed packages
   - And update any database schema migrations on the database
4. Now run the local copy of the project with `yarn dev`
