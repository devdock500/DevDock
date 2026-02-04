const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

// Build the React client
console.log('Building React client...');

exec('cd client && npm run build', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error building client: ${error}`);
    return;
  }
  
  if (stderr) {
    console.error(`stderr: ${stderr}`);
  }
  
  console.log('Client build completed successfully!');
  console.log(stdout);
});