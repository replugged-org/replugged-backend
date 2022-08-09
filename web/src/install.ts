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

type Response = {
  code: InstallResponseType.SUCCESS | InstallResponseType.ALREADY_INSTALLED,
  info: Info
} | {
  code: InstallResponseType.NOT_FOUND | InstallResponseType.UNREACHABLE,
}

const min_port = 6473;
const max_port = 6480;

export default async function install (url: string): Promise<Response> {
  for (let port = min_port; port <= max_port; port++) {
    try {
      const res = await fetch(`http://localhost:${port}/install?address=${encodeURIComponent(url)}`, {
        method: 'POST'
      });
      const data = await res.json() as Response;
      if (Object.values(InstallResponseType).includes(data.code)) {
        return data;
      }
    } catch (e) {}
  }
  return {
    code: InstallResponseType.UNREACHABLE
  };
}
