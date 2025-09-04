# IMY220-Project #
IMY 220 Website Project

I have cloned the file from GitHub to my machine.

Now it was edited online

# Run Code Locally #
# 1. npm install
# 2. npm start
# 3. http://localhost:3000

# Docker Commands #
# 1. Build docker image
docker build -t imy220-project .

# 2. Run the docker container
docker run --rm -p 3000:3000 imy220-project

# 3. Access website
http://localhost:3000

# 4. Stop running container after use
docker stop $(docker ps -q --filter ancestor=imy220-project)

# 5. Clean docker after use
docker rm $(docker ps -aq --filter ancestor=imy220-project)
docker rmi imy220-project
