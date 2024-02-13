import { AttachmentBuilder, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { addChannelToIgnoreList, getIgnoredChannels, getSetting, removeChannelFromIgnoreList, setSetting } from "./db";

const commands = {
  'channel-ignore': {
    command: new SlashCommandBuilder()
      .setName('channel-ignore')
      .setDescription('Ajoute ou retire un salon de la liste des salons ignorés')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .setDMPermission(false)
      .addSubcommand(subcommand => subcommand
        .setName('ajouter')
        .setDescription('Ajoute un salon à la liste des salons ignorés')
        .addChannelOption(option => option
          .setName('salon')
          .setDescription('Le salon à ajouter à la liste des salons ignorés')
          .setRequired(true)
        )
      )
      .addSubcommand(subcommand => subcommand
        .setName('retirer')
        .setDescription('Retire un salon de la liste des salons ignorés')
        .addChannelOption(option => option
          .setName('salon')
          .setDescription('Le salon à retirer de la liste des salons ignorés')
          .setRequired(true)
        )
      ),
    run: async (inter: ChatInputCommandInteraction) => {
      const subcommand = inter.options.getSubcommand()
      const channel = inter.options.getChannel('salon', true)

      switch (subcommand) {
        case 'ajouter':
          await addChannelToIgnoreList(channel.id, inter.guildId ?? '')
          void inter.reply({
            content: `Le salon ${channel.name} (${channel.id}) a été ajouté à la liste des salons ignorés`,
            ephemeral: true
          })
          break
        case 'retirer':
          await removeChannelFromIgnoreList(channel.id)
          void inter.reply({
            content: `Le salon ${channel.name} (${channel.id}) a été retiré de la liste des salons ignorés`,
            ephemeral: true
          })
          break
      }
    }
  },
  'retire-role': {
    command: new SlashCommandBuilder()
      .setName('retire-role')
      .setDescription('Retire un rôle dans la configuration')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .setDMPermission(false)
      .addSubcommand(subcommand => subcommand
        .setName('ignore')
        .setDescription('Retire le rôle configuré pour les personnes ignorées du bot')
      )
      .addSubcommand(subcommand => subcommand
        .setName('force')
        .setDescription('Retire le rôle configuré pour les personnes avec réponse forcée (100% de chance de réponse)')
      ),
    run: async (inter: ChatInputCommandInteraction) => {
      const subcommand = inter.options.getSubcommand()

      if (inter.guildId == null) {
        return inter.reply({
          content: `Une erreur est survenue`,
          ephemeral: true
        })
      }

      switch (subcommand) {
        case 'ignore':
          setSetting(inter.guildId, 'ignoredRoleId', null)
          void inter.reply({
            content: `Le rôle pour les personnes ignorées du bot a été retiré`,
            ephemeral: true
          })
          break
        case 'force':
          setSetting(inter.guildId, 'forcedAnswerRoleId', null)
          void inter.reply({
            content: `Le rôle pour les personnes avec réponse forcée (100% de chance de réponse) a été retiré`,
            ephemeral: true
          })
          break
      }
    }
  },
  'set-config': {
    command: new SlashCommandBuilder()
      .setName('set-config')
      .setDescription('Change la configuration du bot')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .setDMPermission(false)
      .addNumberOption(option => option
        .setName('chance_de_reponse_quoi')
        .setDescription('Le pourcentage de chance de réponse à un "quoi"')
        .setRequired(false)
      )
      .addNumberOption(option => option
        .setName('chance_de_reponse_quoicoubeh')
        .setDescription('Le pourcentage de chance de réponse à un "quoicoubeh"')
        .setRequired(false)
      )
      .addNumberOption(option => option
        .setName('chance_de_reponse_feur')
        .setDescription('Le pourcentage de chance de réponse à un "feur"')
        .setRequired(false)
      )
      .addNumberOption(option => option
        .setName('chance_de_reponse_ping')
        .setDescription('Le pourcentage de chance de réponse à un ping')
        .setRequired(false)
      )
      .addRoleOption(option => option
        .setName('role_ignore')
        .setDescription('Le rôle pour les personnes ignorées du bot')
        .setRequired(false)
      )
      .addRoleOption(option => option
        .setName('role_force')
        .setDescription('Le rôle pour les personnes avec réponse forcée (100% de chance de réponse)')
        .setRequired(false)
      ),
    run: async (inter: ChatInputCommandInteraction) => {
      if (inter.guildId == null) {
        return inter.reply({
          content: `Une erreur est survenue`,
          ephemeral: true
        })
      }

      let reply = 'Les changements suivants ont étés opérés:'
      let numberOfChanges = 0

      /**
       * Chance to answer to "Quoi"
       */

      const percentageQuoi = inter.options.getNumber('chance_de_reponse_quoi', false)

      if (percentageQuoi !== null) {
        if (percentageQuoi < 0 || percentageQuoi > 100) {
          return inter.reply({
            content: `Le pourcentage doit être compris entre 0 et 100`,
            ephemeral: true
          })
        }
        numberOfChanges++
        setSetting(inter.guildId, 'quoiAnswerPercentage', percentageQuoi)
        reply += `\n- Le pourcentage de chance de réponse à un "quoi" a été mis à ${percentageQuoi}%`
      }

      /**
       * Chance to answer to "Quoicoubeh"
       */

      const percentageQuoicoubeh = inter.options.getNumber('chance_de_reponse_quoicoubeh', false)

      if (percentageQuoicoubeh !== null) {
        if (percentageQuoicoubeh < 0 || percentageQuoicoubeh > 100) {
          return inter.reply({
            content: `Le pourcentage doit être compris entre 0 et 100`,
            ephemeral: true
          })
        }
        numberOfChanges++
        setSetting(inter.guildId, 'quoicoubehAnswerPercentage', percentageQuoicoubeh)
        reply += `\n- Le pourcentage de chance de réponse à un "quoicoubeh" a été mis à ${percentageQuoicoubeh}%`
      }

      /**
       * Chance to answer to "Feur"
       */

      const percentageFeur = inter.options.getNumber('chance_de_reponse_feur', false)

      if (percentageFeur !== null) {
        if (percentageFeur < 0 || percentageFeur > 100) {
          return inter.reply({
            content: `Le pourcentage doit être compris entre 0 et 100`,
            ephemeral: true
          })
        }
        numberOfChanges++
        setSetting(inter.guildId, 'feurAnswerPercentage', percentageFeur)
        reply += `\n- Le pourcentage de chance de réponse à un "feur" a été mis à ${percentageFeur}%`
      }

      /**
       * Chance to answer to a Ping
       */

      const percentagePing = inter.options.getNumber('chance_de_reponse_ping', false)

      if (percentagePing !== null) {
        if (percentagePing < 0 || percentagePing > 100) {
          return inter.reply({
            content: `Le pourcentage doit être compris entre 0 et 100`,
            ephemeral: true
          })
        }
        numberOfChanges++
        setSetting(inter.guildId, 'mentionAnswerPercentage', percentagePing)
        reply += `\n- Le pourcentage de chance de réponse à un ping a été mis à ${percentagePing}%`
      }

      /**
       * Ignored role
       */

      const roleToIgnore = inter.options.getRole('role_ignore', false)

      if (roleToIgnore !== null) {
        numberOfChanges++
        setSetting(inter.guildId, 'ignoredRoleId', roleToIgnore.id)
        reply += `\n- Le rôle pour les personnes ignorées du bot a été assigné à <@&${roleToIgnore.id}>`
      }

      /**
       * Forces role
       */

      const forcedRole = inter.options.getRole('role_force', false)

      if (forcedRole !== null) {
        numberOfChanges++
        setSetting(inter.guildId, 'forcedAnswerRoleId', forcedRole.id)
        reply += `\n- Le rôle pour les personnes ignorées du bot a été assigné à <@&${forcedRole.id}>`
      }

      if (numberOfChanges === 0) {
        reply = 'Aucun changement n\'a été effectué'
      }

      void inter.reply({
        content: reply,
        ephemeral: true
      })
    }
  },
  'get-config': {
    command: new SlashCommandBuilder()
      .setName('get-config')
      .setDescription('Affiche la configuration du bot')
      .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
      .setDMPermission(false),
    run: async (inter: ChatInputCommandInteraction) => {
      if (inter.guildId == null) {
        return inter.reply({
          content: `Une erreur est survenue`,
          ephemeral: true
        })
      }

      const quoiAnswerPercentage = getSetting(inter.guildId, 'quoiAnswerPercentage')
      const quoicoubehAnswerPercentage = getSetting(inter.guildId, 'quoicoubehAnswerPercentage')
      const feurAnswerPercentage = getSetting(inter.guildId, 'feurAnswerPercentage')
      const mentionAnswerPercentage = getSetting(inter.guildId, 'mentionAnswerPercentage')

      const ignoredRolesId = getSetting(inter.guildId, 'ignoredRoleId')
      const forcedAnswerRolesId = getSetting(inter.guildId, 'forcedAnswerRoleId')

      let ignoredChannelsString = getIgnoredChannels(inter.guildId).map(channel => `<#${channel.channelId}>`).join(', ') || 'Aucuns'

      if (ignoredChannelsString.length > 1024) {
        ignoredChannelsString = ignoredChannelsString.substring(0, 1020) + '...'
      }

      void inter.reply({
        files: [new AttachmentBuilder('./assets/logo.png').setName('logo.png')],
        embeds: [
          new EmbedBuilder()
            .setTitle('Configuration')
            .setThumbnail('attachment://logo.png')
            .addFields([
              {
                name: 'Chances de réponse...',
                value: '\u200b',
                inline: false
              },
              {
                name: 'à un "quoi"',
                value: `${quoiAnswerPercentage}%`,
                inline: true
              },
              {
                name: 'à un "quoicoubeh"',
                value: `${quoicoubehAnswerPercentage}%`,
                inline: true
              },
              {
                name: 'à un "feur"',
                value: `${feurAnswerPercentage}%`,
                inline: true
              },
              {
                name: 'à un ping',
                value: `${mentionAnswerPercentage}%`,
                inline: true
              },
              {
                name: 'Salon ignoré',
                value: ignoredChannelsString,
                inline: false
              },
              {
                name: 'Rôle ignoré',
                value: ignoredRolesId ? `<@&${ignoredRolesId}>` : 'Aucun',
                inline: true
              },
              {
                name: 'Rôles à réponse forcée',
                value: forcedAnswerRolesId ? `<@&${forcedAnswerRolesId}>` : 'Aucun',
                inline: true
              }
            ])

        ],
        ephemeral: true
      })
    }
  }
}

export default commands
