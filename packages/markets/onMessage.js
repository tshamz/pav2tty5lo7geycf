const firebase = require('@services/firebase');

module.exports = ({ data: rawMessage }) => {
  try {
    const m = JSON.parse(rawMessage);
    const hasBody = m && m.d && m.d.b && m.d.b.d;
    const hasPath = m && m.d && m.d.b && m.d.b.p;

    if (!hasBody || !hasPath) return;

    const body = m.d.b.d;
    const [path, id] = m.d.b.p.split('/');
    const data = { id, ...body };

    if (path.startsWith('marketStats')) {
      firebase.call.updateMarket(data);
    }

    if (path.startsWith('contractStats')) {
      firebase.call.updateContractPrice(data);
    }
  } catch (error) {
    console.log(error);
  }
};
