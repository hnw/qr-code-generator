/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

export interface Env {
	// Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
	// MY_KV_NAMESPACE: KVNamespace;
	//
	// Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
	// MY_DURABLE_OBJECT: DurableObjectNamespace;
	//
	// Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
	// MY_BUCKET: R2Bucket;
	//
	// Example binding to a Service. Learn more at https://developers.cloudflare.com/workers/runtime-apis/service-bindings/
	// MY_SERVICE: Fetcher;
	//
	// Example binding to a Queue. Learn more at https://developers.cloudflare.com/queues/javascript-apis/
	// MY_QUEUE: Queue;
}

export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
		if (request.method == 'POST') {
			return GenerateQRCode(request)
		}
		return new Response(landing, {
			headers: {
			  "Content-Type": "text/html"
			}
		  })
		}
};

import * as qr from 'qr-image';

async function GenerateQRCode(request: Request): Promise<Response> {
	const text = await request.json()
	const headers = { "Content-Type": "image/png" }
	if (typeof text === "string") {
		const qr_png = qr.imageSync(`${text}` || "https://qr.hnw.jp/")
		return new Response(qr_png, { headers })
	}
	return new Response(`illegal request body: ${typeof text}`, {
		status: 404,
	})
}

const landing = `
<h1>QR Generator</h1>
<p>Click the below button to generate a new QR code. This will make a request to your Worker.</p>
<input type="text" id="text" value="https://qr.hnw.jp/"></input>
<button onclick="generate()">Generate QR Code</button>
<p>Generated QR Code Image</p>
<img id="qr" src="#" />
<script>
	function generate() {
		fetch(window.location.pathname, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(document.querySelector("#text").value)
		})
		.then(response => response.blob())
		.then(blob => {
			const reader = new FileReader();
			reader.onloadend = function () {
				document.querySelector("#qr").src = reader.result; // Update the image source with the newly generated QR code
			}
			reader.readAsDataURL(blob);
		})
	}
	window.onload = function() { generate(); }
</script>
`