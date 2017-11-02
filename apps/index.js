const AlexaAppServer = require('alexa-app-server');

const instance = AlexaAppServer.start({
  server_root: process.cwd(),
  public_html: './public',
  app_dir: './apps',
  app_root: '/alexa/',
  port: 8080,
});

// instance.stop();
