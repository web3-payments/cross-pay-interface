# Getting Started with CrossPay Interface

## Available Scripts

In the project directory, you can run:

### `yarn install`
Install the dependencies

### `yarn start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

## build

docker build -f Dockerfile.prod -t public.ecr.aws/n1s0n2p1/cross-pay-interface:latest .

* -f is used to specify the filename. If you don't specify it then you must rename your file to Dockerfile - that's what the build command looks for in the current directory by default.
* -t is used to tag the image. You can tag your image the way you want (e.g v1.0.0, v2.0.0, production, latest, etc.)
* . at the end is important, and it should be added to tell docker to use the current directory.

## Local Run

docker run -it -p 80:80 --rm public.ecr.aws/n1s0n2p1/cross-pay-interface:latest

* -it for interactive mode
* -p to expose and bind ports. Here we are exposing port 80 of the container and binding it with port 80 of the host machine. The first one is of your machine (host OS) and the second one is of the docker image container. For example, if you use -p 1234:80 then you will need to go to http://localhost:1234 on your browser.
* --rm to remove the container once it is stopped
* `public.ecr.aws/n1s0n2p1/cross-pay-interface:latest` the name:tag of the image we want to run container of