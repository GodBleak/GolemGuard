import * as pm2 from 'pm2'

pm2.connect(function(err) {
    if (err) {
      console.error('Error:', err);
      process.exit(2);
    }
    
    pm2.start({
        name: 'golemGuard',
        script    : 'bot.ts',         // Script to be run
        max_memory_restart : '100M',   // Optional: Restarts your app if it reaches 100Mo
        output: "/dev/stdout",
        error: "/dev/stderr",
    }, function(err, apps) {
      if (err) throw err
      console.log(apps)
    });
  });