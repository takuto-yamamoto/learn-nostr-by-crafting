const { currUnixTime, getCliArg } = require('./utils.js');
const {
  relayInit,
  getPublicKey,
  getEventHash,
  getSignature,
} = require('nostr-tools');
require('websocket-polyfill');

/* Q-1: 自分の秘密鍵をhex形式に変換して、ここに設定しよう */
const PRIVATE_KEY_HEX = 'xxx';

const relayUrl = 'wss://relay-jp.nostr.wirednet.jp';

/**
 * テキスト投稿イベントを組み立てる
 * @param {string} content
 */
const composePost = (content) => {
  const pubkey = getPublicKey(PRIVATE_KEY_HEX); // 公開鍵は秘密鍵から導出できる
  const ev = {
    /* Q-2: イベントの pubkey, kind, content を設定してみよう */
    pubkey,
    kind: 1,
    content,
    tags: [],
    created_at: currUnixTime(),
  };
  /* Q-3: イベントのハッシュ値を求めてみよう */
  const id = getEventHash(ev);
  /* Q-4: イベントの署名を生成してみよう */
  const sig = getSignature(ev, PRIVATE_KEY_HEX);

  return { ...ev, id, sig }; // イベントにID(ハッシュ値)と署名を設定

  /*
   * Q(おまけ): nostr-toolsには、イベントのハッシュ値の計算と署名の生成を行って、イベントのオブジェクトに自動で設定してくれる
   *           (24~29行目の処理を一気にやってくれる)、便利な関数が用意されている。その関数を探してみよう
   */
};

const main = async (content) => {
  const relay = relayInit(relayUrl);
  relay.on('error', () => {
    console.error('failed to connect');
  });

  await relay.connect();

  // テキスト投稿イベントを組み立てて、中身を見てみる
  const post = composePost(content);
  console.log(post);

  /* Q-5: Relayオブジェクトのメソッドを使って、イベントを発行してみよう */
  const pub = relay.publish(post);

  pub.on('ok', () => {
    console.log('success!');
    relay.close();
  });
  pub.on('failed', () => {
    console.log('failed to send event');
    relay.close();
  });
};

const content = getCliArg(
  'error: 投稿内容をコマンドライン引数として設定してください'
);
main(content).catch((e) => console.error(e));
