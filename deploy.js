/**
 * Deployment script, executed via GitHub Webhooks.
 */

// Create a Gith server on port 9001.
var gith = require('gith').create(9001)
  , execFile = require('child_process').execFile;

gith({
  repo: 'lucasconstantino/lucasconstantino.com'
}).on('all', function (payload) {
  if (payload.branch === 'master') execFile('deploy.sh', function (error, stdout, stderr) {
    console.log('Blog changes deployed.');
  });
});
