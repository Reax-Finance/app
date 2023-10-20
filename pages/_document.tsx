/* eslint-disable @next/next/no-sync-scripts */
import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="en">
      <Head >
      <script src="/static/datafeeds/udf/dist/bundle.js" />
      </Head>
      <body style={{
        background: '#130B23',
      }}>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}