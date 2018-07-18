LAMBDA IMAGE ENCODER
===============================


LAMBDA SETUP
-------------------------------
- Required enviroment variables:
    * BUCKET_NAME: The bucket to put the images in

- The function must be created with a role that has access to write to S3, sample policy below:
- { "Version": "2012-10-17", "Statement": [ { "Effect": "Allow", "Action": "s3:*", "Resource": "*" }]}

- Memory should be set to the maximum(3000MB)
- Timeout should be set to maximum (5min)
- Handler should be set to index.handler
- Runtime should be set to Node.js 8.10


LOCAL SETUP
-------------------------------
Prerequisites:
- You'll need to have node and npm installed, preferably nvm: https://github.com/creationix/nvm
- To compile the AWS linux node modules, you'll need Docker

Run:
- $ git clone https://github.com/ckelsey/lambda-image-encoder.git
- $ cd lambda-image-encoder && npm i
- $ cd src && npm i && cd ../
- $ gulp

To build:
- $ docker login
- $ cd env/linux
- $ docker build -t amazon-linux .
- $ docker run -v $(pwd):/lambda-image-encoder -it amazonlinux
- $ curl --silent --location https://rpm.nodesource.com/setup_8.x | bash
- $ yum -y install nodejs
- $ yum install gcc-c++ make
- $ yum install cairo cairo-devel cairomm-devel libjpeg-turbo-devel pango pango-devel pangomm pangomm-devel giflib-devel
- $ cd lambda-image-encoder/src && npm i
- $ exit
- $ docker ps --all (find the id of the latest one)
- $ sudo docker cp idofcontainer:/lambda-image-encoder/src/node_modules /src
- $ cd ../../..
- $ gulp build