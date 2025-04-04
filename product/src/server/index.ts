import express from 'express';
import { createServer } from 'http';
import { parse } from 'url';
import next from 'next';

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const apiPort = process.env.API_PORT || 4000;

app.prepare().then(() => {
	const server = express();

	// APIルートの例
	server.get('/api/hello', (req, res) => {
		res.json({ message: 'Hello from Express????' });
	});

	// Next.jsのハンドラーにその他のリクエストを渡す
	server.use((req, res) => {
		const parsedUrl = parse(req.url!, true);
		handle(req, res, parsedUrl);
	});

	// HTTPサーバーの作成
	createServer(server).listen(apiPort, () => {
		console.log(`> API Server ready on http://localhost:${apiPort}`);
	});
}); 