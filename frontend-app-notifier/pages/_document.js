import Document, { Html, Head, Main, NextScript } from "next/document";

// https://nextjs.org/docs/advanced-features/custom-document
class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head />
        <body id="__django_nextjs_body" className="bg-white dark:bg-gray-900">
          <div id="__django_nextjs_body_begin" />
          <Main />
          <NextScript />
          <div id="__django_nextjs_body_end" />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
