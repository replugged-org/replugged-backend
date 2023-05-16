export enum InstallResponseType {
  SUCCESS = "SUCCESS",
  ALREADY_INSTALLED = "ALREADY-INSTALLED",
  NOT_FOUND = "CANNOT-FIND",
  UNREACHABLE = "UNREACHABLE",
}

interface RPCMessage {
  cmd: string;
  data: Response;
  evt: string | null;
  nonce: string | null;
}

type Manifest = Record<string, unknown> & {
  name: string;
};

type Response =
  | {
      kind: "SUCCESS";
      manifest: Manifest;
    }
  | {
      kind: "FAILED";
      manifest?: Manifest;
    }
  | {
      kind: "ALREADY_INSTALLED";
      manifest: Manifest;
    }
  | {
      kind: "CANCELLED";
      manifest: Manifest;
    }
  | (Record<string, unknown> & {
      kind: "ERROR";
    })
  | {
      kind: "UNREACHABLE";
    };

export interface InstallData {
  identifier?: string;
  source?: string;
  id?: string;
  url?: string;
}

const MIN_PORT = 6463;
const MAX_PORT = 6472;

function random(): string {
  return Math.random().toString(16).slice(2);
}

function tryPort(port: number): Promise<WebSocket> {
  const ws = new WebSocket(`ws://127.0.0.1:${port}/?v=1&client_id=REPLUGGED-${random()}`);
  return new Promise((resolve, reject) => {
    let didFinish = false;
    ws.addEventListener("message", (event) => {
      if (didFinish) {
        return;
      }

      const message = JSON.parse(event.data) as RPCMessage;
      if (message.evt !== "READY") {
        return;
      }

      didFinish = true;

      resolve(ws);
    });
    ws.addEventListener("error", () => {
      if (didFinish) {
        return;
      }

      didFinish = true;

      reject(new Error("WS error"));
    });
    ws.addEventListener("close", () => {
      if (didFinish) {
        return;
      }

      didFinish = true;

      reject(new Error("WS close"));
    });
  });
}

function rpcInstall(ws: WebSocket, data: InstallData): Promise<Response> {
  const nonce = random();

  ws.send(
    JSON.stringify({
      cmd: "REPLUGGED_INSTALL",
      args: data,
      nonce,
    }),
  );

  return new Promise((resolve) => {
    ws.addEventListener("message", (event) => {
      const message = JSON.parse(event.data) as RPCMessage;
      if (message.nonce !== nonce) {
        return;
      }

      ws.close();

      resolve(message.data);
    });
  });
}

interface InstallProps {
  data: InstallData;
  onConnect: () => void;
  onFinish: (response: Response) => void;
}

export default async function install({ data, onConnect, onFinish }: InstallProps): Promise<void> {
  for (let port = MIN_PORT; port <= MAX_PORT; port++) {
    try {
      const ws = await tryPort(port);
      onConnect();
      const info = await rpcInstall(ws, data);
      onFinish(info);
      return;
    } catch {}
  }

  onFinish({
    kind: "UNREACHABLE",
  });
}
