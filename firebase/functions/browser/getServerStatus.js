const cors = require('cors');
const express = require('express');
const fetch = require('node-fetch');
const Compute = require('@google-cloud/compute');

const compute = new Compute();
const zone = compute.zone('us-central1-a');

const app = express();

app.use(cors({ origin: true }));

app.get('/:server', async (req, res) => {
  try {
    const server = req.params.server;

    if (!server) {
      res.status(200).json({});
      return;
    }

    const ip = await getIP(server);
    const url = `http://${ip}:8080/status`;
    const status = await fetch(url).then((res) => res.json());

    return res.status(200).json(status);
  } catch (error) {
    console.error(error);
    return { error };
  }
});

const getIP = async (name) => {
  const vm = zone.vm(`kingmaker-${name}`);
  const instance = await vm.get();
  const networkInterface = instance[1].networkInterfaces[0];
  const accessConfig = networkInterface.accessConfigs[0];
  return accessConfig.natIP;
};

module.exports = app;
