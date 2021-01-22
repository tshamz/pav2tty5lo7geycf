const trace = require('@google-cloud/trace-agent');
const debug = require('@google-cloud/debug-agent');

trace.start();

debug.start({ serviceContext: { enableCanary: true } });
