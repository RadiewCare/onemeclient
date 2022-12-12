module.exports = {
  apps : [
      {
        name: "oneme",
        script: "ionic",
        args   : "serve --port=8100 --host=0.0.0.0 --disableHostCheck true --ssl --external --public-host=oneme.orenyi.com",
        watch: true,
        env: {
            "NODE_ENV": "development"
        },
        env_production: {
            "NODE_ENV": "production",
        }
      }
  ]
}
