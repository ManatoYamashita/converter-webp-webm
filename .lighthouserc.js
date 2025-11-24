module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000'],
      numberOfRuns: 1,
      settings: {
        maxWaitForLoad: 90000, // 90秒待機（CI環境でのNext.js hydration対応）
        chromeFlags: [
          '--no-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-software-rasterizer',
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
