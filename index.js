// ============================================================
// 🏪 STARK STORE - BOT DE TICKETS PROFISSIONAL
// ============================================================
// Desenvolvido com discord.js v14
// Sistema completo de tickets com logs, permissões e muito mais
// ============================================================

// ─────────────────────────────────────────────────────────────
// 📦 IMPORTAÇÕES
// ─────────────────────────────────────────────────────────────
require("dotenv").config(); // Carrega variáveis do arquivo .env
const {
  Client,
  GatewayIntentBits,
  Partials,
  REST,
  Routes,
  SlashCommandBuilder,
  EmbedBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  PermissionFlagsBits,
  ChannelType,
  Collection,
} = require("discord.js");

// ─────────────────────────────────────────────────────────────
// ⚙️ CONFIGURAÇÕES GERAIS — EDITE AQUI
// ─────────────────────────────────────────────────────────────

const CONFIG = {
  // 🔑 TOKEN DO BOT (use o arquivo .env para segurança)
  TOKEN: process.env.TOKEN,

  // 🤖 ID DO BOT (Client ID — encontrado no Discord Developer Portal)
  CLIENT_ID: process.env.CLIENT_ID,

  // 🏠 ID DO SERVIDOR (Guild ID — clique com botão direito no servidor > Copiar ID)
  GUILD_ID: process.env.GUILD_ID,

  // 🛡️ ID DO CARGO DE STAFF (que pode usar os comandos e gerenciar tickets)
  STAFF_ROLE_ID: process.env.STAFF_ROLE_ID,

  // 📋 ID DO CANAL DE LOGS (onde os logs de tickets serão enviados)
  LOG_CHANNEL_ID: process.env.LOG_CHANNEL_ID,

  // ─────────────────────────────────────────────────────────
  // 📂 IDs DAS CATEGORIAS DOS TICKETS
  // (cada tipo de ticket vai para uma categoria diferente)
  // Para obter: Ative Modo Desenvolvedor > Clique direito na categoria > Copiar ID
  // ─────────────────────────────────────────────────────────
  CATEGORIES: {
    suporte: process.env.CAT_SUPORTE,     // Categoria para tickets de Suporte
    duvidas: process.env.CAT_DUVIDAS,     // Categoria para tickets de Dúvidas
    denuncia: process.env.CAT_DENUNCIA,   // Categoria para tickets de Denúncia
    compras: process.env.CAT_COMPRAS,     // Categoria para tickets de Compras
    parcerias: process.env.CAT_PARCERIAS, // Categoria para tickets de Parcerias
    hwid: process.env.CAT_HWID,           // Categoria para tickets de Reset HWID
  },

  // ─────────────────────────────────────────────────────────
  // 🎨 CORES DAS EMBEDS (formato hexadecimal)
  // ─────────────────────────────────────────────────────────
  COLORS: {
    PRIMARY: 0x2b2d31,    // Cinza escuro — cor principal das embeds
    SUCCESS: 0x57f287,    // Verde — para ações bem-sucedidas
    ERROR: 0xed4245,      // Vermelho — para erros e avisos
    WARNING: 0xfee75c,    // Amarelo — para alertas
    INFO: 0x5865f2,       // Azul/Roxo — para informações
    LOG_OPEN: 0x57f287,   // Verde — log de ticket aberto
    LOG_CLOSE: 0xed4245,  // Vermelho — log de ticket fechado
    LOG_ADD: 0x5865f2,    // Azul — log de usuário adicionado
    TICKET: 0x2f3136,     // Cinza escuro — embed dentro do ticket
  },

  // ─────────────────────────────────────────────────────────
  // 😀 EMOJIS PERSONALIZADOS
  // (você pode trocar por IDs de emojis do seu servidor)
  // ─────────────────────────────────────────────────────────
  EMOJIS: {
    TICKET: "🎫",
    LOCK: "🔒",
    UNLOCK: "🔓",
    CHECK: "✅",
    CROSS: "❌",
    WARNING: "⚠️",
    INFO: "ℹ️",
    STAR: "⭐",
    STORE: "🏪",
    USER: "👤",
    CATEGORY: "📁",
    TIME: "🕒",
    LOG: "📋",
    LINK: "🔗",
    ADD: "➕",
    DM: "📩",
    BR: "🇧🇷",
    US: "🇺🇸",
    SUPPORT: "🛠️",
    QUESTION: "❓",
    REPORT: "🚨",
    BUY: "💰",
    PARTNER: "🤝",
    HWID: "🔑",
    SEPARATOR: "━━━━━━━━━━━━━━━━━━━━━━━━━━━",
  },
};

// ─────────────────────────────────────────────────────────────
// 🗺️ MAPA DAS OPÇÕES DO SELECT MENU
// Define label, emoji, valor e nome amigável de cada tipo de ticket
// ─────────────────────────────────────────────────────────────
const TICKET_OPTIONS = [
  {
    label: "Suporte",
    description: "Precisa de ajuda técnica? Abra um ticket aqui.",
    value: "suporte",
    emoji: "🛠️",
    categoryKey: "suporte",
    friendlyName: "Suporte",
  },
  {
    label: "Dúvidas",
    description: "Tem alguma dúvida sobre nossos produtos?",
    value: "duvidas",
    emoji: "❓",
    categoryKey: "duvidas",
    friendlyName: "Dúvidas",
  },
  {
    label: "Denúncia",
    description: "Quer denunciar algo ou alguém? Fale aqui.",
    value: "denuncia",
    emoji: "🚨",
    categoryKey: "denuncia",
    friendlyName: "Denúncia",
  },
  {
    label: "Compras",
    description: "Problemas com compras ou quer adquirir algo?",
    value: "compras",
    emoji: "💰",
    categoryKey: "compras",
    friendlyName: "Compras",
  },
  {
    label: "Parcerias",
    description: "Interessado em fazer parceria com a Stark Store?",
    value: "parcerias",
    emoji: "🤝",
    categoryKey: "parcerias",
    friendlyName: "Parcerias",
  },
  {
    label: "Reset HWID",
    description: "Precisa fazer o reset do seu HWID?",
    value: "hwid",
    emoji: "🔑",
    categoryKey: "hwid",
    friendlyName: "Reset HWID",
  },
];

// ─────────────────────────────────────────────────────────────
// 📡 CRIAÇÃO DO CLIENT
// GatewayIntentBits define quais eventos o bot vai "escutar"
// ─────────────────────────────────────────────────────────────
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,              // Para acessar informações do servidor
    GatewayIntentBits.GuildMembers,        // Para acessar membros do servidor
    GatewayIntentBits.GuildMessages,       // Para receber mensagens nos canais
    GatewayIntentBits.MessageContent,      // Para ler o conteúdo das mensagens
    GatewayIntentBits.DirectMessages,      // Para enviar DMs para usuários
  ],
  partials: [
    Partials.Channel,  // Necessário para DMs funcionarem corretamente
    Partials.Message,  // Necessário para mensagens parciais
  ],
});

// ─────────────────────────────────────────────────────────────
// 🗄️ ARMAZENAMENTO EM MEMÓRIA
// Guarda os tickets abertos enquanto o bot está rodando
// Formato: Map<userId, { channelId, category, openedAt }>
// ─────────────────────────────────────────────────────────────
const openTickets = new Map();

// ─────────────────────────────────────────────────────────────
// 🛠️ FUNÇÕES AUXILIARES
// ─────────────────────────────────────────────────────────────

/**
 * Verifica se o membro tem o cargo de Staff
 * @param {GuildMember} member - Membro do servidor
 * @returns {boolean} - true se tem o cargo, false se não tem
 */
function isStaff(member) {
  return member.roles.cache.has(CONFIG.STAFF_ROLE_ID);
}

/**
 * Formata uma data no padrão brasileiro: DD/MM/AAAA às HH:MM
 * @param {Date} date - Objeto Date a ser formatado
 * @returns {string} - Data formatada como string
 */
function formatDate(date) {
  return date.toLocaleString("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Retorna o objeto de opção do ticket pelo value (tipo)
 * @param {string} value - O value da opção (ex: "suporte")
 * @returns {object|undefined} - O objeto da opção ou undefined
 */
function getTicketOption(value) {
  return TICKET_OPTIONS.find((opt) => opt.value === value);
}

/**
 * Envia um log formatado para o canal de logs
 * @param {Guild} guild - O servidor
 * @param {EmbedBuilder} embed - A embed do log
 */
async function sendLog(guild, embed) {
  try {
    // Busca o canal de logs pelo ID configurado
    const logChannel = await guild.channels.fetch(CONFIG.LOG_CHANNEL_ID);
    if (logChannel) {
      await logChannel.send({ embeds: [embed] }); // Envia a embed no canal de logs
    }
  } catch (err) {
    // Se não conseguir enviar o log, apenas exibe o erro no console
    console.error("[LOG ERROR] Não foi possível enviar o log:", err.message);
  }
}

// ─────────────────────────────────────────────────────────────
// 📝 REGISTRO DOS SLASH COMMANDS
// Registra os comandos /ticket e /checkticket na API do Discord
// ─────────────────────────────────────────────────────────────

/**
 * Registra os comandos slash no servidor (guild)
 * Chamado automaticamente quando o bot inicia
 */
async function registerCommands() {
  // Define os comandos que serão registrados
  const commands = [
    // ── /ticket ─────────────────────────────────────────────
    new SlashCommandBuilder()
      .setName("ticket")
      .setDescription("📤 Envia o painel de abertura de tickets no canal atual")
      .toJSON(),

    // ── /checkticket ─────────────────────────────────────────
    new SlashCommandBuilder()
      .setName("checkticket")
      .setDescription("🔍 Verifica se um usuário tem ticket aberto")
      .addUserOption((option) =>
        option
          .setName("usuario") // Nome do parâmetro
          .setDescription("O usuário que deseja verificar") // Descrição do parâmetro
          .setRequired(true) // Parâmetro obrigatório
      )
      .toJSON(),
  ];

  // Instância do REST para comunicar com a API do Discord
  const rest = new REST({ version: "10" }).setToken(CONFIG.TOKEN);

  try {
    console.log("[CMD] Registrando slash commands...");

    // Registra os comandos apenas no servidor (guild), não globalmente
    // Guild commands ficam disponíveis instantaneamente
    await rest.put(
      Routes.applicationGuildCommands(CONFIG.CLIENT_ID, CONFIG.GUILD_ID),
      { body: commands }
    );

    console.log("[CMD] ✅ Slash commands registrados com sucesso!");
  } catch (error) {
    console.error("[CMD] ❌ Erro ao registrar comandos:", error);
  }
}

// ─────────────────────────────────────────────────────────────
// 🟢 EVENTO: BOT PRONTO
// Executado uma vez quando o bot conecta ao Discord com sucesso
// ─────────────────────────────────────────────────────────────
client.once("ready", async () => {
  console.log("╔════════════════════════════════════════╗");
  console.log(`║  🏪 STARK STORE BOT — ONLINE            ║`);
  console.log(`║  🤖 Logado como: ${client.user.tag.padEnd(22)}║`);
  console.log("╚════════════════════════════════════════╝");

  // Define o status/atividade do bot
  client.user.setPresence({
    activities: [{ name: "Stark Store 🏪 | /ticket" }],
    status: "online",
  });

  // Registra os slash commands ao iniciar
  await registerCommands();
});

// ─────────────────────────────────────────────────────────────
// ⚡ EVENTO: INTERACTION CREATE
// Captura todas as interações: comandos, botões, select menus
// ─────────────────────────────────────────────────────────────
client.on("interactionCreate", async (interaction) => {
  try {
    // ── SLASH COMMANDS ──────────────────────────────────────
    if (interaction.isChatInputCommand()) {
      if (interaction.commandName === "ticket") {
        await handleTicketCommand(interaction); // Trata /ticket
      } else if (interaction.commandName === "checkticket") {
        await handleCheckTicketCommand(interaction); // Trata /checkticket
      }
    }

    // ── SELECT MENU ─────────────────────────────────────────
    else if (interaction.isStringSelectMenu()) {
      if (interaction.customId === "ticket_select") {
        await handleTicketSelect(interaction); // Trata seleção do menu
      }
    }

    // ── BOTÕES ──────────────────────────────────────────────
    else if (interaction.isButton()) {
      if (interaction.customId === "close_ticket") {
        await handleCloseTicketButton(interaction); // Botão fechar ticket
      } else if (interaction.customId === "confirm_close") {
        await handleConfirmClose(interaction); // Botão confirmar fechamento
      } else if (interaction.customId === "cancel_close") {
        await handleCancelClose(interaction); // Botão cancelar fechamento
      } else if (interaction.customId === "add_user") {
        await handleAddUser(interaction); // Botão adicionar usuário
      }
    }

    // ── MODAL SUBMIT ─────────────────────────────────────────
    else if (interaction.isModalSubmit()) {
      if (interaction.customId === "add_user_modal") {
        await handleAddUserModal(interaction); // Modal para adicionar usuário
      }
    }
  } catch (err) {
    // Captura qualquer erro não tratado e exibe no console
    console.error("[INTERACTION ERROR]", err);
    // Tenta responder ao usuário com mensagem de erro genérica
    try {
      if (!interaction.replied && !interaction.deferred) {
        await interaction.reply({
          content: `${CONFIG.EMOJIS.CROSS} Ocorreu um erro inesperado. Tente novamente.`,
          ephemeral: true,
        });
      }
    } catch (_) {} // Ignora se não conseguir responder
  }
});

// ─────────────────────────────────────────────────────────────
// 🎫 HANDLER: /ticket
// Envia o painel de abertura de tickets no canal atual
// ─────────────────────────────────────────────────────────────
async function handleTicketCommand(interaction) {
  // Verifica se quem executou tem cargo de Staff
  if (!isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [buildNoPermissionEmbed()], // Embed de sem permissão
      ephemeral: true, // Só quem executou vê
    });
  }

  // ── EMBED PRINCIPAL DO PAINEL DE TICKETS ─────────────────
  const panelEmbed = new EmbedBuilder()
    .setColor(CONFIG.COLORS.PRIMARY) // Cor escura principal
    .setTitle(`${CONFIG.EMOJIS.STORE} Stark Store — Central de Atendimento`)
    .setDescription(
      [
        // ── Seção em Português ───────────────────────────
        `${CONFIG.EMOJIS.BR} **Português**`,
        `${CONFIG.EMOJIS.SEPARATOR}`,
        `> Bem-vindo à **Central de Atendimento da Stark Store**!`,
        `> Para abrir um ticket, selecione a categoria correspondente ao seu atendimento no menu abaixo.`,
        `> Nossa equipe irá te atender o mais rápido possível.`,
        ``,
        `${CONFIG.EMOJIS.SUPPORT} **Suporte** — Problemas técnicos`,
        `${CONFIG.EMOJIS.QUESTION} **Dúvidas** — Perguntas gerais`,
        `${CONFIG.EMOJIS.REPORT} **Denúncia** — Reportar algo/alguém`,
        `${CONFIG.EMOJIS.BUY} **Compras** — Adquirir produtos`,
        `${CONFIG.EMOJIS.PARTNER} **Parcerias** — Proposta de parceria`,
        `${CONFIG.EMOJIS.HWID} **Reset HWID** — Resetar Hardware ID`,
        ``,
        `${CONFIG.EMOJIS.SEPARATOR}`,
        ``,
        // ── Seção em Inglês ──────────────────────────────
        `${CONFIG.EMOJIS.US} **English**`,
        `${CONFIG.EMOJIS.SEPARATOR}`,
        `> Welcome to the **Stark Store Support Center**!`,
        `> To open a ticket, select the category that matches your request in the menu below.`,
        `> Our team will assist you as soon as possible.`,
        ``,
        `${CONFIG.EMOJIS.SUPPORT} **Support** — Technical issues`,
        `${CONFIG.EMOJIS.QUESTION} **Questions** — General inquiries`,
        `${CONFIG.EMOJIS.REPORT} **Report** — Report something/someone`,
        `${CONFIG.EMOJIS.BUY} **Purchases** — Buy products`,
        `${CONFIG.EMOJIS.PARTNER} **Partnerships** — Partnership proposals`,
        `${CONFIG.EMOJIS.HWID} **HWID Reset** — Reset Hardware ID`,
        ``,
        `${CONFIG.EMOJIS.SEPARATOR}`,
        ``,
        // ── Rodapé da embed ───────────────────────────────
        `> ${CONFIG.EMOJIS.WARNING} **Não abra tickets desnecessários / Don't open unnecessary tickets.**`,
      ].join("\n")
    )
    .setThumbnail(interaction.guild.iconURL({ dynamic: true })) // Ícone do servidor
    .setFooter({
      text: "Stark Store — Atendimento Premium",
      iconURL: interaction.guild.iconURL({ dynamic: true }),
    })
    .setTimestamp(); // Hora atual no rodapé

  // ── SELECT MENU COM AS CATEGORIAS ────────────────────────
  const selectMenu = new StringSelectMenuBuilder()
    .setCustomId("ticket_select") // ID usado para identificar a interação
    .setPlaceholder("🎫 Selecione o tipo de atendimento...") // Texto padrão
    .addOptions(
      TICKET_OPTIONS.map((opt) => ({
        label: opt.label,           // Texto visível
        description: opt.description, // Descrição da opção
        value: opt.value,           // Valor passado na interação
        emoji: opt.emoji,           // Emoji ao lado
      }))
    );

  // Empacota o select menu em uma ActionRow (obrigatório pelo Discord)
  const row = new ActionRowBuilder().addComponents(selectMenu);

  // Envia a embed e o select menu no canal (visível para todos)
  await interaction.reply({
    embeds: [panelEmbed],
    components: [row],
  });
}

// ─────────────────────────────────────────────────────────────
// 🔽 HANDLER: SELECT MENU — Criação do Ticket
// Executado quando o usuário seleciona uma opção no menu
// ─────────────────────────────────────────────────────────────
async function handleTicketSelect(interaction) {
  const userId = interaction.user.id; // ID do usuário que selecionou
  const selectedValue = interaction.values[0]; // Valor da opção selecionada
  const option = getTicketOption(selectedValue); // Objeto da opção

  // ── VERIFICA SE JÁ TEM TICKET ABERTO ─────────────────────
  if (openTickets.has(userId)) {
    const existing = openTickets.get(userId); // Pega os dados do ticket existente

    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(CONFIG.COLORS.WARNING) // Cor de aviso
          .setTitle(`${CONFIG.EMOJIS.WARNING} Ticket já aberto!`)
          .setDescription(
            [
              `Você já possui um ticket aberto!`,
              ``,
              `${CONFIG.EMOJIS.LINK} **Canal:** <#${existing.channelId}>`,
              `${CONFIG.EMOJIS.CATEGORY} **Categoria:** ${existing.friendlyName}`,
              ``,
              `Feche o ticket atual antes de abrir um novo.`,
            ].join("\n")
          )
          .setFooter({ text: "Stark Store — Sistema de Tickets" })
          .setTimestamp(),
      ],
      ephemeral: true, // Só o usuário vê
    });
  }

  // ── DEFER PARA EVITAR TIMEOUT (criação pode demorar) ─────
  await interaction.deferReply({ ephemeral: true });

  try {
    // ── CRIA O CANAL DO TICKET ────────────────────────────
    // Nome do canal: emoji + username + categoria (tudo em minúsculo)
    const channelName = `🎟️・${interaction.user.username}-${option.value}`.toLowerCase();

    // Pega a categoria correta pelo ID configurado
    const categoryId = CONFIG.CATEGORIES[option.categoryKey];

    // Define as permissões do canal do ticket
    const permissionOverwrites = [
      {
        // @everyone não pode ver o canal
        id: interaction.guild.id,
        deny: [PermissionFlagsBits.ViewChannel],
      },
      {
        // O usuário que abriu pode ver e escrever
        id: userId,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.EmbedLinks,
        ],
      },
      {
        // O cargo de Staff pode ver e gerenciar
        id: CONFIG.STAFF_ROLE_ID,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.ManageMessages,
          PermissionFlagsBits.AttachFiles,
          PermissionFlagsBits.EmbedLinks,
        ],
      },
      {
        // O próprio bot pode ver e gerenciar o canal
        id: client.user.id,
        allow: [
          PermissionFlagsBits.ViewChannel,
          PermissionFlagsBits.SendMessages,
          PermissionFlagsBits.ManageChannels,
          PermissionFlagsBits.ReadMessageHistory,
          PermissionFlagsBits.EmbedLinks,
          PermissionFlagsBits.AttachFiles,
        ],
      },
    ];

    // Cria o canal de texto na categoria definida
    const ticketChannel = await interaction.guild.channels.create({
      name: channelName,                          // Nome do canal
      type: ChannelType.GuildText,                // Tipo: texto
      parent: categoryId,                         // Categoria pai
      permissionOverwrites: permissionOverwrites, // Permissões definidas acima
      topic: `Ticket de ${interaction.user.tag} | Categoria: ${option.friendlyName}`, // Tópico do canal
    });

    // ── SALVA O TICKET NO MAPA ────────────────────────────
    const openedAt = new Date(); // Data/hora de abertura
    openTickets.set(userId, {
      channelId: ticketChannel.id,         // ID do canal criado
      category: option.value,              // Categoria do ticket
      friendlyName: option.friendlyName,   // Nome amigável
      openedAt: openedAt,                  // Quando foi aberto
      ownerId: userId,                     // ID do dono do ticket
    });

    // ── EMBED DE BOAS-VINDAS DENTRO DO TICKET ────────────
    const ticketEmbed = new EmbedBuilder()
      .setColor(CONFIG.COLORS.TICKET) // Cor escura do ticket
      .setTitle(`${CONFIG.EMOJIS.TICKET} Ticket Aberto — ${option.friendlyName}`)
      .setDescription(
        [
          `Olá, <@${userId}>! Seja bem-vindo(a) ao seu ticket.`,
          `Nossa equipe de suporte irá te atender em breve.`,
          ``,
          `${CONFIG.EMOJIS.SEPARATOR}`,
          ``,
          `${CONFIG.EMOJIS.USER} **Usuário:** <@${userId}>`,
          `${CONFIG.EMOJIS.CATEGORY} **Categoria:** ${option.emoji} ${option.friendlyName}`,
          `${CONFIG.EMOJIS.TIME} **Aberto em:** ${formatDate(openedAt)}`,
          ``,
          `${CONFIG.EMOJIS.SEPARATOR}`,
          ``,
          `> ${CONFIG.EMOJIS.INFO} Descreva seu problema ou dúvida com detalhes.`,
          `> Por favor, aguarde nossa equipe. Não envie spam.`,
        ].join("\n")
      )
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true })) // Avatar do usuário
      .setFooter({
        text: "Stark Store — Premium Support",
        iconURL: interaction.guild.iconURL({ dynamic: true }),
      })
      .setTimestamp();

    // ── BOTÕES DENTRO DO TICKET ────────────────────────────
    const closeBtn = new ButtonBuilder()
      .setCustomId("close_ticket") // ID do botão de fechar
      .setLabel("Fechar Ticket")   // Texto do botão
      .setEmoji("🔒")               // Emoji do botão
      .setStyle(ButtonStyle.Danger); // Estilo vermelho

    const addUserBtn = new ButtonBuilder()
      .setCustomId("add_user")        // ID do botão de adicionar usuário
      .setLabel("Adicionar Usuário")  // Texto do botão
      .setEmoji("➕")                  // Emoji do botão
      .setStyle(ButtonStyle.Secondary); // Estilo cinza

    // Row com os dois botões
    const btnRow = new ActionRowBuilder().addComponents(closeBtn, addUserBtn);

    // Envia a embed de boas-vindas e os botões no canal do ticket
    await ticketChannel.send({
      content: `<@${userId}>`, // Menciona o usuário (ping)
      embeds: [ticketEmbed],
      components: [btnRow],
    });

    // ── RESPOSTA EPHEMERAL PARA O USUÁRIO ─────────────────
    // Botão de link para o canal do ticket
    const linkBtn = new ButtonBuilder()
      .setLabel("Ir para o Ticket") // Texto do botão
      .setEmoji("🎫")               // Emoji
      .setStyle(ButtonStyle.Link)   // Estilo link (abre o canal)
      .setURL(
        `https://discord.com/channels/${interaction.guild.id}/${ticketChannel.id}`
      ); // URL do canal

    const linkRow = new ActionRowBuilder().addComponents(linkBtn);

    // Resposta ephemeral de sucesso (só o usuário vê)
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(CONFIG.COLORS.SUCCESS)
          .setTitle(`${CONFIG.EMOJIS.CHECK} Ticket aberto com sucesso!`)
          .setDescription(
            [
              `Seu ticket foi criado na categoria **${option.friendlyName}**.`,
              `Clique no botão abaixo para acessar o seu ticket.`,
            ].join("\n")
          )
          .setFooter({ text: "Stark Store — Sistema de Tickets" })
          .setTimestamp(),
      ],
      components: [linkRow],
    });

    // ── LOG DE ABERTURA ────────────────────────────────────
    const logEmbed = new EmbedBuilder()
      .setColor(CONFIG.COLORS.LOG_OPEN)
      .setTitle(`${CONFIG.EMOJIS.LOG} Ticket Aberto`)
      .setDescription(
        [
          `${CONFIG.EMOJIS.SEPARATOR}`,
          `${CONFIG.EMOJIS.USER} **Usuário:** <@${userId}> \`(${interaction.user.tag})\``,
          `${CONFIG.EMOJIS.CATEGORY} **Categoria:** ${option.emoji} ${option.friendlyName}`,
          `${CONFIG.EMOJIS.LINK} **Canal:** <#${ticketChannel.id}>`,
          `${CONFIG.EMOJIS.TIME} **Horário:** ${formatDate(openedAt)}`,
          `${CONFIG.EMOJIS.SEPARATOR}`,
        ].join("\n")
      )
      .setThumbnail(interaction.user.displayAvatarURL({ dynamic: true }))
      .setFooter({ text: "Stark Store — Logs" })
      .setTimestamp();

    await sendLog(interaction.guild, logEmbed); // Envia o log
  } catch (err) {
    // Em caso de erro na criação do ticket
    console.error("[TICKET CREATE ERROR]", err);
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(CONFIG.COLORS.ERROR)
          .setTitle(`${CONFIG.EMOJIS.CROSS} Erro ao criar ticket`)
          .setDescription(
            "Não foi possível criar o ticket. Verifique as configurações de ID de categoria e permissões."
          )
          .setFooter({ text: "Stark Store — Sistema de Tickets" })
          .setTimestamp(),
      ],
    });
  }
}

// ─────────────────────────────────────────────────────────────
// 🔒 HANDLER: BOTÃO FECHAR TICKET
// Exibe confirmação antes de fechar
// ─────────────────────────────────────────────────────────────
async function handleCloseTicketButton(interaction) {
  // Apenas Staff pode fechar tickets
  if (!isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [buildNoPermissionEmbed()],
      ephemeral: true,
    });
  }

  // Embed de confirmação de fechamento
  const confirmEmbed = new EmbedBuilder()
    .setColor(CONFIG.COLORS.WARNING)
    .setTitle(`${CONFIG.EMOJIS.WARNING} Fechar Ticket?`)
    .setDescription(
      [
        `Tem certeza que deseja fechar este ticket?`,
        ``,
        `> ${CONFIG.EMOJIS.INFO} O canal será **deletado** e o usuário receberá uma **DM** informando.`,
        ``,
        `Clique em **Confirmar** para fechar ou **Cancelar** para manter aberto.`,
      ].join("\n")
    )
    .setFooter({ text: "Stark Store — Sistema de Tickets" })
    .setTimestamp();

  // Botões de confirmação e cancelamento
  const confirmBtn = new ButtonBuilder()
    .setCustomId("confirm_close") // ID do botão confirmar
    .setLabel("Confirmar")         // Texto
    .setEmoji("✅")                  // Emoji
    .setStyle(ButtonStyle.Success); // Verde

  const cancelBtn = new ButtonBuilder()
    .setCustomId("cancel_close")  // ID do botão cancelar
    .setLabel("Cancelar")          // Texto
    .setEmoji("❌")                 // Emoji
    .setStyle(ButtonStyle.Danger); // Vermelho

  const row = new ActionRowBuilder().addComponents(confirmBtn, cancelBtn);

  // Resposta ephemeral com a confirmação (só o Staff que clicou vê)
  await interaction.reply({
    embeds: [confirmEmbed],
    components: [row],
    ephemeral: true,
  });
}

// ─────────────────────────────────────────────────────────────
// ✅ HANDLER: CONFIRMAR FECHAMENTO DO TICKET
// Fecha o ticket após confirmação do Staff
// ─────────────────────────────────────────────────────────────
async function handleConfirmClose(interaction) {
  // Verifica permissão novamente por segurança
  if (!isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [buildNoPermissionEmbed()],
      ephemeral: true,
    });
  }

  const channel = interaction.channel; // Canal atual (o ticket)

  // Encontra o dono do ticket no mapa (busca pelo channelId)
  let ticketData = null;
  let ownerId = null;
  for (const [uid, data] of openTickets.entries()) {
    if (data.channelId === channel.id) {
      ticketData = data; // Dados do ticket
      ownerId = uid;     // ID do dono
      break;
    }
  }

  const closedAt = new Date(); // Data/hora do fechamento
  const closedBy = interaction.user; // Quem fechou

  // ── NOTIFICA O DONO POR DM ────────────────────────────────
  if (ownerId) {
    try {
      const owner = await client.users.fetch(ownerId); // Busca o usuário

      const dmEmbed = new EmbedBuilder()
        .setColor(CONFIG.COLORS.ERROR)
        .setTitle(`${CONFIG.EMOJIS.DM} Seu ticket foi fechado`)
        .setDescription(
          [
            `Olá, **${owner.username}**!`,
            `Seu ticket na **Stark Store** foi fechado.`,
            ``,
            `${CONFIG.EMOJIS.SEPARATOR}`,
            `${CONFIG.EMOJIS.USER} **Fechado por:** ${closedBy.tag}`,
            `${CONFIG.EMOJIS.CATEGORY} **Categoria:** ${ticketData ? ticketData.friendlyName : "Desconhecida"}`,
            `${CONFIG.EMOJIS.TIME} **Data de fechamento:** ${formatDate(closedAt)}`,
            `${CONFIG.EMOJIS.SEPARATOR}`,
            ``,
            `Se precisar de mais ajuda, abra um novo ticket!`,
          ].join("\n")
        )
        .setThumbnail(interaction.guild.iconURL({ dynamic: true }))
        .setFooter({
          text: "Stark Store — Premium Support",
          iconURL: interaction.guild.iconURL({ dynamic: true }),
        })
        .setTimestamp();

      await owner.send({ embeds: [dmEmbed] }); // Envia a DM
    } catch (err) {
      // Se não conseguir enviar DM (usuário com DMs bloqueadas), apenas loga
      console.warn(`[CLOSE] Não foi possível enviar DM para ${ownerId}:`, err.message);
    }

    openTickets.delete(ownerId); // Remove o ticket do mapa
  }

  // ── LOG DE FECHAMENTO ─────────────────────────────────────
  const logEmbed = new EmbedBuilder()
    .setColor(CONFIG.COLORS.LOG_CLOSE)
    .setTitle(`${CONFIG.EMOJIS.LOG} Ticket Fechado`)
    .setDescription(
      [
        `${CONFIG.EMOJIS.SEPARATOR}`,
        `${CONFIG.EMOJIS.USER} **Fechado por:** <@${closedBy.id}> \`(${closedBy.tag})\``,
        ownerId ? `${CONFIG.EMOJIS.USER} **Dono do ticket:** <@${ownerId}>` : "",
        `${CONFIG.EMOJIS.CATEGORY} **Categoria:** ${ticketData ? ticketData.friendlyName : "Desconhecida"}`,
        `${CONFIG.EMOJIS.TIME} **Horário:** ${formatDate(closedAt)}`,
        `${CONFIG.EMOJIS.SEPARATOR}`,
      ]
        .filter(Boolean) // Remove linhas vazias do array
        .join("\n")
    )
    .setFooter({ text: "Stark Store — Logs" })
    .setTimestamp();

  await sendLog(interaction.guild, logEmbed); // Envia o log

  // ── DELETA O CANAL APÓS 3 SEGUNDOS ───────────────────────
  await interaction.update({
    content: `${CONFIG.EMOJIS.LOCK} Ticket sendo fechado...`,
    embeds: [],
    components: [],
  });

  // Aguarda 3 segundos antes de deletar para o usuário ver a mensagem
  setTimeout(async () => {
    try {
      await channel.delete("Ticket fechado pelo Staff"); // Deleta o canal
    } catch (err) {
      console.error("[CLOSE] Erro ao deletar canal:", err.message);
    }
  }, 3000); // 3000ms = 3 segundos
}

// ─────────────────────────────────────────────────────────────
// ❌ HANDLER: CANCELAR FECHAMENTO DO TICKET
// Cancela a operação de fechar o ticket
// ─────────────────────────────────────────────────────────────
async function handleCancelClose(interaction) {
  // Atualiza a mensagem de confirmação removendo os botões
  await interaction.update({
    embeds: [
      new EmbedBuilder()
        .setColor(CONFIG.COLORS.SUCCESS)
        .setTitle(`${CONFIG.EMOJIS.CHECK} Operação cancelada`)
        .setDescription("O fechamento do ticket foi cancelado.")
        .setFooter({ text: "Stark Store — Sistema de Tickets" })
        .setTimestamp(),
    ],
    components: [], // Remove os botões
  });
}

// ─────────────────────────────────────────────────────────────
// ➕ HANDLER: BOTÃO ADICIONAR USUÁRIO
// Abre um modal para o Staff digitar a menção do usuário
// ─────────────────────────────────────────────────────────────
async function handleAddUser(interaction) {
  // Apenas Staff pode adicionar usuários
  if (!isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [buildNoPermissionEmbed()],
      ephemeral: true,
    });
  }

  // Importa Modal e TextInputBuilder para criar o formulário
  const { ModalBuilder, TextInputBuilder, TextInputStyle } = require("discord.js");

  // Cria o modal
  const modal = new ModalBuilder()
    .setCustomId("add_user_modal")         // ID do modal
    .setTitle("➕ Adicionar Usuário ao Ticket"); // Título do modal

  // Campo de texto para o ID do usuário
  const userInput = new TextInputBuilder()
    .setCustomId("user_id_input")               // ID do campo
    .setLabel("ID ou Menção do Usuário")         // Label visível
    .setStyle(TextInputStyle.Short)              // Linha única
    .setPlaceholder("Ex: 123456789012345678")    // Placeholder
    .setRequired(true)                           // Obrigatório
    .setMinLength(17)                            // Mínimo de caracteres (ID tem 18-19)
    .setMaxLength(22);                           // Máximo de caracteres

  const inputRow = new ActionRowBuilder().addComponents(userInput);
  modal.addComponents(inputRow);

  // Exibe o modal para o usuário
  await interaction.showModal(modal);
}

// ─────────────────────────────────────────────────────────────
// 📝 HANDLER: MODAL ADICIONAR USUÁRIO
// Processa o modal e adiciona o usuário ao canal
// ─────────────────────────────────────────────────────────────
async function handleAddUserModal(interaction) {
  // Pega o valor digitado no campo do modal
  const rawInput = interaction.fields.getTextInputValue("user_id_input").trim();

  // Extrai apenas os números (case de ser uma menção: <@123456789>)
  const userId = rawInput.replace(/\D/g, "");

  // Defer para evitar timeout enquanto busca o usuário
  await interaction.deferReply({ ephemeral: true });

  try {
    // Tenta buscar o usuário pelo ID extraído
    const member = await interaction.guild.members.fetch(userId);

    // Adiciona permissão de ver e escrever no canal para o novo usuário
    await interaction.channel.permissionOverwrites.create(member.user, {
      ViewChannel: true,
      SendMessages: true,
      ReadMessageHistory: true,
      AttachFiles: true,
      EmbedLinks: true,
    });

    // Resposta de sucesso (ephemeral)
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(CONFIG.COLORS.SUCCESS)
          .setTitle(`${CONFIG.EMOJIS.CHECK} Usuário adicionado!`)
          .setDescription(`<@${member.id}> foi adicionado ao ticket com sucesso.`)
          .setFooter({ text: "Stark Store — Sistema de Tickets" })
          .setTimestamp(),
      ],
    });

    // Mensagem visível no canal sobre o novo membro
    await interaction.channel.send({
      embeds: [
        new EmbedBuilder()
          .setColor(CONFIG.COLORS.INFO)
          .setDescription(
            `${CONFIG.EMOJIS.ADD} <@${member.id}> foi adicionado ao ticket por <@${interaction.user.id}>.`
          ),
      ],
    });

    // ── LOG DE ADIÇÃO DE USUÁRIO ──────────────────────────
    const logEmbed = new EmbedBuilder()
      .setColor(CONFIG.COLORS.LOG_ADD)
      .setTitle(`${CONFIG.EMOJIS.LOG} Usuário Adicionado ao Ticket`)
      .setDescription(
        [
          `${CONFIG.EMOJIS.SEPARATOR}`,
          `${CONFIG.EMOJIS.USER} **Adicionado por:** <@${interaction.user.id}> \`(${interaction.user.tag})\``,
          `${CONFIG.EMOJIS.USER} **Usuário adicionado:** <@${member.id}> \`(${member.user.tag})\``,
          `${CONFIG.EMOJIS.LINK} **Ticket:** <#${interaction.channel.id}>`,
          `${CONFIG.EMOJIS.TIME} **Horário:** ${formatDate(new Date())}`,
          `${CONFIG.EMOJIS.SEPARATOR}`,
        ].join("\n")
      )
      .setFooter({ text: "Stark Store — Logs" })
      .setTimestamp();

    await sendLog(interaction.guild, logEmbed); // Envia log
  } catch (err) {
    // Usuário não encontrado ou outro erro
    console.error("[ADD USER ERROR]", err.message);
    await interaction.editReply({
      embeds: [
        new EmbedBuilder()
          .setColor(CONFIG.COLORS.ERROR)
          .setTitle(`${CONFIG.EMOJIS.CROSS} Usuário não encontrado`)
          .setDescription(
            "Não foi possível encontrar o usuário. Verifique o ID e tente novamente."
          )
          .setFooter({ text: "Stark Store — Sistema de Tickets" })
          .setTimestamp(),
      ],
    });
  }
}

// ─────────────────────────────────────────────────────────────
// 🔍 HANDLER: /checkticket
// Verifica se um usuário tem ticket aberto
// ─────────────────────────────────────────────────────────────
async function handleCheckTicketCommand(interaction) {
  // Apenas Staff pode usar /checkticket
  if (!isStaff(interaction.member)) {
    return interaction.reply({
      embeds: [buildNoPermissionEmbed()],
      ephemeral: true,
    });
  }

  // Pega o usuário passado como argumento
  const targetUser = interaction.options.getUser("usuario");
  const targetId = targetUser.id;

  // Verifica se o usuário tem ticket no mapa
  if (!openTickets.has(targetId)) {
    // ── SEM TICKET ABERTO ────────────────────────────────
    return interaction.reply({
      embeds: [
        new EmbedBuilder()
          .setColor(CONFIG.COLORS.INFO)
          .setTitle(`${CONFIG.EMOJIS.INFO} Sem ticket aberto`)
          .setDescription(
            `O usuário <@${targetId}> **não possui** nenhum ticket aberto no momento.`
          )
          .setFooter({ text: "Stark Store — Sistema de Tickets" })
          .setTimestamp(),
      ],
      ephemeral: true, // Só quem executou vê
    });
  }

  // ── TEM TICKET ABERTO ──────────────────────────────────
  const data = openTickets.get(targetId); // Pega os dados do ticket

  return interaction.reply({
    embeds: [
      new EmbedBuilder()
        .setColor(CONFIG.COLORS.SUCCESS)
        .setTitle(`${CONFIG.EMOJIS.TICKET} Ticket encontrado`)
        .setDescription(
          [
            `${CONFIG.EMOJIS.SEPARATOR}`,
            `${CONFIG.EMOJIS.USER} **Usuário:** <@${targetId}>`,
            `${CONFIG.EMOJIS.CATEGORY} **Categoria:** ${data.friendlyName}`,
            `${CONFIG.EMOJIS.LINK} **Canal:** <#${data.channelId}>`,
            `${CONFIG.EMOJIS.TIME} **Aberto em:** ${formatDate(data.openedAt)}`,
            `${CONFIG.EMOJIS.SEPARATOR}`,
          ].join("\n")
        )
        .setThumbnail(targetUser.displayAvatarURL({ dynamic: true }))
        .setFooter({ text: "Stark Store — Sistema de Tickets" })
        .setTimestamp(),
    ],
    ephemeral: true, // Só quem executou vê
  });
}

// ─────────────────────────────────────────────────────────────
// 🚫 FUNÇÃO: EMBED DE SEM PERMISSÃO
// Retorna uma embed bonita para usuários sem permissão
// ─────────────────────────────────────────────────────────────
function buildNoPermissionEmbed() {
  return new EmbedBuilder()
    .setColor(CONFIG.COLORS.ERROR) // Vermelho
    .setTitle(`${CONFIG.EMOJIS.CROSS} Sem permissão!`)
    .setDescription(
      [
        `❌ Ops... você não tem **aura** suficiente para executar este comando.`,
        ``,
        `💫 Farme mais aura e tente novamente 😅`,
      ].join("\n")
    )
    .setFooter({ text: "Stark Store — Sistema de Tickets" })
    .setTimestamp();
}

// ─────────────────────────────────────────────────────────────
// 🔌 CONECTAR AO DISCORD
// Faz o login do bot usando o token do arquivo .env
// ─────────────────────────────────────────────────────────────
client.login(CONFIG.TOKEN).catch((err) => {
  console.error("[LOGIN ERROR] Não foi possível conectar ao Discord:", err.message);
  process.exit(1); // Encerra o processo em caso de erro de login
});
