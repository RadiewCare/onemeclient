module.exports = {
  apps : [{
    name   : "oneme",
    script : "ionic",
    cwd    : "/var/www/vhosts/orenyi.com/oneme.orenyi.com/one-me",
    args   : "serve --disableHostCheck=true --port=8100 --host=0.0.0.0 --ssl --external --public-host=oneme.orenyi.com"

  }]
}
