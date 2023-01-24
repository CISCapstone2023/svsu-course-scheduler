#Load the version of Alpine Linux with NodeJS 18
FROM node:18-alpine
ARG NEXTAUTH_URL
#Go into the directory to work on the build
WORKDIR /usr/svsu
#Copy the package file for downloading
COPY package.json .
#Install all packages with yarn
RUN yarn install
#Copy all of the other code for the project
COPY . .
ENV DATABASE_URL=mysql://root:password@localhost/capstone
ENV NEXTAUTH_SECRET=example
ENV NEXTAUTH_URL=$NEXTAUTH_URL
#Add the wait for connection file for mysql to fully boot
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.9.0/wait /wait
RUN chmod +x /wait
#Generate the database client for this OS
RUN yarn prisma generate
#Build the project
RUN yarn build
