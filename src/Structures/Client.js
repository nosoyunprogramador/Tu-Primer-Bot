const {
  Client,
  GatewayIntentBits,
  Partials,
  ActivityType,
  PresenceUpdateStatus,
  Collection,
  REST,
  Routes,
} = require("discord.js");
const BotUtils = require("./Utils");

module.exports = class extends Client {
  constructor(
    options = {
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
      ],
      partials: [
        Partials.User,
        Partials.Channel,
        Partials.GuildMember,
        Partials.Message,
        Partials.Reaction,
      ],
      allowedMentions: {
        parse: ["roles", "users"],
        repliedUser: true,
      },
      presence: {
        activities: [
          {
            name: process.env.STATUS,
            type: ActivityType[process.env.STATUS_TYPE],
          },
        ],
        status: PresenceUpdateStatus.Online,
      },
    }
  ) {
    super({
      ...options,
    });

    this.commands = new Collection();
    this.slashCommands = new Collection();
    this.slashArray = [];

    this.utils = new BotUtils(this);

    this.start();
  }

  async start() {
    await this.loadEvents();
    await this.loadHandlers();
    await this.loadCommands();
    await this.loadSlashCommands();

    this.login(process.env.TOKEN);
  }

  async loadCommands() {
    console.log(`(${process.env.PREFIX}) cargando comandos.`);
    this.commands.clear();

    const RUTA_ARCHIVOS = await this.utils.loadfiles("/src/commands");

    if (RUTA_ARCHIVOS.length) {
      RUTA_ARCHIVOS.forEach((rutaArchivo) => {
        try {
          const COMANDO = require(rutaArchivo);
          const NOMBRE_COMANDO = rutaArchivo
            .split("\\")
            .pop()
            .split("/")
            .pop()
            .split(".")[0];
          COMANDO.NAME = NOMBRE_COMANDO;

          if (NOMBRE_COMANDO) this.commands.set(NOMBRE_COMANDO, COMANDO);
        } catch (e) {
          console.log(
            `ERROR AL CARGAR LA RUTA DE ARCHIVO ${rutaArchivo}\n ${e}`
          );
        }
      });
    }

    console.log(
      `(${process.env.PREFIX}) ${this.commands.size} comandos cargados.`
    );
  }

  async loadSlashCommands() {
    console.log(`(/) cargando comandos.`);
    this.slashCommands.clear();
    this.slashArray = [];

    const RUTA_ARCHIVOS = await this.utils.loadfiles("/src/slashCommands");

    if (RUTA_ARCHIVOS.length) {
      RUTA_ARCHIVOS.forEach((rutaArchivo) => {
        try {
          const COMANDO = require(rutaArchivo);
          const NOMBRE_COMANDO = rutaArchivo
            .split("\\")
            .pop()
            .split("/")
            .pop()
            .split(".")[0];
          COMANDO.cmd.name = NOMBRE_COMANDO;

          if (NOMBRE_COMANDO) this.slashCommands.set(NOMBRE_COMANDO, COMANDO);

          this.slashArray.push(COMANDO.cmd.toJSON());
        } catch (e) {
          console.log(
            `ERROR AL CARGAR LA RUTA DE ARCHIVO ${rutaArchivo}\n ${e}`
          );
        }
      });
    }

    console.log(`(/) ${this.slashCommands.size} comandos cargados.`);

    const rest = new REST().setToken(process.env.TOKEN);
    (async () => {
      try {
        const data = await rest.put(
          Routes.applicationGuildCommands(
            process.env.CLIENT_ID,
            process.env.SERVER_ID
          ),
          { body: this.slashArray }
        );

        console.log(
          `(/) ${data.length} comandos recargados.`
        );
      } catch (error) {
        console.error(error);
      }
    })();
  }

  async loadHandlers() {
    console.log(`(-) cargando handlers.`);

    const RUTA_ARCHIVOS = await this.utils.loadfiles("src/handlers");

    if (RUTA_ARCHIVOS.length) {
      RUTA_ARCHIVOS.forEach((rutaArchivo) => {
        try {
          require(rutaArchivo)(this);
        } catch (e) {
          console.log(
            `ERROR AL CARGAR LA RUTA DE ARCHIVO ${rutaArchivo}\n ${e}`
          );
        }
      });
    }

    console.log(`(-) ${RUTA_ARCHIVOS.length} handlers cargados.`);
  }

  async loadEvents() {
    console.log(`(+) cargando eventos.`);
    const RUTA_ARCHIVOS = await this.utils.loadfiles("/src/events");
    this.removeAllListeners();

    if (RUTA_ARCHIVOS.length) {
      RUTA_ARCHIVOS.forEach((rutaArchivo) => {
        try {
          const EVENTO = require(rutaArchivo);
          const NOMBRE_EVENTO = rutaArchivo
            .split("\\")
            .pop()
            .split("/")
            .pop()
            .split(".")[0];

          this.on(NOMBRE_EVENTO, EVENTO.bind(null, this));
        } catch (e) {
          console.log(
            `ERROR AL CARGAR LA RUTA DE ARCHIVO ${rutaArchivo}\n ${e}`
          );
        }
      });
    }

    console.log(`(+) ${RUTA_ARCHIVOS.length} eventos cargados.`);
  }
};
