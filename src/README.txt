LAMBDA IMAGE ENCODER
===============================


LAMBDA SETUP
-------------------------------
- Required enviroment variables:
    * BUCKET_NAME: The bucket to put the images in
- The function must be created with a role that has access to write to S3, sample policy below replacing (BUCKET-NAME):
- {"Version":"2012-10-17","Statement":[{"Effect":"Allow","Action":["s3:ListBucket"],"Resource":["arn:aws:s3:::(BUCKET-NAME)"]},{"Effect":"Allow","Action":["s3:PutObject","s3:GetObject"],"Resource":["arn:aws:s3:::(BUCKET-NAME)/*"]}]}
- Memory should be set to the maximum(3000MB)
- Timeout should be set to maximum (5min)
- Handler should be set to index.handler
- Runtime should be set to Node.js 8.10


ENCODING OPTIONS
-------------------------------
- name: image key, if no filepath is given, this will be used to name the file
- prefix: prefix the filename with a string
- filepath: the path to save the file on s3, minus bucket
- format: what format to encode to, i.e. jpg, png, webp
- quality: 1-100, for jpg or webp formats
- compressionLevel: 0-9, for png format
- chromaSubsampling: '4:4:4' or '4:2:0', for jpg format
- progressive: true/false, for jpg or png formats
- width: default null, Set a specific width in pixels
- height: default null, Set a specific height in pixels
- max: Set a maximum dimension for both width and height
- scale: 0.0 to 1, amount to scale the image
- normalize: true/false, run through the image processors (360 or 3D)
- crop: Object of crop settings
  - viewWidth: the width of the cropper viewport, specifically for 360 images
  - viewHeight: the height of the cropper viewport, specifically for 360 images
  - width: the width of the cropped area
  - height: the height of the cropped area
  - x: starting x point of crop
  - y: starting y point of crop
  - tilt: Y axis, specifically for 360 images
  - pan: X axis, specifically for 360 images
  - zoom: Z axis
  - pixelRatio: the pixel ratio of the device that is requesting the crop. I.E. crop settings on a retina screen may differ from a normal screen


LOCAL SETUP
-------------------------------
Prerequisites:
- You'll need to have node and npm installed, preferably nvm: https://github.com/creationix/nvm
- Install aws-sdk globally with npm i -g aws-sdk
- To compile the AWS linux node modules, you'll need Docker: https://www.docker.com/

Run:
- $ git clone https://github.com/ckelsey/lambda-image-encoder.git
- $ cd lambda-image-encoder && npm i
- $ cd src && npm i && cd ../
- $ gulp

To get the linux node_modules and build for Lambda from scratch:
- $ docker login
- $ cd env/linux
- $ docker build -t amazon-linux .
- $ docker images -a (find the id of the latest one)
- $ docker run -v $(pwd):/lambda-image-encoder -it id-of-image
- EXAMPLE: docker run -v $(pwd):/lambda-image-encoder -it 1b91c3dff4c4
- $ docker ps -a (find the id of the latest one)
- $ sudo docker cp id-of-container:/lambda-image-encoder/src/node_modules src 
- EXAMPLE: sudo docker cp 4a87ff062503:/lambda-image-encoder/src/node_modules src
- $ cd ../..
- $ gulp build

To build for Lambda after initial build if nothing has changed with node_modules:
- $ gulp build


GULP TASKS
-------------------------------
gulp - Starts up a pm2 server. Also watches files and reloads
gulp build - Moves files from ./src to ./env/linux/src, removes any unnecessary files, and zips up into a lambda package