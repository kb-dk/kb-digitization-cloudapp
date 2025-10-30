## Run the App
eca start

This command compiles the the code and starts a local webserver with an alma instance including the cloud app at:

http://localhost:4200/institution/45KBDK_KGL

The local webserver tests against KB's Alma Sandbox.
Alma uses two-factor authentication, and that prevents us from being able to log into alma and use the localhost webservice,
when we try, we are just sent to Alma Sandbox. We found a little hacky way to access the localhost webserver:

1. Go to http://localhost:4200/institution/45KBDK_KGL
2. Type in credentials (Alma Sandbox credentials).
3. You receive a confirmation e-mail. Right-click the link and copy the url into a new tab in the browser. Replace the first
   part of the link with "http://localhost:4200"

This: https://kbdk-kgl-psb.alma.exlibrisgroup.com/infra/socialLoginRedirect?institute=45KBDK_KGL&jwt=
Becomes this: http://localhost:4200/infra/socialLoginRedirect?institute=45KBDK_KGL&jwt=

Now you can access the local webserver and find your changes in the cloud app.

## Run the tests
eca test

## Run the tests with code coverage report
eca test --code-coverage
