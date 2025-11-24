module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 1,
      settings: {
        maxWaitForLoad: 90000, // 90秒待機（CI環境でのNext.js hydration対応）
        maxWaitForFcp: 90000, // FCP待機も90秒に延長
        pauseAfterLoadMs: 5000, // ページロード後に5秒追加待機
        onlyCategories: ['performance'], // パフォーマンスカテゴリのみに絞る
        skipAudits: ['screenshot-thumbnails', 'final-screenshot'], // 重いauditをスキップ
        chromeFlags: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
          '--disable-extensions',
          '--disable-background-timer-throttling',
          '--disable-backgrounding-occluded-windows',
          '--disable-renderer-backgrounding',
          '--disable-ipc-flooding-protection',
          '--enable-logging',
          '--v=1',
        ],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: './.lighthouseci',
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        'first-contentful-paint': ['error', { maxNumericValue: 5000 }], // FCP 5秒以内
        'speed-index': ['warn', { maxNumericValue: 8000 }], // SI 8秒以内（警告のみ）
        'interactive': ['error', { maxNumericValue: 10000 }], // TTI 10秒以内
      },
    },
  },
};
