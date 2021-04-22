const fs = require('fs');
const path = require('path');

const frameDir = '../frames';

fs.readdir(frameDir, function(err, files) {

  const totalFrames = files.length;

  files = files.map(function (fileName) {
    return {
      name: fileName,
      time: fs.statSync(`${frameDir}/${fileName}`).mtime.getTime()
    };
  })
  .sort(function (a, b) { return a.time - b.time; })
  .map(function (v) { return v.name; });

  files.forEach(function(file, index) {
    let zeroBuffer = '';
    if (totalFrames >= 100) {
      if (index < 10) {
        zeroBuffer = '00';
      } else if (index < 100) {
        zeroBuffer = '0';
      }
    } else if (totalFrames >= 10) {
      if (index < 10) {
        zeroBuffer = '0';
      }
    }
    const idx = `${zeroBuffer}${index}`;

    console.log(file, '->', idx);

    fs.rename(
      `${frameDir}/${file}`,
      `${frameDir}/${idx}.png`,
      function() {}
    );
  });

  console.log(`assigned ${totalFrames} frame indices`);
});
