// SPDX-License-Identifier: AGPL-3.0-or-later
'use strict'
const { app } = require('@azure/functions')
const df = require('durable-functions')
const watch = require('../lib/rss-watcher')
const entityName = 'saver'

app.timer('diffRss', {
  schedule: process.env.DIFFRSS_SCHEDULE,
  extraInputs: [df.input.durableClient()],
  handler: async (myTimer, context) => {
    const client = df.getClient(context)
    const entityId = new df.EntityId(entityName, 'lastRateError')
    const response = await client.readEntityState(entityId)
    const lastRateError = response.entityState
    if (lastRateError &&
      Date.now() - lastRateError.getTime() <=
      process.env.AZFUNBOT_WAIT_ERROR * 24 * 60 * 60 * 1000) { return }
    const URLS = [
      'https://www.ipa.go.jp/security/alert-rss.rdf',
      'https://jvn.jp/rss/jvn.rdf',
      'https://www.ipa.go.jp/about/newsonly-rss.rdf',
      'https://www.ipa.go.jp/about/press-rss.rdf',
      'https://b.hatena.ne.jp/Itisango/bookmark.rss',
      'https://gihyo.jp/feed/atom',
      'http://feeds.japan.zdnet.com/rss/zdnet/all.rdf',
      'https://rss.itmedia.co.jp/rss/2.0/ait.xml',
      'https://rss.itmedia.co.jp/rss/2.0/keymans.xml',
      'https://rss.itmedia.co.jp/rss/2.0/techtarget.xml' //,
      // 'https://rss.itmedia.co.jp/rss/2.0/itmedia_all.xml',
      // 'https://www.watch.impress.co.jp/data/rss/1.0/ipw/feed.rdf'
    ]
    return watch(URLS, myTimer, context)
  }
})
