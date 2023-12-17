const { currUnixTime } = require('./utils.js');
const { relayInit, getPublicKey, finishEvent, nip19 } = require('nostr-tools');
require('websocket-polyfill');

/* Q-1: Bot用に新しい秘密鍵を生成して、ここに設定しよう */
const BOT_PRIVATE_KEY_HEX = '';

const relayUrl = 'wss://relay-jp.nostr.wirednet.jp';

/**
 * メタデータ(プロフィール)イベントを組み立てる
 */
const composeMetadata = () => {
  /* Q-2: Botアカウントのプロフィールを設定しよう  */
  const profile = {
    name: 'fav_no_tarte', // スクリーンネーム
    display_name: 'ふぁぼのたると', // 表示名
    about: '@hiruno_tarte のかわりにいいねするよ！！！', // 説明欄(bio)
  };

  /* Q-3: メタデータ(プロフィール)イベントのフィールドを埋めよう */
  // pubkeyは以下の処理で自動で設定されるため、ここで設定する必要はありません
  const ev = {
    kind: 0,
    content: JSON.stringify(profile),
    tags: [],
    created_at: currUnixTime(),
  };

  // イベントID(ハッシュ値)計算・署名
  return finishEvent(ev, BOT_PRIVATE_KEY_HEX);
};

const main = async () => {
  const relay = relayInit(relayUrl);
  relay.on('error', () => {
    console.error('failed to connect');
  });

  await relay.connect();

  // メタデータ(プロフィール)イベントを組み立てる
  const metadata = composeMetadata();

  // メタデータイベントを送信
  const pub = relay.publish(metadata);
  pub.on('ok', () => {
    console.log('success!');
    relay.close();
  });
  pub.on('failed', () => {
    console.log('failed to send event');
    relay.close();
  });
};

main().catch((e) => console.error(e));
