"use client";

export default function OfflinePage() {
  return (
    <html lang="it">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Offline | Dribbling</title>
        <style>{`
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background: #1a1a1a;
            color: #ffffff;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 24px;
            padding-top: env(safe-area-inset-top, 24px);
            padding-bottom: env(safe-area-inset-bottom, 24px);
          }
          .icon {
            font-size: 72px;
            margin-bottom: 24px;
          }
          h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 12px;
            color: #ffffff;
          }
          p {
            font-size: 16px;
            color: #888888;
            line-height: 1.6;
            max-width: 300px;
            margin-bottom: 32px;
          }
          button {
            background: #ffffff;
            color: #1a1a1a;
            border: none;
            border-radius: 12px;
            padding: 14px 28px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: opacity 0.2s;
          }
          button:hover { opacity: 0.85; }
          button:active { opacity: 0.7; transform: scale(0.98); }
        `}</style>
      </head>
      <body>
        <div className="icon">🏀</div>
        <h1>Sei offline</h1>
        <p>
          Controlla la tua connessione internet e riprova. Le pagine già
          visitate potrebbero essere ancora disponibili.
        </p>
        <button onClick={() => window.location.reload()}>Riprova</button>
      </body>
    </html>
  );
}
