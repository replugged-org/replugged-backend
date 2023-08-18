export default {
  mango: "mongodb://127.0.0.1:27017",
  secret: "",
  domain: "https://replugged.dev",
  api: {
    port: 8080,
  },
  discord: {
    clientID: "",
    clientSecret: "",
    botToken: "",
    ids: {
      serverId: "1000926524452647132",
      formChannelId: "1003055963454054544",
    },
    roles: {
      user: "1000955925542207538",
      hunter: "1000955924430717018",
      translator: "1000955920009928764",
      contributor: "1000955919141703690",
      donator: "1000955917237506130",
    },
  },
  ipSalt: "", // Generate with "openssl rand -hex 32"
  github: {
    clientID: "",
    clientSecret: "",
    token: "",
  },
  spotify: {
    clientID: "",
    clientSecret: "",
  },
  patreon: {
    clientID: "",
    clientSecret: "",
  },
};
