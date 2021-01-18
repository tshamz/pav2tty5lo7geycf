const websocket = require('@local/services/websocket');

let r = 0;
let t = 0;

module.exports = (connection) => {
  const sendMessage = ({ a, b, p }) => {
    const message = JSON.stringify({
      t: 'd',
      d: {
        r: r++,
        a,
        b: b || {
          t: t++,
          p,
          h: '',
          q: {
            sp: (Date.now() / 1000).toFixed(5),
            i: 'TimeStamp',
          },
        },
      },
    });

    websocket.send(connection)(message);
  };

  const sendSubscribe = (id) => {
    sendMessage({ a: 'q', p: `/contractOrderBook/${id}` });
  };

  const sendUnsubscribe = (id) => {
    sendMessage({ a: 'n', p: `/contractOrderBook/${id}` });
  };

  return {
    send: sendMessage,
    subscribe: sendSubscribe,
    unsubscribe: sendUnsubscribe,
  };
};
