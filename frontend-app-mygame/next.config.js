/** @type {import('next').NextConfig} */
module.exports = {
  output: 'standalone',
  async headers() {
    return [
      {
        env: {
          NEXT_PUBLIC_WEB_URL: process.env.NEXT_PUBLIC_WEB_URL,
          NEXT_PUBLIC_INTERNAL_WEB_URL: process.env.NEXT_PUBLIC_INTERNAL_WEB_URL,
          NEXT_PUBLIC_WEBSOCKET_URL: process.env.NEXT_PUBLIC_WEBSOCKET_URL,
        },
        source: '/:path*',
        headers: [
          { "key": "Access-Control-Allow-Credentials", "value": "true" },
          { "key": "Access-Control-Allow-Origin", "value": process.env.NEXT_PUBLIC_WEB_URL }, // Change this to specific domain for better security
          {
            "key": "Access-Control-Allow-Methods",
            "value": "GET,OPTIONS,PATCH,DELETE,POST,PUT"
          },
          {
            "key": "Access-Control-Allow-Headers",
            "value": "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
          }
        ]
      },
    ]
  },
}
