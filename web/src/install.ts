export enum InstallResponseType {
  SUCCESS = 'SUCCESS',
  ALREADY_INSTALLED = 'ALREADY-INSTALLED',
  NOT_FOUND = 'CANNOT-FIND',
  UNREACHABLE = 'UNREACHABLE',
}


type Info = {
  type: 'plugin' | 'theme',
  url: string,
  username: string,
  repoName: string,
  branch?: string,
  isInstalled: boolean,
}

enum RPCErrorCode {
  UNKNOWN_ERROR = 1000,
  INVALID_PAYLOAD = 4000,
  INVALID_COMMAND = 4002,
  INVALID_PERMISSIONS = 4006,
  INVALID_CLIENTID = 4007,
}
type RPCMessage = {
  cmd: string,
  data: any,
  evt: string | null,
  nonce: string | null,
}
type RPCErrorData = {
  code: RPCErrorCode,
  message: string,
}
type RPCError = Omit<RPCMessage, 'data'> & {
  data: RPCErrorData
}

type Response = {
  code: InstallResponseType.SUCCESS | InstallResponseType.ALREADY_INSTALLED,
  info: Info
} | {
  code: InstallResponseType.NOT_FOUND | InstallResponseType.UNREACHABLE,
}

function isRPCMessage (value: unknown): value is RPCMessage {
  if (typeof value !== 'object' || !value) {
    return false;
  }
  return 'cmd' in value && 'evt' in value && 'nonce' in value;
}
function isRPCError (value: unknown): value is RPCError {
  if (!isRPCMessage(value)) {
    return false;
  }
  return value.evt === 'ERROR';
}

const min_port = 6463;
const max_port = 6473;

function tryPort (port: number): Promise<WebSocket> {
  const ws = new WebSocket(`ws://127.0.0.1:${port}/?v=1`);
  return new Promise((resolve, reject) => {
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as RPCMessage;
      if (message.evt !== 'READY') {
        return;
      }

      ws.onmessage = null;
      ws.onerror = null;

      resolve(ws);
    };
    ws.onerror = () => {
      ws.onmessage = null;
      ws.onerror = null;
      reject();
    };
  });
}

function rpcInstall (ws: WebSocket, address: string): Promise<Info> {
  const nonce = Math.random().toString(16).slice(2);

  ws.send(JSON.stringify({
    cmd: 'PC_INSTALL',
    args: { address },
    nonce
  }));

  return new Promise((resolve, reject) => {
    ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as RPCMessage;
      if (message.nonce !== nonce) {
        return;
      }

      ws.onmessage = null;

      if (message.evt === 'ERROR') {
        const error = message as RPCError;
        reject(error);
      } else {
        const info = message.data as Info;
        resolve(info);
      }
    };
  });
}

export default async function install (url: string): Promise<Response> {
  let ws: WebSocket | null = null;
  for (let port = min_port; port <= max_port; port++) {
    try {
      ws = await tryPort(port);
      break;
    } catch (e) {}
  }

  if (!ws) {
    return {
      code: InstallResponseType.UNREACHABLE
    };
  }

  try {
    const info = await rpcInstall(ws, url);
    if (info.isInstalled) {
      return {
        info,
        code: InstallResponseType.ALREADY_INSTALLED
      };
    }
    return {
      info,
      code: InstallResponseType.SUCCESS
    };
  } catch (error) {
    if (isRPCError(error)) {
      if (error.data.code === RPCErrorCode.INVALID_PAYLOAD) {
        return {
          code: InstallResponseType.NOT_FOUND
        };
      }

      console.error(new Error(`RPC Error ${error.data.code}: ${error.data.message}`));
      return {
        code: InstallResponseType.UNREACHABLE
      };
    }
    return {
      code: InstallResponseType.UNREACHABLE
    };
  }
}
