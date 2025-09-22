# IMY220-Project #
IMY 220 Website Project

I have cloned the file from GitHub to my machine.

Now it was edited online

# Run Code Locally #
npm install
npm start
http://localhost:3000



# Docker Commands #
# 1. Build docker image
docker build -t imy220-project .

# 2. Run the docker container
docker run --rm -p 3000:3000 imy220-project

# 3. Access website
http://localhost:3000

# 4. Stop containers (wait a few seconds)
docker stop $(docker ps -q)

# 4. Clean docker after use
docker rmi imy220-project



# MongoDB #
# Username:
NJDollenberg

# Password:
yy1oc80ws1Mg7ugH

# Connection String:
mongodb+srv://NJDollenberg:yy1oc80ws1Mg7ugH@imy220-project.esoqdrz.mongodb.net/?retryWrites=true&w=majority&appName=imy220-project