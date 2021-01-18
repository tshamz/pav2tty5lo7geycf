const firebase = require('@local/services/firebase');

module.exports = ({ data: rawMessage }) => {
  const m = JSON.parse(rawMessage);
  const hasBody = m && m.d && m.d.b && m.d.b.d;
  const hasPath = m && m.d && m.d.b && m.d.b.p;

  if (!hasBody || !hasPath) return;

  const body = m.d.b.d;
  const [path, id] = m.d.b.p.split('/');
  const data = { id, ...body };

  if (path.startsWith('marketStats')) {
    firebase.functions().httpsCallable('data-updateMarket')(data);
  }

  if (path.startsWith('contractStats')) {
    firebase.functions().httpsCallable('data-updateContractPrice')(data);
  }
};
